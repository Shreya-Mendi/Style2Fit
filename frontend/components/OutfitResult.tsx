"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { OutfitResponse } from "@/types";

interface Props {
  result: OutfitResponse | null;
  loading: boolean;
  onRegenerate?: () => void;
}

const OUTFIT_FIELDS = [
  { key: "top",         label: "Top",         dot: "var(--coral)" },
  { key: "bottom",      label: "Bottom",      dot: "var(--sky)" },
  { key: "shoes",       label: "Shoes",       dot: "var(--mint)" },
  { key: "outerwear",   label: "Outerwear",   dot: "var(--lavender)" },
  { key: "accessories", label: "Accessories", dot: "var(--pink)" },
  { key: "aesthetic",   label: "Aesthetic",   dot: "var(--gold)" },
] as const;

export default function OutfitResult({ result, loading, onRegenerate }: Props) {
  return (
    <div className="space-y-6">
      {/* Skeleton */}
      {loading && !result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="shimmer" style={{ aspectRatio: "3/4", width: "100%", borderRadius: 16 }} />
          <div className="space-y-5 pt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="shimmer h-3 w-20" />
                <div className="shimmer h-4 w-52" />
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        >
          {/* Image panel */}
          <div className="relative">
            {result.image_url ? (
              <motion.div
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: "relative", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden" }}
              >
                <Image
                  src={result.image_url}
                  alt="Generated outfit"
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
              </motion.div>
            ) : (
              <div
                className="flex items-center justify-center card card-lavender card-no-tape"
                style={{ aspectRatio: "3/4" }}
              >
                <div className="text-center px-8">
                  <span className="font-handwritten text-6xl block mb-4" style={{ color: "var(--lavender)" }}>✦</span>
                  <p
                    className="font-body text-xs tracking-[0.12em] uppercase"
                    style={{ color: "var(--ink-muted)", fontWeight: 500 }}
                  >
                    Image rendering
                    <br />requires GPU runtime
                  </p>
                </div>
              </div>
            )}

            {/* Aesthetic badge */}
            {result.outfit_plan.aesthetic && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full font-body text-xs font-semibold"
                style={{ background: "var(--coral)", color: "white", letterSpacing: "0.04em" }}
              >
                {result.outfit_plan.aesthetic}
              </motion.div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {/* Fields table */}
            <div className="card card-cream card-tape-left">
              <div style={{ borderTop: "1.5px solid var(--border)" }}>
                {OUTFIT_FIELDS.map((field, i) => {
                  const value = result.outfit_plan[field.key];
                  if (!value || value.toLowerCase() === "none needed" || value.toLowerCase() === "n/a") return null;
                  return (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.5 }}
                      className="py-3.5 flex items-start justify-between gap-6"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center gap-2 shrink-0 mt-0.5" style={{ minWidth: "6rem" }}>
                        <span
                          style={{ width: 7, height: 7, borderRadius: "50%", background: field.dot, flexShrink: 0, display: "inline-block" }}
                        />
                        <span
                          className="font-body text-xs tracking-[0.1em] uppercase"
                          style={{ color: "var(--ink-muted)", fontWeight: 600 }}
                        >
                          {field.label}
                        </span>
                      </div>
                      <span
                        className="font-body text-sm text-right leading-relaxed"
                        style={{ color: "var(--ink)", fontWeight: 400 }}
                      >
                        {value}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Explanation */}
            {result.outfit_plan.explanation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="card card-gold"
              >
                <p
                  className="font-body text-xs tracking-[0.12em] uppercase mb-3"
                  style={{ color: "#7a5e00", fontWeight: 600 }}
                >
                  Why this works ✦
                </p>
                <p className="font-handwritten text-xl leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                  &ldquo;{result.outfit_plan.explanation}&rdquo;
                </p>
              </motion.div>
            )}

            {/* Diffusion prompt */}
            {result.diffusion_prompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="card card-dark card-no-tape"
              >
                <p
                  className="font-body text-xs tracking-[0.12em] uppercase mb-2"
                  style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500 }}
                >
                  Diffusion prompt
                </p>
                <p
                  className="font-body text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.65)", fontWeight: 400 }}
                >
                  {result.diffusion_prompt}
                </p>
              </motion.div>
            )}

            {/* Regenerate */}
            {onRegenerate && (
              <motion.button
                onClick={onRegenerate}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 text-sm font-body rounded-full transition-all"
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--border)",
                  color: "var(--ink-soft)",
                  fontWeight: 500,
                  cursor: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--coral)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--coral)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--coral-light)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-soft)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                Regenerate ↻
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
