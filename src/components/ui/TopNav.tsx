"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WEDDING_CONFIG } from "@/config/wedding";
import { useAfterWedding } from "@/hooks/useAfterWedding";
import { useGuestGalleryOpen } from "@/hooks/useGuestGalleryOpen";

const NAV_ITEMS = [
  { id: "greeting", label: "인사말" },
  { id: "calendar", label: "예식 일시", hideAfterWedding: true },
  { id: "gallery", label: "갤러리" },
  { id: "location", label: "오시는 길", hideAfterWedding: true },
  { id: "rsvp", label: "참석 여부", hideAfterWedding: true },
  { id: "contact", label: "연락처" },
  { id: "account", label: "마음 전하실 곳", hideAfterWedding: true },
  { id: "guest-gallery", label: "하객 갤러리", guestGallery: true },
  { id: "guestbook", label: "방명록" },
];

export default function TopNav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const afterWedding = useAfterWedding();
  const guestGalleryOpen = useGuestGalleryOpen();

  const filteredItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (afterWedding && item.hideAfterWedding) return false;
        if (item.guestGallery && !guestGalleryOpen) return false;
        return true;
      }),
    [afterWedding, guestGalleryOpen]
  );

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > window.innerHeight * 0.8);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const sections = filteredItems.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const most = visibleEntries.reduce((a, b) =>
            a.intersectionRatio > b.intersectionRatio ? a : b
          );
          setActiveSection(most.target.id);
        }
      },
      { threshold: [0, 0.25, 0.5], rootMargin: "-44px 0px 0px 0px" }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [filteredItems]);

  const scrollTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.nav
            className="fixed top-0 left-0 right-0 z-40 flex justify-center"
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="w-full max-w-[480px] bg-bg-card/90 backdrop-blur-md border-b border-border/60 px-4 h-11 flex items-center justify-between">
              <span className="text-xs font-serif text-primary tracking-wider">
                {open ? "메뉴" : "경하 & 우림"}
              </span>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="p-1.5 -m-1 text-text-muted"
                style={{ minHeight: "auto" }}
                aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  {open ? (
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            </div>
          </motion.nav>

          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-30 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                <motion.div
                  className="relative w-full max-w-[480px] mt-11 h-[calc(100dvh-2.75rem)] bg-bg-card/95 backdrop-blur-md flex flex-col"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ul className="py-2 flex-1">
                    {filteredItems.map(({ id, label }) => {
                      const isActive = activeSection === id;
                      return (
                        <li key={id} className="relative">
                          {isActive && (
                            <span className="absolute left-0 top-0 w-0.5 h-full bg-primary" />
                          )}
                          <button
                            onClick={() => scrollTo(id)}
                            className={`w-full text-left px-6 py-3 text-sm transition-colors ${
                              isActive
                                ? "bg-primary/5 text-primary font-medium"
                                : "text-text hover:bg-primary/5"
                            }`}
                            style={{ minHeight: "auto" }}
                          >
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="px-6 py-6 border-t border-border/40 text-center">
                    <p className="text-xs text-text-muted/80 font-serif">
                      {WEDDING_CONFIG.groom.name} & {WEDDING_CONFIG.bride.name}
                    </p>
                    <p className="text-[10px] text-text-muted/60 tracking-wider mt-1">
                      {WEDDING_CONFIG.date.display}
                    </p>
                    <p className="text-[10px] text-text-muted/60 mt-0.5">
                      {WEDDING_CONFIG.venue.name} {WEDDING_CONFIG.venue.hall}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
