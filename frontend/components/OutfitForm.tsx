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
  "i have a coffee date tmrw what do i wear",
  "first day at my internship, business casual",
  "concert this weekend, indie/alt vibe",
  "birthday dinner at a nice restaurant",
  "omg i have a presentation today help",
  "packing for lisbon for a week in april",
  "going through a dark academia phase help",
];

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
      // handle error silently — result panel will show nothing
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Situation textarea */}
      <div>
        <label
          className="block text-xs tracking-[0.2em] uppercase mb-4"
          style={{ color: "var(--charcoal)", fontWeight: 300 }}
        >
          What&apos;s the situation?
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="i have a coffee date tmrw what do i wear"
          rows={4}
          className="w-full resize-none text-sm leading-relaxed px-5 py-4 transition-all"
          style={{
            background: "var(--cream)",
            border: "1px solid var(--blush)",
            color: "var(--charcoal)",
            fontFamily: "inherit",
            fontWeight: 300,
            borderRadius: 0,
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--dusty-rose)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--blush)")}
        />
      </div>

      {/* Aesthetic select */}
      <div>
        <label
          className="block text-xs tracking-[0.2em] uppercase mb-4"
          style={{ color: "var(--charcoal)", fontWeight: 300 }}
        >
          Aesthetic <span style={{ color: "var(--taupe)" }}>(optional)</span>
        </label>
        <div className="relative">
          <select
            value={aesthetic}
            onChange={(e) => setAesthetic(e.target.value)}
            className="w-full px-5 py-4 text-sm appearance-none"
            style={{
              background: "var(--cream)",
              border: "1px solid var(--blush)",
              color: "var(--charcoal)",
              fontFamily: "inherit",
              fontWeight: 300,
              borderRadius: 0,
              cursor: "none",
            }}
          >
            {AESTHETICS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <div
            className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--taupe)" }}
          >
            ↓
          </div>
        </div>
      </div>

      {/* Examples */}
      <div>
        <p className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: "var(--taupe)", fontWeight: 300 }}>
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setSituation(ex)}
              className="text-xs px-3 py-2 transition-all"
              style={{
                background: situation === ex ? "var(--blush)" : "transparent",
                border: "1px solid var(--blush)",
                color: "var(--taupe)",
                fontFamily: "inherit",
                fontWeight: 300,
                borderRadius: 0,
                cursor: "none",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = "var(--blush)";
                (e.target as HTMLButtonElement).style.color = "var(--charcoal)";
              }}
              onMouseLeave={(e) => {
                if (situation !== ex) {
                  (e.target as HTMLButtonElement).style.background = "transparent";
                  (e.target as HTMLButtonElement).style.color = "var(--taupe)";
                }
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={!situation.trim() || loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.99 }}
        className="w-full py-5 text-xs tracking-[0.3em] uppercase transition-all relative overflow-hidden"
        style={{
          background: situation.trim() && !loading ? "var(--charcoal)" : "var(--blush)",
          color: situation.trim() && !loading ? "var(--ivory)" : "var(--taupe)",
          border: "none",
          fontFamily: "inherit",
          fontWeight: 300,
          cursor: "none",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <span
              className="inline-block w-3 h-3 rounded-full border border-current pulse-soft"
              style={{ borderColor: "var(--taupe)" }}
            />
            Generating outfit...
          </span>
        ) : (
          "Generate Outfit →"
        )}
      </motion.button>
    </form>
  );
}
