"""
Style2Fit Training Data Generator
Uses OpenRouter API (nemotron free model) to generate training samples.

Usage:
  1. export OPENROUTER_API_KEY="your-key-here"
  2. python generate_data.py
  3. Output: style2fit_training_data.jsonl (ready for Colab notebook Part 1)
"""

import os
import json
import time
import requests

API_KEY = os.environ.get("OPENROUTER_API_KEY")
if not API_KEY:
    raise ValueError("Set OPENROUTER_API_KEY environment variable first")

MODEL = "nvidia/nemotron-3-super-120b-a12b:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

# The fixed instruction field for every training sample
SYSTEM_INSTRUCTION = (
    "You are Style2Fit, a fashion styling assistant. Given a situation "
    "described in natural language, generate a complete, structured outfit "
    "recommendation. Include specific items with colors and materials, an "
    "overall aesthetic label, and a brief explanation of why the outfit "
    "works for the situation."
)

# ────────────────────────────────────────────
# 10 hand-written seed samples (already validated)
# ────────────────────────────────────────────
SEED_SAMPLES = [
    {
        "input": "I have a coffee date tomorrow morning. The weather forecast says around 58°F and rainy.",
        "output": "Top: oversized cream ribbed knit sweater\nBottom: straight-leg dark wash jeans\nShoes: white leather low-top sneakers\nOuterwear: camel wool-blend trench coat\nAccessories: small gold hoop earrings, structured leather tote bag\nAesthetic: clean girl, effortless chic\nExplanation: The neutral palette keeps the look polished without being overdressed for a casual coffee date. The trench coat handles the rain while adding structure to the relaxed sweater-and-jeans base. Minimal gold jewelry signals intentionality without trying too hard."
    },
    {
        "input": "First day at my tech internship next Monday. The dress code is business casual. I'm nervous and want to look professional but approachable.",
        "output": "Top: light blue Oxford cloth button-down shirt, sleeves rolled to forearms\nBottom: tailored navy chinos with a slim taper\nShoes: clean white leather minimalist sneakers\nOuterwear: navy cotton blazer (optional, carry it)\nAccessories: simple leather watch, canvas messenger bag\nAesthetic: smart casual, polished but relaxed\nExplanation: The Oxford shirt reads professional without being stiff — rolling the sleeves softens the look and signals approachability. Navy-on-blue tonal pairing looks intentional and cohesive. White sneakers keep it modern and appropriate for a tech environment where dress shoes would feel overdressed."
    },
    {
        "input": "Going to an indie rock concert this Saturday night. I want to look cool but comfortable enough to stand for hours.",
        "output": "Top: vintage-wash black graphic band tee\nBottom: high-waisted straight-leg black jeans\nShoes: black leather chunky-sole boots\nOuterwear: oversized olive green utility jacket\nAccessories: layered silver chain necklaces, black leather crossbody bag\nAesthetic: indie grunge, effortless edge\nExplanation: All-black base creates a sleek canvas that fits the concert energy. The utility jacket adds visual interest with a different texture and color while being easy to tie around the waist if it gets hot. Chunky boots are comfortable for standing and complete the aesthetic. Crossbody bag keeps hands free in a crowd."
    },
    {
        "input": "I have a big presentation at work on Thursday. I want to look confident and authoritative but not intimidating.",
        "output": "Top: fitted white silk blouse with a soft V-neck\nBottom: high-waisted charcoal wool trousers with a wide leg\nShoes: pointed-toe black leather block heels\nOuterwear: structured charcoal blazer, matching trousers\nAccessories: delicate gold pendant necklace, leather portfolio, pearl stud earrings\nAesthetic: power professional, refined authority\nExplanation: The matching charcoal suit projects authority and competence. The white silk blouse with a soft neckline prevents the look from feeling too rigid or unapproachable. Block heels provide height and confidence without sacrificing comfort during a long presentation. Delicate gold jewelry adds warmth without distraction."
    },
    {
        "input": "Weekend trip to Lisbon in April. I need something that works for walking around sightseeing during the day and going to a nice dinner at night.",
        "output": "Top: relaxed-fit white linen button-down shirt\nBottom: tailored beige chinos with a slight crop\nShoes: tan suede loafers, no socks\nOuterwear: lightweight navy cotton bomber jacket\nAccessories: woven leather belt, classic sunglasses, canvas weekender bag\nAesthetic: Mediterranean casual, versatile traveler\nExplanation: The linen shirt works untucked for sightseeing and tucked in for dinner — maximum versatility from one piece. Beige chinos bridge the gap between casual daywear and restaurant-appropriate. Suede loafers are comfortable for walking but elevated enough for evening. The bomber jacket handles cool April evenings without bulk."
    },
    {
        "input": "Outdoor summer wedding in the countryside as a guest. The invitation says festive attire. It'll be hot, around 85°F.",
        "output": "Top: (integrated with dress)\nBottom: (integrated with dress)\nDress: midi-length sage green floral wrap dress in lightweight chiffon\nShoes: strappy nude block-heel sandals\nOuterwear: none needed, bring a lightweight pashmina for evening\nAccessories: gold statement earrings, small beaded clutch, fresh flowers in hair optional\nAesthetic: garden party, romantic elegance\nExplanation: A wrap dress in sage green is wedding-appropriate without competing with the bridal party. Chiffon breathes in 85°F heat while maintaining an elegant drape. Block-heel sandals won't sink into grass like stilettos. The nude color elongates the leg line. Statement earrings provide sparkle without a heavy necklace competing with the wrap neckline."
    },
    {
        "input": "Studying at the library all day. I want to be super comfortable but not look like I just rolled out of bed.",
        "output": "Top: oatmeal-colored cashmere crewneck sweater\nBottom: black high-waisted leggings\nShoes: clean white canvas slip-on sneakers\nOuterwear: long camel cardigan for layering\nAccessories: minimal gold studs, hair claw clip, structured backpack\nAesthetic: cozy academic, put-together comfort\nExplanation: The cashmere sweater elevates what could be a lazy outfit — it reads intentional rather than sloppy. Black leggings provide all-day sitting comfort. The long cardigan adds a layer for library AC while creating a more structured silhouette than a hoodie would. A structured backpack carries books while looking more polished than a gym bag."
    },
    {
        "input": "First date at a trendy rooftop bar downtown. It's a Friday evening in October. I want to look attractive but not overdone.",
        "output": "Top: black ribbed turtleneck, fitted\nBottom: dark olive tailored cargo pants with a slim fit\nShoes: tan suede Chelsea boots\nOuterwear: cognac leather jacket\nAccessories: silver watch, subtle cologne, dark tortoiseshell sunglasses (for golden hour)\nAesthetic: urban sophisticate, understated cool\nExplanation: The black turtleneck is universally flattering and signals effort without overdressing. Slim cargo pants add visual interest with their pocket detailing while staying clean-lined. The cognac leather jacket introduces warmth and texture, creating a palette that says confident and interesting. Chelsea boots bridge casual and dressed-up perfectly for a rooftop bar setting."
    },
    {
        "input": "I'm going to a casual backyard BBQ with friends this Sunday afternoon. Weather is warm, around 78°F and sunny.",
        "output": "Top: relaxed-fit faded blue chambray short-sleeve shirt\nBottom: classic khaki chino shorts, 7-inch inseam\nShoes: brown leather sandals\nOuterwear: none needed\nAccessories: woven rope bracelet, baseball cap, polarized sunglasses\nAesthetic: laid-back Americana, easy weekend\nExplanation: Chambray reads a step above a basic t-shirt while being just as comfortable — appropriate effort level for a friend's backyard. Khaki shorts keep things cool and classic. Leather sandals signal relaxation while avoiding the too-casual look of flip-flops. A baseball cap provides sun protection and completes the weekend-mode vibe."
    },
    {
        "input": "Job interview at a creative agency (graphic design role). The company culture seems pretty casual based on their Instagram. I don't want to show up in a full suit but need to look like I take this seriously.",
        "output": "Top: well-fitted black crewneck merino wool sweater\nBottom: dark indigo selvedge jeans, no distressing\nShoes: clean white minimalist leather sneakers\nOuterwear: unstructured charcoal sport coat\nAccessories: simple black leather portfolio, no-show socks, minimal silver ring\nAesthetic: creative professional, design-conscious\nExplanation: The unstructured sport coat over a crewneck sweater hits the sweet spot — more polished than their daily wear but not corporate. Dark selvedge jeans signal that you understand quality and detail (important for a design role) without being formal. The entirely monochromatic palette with clean lines subtly demonstrates design sensibility. White sneakers show cultural awareness of creative industry norms."
    },
]

