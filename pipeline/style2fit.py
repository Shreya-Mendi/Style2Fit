"""
Style2Fit inference pipeline.

Chains:
  1. Fine-tuned LLM  → parses casual prompt → structured outfit plan
  2. Prompt constructor → converts outfit plan → diffusion-ready description
  3. Fine-tuned SDXL  → renders outfit on a person

Usage:
    from pipeline.style2fit import Style2FitPipeline

    pipe = Style2FitPipeline(
        llm_adapter="models/llm/final",
        sdxl_lora="models/sdxl/final",
    )
    result = pipe.run("i have a coffee date tmrw what do i wear")
    print(result["outfit_plan"])
    result["image"].save("output.png")
"""

import re
import torch
from dataclasses import dataclass
from PIL import Image

from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel
from diffusers import StableDiffusionXLPipeline, AutoencoderKL
from diffusers.utils import load_image


BASE_LLM = "meta-llama/Meta-Llama-3.1-8B-Instruct"
BASE_SDXL = "stabilityai/stable-diffusion-xl-base-1.0"

LLM_SYSTEM_PROMPT = """You are Style2Fit, a personal stylist assistant.
When someone describes their situation in casual language, you generate a complete,
coherent outfit recommendation in structured format.

Always respond with exactly:
Top: ...
Bottom: ...
Shoes: ...
Outerwear: ...
Accessories: ...
Aesthetic: ...
Explanation: ..."""


@dataclass
class OutfitPlan:
    top: str
    bottom: str
    shoes: str
    outerwear: str
    accessories: str
    aesthetic: str
    explanation: str
    raw: str


def parse_outfit(text: str) -> OutfitPlan:
    """Parse structured LLM output into an OutfitPlan."""
    def extract(field: str) -> str:
        match = re.search(rf"{field}:\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
        return match.group(1).strip() if match else ""

    return OutfitPlan(
        top=extract("Top"),
        bottom=extract("Bottom"),
        shoes=extract("Shoes"),
        outerwear=extract("Outerwear"),
        accessories=extract("Accessories"),
        aesthetic=extract("Aesthetic"),
        explanation=extract("Explanation"),
        raw=text,
    )


def outfit_to_diffusion_prompt(plan: OutfitPlan) -> str:
    """
    Convert a structured outfit plan into a prompt for SDXL.
    Constructs a fashion editorial description.
    """
    pieces = [
        plan.top,
        plan.bottom,
        plan.shoes,
    ]
    if plan.outerwear and plan.outerwear.lower() not in ("none", "none needed", "n/a"):
        pieces.append(plan.outerwear)
    if plan.accessories:
        pieces.append(plan.accessories)

    outfit_desc = ", ".join(p for p in pieces if p)

    prompt = (
        f"Full body fashion editorial photo of a person wearing {outfit_desc}. "
        f"{plan.aesthetic} aesthetic. "
        "Soft natural lighting, clean background, professional fashion photography, "
        "sharp focus, high resolution, realistic fabric textures, complete outfit visible."
    )
    negative_prompt = (
        "cropped, bad anatomy, deformed, extra limbs, blurry, low quality, "
        "cartoon, illustration, painting, drawing, unrealistic"
    )
    return prompt, negative_prompt


class Style2FitPipeline:
    def __init__(
        self,
        llm_adapter: str = None,
        sdxl_lora: str = None,
        device: str = None,
    ):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self._load_llm(llm_adapter)
        self._load_sdxl(sdxl_lora)

    def _load_llm(self, adapter_path: str):
        print("Loading LLM...")
        bnb = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16,
        )
        self.tokenizer = AutoTokenizer.from_pretrained(
            adapter_path if adapter_path else BASE_LLM
        )
        base = AutoModelForCausalLM.from_pretrained(
            BASE_LLM,
            quantization_config=bnb,
            device_map="auto",
        )
        if adapter_path:
            self.llm = PeftModel.from_pretrained(base, adapter_path)
        else:
            print("  WARNING: no LLM adapter provided, using base model")
            self.llm = base
        self.llm.eval()

    def _load_sdxl(self, lora_path: str):
        print("Loading SDXL...")
        self.sdxl = StableDiffusionXLPipeline.from_pretrained(
            BASE_SDXL,
            torch_dtype=torch.bfloat16,
            use_safetensors=True,
        ).to(self.device)

        if lora_path:
            self.sdxl.load_lora_weights(lora_path)
            print(f"  LoRA weights loaded from {lora_path}")
        else:
            print("  WARNING: no SDXL LoRA provided, using base model")

        self.sdxl.enable_attention_slicing()

    def generate_outfit_plan(self, situation: str, aesthetic: str = None) -> OutfitPlan:
        """Run the fine-tuned LLM to get a structured outfit plan."""
        user_content = situation
        if aesthetic:
            user_content += f"\naesthetic: {aesthetic}"

        messages = [
            {"role": "system", "content": LLM_SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ]
        input_ids = self.tokenizer.apply_chat_template(
            messages, add_generation_prompt=True, return_tensors="pt"
        ).to(self.llm.device)

        with torch.no_grad():
            output = self.llm.generate(
                input_ids,
                max_new_tokens=300,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        decoded = self.tokenizer.decode(
            output[0][input_ids.shape[-1]:], skip_special_tokens=True
        )
        return parse_outfit(decoded)

    def generate_image(self, plan: OutfitPlan, num_inference_steps: int = 30) -> Image.Image:
        """Run fine-tuned SDXL to render the outfit."""
        prompt, negative_prompt = outfit_to_diffusion_prompt(plan)
        result = self.sdxl(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=7.5,
            height=1024,
            width=768,
        )
        return result.images[0]

    def run(
        self,
        situation: str,
        aesthetic: str = None,
        generate_image: bool = True,
        num_inference_steps: int = 30,
    ) -> dict:
        """
        Full pipeline: situation → outfit plan → image.

        Returns:
            {
                "outfit_plan": OutfitPlan,
                "diffusion_prompt": str,
                "image": PIL.Image or None,
            }
        """
        print(f"Generating outfit plan for: '{situation}'")
        plan = self.generate_outfit_plan(situation, aesthetic)

        prompt, _ = outfit_to_diffusion_prompt(plan)

        image = None
        if generate_image:
            print("Rendering outfit image...")
            image = self.generate_image(plan, num_inference_steps)

        return {
            "outfit_plan": plan,
            "diffusion_prompt": prompt,
            "image": image,
        }
