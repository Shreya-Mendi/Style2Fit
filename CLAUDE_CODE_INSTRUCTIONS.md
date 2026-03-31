# CLAUDE CODE INSTRUCTIONS — Style2Fit Project Build
# ===================================================
# 
# CONTEXT: This is for AIPI 540 Mini Hackathon #3 at Duke University.
# We are building "Style2Fit" — a system that fine-tunes an LLM to generate
# structured outfit recommendations from natural language situation descriptions,
# then visualizes them with a diffusion model.
#
# WHAT ALREADY EXISTS:
# - style2fit_training_data.jsonl (96 training samples, already done)
#
# WHAT YOU NEED TO BUILD:
# Everything else. Specifically, create these files in the project directory:
#
#   1. notebooks/style2fit_train.ipynb     — Colab notebook (Parts 0-5)
#   2. notebooks/style2fit_generate.ipynb  — Colab notebook (Parts 6-7)
#   3. app/demo_app.jsx                    — React demo app for presentation
#   4. app/demo_data_sample.json           — Sample data structure for the app
#   5. slides/pitch_outline.md             — 3-minute pitch script and slide content
#
# IMPORTANT CONSTRAINTS:
# - All notebooks run on Google Colab Pro with A100 GPU
# - The user will manually upload files to Colab and run cells
# - The demo app uses PRE-GENERATED results (no live inference)
# - Total hackathon time budget: ~4 hours
# - 2-person team


