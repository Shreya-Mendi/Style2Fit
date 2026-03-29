"""
Training data generation for Style2Fit LLM fine-tuning.

Two modes:
  1. fashiongen (default) — loads Fashion-Gen dataset, filters to full outfits,
     converts each description into a casual situation + structured outfit pair.
     Grounded in real fashion data. Recommended.

  2. synthetic — generates fully synthetic pairs from seed situations using Claude.
     Use if Fashion-Gen is unavailable or as a supplement.

Usage:
    export ANTHROPIC_API_KEY=...

    # Grounded from Fashion-Gen (recommended):
    python scripts/generate_training_data.py --mode fashiongen --n 500 --out data/synthetic/train.jsonl

    # Fully synthetic:
    python scripts/generate_training_data.py --mode synthetic --n 300 --out data/synthetic/train.jsonl
"""

import json
import random
import argparse
import re
from pathlib import Path
import anthropic

# ---------------------------------------------------------------------------
# Shared config
# ---------------------------------------------------------------------------

SEASONS = ["spring", "summer", "fall", "winter"]
REQUIRED_FIELDS = ["Top:", "Bottom:", "Shoes:", "Aesthetic:", "Explanation:"]

# ---------------------------------------------------------------------------
# MODE 1: Fashion-Gen grounded pairs
# ---------------------------------------------------------------------------

CATEGORY_SIGNALS = {
    "top":       ["shirt", "tee", "blouse", "sweater", "top", "jacket", "coat",
                  "blazer", "cardigan", "hoodie", "sweatshirt", "vest", "tank"],
    "bottom":    ["pant", "trouser", "jean", "skirt", "short", "legging", "chino",
                  "slack", "culotte", "wide-leg", "straight-leg"],
    "shoes":     ["shoe", "boot", "sneaker", "heel", "loafer", "sandal", "flat",
                  "oxford", "pump", "mule", "wedge"],
    "outerwear": ["coat", "jacket", "blazer", "trench", "parka", "anorak",
                  "overcoat", "windbreaker", "cape"],
    "accessory": ["bag", "belt", "scarf", "hat", "earring", "necklace", "bracelet",
                  "sunglasses", "watch", "purse", "tote", "clutch"],
}

MIN_CATEGORIES = 3

FASHIONGEN_SYSTEM_PROMPT = """You are generating training data for a fashion AI assistant called Style2Fit.

Given a fashion product description, output TWO things:

1. SITUATION: A casual, conversational prompt a real person might type — like texting a friend.
   - Vary the register: sometimes lowercase, sometimes with typos, sometimes incomplete
   - The situation should naturally lead someone to want this outfit
   - Examples: "coffee date tmrw help", "first day at my internship", "going to a rooftop bar friday"

2. OUTFIT: The structured outfit plan derived from the product description.
   - Fill in any missing pieces logically (if description only mentions top + bottom, infer shoes)
   - Keep descriptions specific: color, material, fit where available
   - Aesthetic should be 1-2 words
   - Explanation should be 2 sentences max, conversational

Always respond in EXACTLY this format, no extra text:
SITUATION: <casual prompt>
---
Top: <item>
Bottom: <item>
Shoes: <item>
Outerwear: <item or "none needed">
Accessories: <2-3 items>
Aesthetic: <1-2 words>
Explanation: <why this works>"""


def is_full_outfit(entry: dict) -> bool:
    description = entry.get("text") or entry.get("description") or entry.get("caption") or ""
    if len(description) < 40:
        return False
    desc_lower = description.lower()
    categories_found = sum(
        1 for signals in CATEGORY_SIGNALS.values()
        if any(s in desc_lower for s in signals)
    )
    return categories_found >= MIN_CATEGORIES


def convert_fashiongen_entry(client: anthropic.Anthropic, description: str) -> dict | None:
    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            system=FASHIONGEN_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Fashion description:\n{description}"}],
        )
        text = response.content[0].text.strip()

        if "---" not in text or "SITUATION:" not in text:
            return None

        parts = text.split("---", 1)
        situation = re.sub(r"^SITUATION:\s*", "", parts[0].strip(), flags=re.IGNORECASE).strip()
        outfit_text = parts[1].strip()

        if not all(f in outfit_text for f in REQUIRED_FIELDS):
            return None

        return {
            "instruction": situation,
            "input": "",
            "output": outfit_text,
            "source": "fashiongen",
        }
    except Exception as e:
        print(f"  Error: {e}")
        return None


def generate_fashiongen_pairs(client: anthropic.Anthropic, n: int) -> list[dict]:
    from datasets import load_dataset

    print("Loading fashion200k dataset...")
    ds = load_dataset("Marqo/fashion200k", split="data")
    print(f"  Total entries: {len(ds)}")

    print("Filtering to full outfits...")
    full_outfits = [e for e in ds if is_full_outfit(e)]
    print(f"  Full outfit entries: {len(full_outfits)} ({len(full_outfits)/len(ds)*100:.1f}%)")

    sampled = random.sample(full_outfits, min(n * 2, len(full_outfits)))

    pairs = []
    attempts = 0
    print(f"\nConverting to {n} training pairs...")

    for entry in sampled:
        if len(pairs) >= n:
            break
        description = entry.get("text") or entry.get("description") or entry.get("caption") or ""
        pair = convert_fashiongen_entry(client, description)
        attempts += 1
        if pair:
            pairs.append(pair)
            if len(pairs) % 50 == 0:
                print(f"  {len(pairs)}/{n} converted (attempts: {attempts})")

    print(f"  Success rate: {len(pairs)}/{attempts} ({len(pairs)/max(attempts,1)*100:.1f}%)")
    return pairs


