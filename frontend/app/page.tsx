"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cursor from "@/components/Cursor";
import Marquee from "@/components/Marquee";
import OutfitForm from "@/components/OutfitForm";
import OutfitResult from "@/components/OutfitResult";
import type { OutfitResponse } from "@/types";

export default function Home() {
  const [result, setResult] = useState<OutfitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  return (
    <>
      <Cursor />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-6"
        style={{ background: "linear-gradient(to bottom, rgba(250,248,245,0.95), transparent)" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="font-serif text-xl tracking-[0.15em]" style={{ color: "var(--charcoal)" }}>
            STYLE2FIT
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex items-center gap-8"
        >
          <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "var(--taupe)", fontWeight: 300 }}>
            AI Stylist
          </span>
          <div className="w-px h-4" style={{ background: "var(--blush)" }} />
          <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "var(--taupe)", fontWeight: 300 }}>
            AIPI 540
          </span>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col" style={{ background: "var(--ivory)" }}>
        {/* Large editorial headline */}
        <div className="flex-1 flex flex-col justify-end pb-16 px-10 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl"
          >
            <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "var(--taupe)", fontWeight: 300 }}>
              Fine-tuned LLM × Fine-tuned SDXL
            </p>
            <h1 className="font-serif leading-none mb-2"
              style={{
                fontSize: "clamp(4rem, 12vw, 10rem)",
                color: "var(--charcoal)",
                fontWeight: 300,
                letterSpacing: "-0.01em"
              }}>
              Dress
            </h1>
            <h1 className="font-serif leading-none mb-2"
              style={{
                fontSize: "clamp(4rem, 12vw, 10rem)",
                color: "var(--charcoal)",
                fontWeight: 300,
                fontStyle: "italic",
                letterSpacing: "-0.01em"
              }}>
              the
            </h1>
            <h1 className="font-serif leading-none"
              style={{
                fontSize: "clamp(4rem, 12vw, 10rem)",
                color: "var(--charcoal)",
                fontWeight: 300,
                letterSpacing: "-0.01em"
              }}>
              Moment.
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-12 flex items-end justify-between"
          >
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--taupe)", fontWeight: 300 }}>
              Describe your situation the way you&apos;d text a friend.<br />
              Get a complete outfit. See it rendered on a person.
            </p>
            <div className="hidden md:flex items-center gap-3" style={{ color: "var(--taupe)" }}>
              <div className="w-12 h-px" style={{ background: "var(--blush)" }} />
              <span className="text-xs tracking-[0.2em] uppercase" style={{ fontWeight: 300 }}>Scroll</span>
            </div>
          </motion.div>
        </div>

        {/* Decorative rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: 0, height: "1px", background: "var(--blush)", margin: "0 2.5rem" }}
        />
      </section>

      {/* Marquee strip */}
      <Marquee />

      {/* Form section */}
      <section className="px-10 py-24" style={{ background: "var(--ivory)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left: copy */}
          <div className="lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: "var(--dusty-rose)", fontWeight: 300 }}>
                — How it works
              </p>
              <h2 className="font-serif mb-8"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  color: "var(--charcoal)",
                  fontWeight: 300,
                  lineHeight: 1.1,
                }}>
                Tell me what&apos;s<br />
                <em>happening.</em>
              </h2>
              <p className="text-sm leading-loose mb-12" style={{ color: "var(--taupe)", fontWeight: 300, maxWidth: "34ch" }}>
                Type your situation — coffee date, job interview, rooftop bar, first day at the internship.
                The AI reads the vibe, builds a full outfit, and renders it on a person.
              </p>

              {/* Steps */}
              <div className="space-y-8">
                {[
                  { n: "01", label: "Situation", desc: "Casual text prompt, just like texting a friend" },
                  { n: "02", label: "Outfit Plan", desc: "Fine-tuned LLM structures top, bottom, shoes, aesthetic" },
                  { n: "03", label: "Visual", desc: "Fine-tuned SDXL renders the complete look, head to toe" },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-6">
                    <span className="font-serif text-sm mt-0.5" style={{ color: "var(--rose)", fontWeight: 400, minWidth: "2rem" }}>
                      {step.n}
                    </span>
                    <div>
                      <p className="text-xs tracking-[0.15em] uppercase mb-1" style={{ color: "var(--charcoal)", fontWeight: 300 }}>
                        {step.label}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--taupe)", fontWeight: 300 }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <OutfitForm onResult={setResult} onLoading={setLoading} loading={loading} />
          </motion.div>
        </div>
      </section>

      {/* Result section */}
      <AnimatePresence>
        {(result || loading) && (
          <div ref={resultRef}>
            <OutfitResult result={result} loading={loading} />
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="px-10 py-16" style={{ borderTop: "1px solid var(--blush)", background: "var(--cream)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="font-serif text-lg tracking-[0.1em]" style={{ color: "var(--charcoal)" }}>STYLE2FIT</span>
            <p className="text-xs mt-2" style={{ color: "var(--taupe)", fontWeight: 300 }}>
              Fine-tuned LLaMA 3.1 8B × Fine-tuned SDXL
            </p>
          </div>
          <div className="text-xs space-y-1 text-right" style={{ color: "var(--taupe)", fontWeight: 300 }}>
            <p>Built for AIPI 540 · Duke University</p>
            <p>QLoRA + LoRA · Marqo/fashion200k</p>
          </div>
        </div>
      </footer>
    </>
  );
}
