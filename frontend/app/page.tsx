"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cursor from "@/components/Cursor";
import OutfitForm from "@/components/OutfitForm";
import OutfitResult from "@/components/OutfitResult";
import BeforeAfter from "@/components/tabs/BeforeAfter";
import Closet from "@/components/tabs/Closet";
import Evaluations from "@/components/tabs/Evaluations";
import type { OutfitResponse } from "@/types";

type Tab = "generate" | "results" | "compare" | "closet" | "evals";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "generate", label: "Generate", emoji: "✨" },
  { id: "results",  label: "Results",  emoji: "👗" },
  { id: "compare",  label: "Before/After", emoji: "🔀" },
  { id: "closet",   label: "Closet",   emoji: "🧺" },
  { id: "evals",    label: "Evals",    emoji: "📊" },
];

const STEPS = [
  {
    n: "01",
    label: "Situation",
    desc: "Casual text prompt, just like texting a friend",
    bg: "card-coral",
    accent: "var(--coral)",
    tape: "card-tape-left",
    rot: "-rotate-1",
  },
  {
    n: "02",
    label: "Outfit Plan",
    desc: "Fine-tuned LLaMA 3.1 8B structures top, bottom, shoes & aesthetic",
    bg: "card-mint",
    accent: "var(--mint)",
    tape: "",
    rot: "rotate-1",
  },
  {
    n: "03",
    label: "Visual",
    desc: "Fine-tuned SDXL renders the complete look, head to toe",
    bg: "card-sky",
    accent: "var(--sky)",
    tape: "card-tape-right",
    rot: "-rotate-1",
  },
];

const pageVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.22 } },
};

