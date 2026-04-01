"use client";

interface RefreshButtonProps {
  refreshing: boolean;
  cooldown: number;
  onRefresh: () => void;
}

export default function RefreshButton({ refreshing, cooldown, onRefresh }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={refreshing || cooldown > 0}
      className="relative w-9 h-9 flex items-center justify-center rounded-full border border-border text-text-muted hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-40"
      style={{ minHeight: "auto" }}
      aria-label="새로고침"
      type="button"
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-5 h-5 ${refreshing ? "animate-spin" : ""} ${cooldown > 0 ? "opacity-40" : ""} transition-opacity`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M20.015 4.356v4.992"
        />
      </svg>
      {cooldown > 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] tabular-nums text-text-muted">
          {cooldown}
        </span>
      )}
    </button>
  );
}
