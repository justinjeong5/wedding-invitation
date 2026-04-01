"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = "복사" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert("복사에 실패했습니다. 직접 복사해주세요.");
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{ minHeight: "auto" }}
      className={`min-w-[52px] px-3 py-2.5 text-xs rounded-lg transition-all duration-200 shrink-0 ${
        copied
          ? "bg-primary/10 text-primary border border-primary/40 font-medium"
          : "border border-primary/30 text-primary hover:bg-primary/5"
      }`}
    >
      {copied ? "복사됨" : label}
    </button>
  );
}