/* Tiny inline doodle SVGs */
const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const [result, setResult] = useState<OutfitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleResult = (r: OutfitResponse) => {
    setResult(r);
    setActiveTab("results");
  };

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col">
      <Cursor />

      {/* ── Floating toolbar ── */}
      <header
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full"
        style={{
          background: "rgba(253,250,246,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 28px rgba(0,0,0,0.07)",
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        {/* Logo */}
        <span
          className="font-display text-sm font-semibold px-2 shrink-0"
          style={{ color: "var(--ink)", letterSpacing: "-0.02em" }}
        >
          style2fit
        </span>

        <div className="w-px h-4 shrink-0 mx-1" style={{ background: "var(--border)" }} />

        {/* Tabs */}
        <nav className="flex items-center gap-0.5">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-2.5 py-1.5 font-body text-xs rounded-full transition-all"
                style={{
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--coral)" : "var(--ink-muted)",
                  cursor: "none",
                  background: active ? "var(--coral-light)" : "transparent",
                  border: active ? "1px solid rgba(243,123,117,0.3)" : "1px solid transparent",
                }}
              >
                <span className="mr-1 text-[10px]">{tab.emoji}</span>
                {tab.label}
                {tab.id === "results" && result && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: "var(--coral)" }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="w-px h-4 shrink-0 mx-1" style={{ background: "var(--border)" }} />

        <span
          className="font-body text-[10px] shrink-0 px-2.5 py-1 rounded-full font-semibold"
          style={{ background: "var(--gold-light)", color: "#7a5e00", border: "1px solid rgba(245,200,66,0.4)" }}
        >
          AIPI 540
        </span>
      </header>

      {/* ── Colourful marquee strip ── */}
      <div className="pt-[68px]">
        <div
          className="overflow-hidden py-3"
          style={{ borderTop: "1.5px solid var(--border)", borderBottom: "1.5px solid var(--border)", background: "var(--canvas-warm)" }}
        >
          <div className="marquee-track">
            {[
              { text: "Coffee Date", color: "var(--coral)" },
              { text: "Old Money", color: "var(--mint)" },
              { text: "Clean Girl", color: "var(--sky)" },
              { text: "Dark Academia", color: "var(--lavender)" },
              { text: "Rooftop Bar", color: "var(--peach)" },
              { text: "First Day Fit", color: "var(--pink)" },
              { text: "Street Style", color: "var(--coral)" },
              { text: "Coastal Grandma", color: "var(--gold)" },
              { text: "Soft Girl Era", color: "var(--mint)" },
              { text: "Birthday Dinner", color: "var(--coral)" },
              { text: "Museum Afternoon", color: "var(--sky)" },
              { text: "Effortless Chic", color: "var(--lavender)" },
              { text: "Concert Night", color: "var(--peach)" },
              { text: "Coffee Date", color: "var(--coral)" },
              { text: "Old Money", color: "var(--mint)" },
              { text: "Clean Girl", color: "var(--sky)" },
              { text: "Dark Academia", color: "var(--lavender)" },
              { text: "Rooftop Bar", color: "var(--peach)" },
              { text: "First Day Fit", color: "var(--pink)" },
              { text: "Street Style", color: "var(--coral)" },
              { text: "Coastal Grandma", color: "var(--gold)" },
              { text: "Soft Girl Era", color: "var(--mint)" },
              { text: "Birthday Dinner", color: "var(--coral)" },
              { text: "Museum Afternoon", color: "var(--sky)" },
              { text: "Effortless Chic", color: "var(--lavender)" },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-4 px-4">
                <span
                  className="font-display text-xs tracking-[0.18em] uppercase whitespace-nowrap"
                  style={{ color: item.color, fontWeight: 500 }}
                >
                  {item.text}
                </span>
                <span
                  style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: item.color, opacity: 0.6 }}
                />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <main ref={contentRef} className="flex-1 px-5 md:px-10 py-10 max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">

          {/* ── Tab 1: Generate ── */}
          {activeTab === "generate" && (
            <motion.div key="generate" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

                {/* Left: hero copy + process cards */}
                <div className="lg:sticky lg:top-28 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
                  >
                    {/* Label */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="badge" style={{ background: "var(--coral-light)", color: "var(--coral)" }}>
                        <SparkleIcon /> How it works
                      </span>
                    </div>

                    <h1
                      className="font-display mb-4"
                      style={{
                        fontSize: "clamp(2.4rem,5.5vw,4rem)",
                        color: "var(--ink)",
                        fontWeight: 600,
                        lineHeight: 1.05,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      Tell me what&apos;s{" "}
                      <span
                        className="font-handwritten"
                        style={{ color: "var(--coral)", fontWeight: 500, fontSize: "1.08em" }}
                      >
                        happening.
                      </span>
                    </h1>

                    <p
                      className="font-body text-sm leading-relaxed"
                      style={{ color: "var(--ink-muted)", fontWeight: 400, maxWidth: "34ch" }}
                    >
                      Type your situation — coffee date, job interview, rooftop bar.
                      The AI reads the vibe and builds a full outfit.
                    </p>
                  </motion.div>

                  {/* Process steps — coloured sticky cards */}
                  <div className="space-y-4">
                    {STEPS.map((step, i) => (
                      <motion.div
                        key={step.n}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 * i + 0.2, duration: 0.6, ease: [0.16,1,0.3,1] }}
                        className={`card ${step.bg} ${step.tape} ${step.rot} flex items-start gap-4`}
                      >
                        <span
                          className="font-display text-3xl font-bold shrink-0"
                          style={{ color: step.accent, lineHeight: 1 }}
                        >
                          {step.n}
                        </span>
                        <div>
                          <p className="font-body text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
                            {step.label}
                          </p>
                          <p className="font-body text-xs leading-relaxed" style={{ color: "var(--ink-soft)", fontWeight: 400 }}>
                            {step.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Decorative doodle note */}
                  <motion.div
                    initial={{ opacity: 0, rotate: -3 }}
                    animate={{ opacity: 1, rotate: -2 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="card card-gold card-no-tape float"
                    style={{ transform: "rotate(-2deg)", maxWidth: 260 }}
                  >
                    <p className="font-handwritten text-lg leading-snug" style={{ color: "var(--ink-soft)" }}>
                      fine-tuned on 1,400+<br />fashion instruction pairs ✦
                    </p>
                    <p className="font-body text-xs mt-1" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
                      QLoRA · LLaMA 3.1 8B · SDXL
                    </p>
                  </motion.div>
                </div>

                {/* Right: form */}
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.75, ease: [0.16,1,0.3,1] }}
                  className="card card-cream"
                >
                  <p className="font-handwritten text-2xl mb-5" style={{ color: "var(--ink-soft)" }}>
                    What&apos;s the occasion?
                  </p>
                  <OutfitForm onResult={handleResult} onLoading={setLoading} loading={loading} />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ── Tab 2: Results ── */}
          {activeTab === "results" && (
            <motion.div key="results" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8">
                <h2 className="font-display text-3xl md:text-4xl mb-2" style={{ color: "var(--ink)", fontWeight: 600 }}>
                  Your Outfit{" "}
                  <span className="font-handwritten" style={{ color: "var(--pink)", fontWeight: 400, fontSize: "0.85em" }}>
                    ✦
                  </span>
                </h2>
                {!result && !loading && (
                  <p className="font-body text-sm" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
                    Generate an outfit first —{" "}
                    <button
                      onClick={() => setActiveTab("generate")}
                      className="font-body text-sm underline"
                      style={{ color: "var(--coral)", cursor: "none", background: "none", border: "none" }}
                    >
                      go to Generate
                    </button>
                  </p>
                )}
              </div>

              {(result || loading) && (
                <OutfitResult result={result} loading={loading} onRegenerate={() => { setResult(null); setActiveTab("generate"); }} />
              )}

              {!result && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="card card-pink card-no-tape flex flex-col items-center justify-center py-20 text-center"
                >
                  <span className="font-handwritten text-7xl block mb-4" style={{ color: "var(--pink)" }}>✦</span>
                  <p className="font-handwritten text-xl mb-2" style={{ color: "var(--ink-soft)" }}>No outfit yet!</p>
                  <p className="font-body text-sm" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
                    Head to{" "}
                    <button onClick={() => setActiveTab("generate")} style={{ color: "var(--coral)", cursor: "none", background: "none", border: "none" }} className="font-body text-sm underline">
                      Generate
                    </button>{" "}
                    to create one.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Tab 3: Before vs After ── */}
          {activeTab === "compare" && (
            <motion.div key="compare" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <BeforeAfter />
            </motion.div>
          )}

          {/* ── Tab 4: Closet ── */}
          {activeTab === "closet" && (
            <motion.div key="closet" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <Closet />
            </motion.div>
          )}

          {/* ── Tab 5: Evaluations ── */}
          {activeTab === "evals" && (
            <motion.div key="evals" variants={pageVariants} initial="hidden" animate="visible" exit="exit">
              <Evaluations />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer
        className="shrink-0 py-3 px-6 text-center"
        style={{ background: "var(--canvas-warm)", borderTop: "1.5px solid var(--border)" }}
      >
        <p className="font-body text-xs" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
          Fine-tuned LLaMA 3.1 8B &times; Fine-tuned SDXL · Duke University AIPI 540
        </p>
      </footer>
    </div>
  );
}
