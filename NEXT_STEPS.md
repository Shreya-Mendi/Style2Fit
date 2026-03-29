# Style2Fit — Next Steps

Planned extensions beyond the hackathon MVP. Ordered roughly by impact and implementation effort.

---

## 1. Closet Mode

**What:** User provides a list of items they own. The LLM constrains its outfit plan to only those pieces, suggesting combinations and filling gaps with minimal new purchases.

**Why:** Reduces overconsumption. More personal and practical than generating from scratch. Addresses the main ethical concern with the current system.

**How:**
- Add a `closet_items: list[str]` field to the generation request
- Augment the system prompt: *"The user owns the following items: {closet}. Build the outfit using only these pieces where possible."*
- Fine-tune on closet-constrained training pairs (generate synthetically: give Claude a closet + situation, ask for a constrained outfit)
- UI: text area or structured item entry form in the frontend

---

## 2. Group / Event Generation

**What:** Given a shared event (wedding, birthday dinner, festival), generate coordinated outfits for multiple people that work together without being identical.

**Why:** A common real-world use case — bridal parties, friend groups going out, family photos.

**How:**
- Multi-turn prompt: first generate a shared "event brief" (formality, palette, vibe), then generate per-person outfits that fit within it
- Add a `group_size` and `roles` field (e.g., `["bride", "maid of honour", "guest"]`)
- Output: one outfit plan per person + a "coordination note" explaining how they work together
- SDXL extension: generate a side-by-side composite image (multiple figures)

---

## 3. Richer Evaluation Suite

**What:** Move beyond ROUGE-L and format compliance to metrics that actually capture outfit quality.

**Planned metrics:**

| Metric | Method |
|---|---|
| **Aesthetic consistency** | Embed all outfit fields with a fashion CLIP model, compute pairwise cosine similarity — a coherent outfit should cluster tightly |
| **Situation relevance** | Use an LLM-as-judge prompt: *"On a scale of 1-5, how appropriate is this outfit for the described situation?"* |
| **Human preference** | A/B test: show 10 raters base vs fine-tuned output for the same prompt, record preference |
| **Image-text alignment** | CLIP score between the generated image and the outfit description |
| **Diversity** | Measure how different outputs are across repeated runs on the same prompt (avoid mode collapse) |

---

## 4. Model Improvements

**Training data quality:**
- Current data has noise — hoodies labelled as bottoms, `Top: n/a` misused for non-dress items
- Clean the training set: filter pairs where `Top: n/a` but no dress/jumpsuit in `Bottom`
- Expand to 2000+ pairs using the fashiongen pipeline

**LLM:**
- Increase LoRA rank from `r=16` to `r=32` for more expressive adapters
- Try `Mistral 7B` as base — lighter, faster inference, comparable quality
- Add DPO (Direct Preference Optimisation) fine-tuning stage using human preference pairs

**SDXL:**
- The current fine-tune learned product-shot framing from fashion200k — retrain on editorial full-body images (e.g., Lookbook.nu, DeepFashion-MultiModal)
- Add ControlNet pose conditioning so the person's pose is consistent across generations
- Increase inference steps to 50 for the demo

---

## 5. UI Upgrade

**Current:** Basic Gradio + Next.js editorial frontend (pastel palette, Cormorant Garamond serif).

**Planned upgrades:**

**Frontend (Next.js):**
- Connect to live FastAPI backend — real LLM inference, no mock fallback
- Outfit history / session memory — scroll back through past generations
- Save + share individual outfit cards (image + structured plan) as a shareable link
- Mobile-first responsive layout
- Closet input panel — drag-and-drop or text entry of owned items

**Gradio (Colab demo):**
- Add a "Regenerate" button that reruns SDXL only (keep the LLM plan, try a different image)
- Add inference steps slider back per-tab
- Display the diffusion prompt so users can see what SDXL received

**HuggingFace Spaces deployment:**
- Host the full pipeline on a Spaces ZeroGPU instance
- Public URL, no Colab required for the demo

---

## 6. Comparisons Tab (UI)

**What:** A dedicated UI tab showing structured before/after comparisons across multiple prompts simultaneously.

**Layout:**
- Left column: 5 curated prompts (coffee date, internship, concert, travel, presentation)
- Middle column: base LLaMA output for each
- Right column: Style2Fit fine-tuned output for each
- Highlight structured fields in the fine-tuned output to make the improvement visually obvious
- Include the `eval_summary.png` dashboard inline

**Purpose:** Makes the model improvement legible to non-technical audiences in under 30 seconds.

---

## 7. Personalisation Layer

**What:** Learn from user feedback over time. If a user consistently rejects certain aesthetics or pieces, the system adapts.

**How:**
- Add thumbs up/down on generated outfits
- Log feedback to a user profile (local or server-side)
- At inference time, prepend a "user preference summary" to the system prompt
- Long-term: fine-tune a personal LoRA adapter per user on their accepted outfits

---

*Style2Fit — AIPI 540 · Duke University*
