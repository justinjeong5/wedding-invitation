"use client";

import { WEDDING_CONFIG } from "@/config/wedding";

export default function Footer() {
  const { groom, bride, date, venue } = WEDDING_CONFIG;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="pt-16 pb-10 px-5 text-center">
      <div className="text-primary/50 text-sm tracking-[0.5em] mb-8">
        &#x2727; &#x2727; &#x2727;
      </div>

      <p className="text-[13px] text-text-light/70 font-serif font-light leading-relaxed mb-6">
        귀한 걸음 해주시는<br />
        모든 분들께 감사드립니다
      </p>

      <p className="text-xs text-text-muted/80 font-serif mb-1">
        {groom.name} & {bride.name}
      </p>
      <p className="text-[10px] text-text-muted/60 tracking-wider mb-1">
        {date.year}.{String(date.month).padStart(2, "0")}.{String(date.day).padStart(2, "0")}
      </p>
      <p className="text-[10px] text-text-muted/60">
        {venue.name}
      </p>

      <button
        onClick={scrollToTop}
        className="mt-8 px-5 py-2.5 text-xs text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors tracking-wider"
        style={{ minHeight: "auto" }}
      >
        &#x25B2; 처음으로
      </button>
    </footer>
  );
}