# ===================================================
# FILE 1: notebooks/style2fit_train.ipynb
# ===================================================
#
# Create as a proper .ipynb Jupyter notebook with markdown cells and code cells.
# This is the CORE of the project — training + before/after text generation.
#
# CELL STRUCTURE (each is a separate notebook cell):
#
# --- MARKDOWN CELL ---
# # Style2Fit — Training Pipeline
# AIPI 540 Mini Hackathon #3
# Run on Google Colab with A100 GPU runtime.
#
# --- CODE CELL: Part 0 — Install ---
# !pip install -q transformers==4.46.0 datasets peft bitsandbytes accelerate trl
# Pin transformers version to avoid breaking changes.
# Do NOT install diffusers here — that goes in the second notebook.
#
# --- CODE CELL: Part 1 — Load Data ---
# Upload style2fit_training_data.jsonl first.
# Load JSONL, format each sample into:
#   ### Instruction:\n{instruction}\n\n### Input:\n{input}\n\n### Response:\n{output}
# Return as HF Dataset with a "text" field.
# Print sample count and first example preview.
#
# --- CODE CELL: Part 2 — Load Base Model ---
# Use meta-llama/Llama-3.1-8B-Instruct with QLoRA (4-bit NF4 quantization).
# IMPORTANT: User needs HF token with Llama access. Add this at the top:
#   from huggingface_hub import login
#   login()  # will prompt for token
# If Llama access is pending, fall back to mistralai/Mistral-7B-Instruct-v0.3
# Set pad_token = eos_token, padding_side = "right"
# Print model memory footprint after loading.
#
# --- CODE CELL: Part 3 — Define Demo Prompts + Generate BEFORE ---
# Define 8 demo prompts (these exact ones, they map to the demo app):
#
# DEMO_PROMPTS = [
#     {"id": "coffee_date_rainy", "gender": "female", "season": "fall",
#      "style": "clean girl",
#      "prompt": "Coffee date tomorrow morning, it's going to be rainy and chilly around 55°F."},
#     {"id": "tech_internship", "gender": "male", "season": "spring",
#      "style": "smart casual",
#      "prompt": "First day at my tech internship, business casual dress code. I'm nervous."},
#     {"id": "indie_concert", "gender": "neutral", "season": "summer",
#      "style": "indie grunge",
#      "prompt": "Going to an indie rock concert Saturday night, want to look cool but stand for hours."},
#     {"id": "work_presentation", "gender": "female", "season": "winter",
#      "style": "power professional",
#      "prompt": "Big presentation at work Thursday. Want to look confident but not intimidating."},
#     {"id": "lisbon_trip", "gender": "male", "season": "spring",
#      "style": "Mediterranean casual",
#      "prompt": "Weekend trip to Lisbon in April. Need outfits for sightseeing and dinners."},
#     {"id": "summer_wedding", "gender": "female", "season": "summer",
#      "style": "garden party",
#      "prompt": "Outdoor summer wedding guest, festive attire, 85°F and sunny."},
#     {"id": "rooftop_date", "gender": "male", "season": "fall",
#      "style": "urban cool",
#      "prompt": "First date at a trendy rooftop bar, Friday evening in October."},
#     {"id": "creative_interview", "gender": "neutral", "season": "winter",
#      "style": "creative professional",
#      "prompt": "Job interview at a creative agency, casual culture but I need to impress."},
# ]
#
# Generate function: format prompt as ### Instruction / ### Input / ### Response,
# use temperature=0.7, top_p=0.9, max_new_tokens=300.
# Loop through all 8 prompts, save to before_results dict, save as before_results.json.
#
# --- CODE CELL: Part 4 — QLoRA Fine-Tuning ---
# prepare_model_for_kbit_training(model)
# LoRA config: r=16, lora_alpha=32, target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"],
#   lora_dropout=0.05, bias="none", task_type="CAUSAL_LM"
# Print trainable parameters.
# SFTConfig: num_train_epochs=3, per_device_train_batch_size=2,
#   gradient_accumulation_steps=4, learning_rate=2e-4, lr_scheduler_type="cosine",
#   warmup_ratio=0.05, max_seq_length=512, bf16=True, gradient_checkpointing=True,
#   optim="paged_adamw_8bit", report_to="none"
# Use SFTTrainer from trl with dataset_text_field="text".
# IMPORTANT: pass processing_class=tokenizer (not tokenizer= which is deprecated).
# Train, then save model + tokenizer to ./style2fit-lora-final
#
# --- CODE CELL: Part 5 — Generate AFTER ---
# Same 8 prompts, same generate function.
# Save to after_results.json.
# Also print side-by-side comparison for quick visual check.
#
# --- CODE CELL: Part 5b — Export for next notebook ---
# Save combined demo_data_text.json with structure:
# [{"id": "...", "gender": "...", "season": "...", "style": "...",
#   "prompt": "...", "before_text": "...", "after_text": "..."}, ...]
# This file gets downloaded and uploaded to the second notebook.
#
# IMPORTANT NOTES FOR THIS NOTEBOOK:
# - The model is loaded ONCE and used for both before (Part 3) and after (Part 5).
#   Part 3 runs BEFORE fine-tuning. Part 4 does the fine-tuning in-place.
#   Part 5 runs AFTER fine-tuning. The LoRA weights are already applied.
# - If the user needs to restart and already has the LoRA saved, Part 5 should
#   have commented-out code showing how to reload base model + LoRA adapter.
# - Do NOT include diffusion code in this notebook — VRAM won't fit both
#   an 8B LLM and SDXL simultaneously on even an A100.


