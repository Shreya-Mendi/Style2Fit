"""
LoRA fine-tuning of SDXL on Fashion-Gen for Style2Fit.

Targets semantic layers (down_blocks.2 + mid_block + up_blocks.0-1)
to teach outfit coherence — not just surface texture.

Run on Colab A100:
    pip install diffusers accelerate transformers datasets peft torch torchvision

Usage:
    python finetune_sdxl.py --out models/sdxl --steps 2000
"""

import argparse
import math
from pathlib import Path

import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import transforms
from datasets import load_dataset
from accelerate import Accelerator
from diffusers import (
    AutoencoderKL,
    DDPMScheduler,
    StableDiffusionXLPipeline,
    UNet2DConditionModel,
)
from diffusers.optimization import get_scheduler
from peft import LoraConfig, get_peft_model
from transformers import CLIPTextModel, CLIPTextModelWithProjection, CLIPTokenizer


# ---------------------------------------------------------------------------
# Semantic layer targets — teaches outfit coherence (not just surface style)
# ---------------------------------------------------------------------------
SEMANTIC_MODULES = [
    "down_blocks.2",
    "mid_block",
    "up_blocks.0",
    "up_blocks.1",
]

BASE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"
RESOLUTION = 512  # use 1024 if VRAM allows


def is_semantic_layer(name: str) -> bool:
    return any(m in name for m in SEMANTIC_MODULES)


def make_transforms(resolution: int):
    return transforms.Compose([
        transforms.Resize(resolution, interpolation=transforms.InterpolationMode.BILINEAR),
        transforms.CenterCrop(resolution),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.5]),
    ])


