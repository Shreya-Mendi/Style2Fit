"""
Style2Fit Gradio demo.

Run:
    pip install gradio
    python demo/app.py --llm models/llm/final --sdxl models/sdxl/final

For before/after demo mode (hackathon):
    python demo/app.py --compare
"""

import argparse
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import gradio as gr
from pipeline.style2fit import Style2FitPipeline, BASE_LLM, BASE_SDXL, LLM_SYSTEM_PROMPT, outfit_to_diffusion_prompt, parse_outfit

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from diffusers import StableDiffusionXLPipeline

# Global pipeline (loaded once)
pipe: Style2FitPipeline = None
base_llm_tokenizer = None
base_llm_model = None


AESTHETIC_CHOICES = [
    "infer from situation",
    "clean girl", "dark academia", "old money", "streetwear",
    "soft girl", "coastal grandmother", "indie", "minimalist",
    "boho", "preppy", "y2k", "cottagecore",
]

EXAMPLE_PROMPTS = [
    "i have a coffee date tmrw what do i wear",
    "first day at my internship, business casual vibes",
    "going to a concert this weekend, indie/alt vibe",
    "birthday dinner at a nice restaurant",
    "it's finally fall and i want a cozy put together look",
    "beach vacation next week, need full looks",
    "job interview at a tech startup",
    "omg i have a presentation today help",
]


def run_style2fit(situation: str, aesthetic: str, steps: int) -> tuple:
    """Run full pipeline and return outfit text + image."""
    if not situation.strip():
        return "Please enter a situation.", None

    aes = None if aesthetic == "infer from situation" else aesthetic

    try:
        result = pipe.run(situation, aesthetic=aes, num_inference_steps=int(steps))
        plan = result["outfit_plan"]

        outfit_text = f"""**Top:** {plan.top}
**Bottom:** {plan.bottom}
**Shoes:** {plan.shoes}
**Outerwear:** {plan.outerwear}
**Accessories:** {plan.accessories}
**Aesthetic:** {plan.aesthetic}

**Why this works:**
{plan.explanation}"""

        return outfit_text, result["image"]
    except Exception as e:
        return f"Error: {e}", None


def run_base_llm(situation: str) -> str:
    """Run the base (unfine-tuned) LLM for before/after comparison."""
    if not situation.strip():
        return ""
    messages = [
        {"role": "user", "content": f"What should I wear? {situation}"},
    ]
    input_ids = base_llm_tokenizer.apply_chat_template(
        messages, add_generation_prompt=True, return_tensors="pt"
    ).to(base_llm_model.device)
    with torch.no_grad():
        output = base_llm_model.generate(
            input_ids, max_new_tokens=200, temperature=0.7,
            top_p=0.9, do_sample=True,
            pad_token_id=base_llm_tokenizer.eos_token_id,
        )
    return base_llm_tokenizer.decode(output[0][input_ids.shape[-1]:], skip_special_tokens=True)


def build_demo_ui(compare_mode: bool = False):
    with gr.Blocks(
        title="Style2Fit",
        theme=gr.themes.Soft(primary_hue="rose", neutral_hue="slate"),
        css=".output-image img { border-radius: 12px; }",
    ) as demo:

        gr.Markdown("""
# Style2Fit ✨
### Describe your situation. Get a real outfit. See it on a person.
*Talk to it like you're texting a friend.*
""")

        with gr.Row():
            with gr.Column(scale=2):
                situation_input = gr.Textbox(
                    label="What's the situation?",
                    placeholder="i have a coffee date tmrw what do i wear",
                    lines=2,
                )
                aesthetic_input = gr.Dropdown(
                    choices=AESTHETIC_CHOICES,
                    value="infer from situation",
                    label="Aesthetic (optional)",
                )
                steps_slider = gr.Slider(
                    minimum=20, maximum=50, value=30, step=5,
                    label="Image quality (inference steps)",
                )
                run_btn = gr.Button("Generate Outfit", variant="primary")

                gr.Examples(
                    examples=[[p, "infer from situation"] for p in EXAMPLE_PROMPTS],
                    inputs=[situation_input, aesthetic_input],
                    label="Example prompts",
                )

            with gr.Column(scale=3):
                if compare_mode:
                    with gr.Tab("Style2Fit (After)"):
                        outfit_output = gr.Markdown(label="Outfit Plan")
                        image_output = gr.Image(label="Outfit Visual", type="pil")
                    with gr.Tab("Base LLM (Before)"):
                        base_output = gr.Textbox(label="Base model response", lines=8)
                        compare_btn = gr.Button("Run base model comparison")
                        compare_btn.click(
                            fn=run_base_llm,
                            inputs=[situation_input],
                            outputs=[base_output],
                        )
                else:
                    outfit_output = gr.Markdown(label="Outfit Plan")
                    image_output = gr.Image(label="Outfit Visual", type="pil")

        run_btn.click(
            fn=run_style2fit,
            inputs=[situation_input, aesthetic_input, steps_slider],
            outputs=[outfit_output, image_output],
        )

        # Also trigger on Enter
        situation_input.submit(
            fn=run_style2fit,
            inputs=[situation_input, aesthetic_input, steps_slider],
            outputs=[outfit_output, image_output],
        )

    return demo


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--llm", type=str, default=None, help="Path to LLM LoRA adapter")
    parser.add_argument("--sdxl", type=str, default=None, help="Path to SDXL LoRA weights")
    parser.add_argument("--compare", action="store_true", help="Enable before/after comparison tab")
    parser.add_argument("--port", type=int, default=7860)
    parser.add_argument("--share", action="store_true")
    args = parser.parse_args()

    global pipe, base_llm_tokenizer, base_llm_model

    print("Loading Style2Fit pipeline...")
    pipe = Style2FitPipeline(llm_adapter=args.llm, sdxl_lora=args.sdxl)

    if args.compare:
        print("Loading base LLM for comparison...")
        bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
                                  bnb_4bit_compute_dtype=torch.bfloat16)
        base_llm_tokenizer = AutoTokenizer.from_pretrained(BASE_LLM)
        base_llm_model = AutoModelForCausalLM.from_pretrained(
            BASE_LLM, quantization_config=bnb, device_map="auto"
        )

    demo = build_demo_ui(compare_mode=args.compare)
    demo.launch(server_port=args.port, share=args.share)


if __name__ == "__main__":
    main()
