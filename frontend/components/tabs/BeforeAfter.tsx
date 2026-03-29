"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const EXAMPLE_PROMPTS = [
  { text: "coffee date, casual chic", pill: "pill-coral" },
  { text: "rooftop bar, summer night", pill: "pill-peach" },
  { text: "job interview, startup", pill: "pill-mint" },
  { text: "museum visit, artsy vibe", pill: "pill-lavender" },
  { text: "birthday dinner, elevated", pill: "pill-pink" },
];

const BASE_SAMPLE = `Sure! For a coffee date with a casual chic vibe, here are some outfit ideas you might consider. You could wear a nice blouse with some jeans, or maybe a cute dress. Comfortable shoes are important too. You want to look good but also feel relaxed. Maybe add some accessories like a bag or some jewelry!`;

const TUNED_SAMPLE = [
  { label: "Top",         value: "White linen button-down, slightly cropped",  dot: "var(--coral)" },
  { label: "Bottom",      value: "High-waisted straight jeans, mid-wash",       dot: "var(--sky)" },
  { label: "Shoes",       value: "White leather sneakers, minimal",             dot: "var(--mint)" },
  { label: "Accessories", value: "Delicate gold necklace, canvas tote",         dot: "var(--pink)" },
  { label: "Aesthetic",   value: "clean girl / effortless",                     dot: "var(--gold)" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] },
  }),
};

