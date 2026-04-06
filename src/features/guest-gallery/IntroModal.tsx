"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";

const INTRO_KEY = "guest-gallery-intro-seen";

export { INTRO_KEY };

export default function IntroModal({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const dismiss = useCallback((openForm: boolean) => {
    localStorage.setItem(INTRO_KEY, "1");
    if (openForm) onStart();
    else onClose();
  }, [onStart, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
      onClick={() => dismiss(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-10 h-10 mx-auto mb-4 text-primary/70"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>

        <h3 className="text-base font-medium text-text mb-1.5">
          함께한 순간을 남겨주세요
        </h3>
        <p className="text-xs text-text-muted leading-relaxed mb-5">
          소중한 사진을 올려주시면<br />
          신랑신부에게 큰 선물이 됩니다
        </p>

        <div className="flex flex-col gap-2.5 text-left mb-5 px-2">
          {[
            { step: "1", text: "사진을 선택해주세요" },
            { step: "2", text: "이름과 비밀번호를 입력해주세요" },
            { step: "3", text: "올리기 버튼을 눌러주세요" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-medium flex items-center justify-center shrink-0">
                {step}
              </span>
              <span className="text-xs text-text-light">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => dismiss(true)}
          className="w-full py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors mb-2"
          style={{ minHeight: "auto" }}
        >
          사진 올리기
        </button>
        <button
          onClick={() => dismiss(false)}
          className="text-xs text-text-muted/60 underline underline-offset-4 decoration-text-muted/30 hover:text-text-muted transition-colors"
          style={{ minHeight: "auto" }}
        >
          둘러볼게요
        </button>
      </motion.div>
    </motion.div>
  );
}
