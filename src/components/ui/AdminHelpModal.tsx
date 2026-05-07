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

function TimelineRow({ date, label, desc }: { date: string; label: string; desc: string }) {
  return (
    <div className="flex gap-2 text-[11px] leading-relaxed mb-2 last:mb-0">
      <span className="text-orange-400/80 font-medium shrink-0 w-12 text-right">{date}</span>
      <span className="text-text font-medium shrink-0 w-12">{label}</span>
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
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[71] max-w-[400px] mx-auto max-h-[80dvh] bg-bg-card rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="관리자 도움말"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-orange-500/20 shrink-0">
          <p className="text-xs font-semibold text-orange-500 tracking-wider">관리자 도움말</p>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            style={{ minHeight: "auto" }}
            className="w-7 h-7 flex items-center justify-center rounded-full text-text-muted active:bg-border/60 transition-colors"
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
          <Section title="시나리오 미리보기">
            <p className="text-[10px] text-orange-400/80 mb-2.5">
              각 시점의 화면을 미리볼 수 있습니다. 본인 화면에서만 적용되며, 다른 방문자에게는 영향을 주지 않습니다. 선택된 버튼을 다시 누르면 실제 날짜 기준으로 복귀합니다.
            </p>
            <Item
              label="예식 전"
              desc="모든 섹션 표시, 하객갤러리 비공개, 방명록·RSVP 등록 가능"
            />
            <Item
              label="당일"
              desc="하객갤러리 오픈, 사진 업로드 가능"
            />
            <Item
              label="예식 후"
              desc="일시·지도·참석여부·갤러리·계좌 숨김, 감사 갤러리 표시"
            />
            <Item
              label="마감"
              desc="방명록 작성·갤러리 업로드 차단 (기존 데이터는 열람 가능)"
            />
            <Item
              label="파기"
              desc="방명록·하객갤러리 데이터 비표시 (개인정보 보호)"
            />
          </Section>

          <div className="w-full h-px bg-border my-4" />

          <Section title="타임라인">
            <p className="text-[10px] text-orange-400/80 mb-2.5">
              아래 시점에 맞춰 자동으로 전환됩니다.
            </p>
            <TimelineRow date="~7/10" label="예식 전" desc="기본 화면" />
            <TimelineRow date="7/11" label="당일" desc="하객갤러리 오픈" />
            <TimelineRow date="7/12~" label="예식 후" desc="실용 섹션 숨김 + 감사 갤러리" />
            <TimelineRow date="7/14~" label="마감" desc="등록 차단 (열람 유지)" />
            <TimelineRow date="7/25~" label="파기" desc="개인정보 데이터 비표시" />
          </Section>

          <div className="w-full h-px bg-border my-4" />

          <Section title="섹션별 변화">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-[9px] leading-relaxed">
                <thead>
                  <tr className="text-text-muted">
                    <th className="text-left font-medium pb-1 pr-1">섹션</th>
                    <th className="font-medium pb-1 px-0.5">전</th>
                    <th className="font-medium pb-1 px-0.5">당일</th>
                    <th className="font-medium pb-1 px-0.5">후</th>
                    <th className="font-medium pb-1 px-0.5">마감</th>
                    <th className="font-medium pb-1 pl-0.5">파기</th>
                  </tr>
                </thead>
                <tbody className="text-text-muted">
                  <tr><td className="pr-1">일시·지도·RSVP</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">-</td><td className="text-center px-0.5">-</td><td className="text-center pl-0.5">-</td></tr>
                  <tr><td className="pr-1">갤러리·계좌</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">-</td><td className="text-center px-0.5">-</td><td className="text-center pl-0.5">-</td></tr>
                  <tr><td className="pr-1">감사 갤러리</td><td className="text-center px-0.5">-</td><td className="text-center px-0.5">-</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center pl-0.5">O</td></tr>
                  <tr><td className="pr-1">하객갤러리</td><td className="text-center px-0.5">-</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center pl-0.5">빈</td></tr>
                  <tr><td className="pr-1">방명록 작성</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">-</td><td className="text-center pl-0.5">-</td></tr>
                  <tr><td className="pr-1">방명록 열람</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center px-0.5">O</td><td className="text-center pl-0.5">빈</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-text-muted/60 mt-1.5">
              O = 표시 &nbsp; - = 숨김 &nbsp; 빈 = 파기 플레이스홀더
            </p>
          </Section>

          <div className="w-full h-px bg-border my-4" />

          <Section title="다크모드">
            <Item
              label="☀/🌙"
              desc="다크/라이트 모드를 전환합니다. 새로고침 시 OS 시스템 설정으로 자동 복귀합니다."
            />
          </Section>

          <div className="w-full h-px bg-border my-4" />

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

          <div className="w-full h-px bg-border my-4" />

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
