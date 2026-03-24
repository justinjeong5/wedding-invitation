"use client";

import { useActionState, useEffect, useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import {
  submitGuestbook,
  getGuestbookEntries,
  deleteGuestbookEntry,
} from "@/actions/guestbook";
import type { GuestbookEntry } from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function GuestbookItem({
  entry,
  onDeleted,
}: {
  entry: GuestbookEntry;
  onDeleted: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteGuestbookEntry(entry.id, password);
    if (result.success) {
      onDeleted();
    } else {
      setError(result.error ?? "삭제 실패");
    }
    setDeleting(false);
  };

  return (
    <div className="bg-bg-card p-4 rounded-lg border border-border">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium">{entry.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">
            {formatDate(entry.created_at)}
          </span>
          <button
            onClick={() => setShowDelete(!showDelete)}
            className="text-text-muted/50 text-xs hover:text-text-muted"
          >
            &times;
          </button>
        </div>
      </div>
      <p className="text-sm text-text-light whitespace-pre-line">{entry.message}</p>

      {showDelete && (
        <div className="mt-3 flex gap-2">
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-border rounded bg-bg focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-xs bg-red-500/10 text-red-500 rounded disabled:opacity-50"
          >
            삭제
          </button>
          {error && <p className="text-red-500 text-[10px] self-center">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [state, formAction, isPending] = useActionState(submitGuestbook, {
    success: false,
  });

  const loadEntries = async () => {
    const data = await getGuestbookEntries();
    setEntries(data);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (state.success) {
      loadEntries();
    }
  }, [state]);

  return (
    <SectionWrapper id="guestbook">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider text-center">
        방명록
      </h2>

      <form action={formAction} className="space-y-3 font-sans mb-6">
        <div className="flex gap-2">
          <input
            name="name"
            type="text"
            placeholder="이름"
            required
            className="flex-1 px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            required
            className="w-24 px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary"
          />
        </div>
        <textarea
          name="message"
          placeholder="축하 메시지를 남겨주세요"
          required
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary resize-none"
        />
        {state.error && (
          <p className="text-red-500 text-xs">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isPending ? "작성 중..." : "남기기"}
        </button>
      </form>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">
            첫 번째 축하 메시지를 남겨주세요
          </p>
        ) : (
          entries.map((entry) => (
            <GuestbookItem
              key={entry.id}
              entry={entry}
              onDeleted={loadEntries}
            />
          ))
        )}
      </div>
    </SectionWrapper>
  );
}