def collate_fn(examples, tokenizer_1, tokenizer_2, image_transform):
    images, input_ids_1, input_ids_2 = [], [], []
    for ex in examples:
        img = ex["image"].convert("RGB")
        images.append(image_transform(img))

        caption = ex.get("description", ex.get("caption", ""))
        tok1 = tokenizer_1(caption, padding="max_length", max_length=77,
                           truncation=True, return_tensors="pt")
        tok2 = tokenizer_2(caption, padding="max_length", max_length=77,
                           truncation=True, return_tensors="pt")
        input_ids_1.append(tok1.input_ids[0])
        input_ids_2.append(tok2.input_ids[0])

    return {
        "pixel_values": torch.stack(images),
        "input_ids_1": torch.stack(input_ids_1),
        "input_ids_2": torch.stack(input_ids_2),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=str, default="models/sdxl")
    parser.add_argument("--steps", type=int, default=2000)
    parser.add_argument("--batch_size", type=int, default=2)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--rank", type=int, default=16)
    parser.add_argument("--resolution", type=int, default=RESOLUTION)
    args = parser.parse_args()

    Path(args.out).mkdir(parents=True, exist_ok=True)
    accelerator = Accelerator(mixed_precision="bf16")

    # ------------------------------------------------------------------
    # Load components
    # ------------------------------------------------------------------
    print("Loading SDXL components...")
    noise_scheduler = DDPMScheduler.from_pretrained(BASE_MODEL, subfolder="scheduler")
    tokenizer_1 = CLIPTokenizer.from_pretrained(BASE_MODEL, subfolder="tokenizer")
    tokenizer_2 = CLIPTokenizer.from_pretrained(BASE_MODEL, subfolder="tokenizer_2")
    text_encoder_1 = CLIPTextModel.from_pretrained(BASE_MODEL, subfolder="text_encoder")
    text_encoder_2 = CLIPTextModelWithProjection.from_pretrained(BASE_MODEL, subfolder="text_encoder_2")
    vae = AutoencoderKL.from_pretrained(BASE_MODEL, subfolder="vae")
    unet = UNet2DConditionModel.from_pretrained(BASE_MODEL, subfolder="unet")

    # Freeze everything
    vae.requires_grad_(False)
    text_encoder_1.requires_grad_(False)
    text_encoder_2.requires_grad_(False)
    unet.requires_grad_(False)

    # ------------------------------------------------------------------
    # Apply LoRA only to semantic layers
    # ------------------------------------------------------------------
    # Identify which attention modules are in our semantic blocks
    target_modules = []
    for name, module in unet.named_modules():
        if is_semantic_layer(name) and "attn" in name:
            for child_name, _ in module.named_children():
                full = f"{name}.{child_name}"
                if any(k in child_name for k in ["to_q", "to_k", "to_v", "to_out"]):
                    target_modules.append(full)

    # Fall back to named pattern if above is empty
    if not target_modules:
        target_modules = [
            n for n, _ in unet.named_modules()
            if is_semantic_layer(n) and any(k in n for k in ["to_q", "to_k", "to_v", "to_out.0"])
        ]

    lora_config = LoraConfig(
        r=args.rank,
        lora_alpha=args.rank * 2,
        target_modules=["to_q", "to_k", "to_v", "to_out.0"],
        lora_dropout=0.05,
        bias="none",
    )
    unet = get_peft_model(unet, lora_config)

    # Freeze non-semantic LoRA params
    for name, param in unet.named_parameters():
        if param.requires_grad and not is_semantic_layer(name):
            param.requires_grad = False

    trainable = sum(p.numel() for p in unet.parameters() if p.requires_grad)
    print(f"Trainable parameters: {trainable:,} ({trainable/1e6:.1f}M)")

    # ------------------------------------------------------------------
    # Dataset — Fashion-Gen
    # ------------------------------------------------------------------
    print("Loading Fashion-Gen dataset...")
    ds = load_dataset("rajistics/fashion-gen", split="train")
    image_transform = make_transforms(args.resolution)

    def collate(examples):
        return collate_fn(examples, tokenizer_1, tokenizer_2, image_transform)

    dataloader = DataLoader(
        ds, batch_size=args.batch_size, shuffle=True,
        collate_fn=collate, num_workers=2, pin_memory=True,
    )

    # ------------------------------------------------------------------
    # Optimizer + scheduler
    # ------------------------------------------------------------------
    optimizer = torch.optim.AdamW(
        filter(lambda p: p.requires_grad, unet.parameters()),
        lr=args.lr, weight_decay=1e-2,
    )
    lr_scheduler = get_scheduler(
        "cosine",
        optimizer=optimizer,
        num_warmup_steps=100,
        num_training_steps=args.steps,
    )

    unet, optimizer, dataloader, lr_scheduler = accelerator.prepare(
        unet, optimizer, dataloader, lr_scheduler
    )
    text_encoder_1.to(accelerator.device)
    text_encoder_2.to(accelerator.device)
    vae.to(accelerator.device)

    # ------------------------------------------------------------------
    # Training loop
    # ------------------------------------------------------------------
    global_step = 0
    unet.train()

    print(f"Training for {args.steps} steps...")
    while global_step < args.steps:
        for batch in dataloader:
            if global_step >= args.steps:
                break

            # Encode images to latents
            with torch.no_grad():
                latents = vae.encode(
                    batch["pixel_values"].to(dtype=torch.bfloat16)
                ).latent_dist.sample() * vae.config.scaling_factor

            # Sample noise
            noise = torch.randn_like(latents)
            timesteps = torch.randint(
                0, noise_scheduler.config.num_train_timesteps,
                (latents.shape[0],), device=latents.device,
            ).long()
            noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)

            # Text embeddings (SDXL needs both encoders)
            with torch.no_grad():
                enc1_out = text_encoder_1(batch["input_ids_1"].to(accelerator.device),
                                          output_hidden_states=True)
                enc2_out = text_encoder_2(batch["input_ids_2"].to(accelerator.device),
                                          output_hidden_states=True)
                prompt_embeds = torch.cat([
                    enc1_out.hidden_states[-2],
                    enc2_out.hidden_states[-2],
                ], dim=-1)
                pooled_prompt_embeds = enc2_out[0]

            # SDXL added_cond_kwargs
            bs = latents.shape[0]
            add_time_ids = torch.tensor(
                [[args.resolution, args.resolution, 0, 0, args.resolution, args.resolution]] * bs,
                device=accelerator.device, dtype=torch.bfloat16,
            )

            # Predict noise
            noise_pred = unet(
                noisy_latents,
                timesteps,
                encoder_hidden_states=prompt_embeds,
                added_cond_kwargs={
                    "text_embeds": pooled_prompt_embeds,
                    "time_ids": add_time_ids,
                },
            ).sample

            loss = F.mse_loss(noise_pred.float(), noise.float(), reduction="mean")

            accelerator.backward(loss)
            if accelerator.sync_gradients:
                accelerator.clip_grad_norm_(unet.parameters(), 1.0)
            optimizer.step()
            lr_scheduler.step()
            optimizer.zero_grad()

            global_step += 1
            if global_step % 100 == 0:
                print(f"  step {global_step}/{args.steps} | loss {loss.item():.4f}")

            # Save checkpoint every 500 steps
            if global_step % 500 == 0:
                ckpt = Path(args.out) / f"checkpoint-{global_step}"
                accelerator.unwrap_model(unet).save_pretrained(ckpt)
                print(f"  Checkpoint saved to {ckpt}")

    # ------------------------------------------------------------------
    # Save final LoRA weights
    # ------------------------------------------------------------------
    final_path = Path(args.out) / "final"
    accelerator.unwrap_model(unet).save_pretrained(final_path)
    print(f"Final LoRA weights saved to {final_path}")


if __name__ == "__main__":
    main()