# ────────────────────────────────────────────
# Batched prompt for the API
# ────────────────────────────────────────────
# We ask for 10 samples per API call, 7 calls = 70 samples
# This avoids hitting output length limits on free models.

def build_batch_prompt(batch_num, batch_size=10):
    """Build a prompt asking for a batch of training samples."""

    # Vary the focus per batch for diversity
    batch_themes = [
        "Focus on FEMALE-presenting outfits. Mix of casual, professional, and formal occasions across all seasons.",
        "Focus on MALE-presenting outfits. Mix of casual, professional, and formal occasions across all seasons.",
        "Focus on GENDER-NEUTRAL outfits. Include streetwear, athleisure, and minimalist aesthetics.",
        "Focus on TRAVEL and VACATION scenarios. Include beach trips, city breaks, mountain getaways, tropical destinations.",
        "Focus on EMOTIONAL CONTEXT. The user mentions feelings like nervous, confident, playful, powerful, cozy, rebellious.",
        "Focus on SPECIFIC WEATHER conditions. Include extreme heat, snow, wind, humidity, rain, transitional seasons.",
        "Focus on NICHE OCCASIONS. Include funerals, religious events, gallery openings, first days of school, graduation dinners, airport outfits, moving day, courthouse visit.",
        "Focus on AESTHETIC-SPECIFIC outfits. Each sample should name a distinct aesthetic: dark academia, old money, cottagecore, Y2K, gorpcore, quiet luxury, coastal grandmother, soft girl, mob wife.",
        "Focus on BUDGET AND CONSTRAINT scenarios. Users mention budget limits, rewearing specific items, capsule wardrobes, packing light, or not owning certain categories like heels or suits.",
        "Focus on AGE-DIVERSE AND CULTURAL scenarios. Include outfits for teens, college students, 30-somethings, and older adults. Include Lunar New Year, Diwali, Eid celebration, Thanksgiving, Hanukkah dinner.",
    ]

    theme = batch_themes[batch_num % len(batch_themes)]

    return f"""Generate exactly {batch_size} fashion outfit training samples in JSONL format.

RULES:
- Each line must be a valid JSON object with exactly three keys: "instruction", "input", "output"
- The "instruction" value is ALWAYS this exact string: "{SYSTEM_INSTRUCTION}"
- The "input" is a natural, conversational situation description (1-3 sentences)
- The "output" MUST follow this exact structure:
  Top: [specific item with color and material]
  Bottom: [specific item with color and material]
  Shoes: [specific item with color and material]
  Outerwear: [item or "none needed"]
  Accessories: [2-3 specific items]
  Aesthetic: [2-3 word label]
  Explanation: [2-3 sentences]
- For dresses/jumpsuits, use "Dress:" or "Jumpsuit:" instead of separate Top/Bottom
- Be SPECIFIC about colors, materials, and fits (not "a nice shirt" but "fitted sage green linen button-down")
- Each sample must be UNIQUE — different situation, different outfit

DIVERSITY THEME FOR THIS BATCH:
{theme}

EXAMPLE (for format reference only — do NOT repeat this):
{{"instruction": "{SYSTEM_INSTRUCTION}", "input": "Coffee date tomorrow, rainy and 55F.", "output": "Top: oversized cream knit sweater\\nBottom: straight-leg dark wash jeans\\nShoes: white leather sneakers\\nOuterwear: camel trench coat\\nAccessories: gold hoops, leather tote\\nAesthetic: clean girl, effortless\\nExplanation: Neutral palette stays polished. Trench handles rain. Minimal jewelry keeps it casual but intentional."}}

Output ONLY {batch_size} JSONL lines. No markdown, no code fences, no explanation. Start immediately with the first JSON object."""


