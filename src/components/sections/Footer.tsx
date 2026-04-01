"use client";

import { useState, useCallback, useRef } from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { verifyAdminPassword } from "@/actions/guest-gallery";

const ADMIN_CLICK_THRESHOLD = 20;
const CLICK_TIMEOUT_MS = 2000;

export default function Footer() {
  const { groom, bride, date, venue } = WEDDING_CONFIG;
  const [clickCount, setClickCount] = useState(0);
  const lastClickRef = useRef(0);
  const activatedRef = useRef(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleFooterClick = useCallback(() => {
    if (activatedRef.current) return;
    const now = Date.now();
    if (now - lastClickRef.current > CLICK_TIMEOUT_MS) {
      setClickCount(1);
    } else {
      setClickCount((prev) => {
        const next = prev + 1;
        if (next >= ADMIN_CLICK_THRESHOLD) {
          setShowPrompt(true);
        }
        return next;
      });
    }
    lastClickRef.current = now;
  }, []);

  const closePrompt = () => {
    setShowPrompt(false);
    setClickCount(0);
    setAdminPassword("");
    setAdminError("");
  };

  const handlePasswordSubmit = async () => {
    if (!adminPassword || verifying) return;
    setVerifying(true);
    setAdminError("");
    const valid = await verifyAdminPassword(adminPassword);
    if (valid) {
      activatedRef.current = true;
      setShowPrompt(false);
      window.dispatchEvent(
        new CustomEvent("admin-activated", {
          detail: { password: adminPassword },
        })
      );
    } else {
      setAdminError("비밀번호가 올바르지 않습니다.");
    }
    setVerifying(false);
  };

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

      <div onClick={handleFooterClick} className="select-none">
        <p className="text-xs text-text-muted/80 font-serif mb-1">
          {groom.name} & {bride.name}
        </p>
        <p className="text-[10px] text-text-muted/60 tracking-wider mb-1">
          {date.year}.{String(date.month).padStart(2, "0")}.{String(date.day).padStart(2, "0")}
        </p>
        <p className="text-[10px] text-text-muted/60">
          {venue.name}
        </p>
      </div>

      <button
        onClick={scrollToTop}
        className="mt-8 px-5 py-2.5 text-xs text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors tracking-wider"
        style={{ minHeight: "auto" }}
      >
        &#x25B2; 처음으로
      </button>

      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={closePrompt}
        >
          <div
            className="bg-bg-card rounded-lg shadow-lg p-5 mx-4 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-text mb-3 text-center">관리자 비밀번호</p>
            <input
              type="password"
              autoComplete="off"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary mb-2"
              placeholder="비밀번호를 입력하세요"
              autoFocus
              data-1p-ignore
            />
            {adminError && (
              <p className="text-red-500 text-xs mb-2">{adminError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={closePrompt}
                className="flex-1 py-2 text-xs text-text-muted border border-border rounded-lg hover:bg-bg transition-colors"
                style={{ minHeight: "auto" }}
              >
                취소
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={verifying || !adminPassword}
                className="flex-1 py-2 text-xs text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                style={{ minHeight: "auto" }}
              >
                {verifying ? "확인 중..." : "확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
