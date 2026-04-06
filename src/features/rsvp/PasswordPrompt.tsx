"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { deleteRsvp, verifyRsvpPassword } from "@/features/rsvp/actions";

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

export default function PasswordPrompt({
  onVerified,
  onCancel,
  actionLabel,
  rsvpId,
  isDelete,
}: {
  onVerified: (password: string) => void;
  onCancel: () => void;
  actionLabel: string;
  rsvpId: string;
  isDelete?: boolean;
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    setError(null);

    if (isDelete) {
      const result = await deleteRsvp(rsvpId, password);
      if (result.success) {
        onVerified(password);
      } else {
        setError(result.error ?? "실패했습니다.");
      }
    } else {
      const result = await verifyRsvpPassword(rsvpId, password);
      if (result.success) {
        onVerified(password);
      } else {
        setError(result.error ?? "비밀번호가 일치하지 않습니다.");
      }
    }
    setLoading(false);
  };

  return (
    <motion.div {...fadeIn} className="mt-4">
      <div className="flex gap-2 max-w-xs mx-auto">
        <input
          type="password"
          autoComplete="off"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 min-w-0 px-3 py-2 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary"
          data-1p-ignore
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !password}
          className={`px-4 py-2 text-sm border rounded-lg transition-colors disabled:opacity-50 shrink-0 ${
            isDelete
              ? "text-red-500 border-red-200 hover:bg-red-50"
              : "text-primary border-primary/30 hover:bg-primary/5"
          }`}
        >
          {loading ? "확인 중..." : actionLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-bg transition-colors shrink-0"
        >
          취소
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2" role="alert">{error}</p>}
    </motion.div>
  );
}
