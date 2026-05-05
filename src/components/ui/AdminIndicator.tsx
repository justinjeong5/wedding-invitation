"use client";

import { useState, useEffect } from "react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useAfterWedding } from "@/hooks/useAfterWedding";
import { useGuestGalleryOpen } from "@/hooks/useGuestGalleryOpen";
import { useDarkMode } from "@/hooks/useDarkMode";
import AdminHelpModal from "@/components/ui/AdminHelpModal";

const HELP_SEEN_KEY = "admin-help-seen";

export default function AdminIndicator() {
  const { isAdmin } = useAdminMode();
  const afterWedding = useAfterWedding();
  const guestGalleryOpen = useGuestGalleryOpen();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (isAdmin && !sessionStorage.getItem(HELP_SEEN_KEY)) {
      sessionStorage.setItem(HELP_SEEN_KEY, "1");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHelpOpen(true);
    }
  }, [isAdmin]);

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
        <div className="bg-bg-card/95 backdrop-blur-sm border-b border-orange-200/60 flex items-center justify-center gap-1.5 px-3 py-1.5">
          {[
            { label: "예식 후", active: afterWedding, onClick: toggleAfterWedding },
            { label: "하객갤러리", active: guestGalleryOpen, onClick: toggleGuestGallery },
            { label: "다크", active: isDark, onClick: toggleDark },
          ].map(({ label, active, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              style={{ minHeight: "auto" }}
              className={`flex-1 max-w-[120px] px-2 py-1 text-[10px] rounded-md tracking-wide transition-colors ${
                active
                  ? "bg-orange-400/90 text-white"
                  : "bg-bg-card text-text-muted border border-border"
              }`}
            >
              {label} {active ? "ON" : "OFF"}
            </button>
          ))}
          <button
            onClick={() => setHelpOpen(true)}
            style={{ minHeight: "auto" }}
            className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-[10px] font-semibold text-orange-400 border border-orange-300 active:bg-orange-50 transition-colors"
            aria-label="관리자 도움말"
          >
            ?
          </button>
        </div>
      </div>

      {helpOpen && <AdminHelpModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}
