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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-[480px]">
        <div className="bg-orange-400/90 text-white text-[10px] tracking-widest text-center py-1 pointer-events-none select-none">
          관리자 모드
        </div>
        <div className="bg-white/95 backdrop-blur-sm border-b border-orange-200/60 flex items-center justify-center gap-1.5 px-3 py-1.5">
          {[
            { label: "예식 후", active: afterWedding, onClick: toggleAfterWedding },
            { label: "하객갤러리", active: guestGalleryOpen, onClick: toggleGuestGallery },
            { label: "BGM", active: bgmEnabled, onClick: toggleBgm },
          ].map(({ label, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              style={{ minHeight: "auto" }}
              className={`flex-1 max-w-[120px] px-2 py-1 text-[10px] rounded-md tracking-wide transition-colors ${
                active
                  ? "bg-orange-400/90 text-white"
                  : "bg-white text-stone-400 border border-stone-200"
              }`}
            >
              {label} {active ? "ON" : "OFF"}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
