"use client";

import { useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import PasswordPrompt from "@/features/rsvp/PasswordPrompt";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { SavedRsvp } from "@/features/rsvp/types";

export default function RsvpSummary({
  data,
  justSubmitted,
  onEdit,
  onDelete,
}: {
  data: SavedRsvp;
  justSubmitted: boolean;
  onEdit: (password: string) => void;
  onDelete: () => void;
}) {
  const [activePrompt, setActivePrompt] = useState<
    "edit" | "delete" | null
  >(null);

  return (
    <SectionWrapper id="rsvp" className="text-center">
      <h2 className="text-lg font-light text-primary mb-2 tracking-wider">
        참석 여부
      </h2>

      {justSubmitted ? (
        <div className="pt-3 pb-5">
          <p className="text-primary text-2xl mb-1">&#10003;</p>
          <p className="text-sm text-text-light">
            감사합니다.
            <br />
            <span className="text-primary">{WEDDING_CONFIG.groom.name}</span>
            {" & "}
            <span className="text-primary">{WEDDING_CONFIG.bride.name}</span>
            에게 전달되었습니다.
          </p>
        </div>
      ) : (
        <p className="text-xs text-text-muted font-light mb-6">
          이미 {WEDDING_CONFIG.groom.name} & {WEDDING_CONFIG.bride.name}에게
          마음을 전해주셨습니다
        </p>
      )}

      <div className="max-w-sm mx-auto">
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <p className="text-base font-medium mb-3">{data.name}</p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/15">
              {data.side === "groom" ? "신랑측" : "신부측"}
            </span>
            <span
              className={`px-3 py-1 rounded-full border ${
                data.attendance
                  ? "bg-primary/5 text-primary border-primary/15"
                  : "bg-text-muted/5 text-text-muted border-border"
              }`}
            >
              {data.attendance ? "참석" : "불참"}
            </span>
            {data.attendance && (
              <>
                <span className="px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/15">
                  {data.guest_count}명
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/15">
                  식사 {data.meal ? "함" : "안 함"}
                </span>
              </>
            )}
          </div>

          {data.message && (
            <p className="mt-4 pt-3 border-t border-border text-sm text-text-light leading-relaxed">
              &ldquo;{data.message}&rdquo;
            </p>
          )}
        </div>

        <p className="mt-4 text-[10px] text-text-muted/80 leading-relaxed">
          언제든 수정하거나 삭제할 수 있습니다
        </p>

        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            onClick={() =>
              setActivePrompt(activePrompt === "edit" ? null : "edit")
            }
            className="text-xs text-text-muted underline underline-offset-2 min-h-0"
          >
            수정하기
          </button>
          <span className="text-border">|</span>
          <button
            onClick={() =>
              setActivePrompt(activePrompt === "delete" ? null : "delete")
            }
            className="text-xs text-text-muted underline underline-offset-2 min-h-0"
          >
            삭제하기
          </button>
        </div>

        {activePrompt === "edit" && (
          <PasswordPrompt
            rsvpId={data.id}
            actionLabel="확인"
            onVerified={(password) => onEdit(password)}
            onCancel={() => setActivePrompt(null)}
          />
        )}

        {activePrompt === "delete" && (
          <PasswordPrompt
            rsvpId={data.id}
            actionLabel="삭제"
            isDelete
            onVerified={() => onDelete()}
            onCancel={() => setActivePrompt(null)}
          />
        )}
      </div>
    </SectionWrapper>
  );
}
