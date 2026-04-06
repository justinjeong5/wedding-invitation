"use client";

import { copyToClipboard } from "@/lib/clipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
  toastMessage?: string;
}

export default function CopyButton({
  text,
  label = "복사",
  toastMessage = "복사되었습니다",
}: CopyButtonProps) {
  const handleCopy = async () => {
    const ok = await copyToClipboard(text, toastMessage);
    if (!ok) {
      await copyToClipboard(text);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{ minHeight: "auto" }}
      className="min-w-[52px] px-3 py-2.5 text-xs rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-all duration-200 shrink-0"
    >
      {label}
    </button>
  );
}
