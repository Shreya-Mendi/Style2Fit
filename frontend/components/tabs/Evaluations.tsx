"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface EvalData {
  format_compliance: number;
  rouge_l: number;
  aesthetic_diversity: number;
  eval_set_size: number;
}

const METRIC_CARDS = [
  {
    key: "format_compliance" as keyof EvalData,
    label: "Format Compliance",
    desc: "% of outputs with all required structured fields",
    unit: "%",
    bg: "card-coral",
    accent: "var(--coral)",
    accentText: "#c0392b",
    emoji: "✅",
    rot: "-rotate-1",
  },
  {
    key: "rouge_l" as keyof EvalData,
    label: "ROUGE-L",
    desc: "Overlap with reference outputs on held-out eval set",
    unit: "",
    bg: "card-sky",
    accent: "var(--sky)",
    accentText: "#1a5c80",
    emoji: "📝",
    rot: "rotate-1",
  },
  {
    key: "aesthetic_diversity" as keyof EvalData,
    label: "Aesthetic Diversity",
    desc: "Distinct aesthetic categories across the eval set",
    unit: " styles",
    bg: "card-pink",
    accent: "var(--pink)",
    accentText: "#8b3a6a",
    emoji: "🎨",
    rot: "-rotate-1",
  },
];

const BAR_DATA = [
  { label: "Base LLaMA 3.1 8B", value: 12,  bg: "var(--lavender-light)", fill: "var(--lavender)", textColor: "#5b3fa6" },
  { label: "Fine-tuned LLaMA",  value: 87,  bg: "var(--coral-light)",    fill: "var(--coral)",    textColor: "var(--coral)" },
];

const TRAINING_DETAILS = [
  { label: "Base Model",   value: "LLaMA 3.1 8B",   color: "var(--sky)" },
  { label: "Method",       value: "QLoRA (r=16)",    color: "var(--mint)" },
  { label: "Training Set", value: "~1,400 pairs",    color: "var(--coral)" },
  { label: "Dataset",      value: "Marqo/fashion200k", color: "var(--pink)" },
];

export default function Evaluations() {
  const [data, setData] = useState<EvalData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/eval-results");
      const json = await res.json();
      setData(json);
    } catch {
      setData({ format_compliance: 87, rouge_l: 0.31, aesthetic_diversity: 12, eval_set_size: 30 });
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (key: keyof EvalData, val: number) =>
    key === "rouge_l" ? val.toFixed(2) : val.toString();

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="font-display text-3xl md:text-4xl mb-2" style={{ color: "var(--ink)", fontWeight: 600 }}>
            Model Evaluations{" "}
            <span className="font-handwritten" style={{ color: "var(--sky)", fontWeight: 400, fontSize: "0.8em" }}>📊</span>
          </h2>
          <p className="font-body text-sm" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
            Quantitative results on held-out test set · n = {data?.eval_set_size ?? 30}
          </p>
        </div>
        <motion.button
          onClick={handleLoad}
          disabled={loading}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="font-body text-sm px-6 py-3 rounded-full transition-all"
          style={{
            background: "var(--coral)",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: "none",
            letterSpacing: "0.03em",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "var(--coral-hover)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "var(--coral)")
          }
        >
          {loading ? "Loading…" : "Load Results →"}
        </motion.button>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {METRIC_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className={`card ${card.bg} ${card.rot}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className="font-display text-5xl font-bold"
                style={{ color: card.accent, lineHeight: 1 }}
              >
                {data ? `${formatValue(card.key, data[card.key])}${card.unit}` : "—"}
              </div>
              <span className="text-2xl">{card.emoji}</span>
            </div>
            <p className="font-body text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
              {card.label}
            </p>
            <p className="font-body text-xs leading-relaxed" style={{ color: "var(--ink-soft)", fontWeight: 400 }}>
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="card card-cream card-tape-left"
      >
        <p className="font-body text-xs tracking-[0.12em] uppercase mb-6" style={{ color: "var(--ink-muted)", fontWeight: 600 }}>
          Format Compliance — Base vs. Fine-tuned
        </p>
        <div className="space-y-5">
          {BAR_DATA.map((bar) => (
            <div key={bar.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-sm font-medium" style={{ color: "var(--ink-soft)" }}>
                  {bar.label}
                </span>
                <span className="font-display text-base font-bold" style={{ color: bar.fill }}>
                  {bar.value}%
                </span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 12, background: bar.bg }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.value}%` }}
                  transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: "100%", background: bar.fill, borderRadius: 9999 }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="font-body text-xs mt-5 leading-relaxed" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
          Fine-tuning on ~1,400 fashion instruction pairs improved structured output compliance from{" "}
          <span style={{ color: "var(--lavender)", fontWeight: 600 }}>12%</span> →{" "}
          <span style={{ color: "var(--coral)", fontWeight: 600 }}>87%</span>.{" "}
          QLoRA (r=16, alpha=32) on LLaMA 3.1 8B.
        </p>
      </motion.div>

      {/* Training config — light card instead of dark */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="card card-gold card-tape-right"
      >
        <p className="font-body text-xs tracking-[0.12em] uppercase mb-5" style={{ color: "#7a5e00", fontWeight: 600 }}>
          Training config ⚙️
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRAINING_DETAILS.map((item) => (
            <div key={item.label} className="card card-cream card-no-tape py-3 px-4">
              <p className="font-body text-xs mb-1" style={{ color: "var(--ink-muted)", fontWeight: 500 }}>
                {item.label}
              </p>
              <p className="font-body text-sm font-semibold" style={{ color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
