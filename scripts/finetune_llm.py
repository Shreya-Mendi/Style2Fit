"""
QLoRA fine-tuning of Llama 3.1 8B Instruct for Style2Fit.

Trains the model to take casual natural language situation prompts
and produce structured outfit recommendations.

Run on Colab A100:
    pip install transformers peft bitsandbytes datasets accelerate trl
    python finetune_llm.py --data data/synthetic/train.jsonl --out models/llm

Checkpoints saved to models/llm/checkpoint-*/
Final adapter saved to models/llm/final/
"""

import json
import argparse
from pathlib import Path
from datasets import Dataset
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

BASE_MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct"  # swap to mistralai/Mistral-7B-Instruct-v0.3 if needed

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


def format_example(row: dict) -> str:
    """Convert a training pair into a chat-formatted string for instruction tuning."""
    user_content = row["instruction"]
    if row.get("input") and row["input"] != "aesthetic: infer | season: infer":
        user_content += f"\n{row['input']}"

    return (
        f"<|begin_of_text|>"
        f"<|start_header_id|>system<|end_header_id|>\n{SYSTEM_PROMPT}<|eot_id|>"
        f"<|start_header_id|>user<|end_header_id|>\n{user_content}<|eot_id|>"
        f"<|start_header_id|>assistant<|end_header_id|>\n{row['output']}<|eot_id|>"
    )


def load_dataset_from_jsonl(path: str) -> Dataset:
    rows = []
    with open(path) as f:
        for line in f:
            row = json.loads(line)
            rows.append({"text": format_example(row)})
    return Dataset.from_list(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="data/synthetic/train.jsonl")
    parser.add_argument("--out", type=str, default="models/llm")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=4)
    parser.add_argument("--lr", type=float, default=2e-4)
    args = parser.parse_args()

    Path(args.out).mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # 4-bit quantization config (QLoRA)
    # ------------------------------------------------------------------
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )

    # ------------------------------------------------------------------
    # Load model + tokenizer
    # ------------------------------------------------------------------
    print(f"Loading {BASE_MODEL}...")
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
    )
    model.config.use_cache = False

    # ------------------------------------------------------------------
    # LoRA config — all attention layers (no time constraint)
    # ------------------------------------------------------------------
    lora_config = LoraConfig(
        task_type=TaskType.CAUSAL_LM,
        r=16,
        lora_alpha=32,
        lora_dropout=0.05,
        bias="none",
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",   # attention
            "gate_proj", "up_proj", "down_proj",        # MLP
        ],
    )
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # ------------------------------------------------------------------
    # Dataset
    # ------------------------------------------------------------------
    print(f"Loading dataset from {args.data}...")
    dataset = load_dataset_from_jsonl(args.data)
    print(f"  {len(dataset)} training examples")

    # 90/10 train/eval split
    split = dataset.train_test_split(test_size=0.1, seed=42)

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------
    training_args = TrainingArguments(
        output_dir=args.out,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        gradient_accumulation_steps=4,
        learning_rate=args.lr,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        bf16=True,
        logging_steps=10,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=split["train"],
        eval_dataset=split["test"],
        dataset_text_field="text",
        max_seq_length=512,
        tokenizer=tokenizer,
    )

    print("Starting training...")
    trainer.train()

    # ------------------------------------------------------------------
    # Save final adapter
    # ------------------------------------------------------------------
    final_path = Path(args.out) / "final"
    trainer.model.save_pretrained(final_path)
    tokenizer.save_pretrained(final_path)
    print(f"Adapter saved to {final_path}")


if __name__ == "__main__":
    main()
