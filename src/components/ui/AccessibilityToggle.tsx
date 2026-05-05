"use client";

import { useEffect, useState } from "react";

export default function AccessibilityToggle() {
  const [large, setLarge] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wedding-large-mode");
    if (saved === "true") {
      setLarge(true);
      document.documentElement.classList.add("large-mode");
    }
  }, []);

  const toggle = () => {
    const next = !large;
    setLarge(next);
    if (next) {
      document.documentElement.classList.add("large-mode");
    } else {
      document.documentElement.classList.remove("large-mode");
    }
    localStorage.setItem("wedding-large-mode", String(next));
  };

  return (
    <button
      onClick={toggle}
      className="fixed bottom-[4.5rem] right-6 z-40 w-10 h-10 rounded-full bg-bg-card shadow-lg border border-border flex items-center justify-center text-primary active:scale-95 transition-transform"
      style={{ minHeight: "auto" }}
      aria-label={large ? "글자 작게" : "글자 크게"}
      title={large ? "글자 작게" : "글자 크게"}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m20 20-3.5-3.5" />
        {large ? (
          <path strokeLinecap="round" d="M8.5 11h5" />
        ) : (
          <path strokeLinecap="round" d="M11 8.5v5M8.5 11h5" />
        )}
      </svg>
    </button>
  );
}
