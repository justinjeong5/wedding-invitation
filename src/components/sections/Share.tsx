"use client";

import { useEffect, useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";
import { loadKakaoSDK, shareKakao } from "@/lib/kakao";

export default function Share() {
  const { meta } = WEDDING_CONFIG;
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
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <SectionWrapper id="share" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        공유하기
      </h2>
      <div className="flex gap-3 justify-center">
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
    </SectionWrapper>
  );
}
