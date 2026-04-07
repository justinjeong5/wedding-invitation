"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface AdminHelpModalProps {
  onClose: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-[11px] font-semibold text-orange-500 tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

function Item({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex gap-2 text-[11px] leading-relaxed mb-1.5 last:mb-0">
      <span className="text-text font-medium shrink-0">{label}</span>
      <span className="text-text-muted">{desc}</span>
    </div>
  );
}

export default function AdminHelpModal({ onClose }: AdminHelpModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <>
      <div className="fixed inset-0 z-[70] bg-black/40" onClick={onClose} />
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[71] max-w-[400px] mx-auto max-h-[80dvh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="관리자 도움말"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-orange-100 shrink-0">
          <p className="text-xs font-semibold text-orange-500 tracking-wider">관리자 도움말</p>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            style={{ minHeight: "auto" }}
            className="w-7 h-7 flex items-center justify-center rounded-full text-stone-400 active:bg-stone-100 transition-colors"
            aria-label="닫기"
            type="button"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-4">
          <Section title="상단 토글 버튼">
            <p className="text-[10px] text-orange-400/80 mb-2.5">
              모든 토글은 본인 화면에서만 적용되며, 다른 방문자에게는 영향을 주지 않습니다.
            </p>
            <Item
              label="예식 후"
              desc="예식 후 화면을 미리보기합니다. ON 시 일시·지도·참석여부·계좌 섹션이 숨겨지고, 감사 갤러리가 표시됩니다. 실제로는 예식 당일(7/11) 자정 이후 모든 방문자에게 자동 전환됩니다."
            />
            <Item
              label="하객갤러리"
              desc="하객 사진 갤러리가 오픈된 화면을 미리보기합니다. 실제로는 예식 당일(7/11) 자정부터 모든 방문자에게 자동 오픈됩니다."
            />
          </Section>

          <div className="w-full h-px bg-stone-100 my-4" />

          <Section title="시간별 자동 전환">
            <div className="text-[11px] text-text-muted leading-relaxed space-y-2">
              <div className="flex gap-2">
                <span className="text-text font-medium shrink-0 w-16">예식 전</span>
                <span>모든 섹션 표시, 하객갤러리 비공개</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text font-medium shrink-0 w-16">예식 당일</span>
                <span>하객갤러리 오픈, 사진 업로드 가능</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text font-medium shrink-0 w-16">예식 후</span>
                <span>일시·지도·참석여부·계좌 숨김, 감사 갤러리 표시</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text font-medium shrink-0 w-16">예식 3일 후</span>
                <span>방명록 작성·갤러리 업로드 차단</span>
              </div>
            </div>
          </Section>

          <div className="w-full h-px bg-stone-100 my-4" />

          <Section title="관리자 권한">
            <Item
              label="방명록 삭제"
              desc="비밀번호 없이 모든 방명록 글을 즉시 삭제할 수 있습니다."
            />
            <Item
              label="갤러리 삭제"
              desc="비밀번호 없이 모든 하객 사진을 즉시 삭제할 수 있습니다."
            />
            <Item
              label="RSVP 통계"
              desc="참석/불참, 신랑측/신부측, 예상 인원, 식사 인원 등 참석 현황을 확인할 수 있습니다."
            />
            <Item
              label="방문자 통계"
              desc="총 방문 수, 고유 방문자, 재방문율, 최근 7일 추이를 확인할 수 있습니다."
            />
          </Section>

          <div className="w-full h-px bg-stone-100 my-4" />

          <Section title="관리자 진입 방법">
            <p className="text-[11px] text-text-muted leading-relaxed">
              페이지 하단 Footer를 빠르게 20회 탭한 후 비밀번호를 입력하면 관리자 모드가 활성화됩니다.
              관리자 모드는 현재 세션에서만 유지됩니다.
            </p>
          </Section>
        </div>
      </div>
    </>,
    document.body
  );
}
