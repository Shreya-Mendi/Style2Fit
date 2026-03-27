# Style2Fit 👗✨
### A Personalized Outfit Generator with Visual Try-On

> *Describe your life situation. Get a real outfit. See it on a person.*

---

## 🧠 Overview

**Style2Fit** is a hybrid generative system that turns natural language situation descriptions into concrete, wearable outfit recommendations — and then visualizes those outfits on a person.

The system combines:
- A **fine-tuned large language model (LLM)** for outfit reasoning and planning
- A **diffusion-based image model** for visual outfit rendering

This allows users to go from a casual, conversational prompt to:
1. A structured, aesthetic-consistent outfit recommendation
2. A realistic visual preview of that outfit on a person

---

## 🎯 Problem Statement

People constantly describe their lives in natural language — a trip, an event, a mood, a situation — but struggle to translate that into a concrete outfit. The gap between "I need something to wear" and "here's exactly what to wear and why" is where Style2Fit lives.

**Examples of real situations users want help with:**

| What the user says | What they need |
|---|---|
| "I have a coffee date tomorrow, it's supposed to rain" | Cozy, put-together, weather-appropriate |
| "First day at my internship next Monday, business casual" | Polished, professional, not overdressed |
| "Going to a concert this weekend, indie/alt vibe" | Edgy, comfortable, on-aesthetic |
| "I have a presentation and want to look confident" | Sharp, intentional, occasion-specific |
| "Lisbon for a week in April, mix of sightseeing and dinners" | Versatile, travel-appropriate, stylish |

Existing tools either generate **generic fashion advice** (base LLMs) or **produce images without personalization** (raw diffusion models). Style2Fit bridges this gap by combining **reasoning + visualization**.

---

## ⚙️ System Design

### 🔗 Hybrid Pipeline

```
Natural Language Situation Prompt
            ↓
   Fine-Tuned LLM (Style Planner)
   - Interprets situation context
   - Maps to aesthetic + occasion
   - Generates structured outfit plan
            ↓
   Structured Outfit Description
   (top, bottom, shoes, accessories, vibe, reasoning)
            ↓
   Diffusion Model (Visual Renderer)
   - Constructs image prompt from outfit plan
   - Generates person wearing the outfit
            ↓
   Visual Outfit Preview
```

---

## 🧾 Inputs

Users describe their situation in **plain, conversational language**. The model handles interpretation.

| Input | Required | Examples |
|---|---|---|
| **Natural language prompt** | ✅ Yes | "Coffee date tomorrow, it's raining", "internship first day", "wedding guest, summer outdoor" |
| **Aesthetic / Style** | Optional | "clean girl", "dark academia", "streetwear", "old money", "soft girl" |
| **Occasion** | Optional | Can be inferred from the prompt |
| **Weather / Context** | Optional | Can be inferred from the prompt |
| **Closet Items** | ⬜ Optional | Constrains suggestions to items the user already owns |
| **Reference Photo** | ⬜ Optional | Used for visualization only, with explicit consent |

> **Note on closet mode:** When the user provides a list of items they own, the LLM restricts its outfit plan to only those pieces. This is an optional feature — Style2Fit works fully without it.

---

## 🧠 LLM Component — Core Contribution

### Model
A small instruct LLM fine-tuned for structured outfit generation:
- **Llama 3.1 8B Instruct** (preferred)
- **Mistral 7B Instruct** (alternative)
- **Phi-3 Mini** (if compute-constrained)

### Fine-Tuning Strategy
- **Method:** LoRA / PEFT (QLoRA if hardware is limited)
- **Task:** Instruction tuning for situation-aware, structured outfit generation
- **Library stack:** Hugging Face Transformers + PEFT + bitsandbytes

### Training Data Format

Each training example maps a natural language situation to a structured outfit plan:

**Prompt:**
```
The user is going to a coffee date tomorrow. It will be around 58°F and rainy.
They want a cozy but put-together look. Generate a complete outfit.
```

**Target Output:**
```
Top: oversized cream knit sweater
Bottom: straight-leg dark jeans
Shoes: white leather sneakers
Outerwear: camel trench coat
Accessories: small gold hoops, tote bag
Aesthetic: clean girl, effortless
Explanation: The neutral palette keeps the look polished without being overdressed.
The trench handles the rain while staying stylish. Minimal jewelry keeps it casual
but intentional.
```

### What the LLM Learns

After fine-tuning, the model improves at:
- **Parsing situation context** from casual, natural language
- **Inferring aesthetic and occasion** without the user having to name them explicitly
- **Generating coherent, complete outfits** with all components
- **Producing structured outputs** (not just a paragraph of suggestions)
- **Explaining styling decisions** in a useful, concise way
- **Respecting optional constraints** like closet items or stated aesthetic preferences

---

## 🖼️ Diffusion Component — Visualization Layer

The structured outfit description from the LLM is used to construct a prompt for a diffusion model.

### Model
**Stable Diffusion XL** or similar open-source diffusion model

