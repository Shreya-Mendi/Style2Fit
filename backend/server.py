"""
Style2Fit FastAPI backend — optimized for Apple Silicon (MPS).

LLM runs on MPS (float16) — fast enough for demo.
SDXL image generation is disabled by default (too slow without CUDA).
Set GENERATE_IMAGES=1 to enable (expect ~10-15 min per image on CPU).

Run:
    cd /Users/shreyamendi/Deeplearning/Style2Fit
    uvicorn backend.server:app --reload --port 8000
"""

import os
import re
import io
import base64
import torch
from pathlib import Path
from dataclasses import dataclass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

ROOT = Path(__file__).parent.parent
LLM_ADAPTER = ROOT / "models" / "llm" / "llm_adapter"
SDXL_LORA   = ROOT / "models" / "sdxl" / "sdxl_lora"

BASE_LLM  = "meta-llama/Meta-Llama-3.1-8B-Instruct"
BASE_SDXL = "stabilityai/stable-diffusion-xl-base-1.0"

GENERATE_IMAGES = os.environ.get("GENERATE_IMAGES", "0") == "1"

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are Style2Fit, a personal stylist assistant.
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

# ---------------------------------------------------------------------------
# Model state (loaded once at startup)
# ---------------------------------------------------------------------------

tokenizer = None
llm       = None
sdxl      = None


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
    def extract(field: str) -> str:
        m = re.search(rf"{field}:\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
        return m.group(1).strip() if m else ""
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


def outfit_to_diffusion_prompt(plan: OutfitPlan) -> tuple[str, str]:
    pieces = [plan.top, plan.bottom, plan.shoes]
    if plan.outerwear and plan.outerwear.lower() not in ("none", "none needed", "n/a"):
        pieces.append(plan.outerwear)
    if plan.accessories:
        pieces.append(plan.accessories)
    outfit_desc = ", ".join(p for p in pieces if p)
    prompt = (
        f"Full body fashion editorial photo of a person wearing {outfit_desc}. "
        f"{plan.aesthetic} aesthetic. Full length shot, head to toe, shoes visible, "
        "soft natural lighting, clean background, professional fashion photography, "
        "sharp focus, high resolution, realistic fabric textures."
    )
    negative = (
        "cropped, close up, portrait, headshot, cut off feet, cut off shoes, "
        "bad anatomy, deformed, extra limbs, blurry, low quality, "
        "cartoon, illustration, painting, drawing, unrealistic"
    )
    return prompt, negative


def load_models():
    global tokenizer, llm, sdxl

    # ----- LLM -----
    print("Loading tokenizer...")
    from transformers import AutoTokenizer, AutoModelForCausalLM
    from peft import PeftModel

    tokenizer = AutoTokenizer.from_pretrained(str(LLM_ADAPTER))
    tokenizer.pad_token = tokenizer.eos_token

    # Apple Silicon: use MPS in float16 — fits 8B in 16GB unified memory
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    dtype  = torch.float16 if device == "mps" else torch.float32

    print(f"Loading LLM on {device} ({dtype})...")
    base = AutoModelForCausalLM.from_pretrained(
        BASE_LLM,
        torch_dtype=dtype,
        low_cpu_mem_usage=True,
    ).to(device)

    print("Applying LoRA adapter...")
    llm = PeftModel.from_pretrained(base, str(LLM_ADAPTER))
    llm.eval()
    print("LLM ready.")

    # ----- SDXL (optional) -----
    if GENERATE_IMAGES:
        print("Loading SDXL (this will be slow on CPU)...")
        from diffusers import StableDiffusionXLPipeline
        from peft import PeftModel as PeftModelSD

        sdxl_pipe = StableDiffusionXLPipeline.from_pretrained(
            BASE_SDXL,
            torch_dtype=torch.float32,
        ).to("cpu")
        sdxl_pipe.unet = PeftModelSD.from_pretrained(sdxl_pipe.unet, str(SDXL_LORA))
        sdxl_pipe.enable_attention_slicing()
        sdxl = sdxl_pipe
        print("SDXL ready.")
    else:
        print("SDXL skipped (set GENERATE_IMAGES=1 to enable).")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="Style2Fit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    situation: str
    aesthetic: str | None = None
    generate_image: bool = False
    num_inference_steps: int = 30


@app.on_event("startup")
async def startup():
    load_models()


@app.post("/generate")
async def generate(req: GenerateRequest):
    if not req.situation.strip():
        return {"error": "situation is required"}

    # ----- LLM inference -----
    user_content = req.situation
    if req.aesthetic:
        user_content += f"\naesthetic: {req.aesthetic}"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_content},
    ]
    input_ids = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_tensors="pt"
    ).to(llm.device)

    with torch.no_grad():
        output = llm.generate(
            input_ids,
            max_new_tokens=300,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
        )

    decoded = tokenizer.decode(output[0][input_ids.shape[-1]:], skip_special_tokens=True)
    plan = parse_outfit(decoded)
    prompt, _ = outfit_to_diffusion_prompt(plan)

    # ----- Optional image gen -----
    image_url = None
    if req.generate_image and sdxl is not None:
        _, negative = outfit_to_diffusion_prompt(plan)
        result = sdxl(
            prompt=prompt,
            negative_prompt=negative,
            num_inference_steps=req.num_inference_steps,
            guidance_scale=7.5,
            height=1024,
            width=768,
        )
        img = result.images[0]
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode()
        image_url = f"data:image/png;base64,{b64}"

    return {
        "outfit_plan": {
            "top":         plan.top,
            "bottom":      plan.bottom,
            "shoes":       plan.shoes,
            "outerwear":   plan.outerwear,
            "accessories": plan.accessories,
            "aesthetic":   plan.aesthetic,
            "explanation": plan.explanation,
            "raw":         plan.raw,
        },
        "diffusion_prompt": prompt,
        "image_url": image_url,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "llm_loaded": llm is not None, "sdxl_loaded": sdxl is not None}