# ===================================================
# FILE 2: notebooks/style2fit_generate.ipynb
# ===================================================
#
# SEPARATE notebook for diffusion image generation.
# This runs AFTER the first notebook. User downloads demo_data_text.json
# from notebook 1, then uploads it here.
#
# CELL STRUCTURE:
#
# --- CODE CELL: Install ---
# !pip install -q diffusers transformers accelerate safetensors pillow
#
# --- CODE CELL: Load SDXL ---
# Load stabilityai/stable-diffusion-xl-base-1.0 with torch_dtype=float16, variant="fp16"
# Move to cuda.
#
# --- CODE CELL: Load text results ---
# Load demo_data_text.json (uploaded by user)
#
# --- CODE CELL: Generate images ---
# For each demo prompt, convert both before_text and after_text into image prompts:
#   "Full body fashion photograph, {subject} wearing {outfit_text},
#    natural lighting, clean background, fashion editorial style,
#    high quality, detailed clothing textures, 8k"
# where subject = "a young woman" / "a young man" / "a person" based on gender field.
#
# Negative prompt: "blurry, low quality, distorted face, extra limbs, bad anatomy,
#   watermark, text, logo, cropped, worst quality"
#
# Use seed=42 for all images. num_inference_steps=30.
# Save to images_before/{id}.png and images_after/{id}.png.
#
# --- CODE CELL: Convert images to base64 + export final JSON ---
# Read each image, convert to base64 string.
# Create final demo_data.json with structure:
# [{"id": "...", "gender": "...", "season": "...", "style": "...",
#   "prompt": "...", "before_text": "...", "after_text": "...",
#   "before_image_base64": "data:image/png;base64,...",
#   "after_image_base64": "data:image/png;base64,..."}, ...]
#
# IMPORTANT: The base64 encoding is necessary because the React demo app
# will embed images directly. Each image will be ~200-400KB as base64.
# The total JSON file will be ~5-8MB — this is fine.
#
# Print "Download demo_data.json and use it in the demo app."
#
# --- CODE CELL: Display grid preview ---
# Use matplotlib to show a 2x8 grid of before/after images for quick review.
# This is for the user to visually verify results before downloading.


# ===================================================
# FILE 3: app/demo_app.jsx
# ===================================================
#
# React artifact for the live demo during the 3-minute pitch.
# This is a SELF-CONTAINED React component with embedded sample data.
#
# DESIGN REQUIREMENTS:
# - Clean, modern UI. Think fashion app, not developer tool.
# - Title: "Style2Fit" with a subtitle "AI-Powered Outfit Recommendations"
# - Background: clean white/light gray
# - Typography: clean sans-serif
#
# LAYOUT:
# 1. TOP SECTION — User Input Panel
#    - Gender selector: 3 buttons (Female / Male / Neutral)
#    - Season selector: 4 buttons (Spring / Summer / Fall / Winter)
#    - Style preference: dropdown or button group with options like
#      "clean girl", "smart casual", "indie grunge", "power professional",
#      "Mediterranean casual", "garden party", "urban cool", "creative professional"
#    - When the user selects gender + season + style, the app finds the
#      matching demo prompt from the pre-generated data and displays it.
#    - Show the matched situation prompt in a quote-style callout box.
#
# 2. MAIN SECTION — Before/After Comparison (side by side)
#    LEFT COLUMN: "Base Model (Before Fine-Tuning)"
#    - Shows the before_text in a styled text block
#    - Shows the before_image below it
#    - Label: "Llama 3.1 8B — No Fine-Tuning"
#
#    RIGHT COLUMN: "Style2Fit (After Fine-Tuning)"  
#    - Shows the after_text in a styled text block
#    - Shows the after_image below it
#    - Label: "Llama 3.1 8B + QLoRA Fine-Tuning"
#
# 3. BOTTOM SECTION — Key Info
#    - Small footer showing: "96 training samples | QLoRA rank=16 | 3 epochs | SDXL visualization"
#
# DATA HANDLING:
# The app should have a DEMO_DATA constant at the top of the file.
# For the initial build, use PLACEHOLDER data — I will provide real data later.
# Structure:
# const DEMO_DATA = [
#   {
#     id: "coffee_date_rainy",
#     gender: "female",
#     season: "fall", 
#     style: "clean girl",
#     prompt: "Coffee date tomorrow morning, it's going to be rainy and chilly around 55°F.",
#     before_text: "[PLACEHOLDER — will be replaced with real model output]",
#     after_text: "[PLACEHOLDER — will be replaced with real model output]",
#     before_image_base64: null,  // will be replaced
#     after_image_base64: null,   // will be replaced
#   },
#   // ... all 8 entries
# ];
#
# MATCHING LOGIC:
# When user selects gender + season + style, find the entry in DEMO_DATA
# where all three match. If no exact match, find the closest match
# (prioritize style > season > gender).
# If no data is available yet (placeholder), show a message:
# "Run the Colab notebooks first, then paste results here."
#
# STYLING:
# - Use Tailwind CSS utility classes
# - Cards for before/after with subtle shadow
# - The "after" card should have a subtle green/teal accent border
#   to visually signal improvement
# - Outfit text should be formatted with line breaks preserved
#   (split on \n and render each line)
# - Images should be displayed at a reasonable size (300-400px height)
# - Responsive: stack vertically on narrow screens
# - When before_image_base64 and after_image_base64 are null,
#   show a gray placeholder box with text "Image will appear after running SDXL"
#
# IMPORTANT:
# - This is a React artifact (.jsx), NOT a full React app
# - Use only Tailwind classes, no separate CSS files
# - Import useState from react
# - Default export the component
# - No external API calls — everything is embedded in DEMO_DATA