### How It Works

The LLM output is converted into a diffusion prompt:

```
"Full body portrait, female presenting person wearing a cream knit sweater,
straight-leg dark jeans, camel trench coat, white sneakers, gold hoop earrings,
clean girl aesthetic, soft natural lighting, city street background, fashion editorial style"
```

This is fed to the diffusion model to generate a realistic visual preview.

### Optional: Reference Image Input
If the user provides a photo of themselves, it can be used as a conditioning input (e.g., via ControlNet or IP-Adapter) to make the visualization more personalized.

### Role of the Diffusion Component
- Makes the outfit recommendation **tangible and interpretable**
- Provides a lightweight **visual try-on experience**
- Makes the demo more engaging for a general audience
- Demonstrates how **LLM + diffusion can work as a complete pipeline**

---

## 🔍 Before vs. After Comparison

This is the core demonstration of what the model learned.

**Demo Prompt:**
> *"I have a presentation next week and I want to look confident and put-together but not like I'm trying too hard."*

| | Base LLM (Before) | Style2Fit (After) |
|---|---|---|
| **Outfit specificity** | Generic ("wear a blazer and nice pants") | Specific pieces with colors and styling notes |
| **Situation interpretation** | Treats it as a simple occasion query | Infers professional-but-approachable tone |
| **Aesthetic coherence** | Inconsistent | Consistent throughout all pieces |
| **Structure** | Unstructured paragraph | Structured plan: top, bottom, shoes, accessories |
| **Reasoning** | None | Explains why each piece works for the situation |
| **Visual output** | None | Diffusion model renders the outfit on a person |

---

## 📊 Evaluation

### Automatic / Rule-Based
- Does the output include all outfit components (top, bottom, shoes)?
- Does the explanation reference the stated situation?
- Is the aesthetic consistent across all suggested pieces?
- Are optional closet constraints respected (when provided)?

### Human Evaluation (5–10 raters)

| Dimension | What raters assess |
|---|---|
| **Style coherence** | Does the outfit feel like a complete, intentional look? |
| **Situation fit** | Does it make sense for what the user described? |
| **Personalization** | Does it feel tailored, not generic? |
| **Wearability** | Would a real person actually wear this? |
| **Visual realism** | Does the generated image match the described outfit? |

---

## ⚠️ Risks & Ethical Considerations

### 1. Bias in Fashion Data
- Training data likely reflects narrow beauty standards and dominant Western aesthetics
- Certain body types, cultural styles, and price points may be underrepresented
- Aesthetic vocabulary ("clean girl", "old money") can encode cultural exclusion

### 2. Subjectivity of Style
- "A good outfit" has no ground truth — evaluation is inherently imperfect
- Human raters will disagree; metrics should focus on constraint-following and coherence rather than aesthetic judgment

### 3. Privacy & Consent (Reference Images)
- User photos must only be used with explicit, informed consent
- Images should not be stored or reused beyond the session
- The system should not be used for identity manipulation or impersonation

### 4. Misleading Visual Outputs
- Generated images may not accurately reflect real-world fit, fabric, or proportions
- Users should understand outputs are illustrative, not predictive

### 5. Overconsumption
- A system that recommends new purchases without acknowledging what users already own could worsen fast fashion habits
- Style2Fit's optional closet-constraint mode is a deliberate design choice to encourage working with what you have

---

## 🚀 Key Contributions

Style2Fit demonstrates that:

1. **LLMs can be fine-tuned for structured, situation-aware creative generation** — going beyond generic advice to produce coherent, constraint-respecting outfit plans from casual natural language
2. **Hybrid pipelines (LLM + diffusion) create a more complete generative experience** — combining reasoning with visualization in a way neither model achieves alone
3. **The learned capability is measurable** — the before/after comparison shows clear improvement in structure, coherence, and situation awareness

---

## 🗣️ 3-Minute Pitch Outline

| Slide | Title | Content |
|---|---|---|
| 1 | The Problem | Show 3 real situation prompts. Ask: what would you actually wear? |
| 2 | The System | Hybrid pipeline diagram. LLM → structured plan → diffusion → image. |
| 3 | Before vs. After | Same prompt, both outputs side by side. Clear improvement story. |
| 4 | What It Learned | Situation parsing, aesthetic coherence, structured output, styling rationale. |
| 5 | Ethics & Evaluation | Bias in style data, subjectivity, privacy for images. |

---

## 🛠️ Tech Stack

| Component | Tool |
|---|---|
| Base LLM | Llama 3.1 8B Instruct / Mistral 7B |
| Fine-tuning | LoRA / PEFT via Hugging Face + bitsandbytes |
| Diffusion model | Stable Diffusion XL |
| Conditioning (optional) | ControlNet / IP-Adapter |
| Compute | Google Colab Pro / Lambda Labs |
| Demo interface | Gradio or Streamlit |

---

*AIPI 540 · Mini Hackathon #3 · Duke University*
