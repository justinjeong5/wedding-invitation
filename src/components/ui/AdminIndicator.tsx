"use client";

import { useState } from "react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useAfterWedding } from "@/hooks/useAfterWedding";
import { useGuestGalleryOpen } from "@/hooks/useGuestGalleryOpen";

export default function AdminIndicator() {
  const { isAdmin } = useAdminMode();
  const afterWedding = useAfterWedding();
  const guestGalleryOpen = useGuestGalleryOpen();
  const [bgmEnabled, setBgmEnabled] = useState(true);

  const toggleAfterWedding = () => {
    window.dispatchEvent(
      new CustomEvent("after-wedding-preview", {
        detail: { enabled: !afterWedding },
      })
    );
  };

  const toggleGuestGallery = () => {
    window.dispatchEvent(
      new CustomEvent("guest-gallery-preview", {
        detail: { enabled: !guestGalleryOpen },
      })
    );
  };

  const toggleBgm = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    window.dispatchEvent(
      new CustomEvent("bgm-toggle", {
        detail: { enabled: next },
      })
    );
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Viewport border */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{ boxShadow: "inset 0 0 0 4px rgba(234, 138, 46, 0.6)" }}
      />
      {/* Top bar */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
        <span className="inline-block px-3 py-0.5 text-[10px] text-white bg-orange-400/80 rounded-b-md tracking-wider pointer-events-none">
          관리자 모드
        </span>
        <button
          onClick={toggleAfterWedding}
          className={`px-2.5 py-0.5 text-[10px] rounded-b-md tracking-wider transition-colors ${
            afterWedding
              ? "bg-primary/90 text-white"
              : "bg-white/80 text-text-muted border border-t-0 border-border"
          }`}
        >
          예식 후 {afterWedding ? "ON" : "OFF"}
        </button>
        <button
          onClick={toggleGuestGallery}
          className={`px-2.5 py-0.5 text-[10px] rounded-b-md tracking-wider transition-colors ${
            guestGalleryOpen
              ? "bg-primary/90 text-white"
              : "bg-white/80 text-text-muted border border-t-0 border-border"
          }`}
        >
          하객갤러리 {guestGalleryOpen ? "ON" : "OFF"}
        </button>
        <button
          onClick={toggleBgm}
          className={`px-2.5 py-0.5 text-[10px] rounded-b-md tracking-wider transition-colors ${
            bgmEnabled
              ? "bg-primary/90 text-white"
              : "bg-white/80 text-text-muted border border-t-0 border-border"
          }`}
        >
          BGM {bgmEnabled ? "ON" : "OFF"}
        </button>
      </div>
    </>
  );
}