# ===================================================
# FILE 4: app/demo_data_sample.json
# ===================================================
#
# A sample JSON file showing the exact data structure the app expects.
# Use the 8 demo prompts with placeholder text for before/after.
# This file serves as documentation for the data format.
#
# [
#   {
#     "id": "coffee_date_rainy",
#     "gender": "female",
#     "season": "fall",
#     "style": "clean girl",
#     "prompt": "Coffee date tomorrow morning, it's going to be rainy and chilly around 55°F.",
#     "before_text": "You could wear a nice sweater with some jeans and maybe boots. A jacket would be good for the rain. Some earrings could complete the look.",
#     "after_text": "Top: oversized cream ribbed knit sweater\nBottom: straight-leg dark wash jeans\nShoes: white leather low-top sneakers\nOuterwear: camel wool-blend trench coat\nAccessories: small gold hoop earrings, structured leather tote bag\nAesthetic: clean girl, effortless chic\nExplanation: The neutral palette keeps the look polished without being overdressed for a casual coffee date. The trench coat handles the rain while adding structure.",
#     "before_image_base64": null,
#     "after_image_base64": null
#   },
#   ... (all 8 entries with similar placeholder before_text that is vague/generic,
#        and after_text that matches our training data format)
# ]


# ===================================================
# FILE 5: slides/pitch_outline.md
# ===================================================
#
# Markdown file with the 3-minute pitch structure.
# Include speaker notes and timing.
#
# ## Slide 1 — The Problem (30 seconds)
# Title: "You describe your life. We dress you for it."
# Content:
# - Show 3 example situations:
#   * "Coffee date tomorrow, it's raining"
#   * "First day at tech internship, I'm nervous"
#   * "Lisbon trip, need day-to-night outfits"
# - Ask the audience: "What would YOU actually wear?"
# - Point: Base LLMs give generic advice. Style2Fit gives structured, specific plans.
# Speaker notes: Start with audience engagement. Make it relatable.
#
# ## Slide 2 — The System (45 seconds)
# Title: "Hybrid Pipeline: LLM + Diffusion"
# Content:
# - Diagram: Situation Prompt → Fine-Tuned LLM → Structured Outfit → SDXL → Image
# - Key technical details:
#   * Llama 3.1 8B Instruct + QLoRA (rank=16)
#   * 96 custom training samples
#   * LoRA applied to Q/K/V/O attention projections + FFN layers
#   * SDXL for visualization (inference only, no fine-tuning)
# - Course connection: "LoRA works by injecting low-rank matrices into the
#   Transformer attention blocks (slides 47, 59). We freeze 8 billion parameters
#   and train only ~10 million — 0.12% of the model."
# Speaker notes: Emphasize parameter efficiency. Show you understand the theory.
#
# ## Slide 3 — Before vs After (60 seconds) ← THIS IS THE MONEY SLIDE
# Title: "What the Model Learned"
# Content:
# - Live demo OR screenshot of the demo app
# - Show one prompt, both outputs side by side
# - Call out specific improvements:
#   * BEFORE: Generic paragraph ("wear a nice blazer and pants")
#   * AFTER: Structured fields (Top/Bottom/Shoes/Accessories/Aesthetic/Explanation)
#   * BEFORE: No situation awareness
#   * AFTER: References weather, infers formality, explains reasoning
# - Show SDXL-generated images for both
# - If time, click through a second example in the demo app
# Speaker notes: This is where you win votes. Let the contrast speak for itself.
#
# ## Slide 4 — Evaluation (15 seconds)
# Title: "How We Know It Works"
# Content:
# - Structure completeness: Does output include Top/Bottom/Shoes/Accessories/Aesthetic/Explanation?
#   BEFORE: 0-20% of outputs had all fields. AFTER: 90%+ have all fields.
# - Situation reference: Does the explanation mention the stated scenario?
# - Qualitative: Our own review of coherence and wearability.
# Speaker notes: Keep this brief. The before/after already proved it.
#
# ## Slide 5 — Ethics & Risks (30 seconds)
# Title: "What Could Go Wrong"
# Content:
# - Training data bias: Our 96 samples skew toward Western aesthetics and
#   certain body types. A production system would need diverse representation.
#   (Course slide 82: bias in training data → fairness checks)
# - Subjectivity: "Good outfit" has no ground truth — evaluation is inherently
#   limited. We focused on structure and constraint-following, not aesthetic judgment.
# - AI-generated training data: We used Claude/GPT to generate training samples —
#   this creates a circular dependency where the fine-tuned model may inherit
#   biases from the data-generating model.
# - Mode collapse risk (Course slide 83): With only 96 samples, the model could
#   learn to generate repetitive outputs. We mitigated by diversifying situations.
# - Image generation: SDXL outputs don't reflect real fabric, fit, or proportions.
#   Users should understand these are illustrative, not predictive.
# Speaker notes: Show you've thought critically. Don't apologize, just be honest.
#
# ## Division of Labor
# Person A: Data preparation, slide design, pitch delivery for slides 1, 3, 5
# Person B: Colab training, demo app, pitch delivery for slides 2, 4


