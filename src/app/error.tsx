"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-dvh bg-bg w-full max-w-[480px] mx-auto flex flex-col items-center justify-center px-5 text-center">
      <div className="text-primary/40 text-3xl tracking-[0.5em] mb-8">
        &#x2727; &#x2727; &#x2727;
      </div>
      <p className="text-base text-text font-serif font-light mb-2">
        페이지를 불러오지 못했습니다
      </p>
      <p className="text-xs text-text-muted/70 font-light mb-8 leading-relaxed">
        잠시 후 다시 시도해주세요
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 text-xs text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors tracking-wider"
        style={{ minHeight: "auto" }}
      >
        다시 시도
      </button>
    </main>
  );
}
