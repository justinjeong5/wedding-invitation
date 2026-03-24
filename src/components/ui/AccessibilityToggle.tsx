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
      className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-primary active:scale-95 transition-transform"
      style={{ minHeight: "auto" }}
      aria-label={large ? "글자 작게" : "글자 크게"}
      title={large ? "글자 작게" : "글자 크게"}
    >
      <span className="font-bold leading-none" style={{ fontSize: large ? 15 : 12, minHeight: "auto" }}>
        {large ? "가−" : "가+"}
      </span>
    </button>
  );
}
