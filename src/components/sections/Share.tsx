"use client";

import { useEffect, useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";
import { loadKakaoSDK, shareKakao } from "@/lib/kakao";
import { QRCodeSVG } from "qrcode.react";

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
      <h2 className="text-lg font-light text-primary mb-2 tracking-wider">
        공유하기
      </h2>
      <p className="text-xs text-text-muted font-light mb-8">
        소중한 분들에게 알려주세요
      </p>
      <div className="mb-8 inline-block p-3 bg-white rounded-2xl shadow-sm border border-border">
        <QRCodeSVG
          value={meta.siteUrl}
          size={140}
          bgColor="transparent"
          fgColor="#333333"
          level="M"
        />
      </div>
      <p className="text-[11px] text-text-muted font-light mb-6">
        옆에 계신 분에게 보여주세요
      </p>

      <div className="flex gap-3 justify-center max-w-xs mx-auto">
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
    </SectionWrapper>
  );
}
