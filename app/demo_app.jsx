import { useState } from "react";
import { Sparkles, Layers, ChevronDown, Quote, Shirt, Palette, Sun, Snowflake, Leaf, Flower2 } from "lucide-react";

const DEMO_DATA = [
  {
    id: "coffee_date_rainy",
    gender: "female",
    season: "fall",
    style: "clean girl",
    prompt: "Coffee date tomorrow morning, it's going to be rainy and chilly around 55\u00B0F.",
    before_text: "You could wear a nice sweater with some jeans and maybe boots. A jacket would be good for the rain. Some earrings could complete the look.",
    after_text: "Top: oversized cream ribbed knit sweater\nBottom: straight-leg dark wash jeans\nShoes: white leather low-top sneakers\nOuterwear: camel wool-blend trench coat\nAccessories: small gold hoop earrings, structured leather tote bag\nAesthetic: clean girl, effortless chic\nExplanation: The neutral palette keeps the look polished without being overdressed for a casual coffee date. The trench coat handles the rain while adding structure.",
    before_image_base64: null,
    after_image_base64: null,
  },
  {
    id: "tech_internship",
    gender: "male",
    season: "spring",
    style: "smart casual",
    prompt: "First day at my tech internship, business casual dress code. I'm nervous.",
    before_text: "Wear a button-down shirt with khakis and dress shoes. Maybe add a belt. Keep it simple and professional.",
    after_text: "Top: light blue Oxford cloth button-down shirt, sleeves rolled to forearms\nBottom: tailored navy chinos with a slim taper\nShoes: clean white leather minimalist sneakers\nOuterwear: navy cotton blazer (optional, carry it)\nAccessories: simple leather watch, canvas messenger bag\nAesthetic: smart casual, polished but relaxed\nExplanation: The Oxford shirt reads professional without being stiff \u2014 rolling the sleeves softens the look.",
    before_image_base64: null,
    after_image_base64: null,
  },
  {
    id: "indie_concert",
    gender: "neutral",
    season: "summer",
    style: "indie grunge",
    prompt: "Going to an indie rock concert Saturday night, want to look cool but stand for hours.",
    before_text: "Wear a band t-shirt with jeans and comfortable shoes. Maybe a jacket in case it gets cold.",
    after_text: "Top: vintage-wash black graphic band tee\nBottom: high-waisted straight-leg black jeans\nShoes: black leather chunky-sole boots\nOuterwear: oversized olive green utility jacket\nAccessories: layered silver chain necklaces, black leather crossbody bag\nAesthetic: indie grunge, effortless edge\nExplanation: All-black base creates a sleek canvas that fits the concert energy. Chunky boots are comfortable for standing.",
    before_image_base64: null,
    after_image_base64: null,
  },
  {
    id: "work_presentation",
    gender: "female",
    season: "winter",
    style: "power professional",
    prompt: "Big presentation at work Thursday. Want to look confident but not intimidating.",
    before_text: "A blazer with nice pants and heels would work well. Keep colors neutral. Add some jewelry.",
    after_text: "Top: fitted white silk blouse with a soft V-neck\nBottom: high-waisted charcoal wool trousers with a wide leg\nShoes: pointed-toe black leather block heels\nOuterwear: structured charcoal blazer, matching trousers\nAccessories: delicate gold pendant necklace, leather portfolio, pearl stud earrings\nAesthetic: power professional, refined authority\nExplanation: The matching charcoal suit projects authority. The white silk blouse prevents the look from feeling too rigid.",
    before_image_base64: null,
    after_image_base64: null,
  },
  {
    id: "lisbon_trip",
    gender: "male",
    season: "spring",
    style: "Mediterranean casual",
    prompt: "Weekend trip to Lisbon in April. Need outfits for sightseeing and dinners.",
    before_text: "Pack some casual clothes like t-shirts, shorts, and comfortable walking shoes. Bring a jacket for evenings.",
    after_text: "Top: relaxed-fit white linen button-down shirt\nBottom: tailored beige chinos with a slight crop\nShoes: tan suede loafers, no socks\nOuterwear: lightweight navy cotton bomber jacket\nAccessories: woven leather belt, classic sunglasses, canvas weekender bag\nAesthetic: Mediterranean casual, versatile traveler\nExplanation: The linen shirt works untucked for sightseeing and tucked in for dinner \u2014 maximum versatility.",
    before_image_base64: null,
    after_image_base64: null,
  },
  {
    id: "summer_wedding",
    gender: "female",
    season: "summer",
    style: "garden party",
    prompt: "Outdoor summer wedding guest, festive attire, 85\u00B0F and sunny.",
    before_text: "Wear a nice dress with heels and some accessories. Choose light colors for summer. Don't forget sunscreen.",
    after_text: "Dress: midi-length sage green floral wrap dress in lightweight chiffon\nShoes: strappy nude block-heel sandals\nOuterwear: none needed, bring a lightweight pashmina for evening\nAccessories: gold statement earrings, small beaded clutch, fresh flowers in hair optional\nAesthetic: garden party, romantic elegance\nExplanation: A wrap dress in sage green is wedding-appropriate without competing with the bridal party. Chiffon breathes in 85\u00B0F heat.",
    before_image_base64: null,
    after_image_base64: null,
  },
  {
    id: "rooftop_date",
    gender: "male",
    season: "fall",
    style: "urban cool",
    prompt: "First date at a trendy rooftop bar, Friday evening in October.",
    before_text: "Wear dark jeans with a nice shirt and maybe a jacket. Keep it casual but put together.",
    after_text: "Top: black ribbed turtleneck, fitted\nBottom: dark olive tailored cargo pants with a slim fit\nShoes: tan suede Chelsea boots\nOuterwear: cognac leather jacket\nAccessories: silver watch, subtle cologne, dark tortoiseshell sunglasses (for golden hour)\nAesthetic: urban sophisticate, understated cool\nExplanation: The black turtleneck signals effort without overdressing. Chelsea boots bridge casual and dressed-up perfectly.",
    before_image_base64: null,
    after_image_base64: null,
  },
  {
    id: "creative_interview",
    gender: "neutral",
    season: "winter",
    style: "creative professional",
    prompt: "Job interview at a creative agency, casual culture but I need to impress.",
    before_text: "Dress nicely but not too formal. Maybe smart casual with a blazer and jeans. Show some personality.",
    after_text: "Top: well-fitted black crewneck merino wool sweater\nBottom: dark indigo selvedge jeans, no distressing\nShoes: clean white minimalist leather sneakers\nOuterwear: unstructured charcoal sport coat\nAccessories: simple black leather portfolio, no-show socks, minimal silver ring\nAesthetic: creative professional, design-conscious\nExplanation: The unstructured sport coat over a crewneck hits the sweet spot \u2014 more polished than daily wear but not corporate.",
    before_image_base64: null,
    after_image_base64: null,
  },
];