# ===================================================
# TECHNICAL NOTES FOR CLAUDE CODE
# ===================================================
#
# 1. NOTEBOOK FORMAT:
#    Generate .ipynb files directly using the nbformat structure:
#    {"cells": [...], "metadata": {...}, "nbformat": 4, "nbformat_minor": 5}
#    Each cell is either {"cell_type": "markdown", "source": [...]}
#    or {"cell_type": "code", "source": [...], "outputs": [], "execution_count": null}
#    This is important — the user needs to open these directly in Colab.
#
# 2. SPLITTING INTO TWO NOTEBOOKS IS CRITICAL:
#    The LLM (8B quantized) uses ~6GB VRAM. SDXL uses ~7GB VRAM.
#    Loading both simultaneously would exceed even A100's 40GB when including
#    optimizer states and activations during training. Splitting ensures each
#    notebook runs without OOM errors.
#
# 3. REACT APP:
#    - Must be a single .jsx file with default export
#    - Use only Tailwind CSS (available in the artifact environment)
#    - Can import { useState } from "react"
#    - Can import lucide-react icons
#    - No external API calls
#    - All data is embedded in the component file
#    - Images use base64 data URLs when available, gray placeholder when null
#
# 4. DATA FLOW:
#    style2fit_training_data.jsonl  →  [Notebook 1]  →  demo_data_text.json
#                                                             ↓
#                                                       [Notebook 2]  →  demo_data.json
#                                                                             ↓
#                                                                       [Demo App]
#
# 5. FILE NAMING:
#    Keep these exact names — they're referenced across files:
#    - style2fit_training_data.jsonl (input, already exists)
#    - before_results.json (intermediate, notebook 1)
#    - after_results.json (intermediate, notebook 1)
#    - demo_data_text.json (output of notebook 1, input of notebook 2)
#    - demo_data.json (output of notebook 2, input of demo app)
#
# 6. ERROR HANDLING IN NOTEBOOKS:
#    Add try/except around model loading with a fallback message suggesting
#    Mistral-7B if Llama access fails. Add a cell at the top that checks
#    GPU type: !nvidia-smi and warn if not A100.
#
# 7. The demo app should work WITH OR WITHOUT images.
#    If before_image_base64/after_image_base64 are null, show placeholder.
#    This way the app is useful even if the user only completes notebook 1.
#    Text-only before/after comparison is already compelling enough for the pitch.