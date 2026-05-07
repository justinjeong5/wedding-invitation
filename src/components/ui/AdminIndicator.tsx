"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useDarkMode } from "@/hooks/useDarkMode";
import AdminHelpModal from "@/components/ui/AdminHelpModal";

const HELP_SEEN_KEY = "wjw-admin-help-seen";

type Scenario = "pre-wedding" | "wedding-day" | "after-wedding" | "submission-closed" | "data-disposed";

interface ScenarioOption {
  key: Scenario;
  label: string;
  date: string;
  desc: string;
}

const SCENARIOS: ScenarioOption[] = [
  { key: "pre-wedding", label: "예식 전", date: "~7/10", desc: "모든 섹션 표시, 하객갤러리 비공개" },
  { key: "wedding-day", label: "당일", date: "7/11", desc: "하객갤러리 오픈, 사진 업로드 가능" },
  { key: "after-wedding", label: "예식 후", date: "7/12~", desc: "일시·지도·RSVP·갤러리·계좌 숨김, 감사 갤러리 표시" },
  { key: "submission-closed", label: "마감", date: "7/14~", desc: "등록 차단 (기존 데이터 열람 가능)" },
  { key: "data-disposed", label: "파기", date: "7/25~", desc: "방명록·하객갤러리 데이터 비표시" },
];

const SCENARIO_STATES: Record<
  Scenario,
  { afterWedding: boolean; guestGalleryOpen: boolean; submissionOpen: boolean; dataDisposed: boolean }
> = {
  "pre-wedding": { afterWedding: false, guestGalleryOpen: false, submissionOpen: true, dataDisposed: false },
  "wedding-day": { afterWedding: false, guestGalleryOpen: true, submissionOpen: true, dataDisposed: false },
  "after-wedding": { afterWedding: true, guestGalleryOpen: true, submissionOpen: true, dataDisposed: false },
  "submission-closed": { afterWedding: true, guestGalleryOpen: true, submissionOpen: false, dataDisposed: false },
  "data-disposed": { afterWedding: true, guestGalleryOpen: true, submissionOpen: false, dataDisposed: true },
};

function dispatchPreview(eventName: string, detail: { value: boolean } | { reset: true }) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function resetToLive() {
  dispatchPreview("after-wedding-preview", { reset: true });
  dispatchPreview("guest-gallery-preview", { reset: true });
  dispatchPreview("submission-open-preview", { reset: true });
  dispatchPreview("data-disposed-preview", { reset: true });
}

function applyScenario(scenario: Scenario) {
  const s = SCENARIO_STATES[scenario];
  dispatchPreview("after-wedding-preview", { value: s.afterWedding });
  dispatchPreview("guest-gallery-preview", { value: s.guestGalleryOpen });
  dispatchPreview("submission-open-preview", { value: s.submissionOpen });
  dispatchPreview("data-disposed-preview", { value: s.dataDisposed });
}

export default function AdminIndicator() {
  const { isAdmin } = useAdminMode();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdmin && !sessionStorage.getItem(HELP_SEEN_KEY)) {
      sessionStorage.setItem(HELP_SEEN_KEY, "1");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHelpOpen(true);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const selectScenario = (s: Scenario) => {
    if (scenario === s) {
      setScenario(null);
      resetToLive();
    } else {
      setScenario(s);
      applyScenario(s);
    }
    setDropdownOpen(false);
  };

  if (!isAdmin) return null;

  const selected = SCENARIOS.find((s) => s.key === scenario);

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
        <div className="bg-bg-card/95 backdrop-blur-sm border-b border-orange-200/60">
          <div className="flex items-center gap-1.5 px-3 py-1.5">
            {/* Scenario dropdown */}
            <div ref={dropdownRef} className="relative flex-1">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ minHeight: "auto" }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] rounded-md border transition-colors ${
                  scenario
                    ? "bg-bg-card text-text border-orange-300/60"
                    : "bg-bg-card text-text-muted border-border"
                }`}
              >
                <span>{selected ? `${selected.label} (${selected.date})` : "시나리오 선택"}</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-3 h-3 ml-1 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                  {/* Reset option */}
                  <button
                    onClick={() => { setScenario(null); resetToLive(); setDropdownOpen(false); }}
                    style={{ minHeight: "auto" }}
                    className={`w-full text-left px-3 py-2 border-b border-border/50 transition-colors ${
                      !scenario ? "bg-orange-50 dark:bg-orange-400/10" : "hover:bg-border/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 ${
                        !scenario ? "border-orange-400 bg-orange-400" : "border-text-muted/40"
                      }`} />
                      <span className="text-[11px] text-text font-medium">실제 날짜 기준</span>
                    </div>
                    <p className="text-[9px] text-text-muted mt-0.5 ml-[18px]">
                      현재 시점에 맞게 자동 표시
                    </p>
                  </button>

                  {SCENARIOS.map((opt, i) => (
                    <button
                      key={opt.key}
                      onClick={() => selectScenario(opt.key)}
                      style={{ minHeight: "auto" }}
                      className={`w-full text-left px-3 py-2 transition-colors ${
                        i < SCENARIOS.length - 1 ? "border-b border-border/50" : ""
                      } ${
                        scenario === opt.key ? "bg-orange-50 dark:bg-orange-400/10" : "hover:bg-border/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 ${
                          scenario === opt.key ? "border-orange-400 bg-orange-400" : "border-text-muted/40"
                        }`} />
                        <span className="text-[11px] text-text font-medium">{opt.label}</span>
                        <span className="text-[9px] text-text-muted/70">{opt.date}</span>
                      </div>
                      <p className="text-[9px] text-text-muted mt-0.5 ml-[18px]">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              style={{ minHeight: "auto" }}
              className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-md transition-colors ${
                isDark
                  ? "bg-orange-400/90 text-white"
                  : "bg-bg-card text-text-muted border border-border"
              }`}
              aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {isDark ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            {/* Help */}
            <button
              onClick={() => setHelpOpen(true)}
              style={{ minHeight: "auto" }}
              className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-[10px] font-semibold text-orange-400 border border-orange-300 active:bg-orange-50 transition-colors"
              aria-label="관리자 도움말"
            >
              ?
            </button>
          </div>

          {/* Selected scenario description */}
          {selected && (
            <div className="px-3 pb-1.5 -mt-0.5">
              <p className="text-[9px] text-text-muted/70 leading-relaxed">
                {selected.desc}
              </p>
            </div>
          )}
        </div>
      </div>

      {helpOpen && <AdminHelpModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}
