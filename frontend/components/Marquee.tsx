"use client";

const ITEMS = [
  "Coffee Date",
  "First Day Fit",
  "Rooftop Bar",
  "Business Casual",
  "Concert Night",
  "Birthday Dinner",
  "Museum Afternoon",
  "Dark Academia",
  "Old Money",
  "Clean Girl",
  "Soft Girl Era",
  "Coastal Grandmother",
  "Street Style",
  "Effortless Chic",
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div
      className="overflow-hidden py-4"
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        background: "var(--canvas-warm)",
      }}
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-5 px-5"
            style={{ color: "var(--ink-muted)" }}
          >
            <span
              className="font-body text-xs tracking-[0.2em] uppercase whitespace-nowrap"
              style={{ fontWeight: 500 }}
            >
              {item}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--coral)",
                flexShrink: 0,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
