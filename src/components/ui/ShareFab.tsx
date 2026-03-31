"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WEDDING_CONFIG } from "@/config/wedding";
import { loadKakaoSDK, shareKakao } from "@/lib/kakao";

export default function ShareFab() {
  const [open, setOpen] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { meta } = WEDDING_CONFIG;

  useEffect(() => {
    loadKakaoSDK()
      .then(() => setKakaoReady(true))
      .catch(() => {});
  }, []);

  const handleKakaoShare = () => {
    if (!kakaoReady) return;
    shareKakao({
      title: meta.title,
      description: meta.description,
      imageUrl: `${meta.siteUrl}${meta.ogImage}`,
      webUrl: meta.siteUrl,
    });
    setOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meta.siteUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = meta.siteUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
      setOpen(false);
    }, 1200);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-primary active:scale-95 transition-transform"
        style={{ minHeight: "auto" }}
        aria-label="공유하기"
        title="공유하기"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
          <polyline strokeLinecap="round" strokeLinejoin="round" points="16 6 12 2 8 6" />
          <line strokeLinecap="round" x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <motion.div
              className="relative w-full max-w-[480px] bg-white rounded-t-2xl px-6 pt-6 pb-8"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />
              <h3 className="text-sm font-medium text-text mb-4 text-center">공유하기</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleKakaoShare}
                  disabled={!kakaoReady}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm bg-[#FEE500] text-[#3C1E1E] rounded-xl hover:bg-[#FDD835] transition disabled:opacity-50 font-medium"
                >
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="currentColor">
                    <path d="M12 3C6.48 3 2 6.54 2 10.86c0 2.8 1.86 5.27 4.66 6.67l-.9 3.34c-.08.28.24.52.49.36l3.96-2.64c.58.08 1.18.13 1.79.13 5.52 0 10-3.54 10-7.86S17.52 3 12 3z" />
                  </svg>
                  카카오톡
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm rounded-xl transition font-medium ${
                    linkCopied
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                  </svg>
                  {linkCopied ? "복사 완료" : "링크 복사"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
