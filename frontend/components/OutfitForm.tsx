"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { OutfitResponse } from "@/types";

const AESTHETICS = [
  "infer from situation",
  "clean girl",
  "dark academia",
  "old money",
  "streetwear",
  "soft girl",
  "indie",
  "minimalist",
  "boho",
  "preppy",
  "y2k",
  "coastal grandmother",
];

const EXAMPLES = [
  { text: "coffee date tmrw ☕", pill: "pill-coral" },
  { text: "internship first day", pill: "pill-mint" },
  { text: "concert this weekend", pill: "pill-lavender" },
  { text: "birthday dinner", pill: "pill-pink" },
  { text: "presentation today", pill: "pill-sky" },
  { text: "week in lisbon", pill: "pill-gold" },
  { text: "dark academia era", pill: "pill-peach" },
];

const PILL_ACTIVE: Record<string, { bg: string; color: string; border: string }> = {
  "pill-coral":    { bg: "var(--coral)",    color: "white",   border: "var(--coral)" },
  "pill-mint":     { bg: "var(--mint)",     color: "white",   border: "var(--mint)" },
  "pill-lavender": { bg: "var(--lavender)", color: "white",   border: "var(--lavender)" },
  "pill-pink":     { bg: "var(--pink)",     color: "white",   border: "var(--pink)" },
  "pill-sky":      { bg: "var(--sky)",      color: "white",   border: "var(--sky)" },
  "pill-gold":     { bg: "var(--gold)",     color: "#5a4000", border: "var(--gold)" },
  "pill-peach":    { bg: "var(--peach)",    color: "white",   border: "var(--peach)" },
};

const PILL_INACTIVE: Record<string, { bg: string; color: string; border: string }> = {
  "pill-coral":    { bg: "var(--coral-light)",    color: "var(--coral)",    border: "rgba(243,123,117,0.35)" },
  "pill-mint":     { bg: "var(--mint-light)",     color: "#1e6644",         border: "rgba(109,213,160,0.4)" },
  "pill-lavender": { bg: "var(--lavender-light)", color: "var(--lavender)", border: "rgba(167,139,250,0.4)" },
  "pill-pink":     { bg: "var(--pink-light)",     color: "var(--pink)",     border: "rgba(234,137,185,0.4)" },
  "pill-sky":      { bg: "var(--sky-light)",      color: "var(--sky)",      border: "rgba(107,191,234,0.4)" },
  "pill-gold":     { bg: "var(--gold-light)",     color: "#7a5e00",         border: "rgba(245,200,66,0.4)" },
  "pill-peach":    { bg: "var(--peach-light)",    color: "#9b5200",         border: "rgba(255,171,118,0.4)" },
};

interface Props {
  onResult: (r: OutfitResponse) => void;
  onLoading: (v: boolean) => void;
  loading: boolean;
}

export default function OutfitForm({ onResult, onLoading, loading }: Props) {
  const [situation, setSituation] = useState("");
  const [aesthetic, setAesthetic] = useState("infer from situation");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || loading) return;

    onLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation.trim(),
          aesthetic: aesthetic === "infer from situation" ? null : aesthetic,
        }),
      });
      const data = await res.json();
      onResult(data);
    } catch {
      // silent fail
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Situation */}
      <div>
        <label
          className="font-body block text-xs tracking-[0.14em] uppercase mb-2.5"
          style={{ color: "var(--ink-soft)", fontWeight: 600 }}
        >
          What&apos;s the situation?
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="i have a coffee date tmrw what do i wear"
          rows={4}
          className="w-full resize-none text-sm leading-relaxed px-4 py-3 transition-all font-body"
          style={{
            background: "var(--canvas)",
            border: "1.5px solid var(--border)",
            color: "var(--ink)",
            fontWeight: 400,
            borderRadius: 12,
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--coral)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
      </div>

      {/* Aesthetic */}
      <div>
        <label
          className="font-body block text-xs tracking-[0.14em] uppercase mb-2.5"
          style={{ color: "var(--ink-soft)", fontWeight: 600 }}
        >
          Aesthetic{" "}
          <span style={{ color: "var(--ink-muted)", textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>
            (optional)
          </span>
        </label>
        <div className="relative">
          <select
            value={aesthetic}
            onChange={(e) => setAesthetic(e.target.value)}
            className="w-full px-4 py-3 text-sm appearance-none font-body"
            style={{
              background: "var(--canvas)",
              border: "1.5px solid var(--border)",
              color: "var(--ink)",
              fontWeight: 400,
              borderRadius: 12,
              cursor: "none",
            }}
          >
            {AESTHETICS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs"
            style={{ color: "var(--ink-muted)" }}
          >
            ↓
          </div>
        </div>
      </div>

      {/* Example pills */}
      <div>
        <p
          className="font-body text-xs tracking-[0.14em] uppercase mb-3"
          style={{ color: "var(--ink-muted)", fontWeight: 600 }}
        >
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => {
            const active = situation === ex.text;
            const s = active ? PILL_ACTIVE[ex.pill] : PILL_INACTIVE[ex.pill];
            return (
              <button
                key={ex.text}
                type="button"
                onClick={() => setSituation(ex.text)}
                className="pill font-body"
                style={{
                  background: s.bg,
                  color: s.color,
                  border: `1.5px solid ${s.border}`,
                  cursor: "none",
                }}
              >
                {ex.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!situation.trim() || loading}
        whileHover={{ scale: loading ? 1 : 1.025 }}
        whileTap={{ scale: loading ? 1 : 0.975 }}
        className="w-full py-4 text-sm font-body tracking-wide transition-all rounded-full relative overflow-hidden"
        style={{
          background: situation.trim() && !loading ? "var(--coral)" : "var(--border)",
          color: situation.trim() && !loading ? "white" : "var(--ink-muted)",
          border: "none",
          fontWeight: 600,
          cursor: "none",
          letterSpacing: "0.04em",
        }}
        onMouseEnter={(e) => {
          if (situation.trim() && !loading)
            (e.currentTarget as HTMLButtonElement).style.background = "var(--coral-hover)";
        }}
        onMouseLeave={(e) => {
          if (situation.trim() && !loading)
            (e.currentTarget as HTMLButtonElement).style.background = "var(--coral)";
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2.5">
            {[0, 0.18, 0.36].map((delay, i) => (
              <span
                key={i}
                className="inline-block w-2 h-2 rounded-full pulse-soft"
                style={{ background: "white", animationDelay: `${delay}s` }}
              />
            ))}
            <span className="ml-2 font-body text-sm" style={{ fontWeight: 500 }}>Generating outfit...</span>
          </span>
        ) : (
          "Generate Outfit →"
        )}
      </motion.button>
    </form>
  );
}
