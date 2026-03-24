"use client";

import { useActionState, useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { submitRsvp } from "@/actions/rsvp";

export default function Rsvp() {
  const [state, formAction, isPending] = useActionState(submitRsvp, {
    success: false,
  });
  const [attendance, setAttendance] = useState(true);

  if (state.success) {
    return (
      <SectionWrapper id="rsvp" className="text-center">
        <h2 className="text-lg font-light text-primary mb-4 tracking-wider">
          참석 여부
        </h2>
        <div className="py-8">
          <p className="text-primary text-2xl mb-2">&#10003;</p>
          <p className="text-sm text-text-light">감사합니다. 전달되었습니다.</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id="rsvp" className="text-center">
      <h2 className="text-lg font-light text-primary mb-2 tracking-wider">
        참석 여부
      </h2>
      <p className="text-xs text-text-muted font-light mb-8">
        참석 여부를 알려주시면 준비에 큰 도움이 됩니다
      </p>

      <form action={formAction} className="space-y-4 font-sans max-w-sm mx-auto">
        <input
          name="name"
          type="text"
          placeholder="이름"
          required
          className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary"
        />

        <div className="flex gap-3">
          <label className="flex-1">
            <input type="radio" name="side" value="groom" required className="sr-only peer" />
            <div className="py-3 text-sm border border-border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary text-center">
              신랑측
            </div>
          </label>
          <label className="flex-1">
            <input type="radio" name="side" value="bride" className="sr-only peer" />
            <div className="py-3 text-sm border border-border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary text-center">
              신부측
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <label className="flex-1">
            <input
              type="radio"
              name="attendance"
              value="true"
              defaultChecked
              onChange={() => setAttendance(true)}
              className="sr-only peer"
            />
            <div className="py-3 text-sm border border-border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary text-center">
              참석
            </div>
          </label>
          <label className="flex-1">
            <input
              type="radio"
              name="attendance"
              value="false"
              onChange={() => setAttendance(false)}
              className="sr-only peer"
            />
            <div className="py-3 text-sm border border-border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary text-center">
              불참
            </div>
          </label>
        </div>

        {attendance && (
          <>
            <select
              name="guest_count"
              className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  총 {n}명
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <label className="flex-1">
                <input type="radio" name="meal" value="true" defaultChecked className="sr-only peer" />
                <div className="py-3 text-sm border border-border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary text-center">
                  식사 함
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="meal" value="false" className="sr-only peer" />
                <div className="py-3 text-sm border border-border rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary text-center">
                  식사 안 함
                </div>
              </label>
            </div>
          </>
        )}

        <textarea
          name="message"
          placeholder="축하 메시지 (선택)"
          rows={2}
          className="w-full px-4 py-3 text-sm border border-border rounded-lg bg-bg-card focus:outline-none focus:border-primary resize-none"
        />

        {state.error && (
          <p className="text-red-500 text-xs">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isPending ? "전송 중..." : "전송하기"}
        </button>
      </form>
    </SectionWrapper>
  );
}
