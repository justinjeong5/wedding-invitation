"use client";

import { useActionState, useEffect, useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import {
  submitGuestbook,
  getGuestbookEntries,
  updateGuestbookEntry,
  deleteGuestbookEntry,
} from "@/actions/guestbook";
import type { GuestbookEntry } from "@/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function GuestbookItem({
  entry,
  onChanged,
}: {
  entry: GuestbookEntry;
  onChanged: () => void;
}) {
  const [activeAction, setActiveAction] = useState<
    "edit" | "delete" | null
  >(null);
  const [password, setPassword] = useState("");
  const [editMessage, setEditMessage] = useState(entry.message);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setActiveAction(null);
    setPassword("");
    setEditMessage(entry.message);
    setError("");
  };

  const handleDelete = async () => {
    if (!password) return;
    setLoading(true);
    setError("");
    const result = await deleteGuestbookEntry(entry.id, password);
    if (result.success) {
      onChanged();
    } else {
      setError(result.error ?? "삭제 실패");
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!password || !editMessage.trim()) return;
    setLoading(true);
    setError("");
    const result = await updateGuestbookEntry(
      entry.id,
      password,
      editMessage
    );
    if (result.success) {
      onChanged();
      reset();
    } else {
      setError(result.error ?? "수정 실패");
    }
    setLoading(false);
  };

  return (
    <div className="bg-bg-card p-4 rounded-lg border border-border">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium">{entry.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">
            {formatDate(entry.created_at)}
            {entry.edited && (
              <span className="text-text-muted/50 ml-1">(편집됨)</span>
            )}
          </span>
          {!activeAction && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveAction("edit")}
                className="text-text-muted/50 text-[10px] hover:text-text-muted min-h-0 px-0.5"
              >
                수정
              </button>
              <button
                onClick={() => setActiveAction("delete")}
                className="text-text-muted/50 text-xs hover:text-text-muted min-h-0 px-0.5"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>

      {activeAction === "edit" ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary resize-none"
          />
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              className="flex-1 min-w-0 px-3 py-1.5 text-xs border border-border rounded bg-bg focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleEdit}
              disabled={loading || !password || !editMessage.trim()}
              className="px-3 py-1.5 text-xs text-primary border border-primary/30 rounded hover:bg-primary/5 transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? "수정 중..." : "수정"}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 text-xs text-text-muted border border-border rounded hover:bg-bg transition-colors shrink-0"
            >
              취소
            </button>
          </div>
          {error && <p className="text-red-500 text-[10px]">{error}</p>}
        </div>
      ) : activeAction === "delete" ? (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-text-light whitespace-pre-line">
            {entry.message}
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDelete()}
              className="flex-1 min-w-0 px-3 py-1.5 text-xs border border-border rounded bg-bg focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleDelete}
              disabled={loading || !password}
              className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
            >
              {loading ? "삭제 중..." : "삭제"}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 text-xs text-text-muted border border-border rounded hover:bg-bg transition-colors shrink-0"
            >
              취소
            </button>
          </div>
          {error && <p className="text-red-500 text-[10px]">{error}</p>}
        </div>
      ) : (
        <p className="text-sm text-text-light whitespace-pre-line">
          {entry.message}
        </p>
      )}
    </div>
  );
}

function GuestbookSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-bg-card p-4 rounded-lg border border-border animate-pulse"
        >
          <div className="flex justify-between mb-2">
            <div className="h-4 w-16 bg-border/50 rounded" />
            <div className="h-3 w-20 bg-border/30 rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3.5 w-full bg-border/40 rounded" />
            <div className="h-3.5 w-2/3 bg-border/30 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, formAction, isPending] = useActionState(submitGuestbook, {
    success: false,
  });

  const loadEntries = async () => {
    const data = await getGuestbookEntries();
    setEntries(data);
    setLoading(false);
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
        {loading ? (
          <GuestbookSkeleton />
        ) : entries.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">
            첫 번째 축하 메시지를 남겨주세요
          </p>
        ) : (
          entries.map((entry) => (
            <GuestbookItem
              key={entry.id}
              entry={entry}
              onChanged={loadEntries}
            />
          ))
        )}
      </div>
    </SectionWrapper>
  );
}
