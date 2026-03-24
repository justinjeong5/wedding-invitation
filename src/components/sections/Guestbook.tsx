"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
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
  onUpdated,
  onDeleted,
}: {
  entry: GuestbookEntry;
  onUpdated: (id: string, newMessage: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [activeAction, setActiveAction] = useState<
    "edit" | "delete" | null
  >(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [password, setPassword] = useState("");
  const [editMessage, setEditMessage] = useState(entry.message);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditMessage(entry.message);
  }, [entry.message]);

  const reset = () => {
    setActiveAction(null);
    setMenuOpen(false);
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
      onDeleted(entry.id);
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
      onUpdated(entry.id, editMessage.trim());
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
          </span>
          {!activeAction && (
            <div className="relative">
              <button
                ref={menuBtnRef}
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-text-muted/40 hover:text-text-muted text-sm min-h-0 px-1 leading-none"
              >
                &#8942;
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    className="fixed z-20 bg-bg-card border border-border rounded-lg shadow-sm overflow-hidden"
                    style={{
                      top: menuBtnRef.current
                        ? menuBtnRef.current.getBoundingClientRect().bottom + 4
                        : 0,
                      right: menuBtnRef.current
                        ? window.innerWidth -
                          menuBtnRef.current.getBoundingClientRect().right
                        : 0,
                    }}
                  >
                    <button
                      onClick={() => {
                        setActiveAction("edit");
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-xs text-text-light hover:bg-bg transition-colors min-h-0 whitespace-nowrap"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        setActiveAction("delete");
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-bg transition-colors min-h-0 whitespace-nowrap"
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
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
              disabled={loading || !password || !editMessage.trim() || editMessage.trim() === entry.message}
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
          {entry.edited && (
            <span className="text-[10px] text-text-muted/40 ml-1">(편집됨)</span>
          )}
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
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [state, formAction, isPending] = useActionState(submitGuestbook, {
    success: false,
  });

  const loadInitial = async () => {
    const result = await getGuestbookEntries();
    setEntries(result.entries);
    setHasMore(result.hasMore);
    setLoading(false);
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || entries.length === 0) return;
    setLoadingMore(true);
    const lastEntry = entries[entries.length - 1];
    const result = await getGuestbookEntries(lastEntry.created_at);
    setEntries((prev) => [...prev, ...result.entries]);
    setHasMore(result.hasMore);
    setLoadingMore(false);
  }, [loadingMore, hasMore, entries]);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (state.success) {
      loadInitial();
    }
  }, [state]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleUpdated = (id: string, newMessage: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, message: newMessage, edited: true } : e
      )
    );
  };

  const handleDeleted = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

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

      <div className="space-y-3">
        {loading ? (
          <GuestbookSkeleton />
        ) : entries.length === 0 ? (
          <p className="text-center text-sm text-text-muted py-8">
            첫 번째 축하 메시지를 남겨주세요
          </p>
        ) : (
          <>
            {entries.map((entry) => (
              <GuestbookItem
                key={entry.id}
                entry={entry}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
            <div ref={sentinelRef} className="h-1" />
            {loadingMore && (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
