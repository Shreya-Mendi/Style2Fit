# Style2Fit — 3-Minute Pitch Outline

## Slide 1 — The Problem (30 seconds)

**Title:** "You describe your life. We dress you for it."

**Content:**
- Show 3 example situations:
  - "Coffee date tomorrow, it's raining"
  - "First day at tech internship, I'm nervous"
  - "Lisbon trip, need day-to-night outfits"
- Ask the audience: "What would YOU actually wear?"
- Point: Base LLMs give generic advice. Style2Fit gives structured, specific plans.

**Speaker notes:** Start with audience engagement. Make it relatable. Pause after the question — let it land.

---

## Slide 2 — The System (45 seconds)

**Title:** "Hybrid Pipeline: LLM + Diffusion"

**Content:**
- Diagram: Situation Prompt → Fine-Tuned LLM → Structured Outfit → SDXL → Image
- Key technical details:
  - Llama 3.1 8B Instruct + QLoRA (rank=16)
  - 96 custom training samples
  - LoRA applied to Q/K/V/O attention projections + FFN layers
  - SDXL for visualization (inference only, no fine-tuning)
- Course connection: "LoRA works by injecting low-rank matrices into the Transformer attention blocks (slides 47, 59). We freeze 8 billion parameters and train only ~10 million — 0.12% of the model."

**Speaker notes:** Emphasize parameter efficiency. Show you understand the theory. Don't rush through the architecture — the diagram should be visible for the full 45 seconds.

---

## Slide 3 — Before vs After (60 seconds) ← THE MONEY SLIDE

**Title:** "What the Model Learned"

**Content:**
- Live demo OR screenshot of the demo app
- Show one prompt, both outputs side by side
- Call out specific improvements:
  - BEFORE: Generic paragraph ("wear a nice blazer and pants")
  - AFTER: Structured fields (Top/Bottom/Shoes/Accessories/Aesthetic/Explanation)
  - BEFORE: No situation awareness
  - AFTER: References weather, infers formality, explains reasoning
- Show SDXL-generated images for both
- If time, click through a second example in the demo app

**Speaker notes:** This is where you win votes. Let the contrast speak for itself. Read one "before" output aloud to show how vague it is, then let the audience read the "after" output on screen.

---

## Slide 4 — Evaluation (15 seconds)

**Title:** "How We Know It Works"

**Content:**
- Structure completeness: Does output include Top/Bottom/Shoes/Accessories/Aesthetic/Explanation?
  - BEFORE: 0–20% of outputs had all fields
  - AFTER: 90%+ have all fields
- Situation reference: Does the explanation mention the stated scenario?
- Qualitative: Our own review of coherence and wearability

**Speaker notes:** Keep this brief. The before/after already proved it. Just show the numbers and move on.

---

## Slide 5 — Ethics & Risks (30 seconds)

**Title:** "What Could Go Wrong"

**Content:**
- **Training data bias:** Our 96 samples skew toward Western aesthetics and certain body types. A production system would need diverse representation. (Course slide 82: bias in training data → fairness checks)
- **Subjectivity:** "Good outfit" has no ground truth — evaluation is inherently limited. We focused on structure and constraint-following, not aesthetic judgment.
- **AI-generated training data:** We used Claude/GPT to generate training samples — this creates a circular dependency where the fine-tuned model may inherit biases from the data-generating model.
- **Mode collapse risk** (Course slide 83): With only 96 samples, the model could learn to generate repetitive outputs. We mitigated by diversifying situations.
- **Image generation:** SDXL outputs don't reflect real fabric, fit, or proportions. Users should understand these are illustrative, not predictive.

**Speaker notes:** Show you've thought critically. Don't apologize, just be honest. This slide builds credibility.

---

## Division of Labor

| Responsibility | Person A | Person B |
|---|---|---|
| Data preparation | ✓ | |
| Colab training | | ✓ |
| Demo app | | ✓ |
| Slide design | ✓ | |
| Pitch: Slides 1, 3, 5 | ✓ | |
| Pitch: Slides 2, 4 | | ✓ |

---

## Timing Summary

| Slide | Duration | Cumulative |
|---|---|---|
| 1 — Problem | 30s | 0:30 |
| 2 — System | 45s | 1:15 |
| 3 — Demo | 60s | 2:15 |
| 4 — Evaluation | 15s | 2:30 |
| 5 — Ethics | 30s | 3:00 |
