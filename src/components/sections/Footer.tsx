"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WEDDING_CONFIG } from "@/config/wedding";
import { verifyAdminPassword } from "@/actions/auth";

const ADMIN_CLICK_THRESHOLD = 20;
const CLICK_TIMEOUT_MS = 2000;
const LOCKOUT_KEY = "wjw-admin-lockout";
const MAX_FAIL = 3;
const LOCKOUT_MS = 10 * 60 * 1000;

function getLockout(): { failCount: number; lockedUntil: number | null } {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return { failCount: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { failCount: 0, lockedUntil: null };
  }
}

function setLockout(data: { failCount: number; lockedUntil: number | null }) {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data));
}

function clearLockout() {
  localStorage.removeItem(LOCKOUT_KEY);
}

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function LockoutCard({ lockedUntil, onClose }: { lockedUntil: number; onClose: () => void }) {
  const [remaining, setRemaining] = useState(() => lockedUntil - Date.now());

  useEffect(() => {
    const tick = () => {
      const left = lockedUntil - Date.now();
      if (left <= 0) {
        clearLockout();
        onClose();
        return;
      }
      setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, onClose]);

  return (
    <motion.div
      key="lockout"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-amber-50 dark:bg-amber-950/30 rounded-lg shadow-lg p-5 mx-4 w-full max-w-xs relative border border-amber-200 dark:border-amber-800/40"
    >
      <button
        onClick={onClose}
        style={{ minHeight: "auto" }}
        className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-amber-600/60 hover:bg-amber-200/40 transition-colors"
        aria-label="닫기"
        type="button"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>

      <div className="flex flex-col items-center text-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-amber-500 mb-3">
          <path
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium mb-1">
          입력이 일시 중단되었습니다
        </p>
        <p className="text-xs text-amber-700/70 dark:text-amber-400/60 mb-4">
          보안을 위해 잠시 후 다시 시도해 주세요
        </p>
        <p className="text-2xl font-light text-amber-700 dark:text-amber-400 tabular-nums tracking-wider">
          {formatRemaining(remaining)}
        </p>
        <p className="text-[10px] text-amber-600/50 dark:text-amber-500/40 mt-1">
          후에 다시 시도할 수 있습니다
        </p>
      </div>
    </motion.div>
  );
}

export default function Footer() {
  const { groom, bride, date, venue } = WEDDING_CONFIG;
  const [, setClickCount] = useState(0);
  const lastClickRef = useRef(0);
  const activatedRef = useRef(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    const lock = getLockout();
    if (lock.lockedUntil && lock.lockedUntil > Date.now()) {
      setLockedUntil(lock.lockedUntil);
    } else if (lock.lockedUntil) {
      clearLockout();
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setClickCount(0);
      }
    };
    document.addEventListener("click", handleOutsideClick, true);
    return () => document.removeEventListener("click", handleOutsideClick, true);
  }, []);

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
    if (lockedUntil && lockedUntil > Date.now()) return;

    setVerifying(true);
    setAdminError("");
    const valid = await verifyAdminPassword(adminPassword);
    if (valid) {
      activatedRef.current = true;
      clearLockout();
      setLockedUntil(null);
      setShowPrompt(false);
      window.dispatchEvent(
        new CustomEvent("admin-activated", {
          detail: { password: adminPassword },
        })
      );
    } else {
      const lock = getLockout();
      const newCount = lock.failCount + 1;
      if (newCount >= MAX_FAIL) {
        const until = Date.now() + LOCKOUT_MS;
        setLockout({ failCount: newCount, lockedUntil: until });
        setLockedUntil(until);
        setAdminError("");
      } else {
        setLockout({ failCount: newCount, lockedUntil: null });
        setAdminError("비밀번호가 올바르지 않습니다.");
      }
    }
    setAdminPassword("");
    setVerifying(false);
  };

  const handleLockoutEnd = useCallback(() => {
    setLockedUntil(null);
    clearLockout();
  }, []);

  const isLocked = lockedUntil !== null && lockedUntil > Date.now();

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

      <div ref={triggerRef} onClick={handleFooterClick} className="select-none">
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

      <div className="mt-6 text-[9px] text-text-muted/40 leading-relaxed">
        <p>
          Art Direction by {bride.name} · Built by {groom.name}
        </p>
        <p className="mt-1">
          Music: &quot;A Thousand Years&quot; by Christina Perri
        </p>
      </div>

      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <AnimatePresence mode="wait">
            {isLocked ? (
              <LockoutCard
                key="lockout"
                lockedUntil={lockedUntil!}
                onClose={closePrompt}
              />
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-bg-card rounded-lg shadow-lg p-5 mx-4 w-full max-w-xs relative"
              >
                <button
                  onClick={closePrompt}
                  style={{ minHeight: "auto" }}
                  className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-text-muted hover:bg-border/40 transition-colors"
                  aria-label="닫기"
                  type="button"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
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
                    {verifying ? "확인 중..." : "로그인"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </footer>
  );
}
