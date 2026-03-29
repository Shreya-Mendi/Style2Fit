"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PLACEHOLDER_ITEMS = [
  { text: "White linen button-down",      color: "card-coral" },
  { text: "High-waisted straight jeans",  color: "card-sky" },
  { text: "Oversized blazer — camel",     color: "card-gold" },
  { text: "Silk midi slip dress",         color: "card-lavender" },
  { text: "White leather sneakers",       color: "card-mint" },
  { text: "Strappy block heels",          color: "card-pink" },
  { text: "Gold hoop earrings",           color: "card-peach" },
  { text: "Structured leather tote",      color: "card-coral" },
];

const COMING_SOON = [
  { icon: "📸", text: "Upload photos of your actual clothes", color: "var(--coral)" },
  { icon: "🧠", text: "AI learns your personal wardrobe",     color: "var(--sky)" },
  { icon: "✨", text: "Outfit suggestions from what you own", color: "var(--mint)" },
  { icon: "📊", text: "Style analytics — gaps to fill",       color: "var(--lavender)" },
];

export default function Closet() {
  const [newItem, setNewItem] = useState("");
  const [items, setItems] = useState(PLACEHOLDER_ITEMS);

  const CARD_COLORS = ["card-coral","card-sky","card-gold","card-lavender","card-mint","card-pink","card-peach"];

  const handleAdd = () => {
    if (newItem.trim()) {
      setItems([...items, { text: newItem.trim(), color: CARD_COLORS[items.length % CARD_COLORS.length] }]);
      setNewItem("");
    }
  };

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
            Your Closet{" "}
            <span className="font-handwritten" style={{ color: "var(--pink)", fontWeight: 400, fontSize: "0.85em" }}>🧺</span>
          </h2>
          <p className="font-body text-sm" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
            Build your wardrobe. Let the AI style from what you own.
          </p>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="font-body text-xs px-4 py-1.5 rounded-full font-bold"
          style={{ background: "var(--gold)", color: "#5a4000", border: "1.5px solid rgba(245,200,66,0.6)", cursor: "default" }}
        >
          Coming Soon ✦
        </motion.div>
      </motion.div>

      {/* Coming soon cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMING_SOON.map((item, i) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`card ${i % 2 === 0 ? "card-mint" : "card-sky"} ${i === 0 ? "-rotate-1" : i === 1 ? "rotate-1" : i === 2 ? "rotate-1" : "-rotate-1"} flex items-center gap-4`}
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="font-body text-sm" style={{ color: "var(--ink-soft)", fontWeight: 500 }}>
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Add item form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="card card-cream"
      >
        <p className="font-body text-xs tracking-[0.12em] uppercase mb-4" style={{ color: "var(--ink-muted)", fontWeight: 600 }}>
          Add to closet
        </p>
        <div className="flex gap-3">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. White linen button-down…"
            className="flex-1 font-body text-sm px-4 py-3 rounded-xl transition-all"
            style={{
              background: "var(--canvas)",
              border: "1.5px solid var(--border)",
              color: "var(--ink)",
              fontWeight: 400,
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--coral)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="font-body text-sm px-5 py-3 rounded-xl shrink-0 transition-all"
            style={{
              background: "var(--coral)",
              color: "white",
              fontWeight: 600,
              border: "none",
              cursor: "none",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "var(--coral-hover)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "var(--coral)")
            }
          >
            Add +
          </motion.button>
        </div>
      </motion.div>

      {/* Wardrobe chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.6 }}
      >
        <p className="font-body text-xs tracking-[0.12em] uppercase mb-4" style={{ color: "var(--ink-muted)", fontWeight: 600 }}>
          Sample closet ({items.length} items)
        </p>
        <div className="flex flex-wrap gap-2.5">
          {items.map((item, i) => (
            <motion.span
              key={`${item.text}-${i}`}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.04 * i, duration: 0.4 }}
              className={`font-body text-xs px-3.5 py-1.5 rounded-full ${item.color}`}
              style={{
                border: "1.5px solid var(--border)",
                color: "var(--ink-soft)",
                fontWeight: 500,
                cursor: "default",
              }}
            >
              {item.text}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
