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
      className="overflow-hidden py-5"
      style={{
        borderTop: "1px solid var(--blush)",
        borderBottom: "1px solid var(--blush)",
        background: "var(--cream)",
      }}
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-6 px-6"
            style={{ color: "var(--taupe)", fontWeight: 300 }}
          >
            <span className="text-xs tracking-[0.25em] uppercase whitespace-nowrap">
              {item}
            </span>
            <span
              className="font-serif text-base italic"
              style={{ color: "var(--rose)" }}
            >
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
