"use client";

import { useEffect, useState } from "react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { loadKakaoSDK, shareKakao } from "@/lib/kakao";

export default function Footer() {
  const { meta, groom, bride } = WEDDING_CONFIG;
  const [kakaoReady, setKakaoReady] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meta.siteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = meta.siteUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <footer className="py-12 px-6 text-center">
      <div className="max-w-lg mx-auto">
        <div className="flex gap-3 justify-center mb-8">
          <button
            onClick={handleKakaoShare}
            disabled={!kakaoReady}
            className="flex-1 max-w-[160px] py-3 text-sm bg-[#FEE500] text-[#191919] rounded-lg font-sans font-medium hover:brightness-95 transition disabled:opacity-50"
          >
            카카오톡 공유
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 max-w-[160px] py-3 text-sm border border-border text-text-light rounded-lg font-sans hover:bg-bg-card transition"
          >
            {linkCopied ? "복사 완료!" : "링크 복사"}
          </button>
        </div>

        <p className="text-xs text-text-muted font-sans">
          {groom.name} & {bride.name}
        </p>
      </div>
    </footer>
  );
}