const GENDERS = ["female", "male", "neutral"];
const SEASONS = ["spring", "summer", "fall", "winter"];
const STYLES = [...new Set(DEMO_DATA.map((d) => d.style))];

const SEASON_ICONS = {
  spring: Flower2,
  summer: Sun,
  fall: Leaf,
  winter: Snowflake,
};

function findBestMatch(gender, season, style) {
  // Exact match
  let match = DEMO_DATA.find(
    (d) => d.gender === gender && d.season === season && d.style === style
  );
  if (match) return match;

  // Prioritize style > season > gender
  match = DEMO_DATA.find((d) => d.style === style && d.season === season);
  if (match) return match;

  match = DEMO_DATA.find((d) => d.style === style && d.gender === gender);
  if (match) return match;

  match = DEMO_DATA.find((d) => d.style === style);
  if (match) return match;

  match = DEMO_DATA.find((d) => d.season === season && d.gender === gender);
  if (match) return match;

  match = DEMO_DATA.find((d) => d.season === season);
  if (match) return match;

  match = DEMO_DATA.find((d) => d.gender === gender);
  if (match) return match;

  return DEMO_DATA[0];
}

function ImagePlaceholder({ label }) {
  return (
    <div className="w-full h-72 sm:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 border border-gray-200">
      <Shirt className="w-10 h-10 text-gray-300" />
      <span className="text-xs text-gray-400 text-center px-4 leading-relaxed">
        {label || "Image will appear after running SDXL"}
      </span>
    </div>
  );
}

