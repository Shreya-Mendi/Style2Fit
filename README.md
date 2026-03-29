# Style2Fit

> *Describe your situation in plain language. Get a structured outfit plan. See it rendered on a person.*

**AIPI 540 · Mini Hackathon · Duke University**

---

## What it does

Style2Fit is a hybrid generative pipeline that turns casual natural language prompts into complete outfit recommendations with a visual preview.

```
"i have a coffee date tmrw what do i wear"
              ↓
  Fine-tuned LLaMA 3.1 8B (QLoRA)
  → Top / Bottom / Shoes / Outerwear / Accessories / Aesthetic / Explanation
              ↓
  Prompt constructor
              ↓
  Fine-tuned SDXL (LoRA on semantic layers)
              ↓
  Full-body fashion editorial image
```

The key contribution is the **end-to-end fine-tuning of both models** on fashion data — the LLM learns to parse situational context into structured plans, and the diffusion model learns editorial fashion composition.

---

## Demo

| Input | Output |
|---|---|
| "i have a coffee date tmrw what do i wear" | Structured outfit plan + rendered image |
| "first day at my internship, business casual" | Polished work look |
| "packing for lisbon for a week in april" | Multi-day capsule wardrobe |
| "going through a dark academia phase help" | Aesthetic-matched complete look |

**Gradio demo** (notebook 04): runs on A100 Colab, generates public URL via `share=True`.
**Next.js frontend** (`frontend/`): editorial pastel UI, connects to FastAPI backend.

---

## Hackathon Rubric

### 1. Problem & Motivation
The gap between "I need something to wear to X" and a concrete, coherent outfit is something every person faces. Base LLMs give generic advice. Raw diffusion models generate images without reasoning. Style2Fit combines both — situation-aware LLM reasoning + diffusion visualization — in a single end-to-end fine-tuned pipeline.

### 2. Technical Approach

**LLM — QLoRA fine-tuning**
- Base: `meta-llama/Meta-Llama-3.1-8B-Instruct`
- Method: QLoRA (4-bit NF4 base + bfloat16 LoRA adapters)
- LoRA config: `r=16`, `α=32`, all attention + MLP layers (`q/k/v/o_proj`, `gate/up/down_proj`)
- Training: 3 epochs, batch 4, grad accum 4, lr 2e-4 cosine, 540 pairs
- Library: `transformers` + `peft` + `trl` (SFTTrainer)

**SDXL — LoRA fine-tuning**
- Base: `stabilityai/stable-diffusion-xl-base-1.0`
- Method: LoRA on semantic U-Net layers only (`down_blocks.2`, `mid_block`, `up_blocks.0-1`)
- Config: `r=16`, 2000 steps, lr 1e-4, batch 2
- Dataset: Marqo/fashion200k (full-body outfit images)
- Library: `diffusers` + `peft`

**Training data**
- 540 total pairs: 500 from `Marqo/fashion200k` (grounded) + 34 situational seeds + 6 multi-day trip plans
- Generated using GPT-4o-mini to convert fashion product descriptions → casual situation prompts
- Coverage: date, work, travel, weather, aesthetic, gender expression, dress code, body fit

### 3. Evaluation

| Metric | Result |
|---|---|
| Format compliance — fine-tuned | see `data/eval_results.json` |
| Format compliance — base model | see `data/eval_results.json` |
| ROUGE-L mean (30 held-out pairs) | see `data/eval_results.json` |
| Aesthetic diversity (30 prompts) | see `data/eval_results.json` |

Evaluation script: notebook `04_demo.ipynb` eval cell — runs format compliance, ROUGE-L, field completeness, aesthetic diversity, and before/after comparison. Results saved to `eval_results.json` + `eval_summary.png`.

### 4. Before vs After
The Gradio demo includes a **Before vs After tab** — same prompt, base LLaMA vs fine-tuned, side by side with a structured/unstructured label. The base model gives conversational prose; the fine-tuned model gives the exact 7-field structured plan every time.

### 5. Ethical Considerations
- Fashion data reflects narrow aesthetic and body standards — outputs may favour Western, slim-presenting styles
- "Aesthetic" labels (clean girl, old money) encode cultural class signals
- Generated images are illustrative only — fabric, fit, and proportions will not match reality
- Closet-mode (planned) would reduce overconsumption by working with what users already own

---

## Project Structure

```
Style2Fit/
├── notebooks/
│   ├── 01_generate_data.ipynb    # GPT-4o-mini → 540 training pairs
│   ├── 02_finetune_llm.ipynb     # QLoRA fine-tune LLaMA 3.1 8B
│   ├── 03_finetune_sdxl.ipynb    # LoRA fine-tune SDXL
│   └── 04_demo.ipynb             # Full pipeline demo + eval + Gradio
├── pipeline/
│   └── style2fit.py              # Inference pipeline class
├── scripts/
│   └── generate_training_data.py # CLI data generation (fashiongen + synthetic)
├── backend/
│   └── server.py                 # FastAPI backend (Apple Silicon / local)
├── frontend/                     # Next.js + Tailwind editorial UI
├── data/
│   └── train.jsonl               # 540 training pairs
└── models/
    ├── llm_adapter.zip           # QLoRA adapter weights
    └── sdxl_lora.zip             # SDXL LoRA weights
```

---

## Running locally

**Gradio demo (Colab A100):**
```
# Upload llm_adapter.zip + sdxl_lora.zip + train.jsonl to runtime
# Run notebooks/04_demo.ipynb top to bottom
```

**Next.js frontend:**
```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

**FastAPI backend (Apple Silicon):**
```bash
# Unzip models/llm_adapter.zip → models/llm/llm_adapter/
# Unzip models/sdxl_lora.zip   → models/sdxl/sdxl_lora/
uvicorn backend.server:app --reload --port 8000
```

---

## Tech Stack

| Component | Tool |
|---|---|
| Base LLM | LLaMA 3.1 8B Instruct |
| LLM fine-tuning | QLoRA via PEFT + TRL SFTTrainer |
| Diffusion model | Stable Diffusion XL 1.0 |
| Diffusion fine-tuning | LoRA via PEFT + diffusers |
| Training data | Marqo/fashion200k + GPT-4o-mini |
| Demo | Gradio (Colab) + Next.js / Tailwind (local) |
| Backend | FastAPI + uvicorn |
| Compute | Google Colab A100 |
