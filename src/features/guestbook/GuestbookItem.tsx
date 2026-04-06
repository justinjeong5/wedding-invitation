"use client";

import { useEffect, useRef, useState } from "react";
import { deleteGuestbookEntry, updateGuestbookEntry } from "@/features/guestbook/actions";
import { formatRelativeDate } from "@/lib/format";
import type { GuestbookEntry } from "@/types";

export default function GuestbookItem({
  entry,
  isAdmin,
  adminPassword,
  onUpdated,
  onDeleted,
}: {
  entry: GuestbookEntry;
  isAdmin: boolean;
  adminPassword?: string;
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
    if (!isAdmin && !password) return;
    setLoading(true);
    setError("");
    const pw = isAdmin ? (adminPassword ?? "") : password;
    const result = await deleteGuestbookEntry(entry.id, pw, isAdmin);
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
    <div className="bg-bg-card px-4 py-3 rounded-lg border border-border">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{entry.name}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-light">
            {formatRelativeDate(entry.created_at)}
          </span>
          {!activeAction && (
            <div className="relative">
              <button
                ref={menuBtnRef}
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-text-muted hover:text-text text-base leading-none"
                style={{ minHeight: "auto", padding: "2px 4px" }}
                aria-label="메시지 메뉴"
                type="button"
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
              autoComplete="off"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              className="flex-1 min-w-0 px-3 py-1.5 text-xs border border-border rounded bg-bg focus:outline-none focus:border-primary"
              data-1p-ignore
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
          {error && <p className="text-red-500 text-xs" role="alert">{error}</p>}
        </div>
      ) : activeAction === "delete" ? (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-text-light whitespace-pre-line">
            {entry.message}
          </p>
          {isAdmin ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
              >
                {loading ? "삭제 중..." : "관리자 삭제"}
              </button>
              <button
                onClick={reset}
                className="px-3 py-1.5 text-xs text-text-muted border border-border rounded hover:bg-bg transition-colors shrink-0"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="password"
                autoComplete="off"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                data-1p-ignore
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
          )}
          {error && <p className="text-red-500 text-xs" role="alert">{error}</p>}
        </div>
      ) : (
        <p className="text-sm text-text-light whitespace-pre-line">
          {entry.message}
          {entry.edited && (
            <span className="text-xs text-text-muted ml-1">(편집됨)</span>
          )}
        </p>
      )}
    </div>
  );
}
