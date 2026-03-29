"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { OutfitResponse } from "@/types";

interface Props {
  result: OutfitResponse | null;
  loading: boolean;
}

const OUTFIT_FIELDS = [
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
  { key: "shoes", label: "Shoes" },
  { key: "outerwear", label: "Outerwear" },
  { key: "accessories", label: "Accessories" },
  { key: "aesthetic", label: "Aesthetic" },
] as const;

export default function OutfitResult({ result, loading }: Props) {
  return (
    <section
      className="px-10 py-24"
      style={{ background: "var(--cream)", borderTop: "1px solid var(--blush)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs tracking-[0.3em] uppercase mb-16"
          style={{ color: "var(--dusty-rose)", fontWeight: 300 }}
        >
          — Your outfit
        </motion.p>

        {loading && !result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Skeleton image */}
            <div
              className="shimmer"
              style={{ aspectRatio: "3/4", width: "100%" }}
            />
            {/* Skeleton text */}
            <div className="space-y-8 pt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="shimmer h-3 w-16" />
                  <div className="shimmer h-4 w-48" />
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
          >
            {/* Image panel */}
            <div className="relative">
              {result.image_url ? (
                <motion.div
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0 0)" }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ position: "relative", aspectRatio: "3/4" }}
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
                  className="flex items-center justify-center"
                  style={{
                    aspectRatio: "3/4",
                    background: "var(--blush)",
                    border: "1px solid var(--rose)",
                  }}
                >
                  <div className="text-center px-8">
                    <span
                      className="font-serif italic text-4xl block mb-4"
                      style={{ color: "var(--dusty-rose)" }}
                    >
                      ✦
                    </span>
                    <p
                      className="text-xs tracking-[0.15em] uppercase"
                      style={{ color: "var(--taupe)", fontWeight: 300 }}
                    >
                      Image rendering
                      <br />
                      requires GPU runtime
                    </p>
                  </div>
                </div>
              )}

              {/* Aesthetic badge */}
              {result.outfit_plan.aesthetic && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-0 left-0 px-4 py-3"
                  style={{ background: "var(--charcoal)" }}
                >
                  <span
                    className="font-serif italic text-sm"
                    style={{ color: "var(--blush)" }}
                  >
                    {result.outfit_plan.aesthetic}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Outfit details */}
            <div>
              <div className="space-y-0" style={{ borderTop: "1px solid var(--blush)" }}>
                {OUTFIT_FIELDS.map((field, i) => {
                  const value = result.outfit_plan[field.key];
                  if (!value || value.toLowerCase() === "none needed" || value.toLowerCase() === "n/a") return null;
                  return (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.6 }}
                      className="py-5 flex items-start justify-between gap-8"
                      style={{ borderBottom: "1px solid var(--blush)" }}
                    >
                      <span
                        className="text-xs tracking-[0.2em] uppercase shrink-0 mt-0.5"
                        style={{ color: "var(--taupe)", fontWeight: 300, minWidth: "6rem" }}
                      >
                        {field.label}
                      </span>
                      <span
                        className="text-sm text-right leading-relaxed"
                        style={{ color: "var(--charcoal)", fontWeight: 300 }}
                      >
                        {value}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Explanation */}
              {result.outfit_plan.explanation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-10"
                >
                  <p
                    className="text-xs tracking-[0.2em] uppercase mb-4"
                    style={{ color: "var(--taupe)", fontWeight: 300 }}
                  >
                    Why this works
                  </p>
                  <p
                    className="font-serif italic text-lg leading-relaxed"
                    style={{ color: "var(--warm-brown)", fontWeight: 300 }}
                  >
                    &ldquo;{result.outfit_plan.explanation}&rdquo;
                  </p>
                </motion.div>
              )}

              {/* Prompt pill */}
              {result.diffusion_prompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-10 p-5"
                  style={{
                    background: "var(--ivory)",
                    border: "1px solid var(--blush)",
                  }}
                >
                  <p
                    className="text-xs tracking-[0.2em] uppercase mb-3"
                    style={{ color: "var(--taupe)", fontWeight: 300 }}
                  >
                    Diffusion prompt
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--taupe)", fontWeight: 300 }}
                  >
                    {result.diffusion_prompt}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