export default function BeforeAfter() {
  const [prompt, setPrompt] = useState("coffee date, casual chic");
  const [compared, setCompared] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCompare = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setCompared(true); }, 1200);
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="font-display text-3xl md:text-4xl mb-2" style={{ color: "var(--ink)", fontWeight: 600 }}>
          Same prompt.{" "}
          <span className="font-handwritten" style={{ color: "var(--coral)", fontWeight: 500, fontSize: "1.05em" }}>
            Different model.
          </span>
        </h2>
        <p className="font-body text-sm" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
          See how fine-tuning on fashion data changes output quality and structure.
        </p>
      </motion.div>

      {/* Prompt input card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="card card-cream flex flex-col sm:flex-row gap-3 items-start sm:items-end"
      >
        <div className="flex-1">
          <label
            className="font-body block text-xs tracking-[0.12em] uppercase mb-2"
            style={{ color: "var(--ink-soft)", fontWeight: 600 }}
          >
            Prompt
          </label>
          <input
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setCompared(false); }}
            placeholder="coffee date, casual chic"
            className="w-full font-body text-sm px-4 py-3 rounded-xl transition-all"
            style={{
              background: "var(--canvas)",
              border: "1.5px solid var(--border)",
              color: "var(--ink)",
              fontWeight: 400,
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--coral)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        <motion.button
          onClick={handleCompare}
          disabled={!prompt.trim() || loading}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="font-body text-sm px-7 py-3 rounded-full shrink-0 transition-all"
          style={{
            background: prompt.trim() && !loading ? "var(--coral)" : "var(--border)",
            color: prompt.trim() && !loading ? "white" : "var(--ink-muted)",
            fontWeight: 600,
            border: "none",
            cursor: "none",
            letterSpacing: "0.03em",
          }}
          onMouseEnter={(e) => {
            if (prompt.trim() && !loading)
              (e.currentTarget as HTMLButtonElement).style.background = "var(--coral-hover)";
          }}
          onMouseLeave={(e) => {
            if (prompt.trim() && !loading)
              (e.currentTarget as HTMLButtonElement).style.background = "var(--coral)";
          }}
        >
          {loading ? "Comparing…" : "Compare →"}
        </motion.button>
      </motion.div>

      {/* Example prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-wrap gap-2"
      >
        {EXAMPLE_PROMPTS.map((ex) => {
          const active = prompt === ex.text;
          const ACTIVE_BG: Record<string, string> = {
            "pill-coral": "var(--coral)", "pill-peach": "var(--peach)",
            "pill-mint": "var(--mint)", "pill-lavender": "var(--lavender)", "pill-pink": "var(--pink)",
          };
          const INACTIVE_BG: Record<string, string> = {
            "pill-coral": "var(--coral-light)", "pill-peach": "var(--peach-light)",
            "pill-mint": "var(--mint-light)", "pill-lavender": "var(--lavender-light)", "pill-pink": "var(--pink-light)",
          };
          const INACTIVE_COLOR: Record<string, string> = {
            "pill-coral": "var(--coral)", "pill-peach": "#9b5200",
            "pill-mint": "#1e6644", "pill-lavender": "var(--lavender)", "pill-pink": "var(--pink)",
          };
          return (
            <button
              key={ex.text}
              onClick={() => { setPrompt(ex.text); setCompared(false); }}
              className="pill font-body"
              style={{
                background: active ? ACTIVE_BG[ex.pill] : INACTIVE_BG[ex.pill],
                color: active ? "white" : INACTIVE_COLOR[ex.pill],
                border: `1.5px solid ${active ? ACTIVE_BG[ex.pill] : "transparent"}`,
                cursor: "none",
              }}
            >
              {ex.text}
            </button>
          );
        })}
      </motion.div>

      {/* Comparison */}
      {compared && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Base model — lavender card (light, fully readable) ── */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card card-lavender card-tape-left"
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <span className="font-display text-base font-semibold" style={{ color: "var(--ink)" }}>
                Base LLaMA 3.1 8B
              </span>
              <span
                className="badge shrink-0"
                style={{ background: "rgba(167,139,250,0.25)", color: "#5b3fa6", border: "1px solid rgba(167,139,250,0.4)" }}
              >
                Unstructured
              </span>
            </div>

            <div
              className="font-body text-sm leading-relaxed p-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.55)", color: "var(--ink-soft)", border: "1px solid rgba(167,139,250,0.2)" }}
            >
              <p className="mb-2 font-body text-xs uppercase tracking-wide" style={{ color: "var(--lavender)", fontWeight: 600 }}>Output:</p>
              <p>{BASE_SAMPLE}</p>
            </div>

            <p className="mt-4 font-body text-xs" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
              ✗ No structured fields &nbsp;·&nbsp; Generic suggestions &nbsp;·&nbsp; No aesthetic reasoning
            </p>
          </motion.div>

          {/* ── Fine-tuned — coral/cream card ── */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card card-coral"
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <span className="font-display text-base font-semibold" style={{ color: "var(--ink)" }}>
                Fine-tuned LLaMA 3.1 8B
              </span>
              <span
                className="badge shrink-0"
                style={{ background: "var(--coral)", color: "white" }}
              >
                Structured ✓
              </span>
            </div>

            <div className="space-y-0" style={{ borderTop: "1.5px solid rgba(243,123,117,0.25)" }}>
              {TUNED_SAMPLE.map((f) => (
                <div
                  key={f.label}
                  className="flex items-start gap-3 py-2.5"
                  style={{ borderBottom: "1px solid rgba(243,123,117,0.18)" }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: f.dot, flexShrink: 0, marginTop: 6, display: "inline-block" }} />
                  <span
                    className="font-body text-xs uppercase tracking-wide shrink-0"
                    style={{ color: "var(--ink-muted)", fontWeight: 600, minWidth: "5.5rem", paddingTop: 1 }}
                  >
                    {f.label}
                  </span>
                  <span className="font-body text-sm" style={{ color: "var(--ink)", fontWeight: 400 }}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 font-body text-xs" style={{ color: "var(--ink-soft)", fontWeight: 400 }}>
              ✓ Structured JSON &nbsp;·&nbsp; Specific garments &nbsp;·&nbsp; Ready for SDXL rendering
            </p>
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {!compared && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card card-mint card-no-tape flex flex-col items-center justify-center py-16 text-center"
        >
          <span className="font-handwritten text-5xl block mb-3" style={{ color: "var(--mint)" }}>🔀</span>
          <p className="font-handwritten text-xl mb-1" style={{ color: "var(--ink-soft)" }}>Pick a prompt and compare!</p>
          <p className="font-body text-sm" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
            See how fine-tuning transforms vague suggestions into structured outfits.
          </p>
        </motion.div>
      )}
    </div>
  );
}
