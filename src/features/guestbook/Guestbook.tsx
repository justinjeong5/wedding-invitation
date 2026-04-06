"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { useAdminMode } from "@/hooks/useAdminMode";
import { useSubmissionOpen } from "@/hooks/useSubmissionOpen";
import SectionWrapper from "@/components/ui/SectionWrapper";
import RefreshButton from "@/components/ui/RefreshButton";
import { submitGuestbook, getGuestbookEntries } from "@/features/guestbook/actions";
import { usePaginatedData } from "@/hooks/usePaginatedData";
import { useVisitorId } from "@/components/VisitTracker";
import GuestbookItem from "@/features/guestbook/GuestbookItem";
import GuestbookSkeleton from "@/features/guestbook/GuestbookSkeleton";
import type { GuestbookEntry } from "@/types";

export default function Guestbook() {
  // TODO: 테스트 후 삭제 — 50% 확률 런타임 에러
  const [testThrow, setTestThrow] = useState(false);
  useEffect(() => { if (Math.random() > 0.5) setTestThrow(true); }, []);

  const visitorId = useVisitorId();
  const [state, formAction, isPending] = useActionState(submitGuestbook, {
    success: false,
  });

  const { isAdmin, adminPasswordRef } = useAdminMode();
  const submissionOpen = useSubmissionOpen();

  const fetchEntries = useCallback(
    async (cursor?: string) => {
      const result = await getGuestbookEntries(cursor);
      return { items: result.entries, hasMore: result.hasMore };
    },
    []
  );

  const {
    items: entries,
    setItems: setEntries,
    loading,
    loadingMore,
    refreshing,
    cooldown,
    refresh,
    reload,
    sentinelRef,
  } = usePaginatedData<GuestbookEntry>({
    fetchFn: fetchEntries,
    getCursor: (entry) => entry.created_at,
  });

  useEffect(() => {
    if (state.success) reload();
  }, [state, reload]);

  // TODO: 테스트 후 삭제
  if (testThrow) throw new Error("[TEST] Guestbook 섹션 런타임 에러 테스트");

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

      {submissionOpen ? (
        <form action={formAction} className="space-y-3 mb-6" data-1p-ignore>
          <input type="hidden" name="visitor_id" value={visitorId} />
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
              autoComplete="off"
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
            <p className="text-red-500 text-xs" role="alert">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isPending ? "작성 중..." : "남기기"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-text-muted/70 text-center mb-6">
          방명록 작성 기간이 종료되었습니다
        </p>
      )}

      {!loading && entries.length > 0 && (
        <div className="flex justify-end mb-2">
          <RefreshButton refreshing={refreshing} cooldown={cooldown} onRefresh={refresh} />
        </div>
      )}

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
                isAdmin={isAdmin}
                adminPassword={adminPasswordRef.current}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
            <div ref={sentinelRef} className="h-1" />
            {loadingMore && <GuestbookSkeleton count={2} />}
          </>
        )}
      </div>

      <p className="text-[10px] text-text-muted/60 text-center mt-6 leading-relaxed">
        모두가 함께 보는 공간이며, 부적절한 내용은 별도의 고지 없이 삭제될 수 있습니다.
      </p>
    </SectionWrapper>
  );
}