function OutfitText({ text }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0 && colonIdx < 20) {
          const label = line.slice(0, colonIdx);
          const value = line.slice(colonIdx + 1);
          return (
            <p key={i} className="text-sm leading-relaxed text-gray-700">
              <span className="font-semibold text-gray-900">{label}:</span>
              {value}
            </p>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-gray-700">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function PillSelector({ options, value, onChange, iconMap }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        const Icon = iconMap?.[opt];
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200 flex items-center gap-1.5 ${
              active
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function Style2FitDemo() {
  const [gender, setGender] = useState("female");
  const [season, setSeason] = useState("fall");
  const [style, setStyle] = useState("clean girl");

  const entry = findBestMatch(gender, season, style);
  const isExact =
    entry.gender === gender &&
    entry.season === season &&
    entry.style === style;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <Sparkles className="w-7 h-7 text-teal-500" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Style2Fit
            </h1>
          </div>
          <p className="text-gray-500 text-sm sm:text-base tracking-wide">
            AI-Powered Outfit Recommendations
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Selectors */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
              Gender
            </label>
            <PillSelector
              options={GENDERS}
              value={gender}
              onChange={setGender}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
              Season
            </label>
            <PillSelector
              options={SEASONS}
              value={season}
              onChange={setSeason}
              iconMap={SEASON_ICONS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
              Style
            </label>
            <div className="relative">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full sm:w-72 appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 font-medium capitalize focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Prompt Callout */}
        <section className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex gap-3">
            <Quote className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <div>
              {!isExact && (
                <p className="text-xs text-amber-600 font-medium mb-1.5">
                  No exact match found -- showing closest result ({entry.style},{" "}
                  {entry.season}, {entry.gender})
                </p>
              )}
              <p className="text-gray-700 text-sm sm:text-base italic leading-relaxed">
                "{entry.prompt}"
              </p>
              <div className="flex gap-2 mt-3">
                <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 capitalize">
                  {entry.gender}
                </span>
                <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 capitalize">
                  {entry.season}
                </span>
                <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 capitalize">
                  {entry.style}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Before / After Comparison */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-800">
                Base Model{" "}
                <span className="text-gray-400 font-normal">(Before Fine-Tuning)</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                Llama 3.1 8B -- No Fine-Tuning
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {entry.before_text}
                </p>
              </div>
              {entry.before_image_base64 ? (
                <img
                  src={`data:image/png;base64,${entry.before_image_base64}`}
                  alt="Before outfit visualization"
                  className="w-full h-72 sm:h-80 object-cover rounded-xl"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
          </div>

          {/* After Card */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-teal-200 overflow-hidden relative">
            <div className="absolute top-3 right-3">
              <span className="bg-teal-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Fine-Tuned
              </span>
            </div>
            <div className="px-6 py-4 border-b border-teal-100 bg-teal-50/40">
              <h2 className="text-base font-semibold text-gray-800">
                Style2Fit{" "}
                <span className="text-gray-400 font-normal">(After Fine-Tuning)</span>
              </h2>
              <p className="text-xs text-teal-600 mt-0.5 flex items-center gap-1.5">
                <Palette className="w-3 h-3" />
                Llama 3.1 8B + QLoRA Fine-Tuning
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100">
                <OutfitText text={entry.after_text} />
              </div>
              {entry.after_image_base64 ? (
                <img
                  src={`data:image/png;base64,${entry.after_image_base64}`}
                  alt="After outfit visualization"
                  className="w-full h-72 sm:h-80 object-cover rounded-xl"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6">
          <p className="text-xs text-gray-400 tracking-wide">
            96 training samples &nbsp;|&nbsp; QLoRA rank=16 &nbsp;|&nbsp; 3 epochs &nbsp;|&nbsp; SDXL visualization
          </p>
        </footer>
      </main>
    </div>
  );
}
