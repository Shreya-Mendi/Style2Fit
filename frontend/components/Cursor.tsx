"use client";

import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      raf = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      ring.style.width = "48px";
      ring.style.height = "48px";
      ring.style.opacity = "0.4";
    };
    const onLeave = () => {
      ring.style.width = "32px";
      ring.style.height = "32px";
      ring.style.opacity = "1";
    };

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, textarea, select").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    raf = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        style={{
          width: 6,
          height: 6,
          background: "var(--coral)",
          borderRadius: "50%",
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        ref={ringRef}
        style={{
          width: 32,
          height: 32,
          border: "1.5px solid var(--coral)",
          borderRadius: "50%",
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9998,
          transform: "translate(-50%, -50%)",
          transition: "width 0.25s ease, height 0.25s ease, opacity 0.25s ease",
        }}
      />
    </>
  );
}