def call_api(prompt, max_retries=3):
    """Call OpenRouter API with retries."""
    for attempt in range(max_retries):
        try:
            response = requests.post(
                API_URL,
                headers=HEADERS,
                data=json.dumps({
                    "model": MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.9,
                    "max_tokens": 4096,
                }),
                timeout=120,
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return content
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt < max_retries - 1:
                wait = 10 * (attempt + 1)
                print(f"  Retrying in {wait}s...")
                time.sleep(wait)
    return None


def parse_jsonl_response(text):
    """Parse JSONL lines from API response, skipping bad lines."""
    samples = []
    for line in text.strip().split("\n"):
        line = line.strip()
        if not line or line.startswith("```") or line.startswith("#"):
            continue
        try:
            obj = json.loads(line)
            # Validate required fields
            if all(k in obj for k in ("instruction", "input", "output")):
                # Ensure the output has the right structure
                out = obj["output"]
                if "Top:" in out or "Dress:" in out or "Jumpsuit:" in out:
                    if "Aesthetic:" in out and "Explanation:" in out:
                        # Force correct instruction
                        obj["instruction"] = SYSTEM_INSTRUCTION
                        samples.append(obj)
        except json.JSONDecodeError:
            continue
    return samples


def main():
    all_samples = []

    # Step 1: Add the 10 hand-written seed samples
    print("Adding 10 seed samples...")
    for s in SEED_SAMPLES:
        all_samples.append({
            "instruction": SYSTEM_INSTRUCTION,
            "input": s["input"],
            "output": s["output"],
        })
    print(f"  Total so far: {len(all_samples)}")

    # Step 2: Generate 10 batches of 10 = 100 samples via API
    target_generated = 100
    batch_size = 10
    num_batches = 10
    generated = 0

    for batch_num in range(num_batches):
        if generated >= target_generated:
            break

        print(f"\nBatch {batch_num+1}/{num_batches}: requesting {batch_size} samples...")
        prompt = build_batch_prompt(batch_num, batch_size)
        response_text = call_api(prompt)

        if response_text is None:
            print(f"  FAILED — skipping batch {batch_num+1}")
            continue

        parsed = parse_jsonl_response(response_text)
        print(f"  Parsed {len(parsed)} valid samples from response")

        all_samples.extend(parsed)
        generated += len(parsed)
        print(f"  Total so far: {len(all_samples)}")

        # Rate limit: wait between calls for free model
        if batch_num < num_batches - 1:
            print("  Waiting 15s before next batch...")
            time.sleep(15)

    # Step 3: Deduplicate by input text
    seen_inputs = set()
    deduped = []
    for s in all_samples:
        key = s["input"].strip().lower()
        if key not in seen_inputs:
            seen_inputs.add(key)
            deduped.append(s)
    print(f"\nAfter dedup: {len(deduped)} unique samples")

    # Step 4: Write output file
    output_file = "style2fit_training_data.jsonl"
    with open(output_file, "w") as f:
        for s in deduped:
            f.write(json.dumps(s, ensure_ascii=False) + "\n")

    print(f"\nDone! Saved {len(deduped)} samples to {output_file}")
    print("This file is ready to upload to Colab for Part 1 of the notebook.")

    # Quick stats
    inputs_text = " ".join(s["input"] for s in deduped)
    has_weather = sum(1 for s in deduped if any(w in s["input"].lower() for w in ["°f", "°c", "rain", "snow", "sunny", "hot", "cold", "warm", "chilly"]))
    has_emotion = sum(1 for s in deduped if any(w in s["input"].lower() for w in ["nervous", "confident", "anxious", "excited", "comfortable", "powerful", "playful"]))
    print(f"\nStats:")
    print(f"  Samples with weather context: {has_weather}/{len(deduped)}")
    print(f"  Samples with emotional context: {has_emotion}/{len(deduped)}")


if __name__ == "__main__":
    main()