# ---------------------------------------------------------------------------
# MODE 2: Fully synthetic pairs
# ---------------------------------------------------------------------------

SITUATION_SEEDS = [
    "i have a coffee date tmrw what do i wear",
    "coffee date this weekend, its supposed to rain",
    "going on a first date to a cute cafe, want to look effortless",
    "meeting someone for the first time at a coffee shop, nervous lol",
    "brunch with friends sunday, its finally warm out",
    "first day at my internship next monday, business casual",
    "i have a big presentation today and want to look confident",
    "job interview at a tech startup, what should i wear",
    "going into the office for the first time in months",
    "client meeting, need to look polished but not overdressed",
    "going to a concert this weekend, indie/alt vibe",
    "birthday dinner at a nice restaurant",
    "rooftop bar with friends friday night",
    "club night but i want to look cool not try hard",
    "house party, want something cute but comfortable",
    "packing for lisbon for a week in april, mix of sightseeing and dinners",
    "weekend trip to nyc in november",
    "beach vacation next week, need full looks not just swimsuits",
    "paris for 5 days in the fall, what are my outfits",
    "wedding guest outfit, outdoor summer ceremony",
    "graduation ceremony next month",
    "galentines dinner with my friends",
    "baby shower this weekend, what do i wear as a guest",
    "museum date, want to look artsy",
    "its finally fall, i want a cozy but put together look",
    "its like 90 degrees and i have to look nice",
    "rainy day but i still want to look cute",
    "first real cold day of the year, transitional weather",
    "i want to look like i have my life together",
    "soft girl era, what do i wear",
    "going through a dark academia phase help",
    "old money aesthetic for a day out",
    "clean girl look for running errands",
]

AESTHETICS = [
    "clean girl", "dark academia", "old money", "streetwear",
    "soft girl", "coastal grandmother", "indie", "minimalist",
    "boho", "preppy", "y2k", "cottagecore", None, None, None,
]

SYNTHETIC_SYSTEM_PROMPT = """You are a fashion stylist assistant generating training data for a fine-tuned outfit recommendation model.

Given a casual, conversational situation prompt, generate a structured outfit recommendation.

Rules:
- Infer any missing context (season, weather, formality) from the situation
- The outfit must be coherent — all pieces work together aesthetically
- Explanation should be 2-3 sentences max, conversational

Always respond in EXACTLY this format:
Top: [specific item with color/material]
Bottom: [specific item with color/material]
Shoes: [specific item]
Outerwear: [item or "none needed"]
Accessories: [2-3 items]
Aesthetic: [1-2 words]
Explanation: [why this works for the situation]"""


def generate_synthetic_pair(client: anthropic.Anthropic, situation: str, aesthetic: str | None, season: str) -> dict | None:
    parts = [situation]
    if aesthetic:
        parts.append(f"aesthetic: {aesthetic}")
    parts.append(f"season: {season}")
    user_msg = " | ".join(parts)

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=400,
            system=SYNTHETIC_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_msg}],
        )
        output = response.content[0].text.strip()

        if not all(f in output for f in REQUIRED_FIELDS):
            return None

        return {
            "instruction": situation,
            "input": f"aesthetic: {aesthetic or 'infer'} | season: {season}",
            "output": output,
            "source": "synthetic",
        }
    except Exception as e:
        print(f"  Error: {e}")
        return None


def generate_synthetic_pairs(client: anthropic.Anthropic, n: int) -> list[dict]:
    pairs = []
    attempts = 0
    fillers = ["omg ", "help ", "idk what to wear, ", "so ", "okay so "]

    print(f"Generating {n} synthetic pairs...")
    while len(pairs) < n and attempts < n * 2:
        situation = random.choice(SITUATION_SEEDS)
        if random.random() < 0.4:
            situation = random.choice(fillers) + situation
        aesthetic = random.choice(AESTHETICS)
        season = random.choice(SEASONS)

        pair = generate_synthetic_pair(client, situation, aesthetic, season)
        attempts += 1
        if pair:
            pairs.append(pair)
            if len(pairs) % 50 == 0:
                print(f"  {len(pairs)}/{n} generated...")

    return pairs


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["fashiongen", "synthetic"], default="fashiongen",
                        help="fashiongen: grounded from real data (recommended). synthetic: fully generated.")
    parser.add_argument("--n", type=int, default=500)
    parser.add_argument("--out", type=str, default="data/synthetic/train.jsonl")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    random.seed(args.seed)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env

    if args.mode == "fashiongen":
        pairs = generate_fashiongen_pairs(client, args.n)
    else:
        pairs = generate_synthetic_pairs(client, args.n)

    with open(out_path, "w") as f:
        for pair in pairs:
            f.write(json.dumps(pair) + "\n")
    print(f"\nSaved {len(pairs)} pairs to {out_path}")

    preview_path = out_path.parent / "preview.json"
    with open(preview_path, "w") as f:
        json.dump(pairs[:5], f, indent=2)
    print(f"Preview saved to {preview_path}")

    if pairs:
        print("\n--- Sample pair ---")
        p = pairs[0]
        print(f"SITUATION: {p['instruction']}")
        print(f"OUTFIT:\n{p['output']}")


if __name__ == "__main__":
    main()
