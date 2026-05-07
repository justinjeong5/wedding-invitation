"use client";

import { useActionState, useState, useEffect } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { submitRsvp, updateRsvp } from "@/features/rsvp/actions";
import { useVisitorId } from "@/components/VisitTracker";
import { useCountdown } from "@/hooks/useCountdown";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { SavedRsvp } from "@/features/rsvp/types";

const weddingDate = new Date(
  WEDDING_CONFIG.date.year,
  WEDDING_CONFIG.date.month - 1,
  WEDDING_CONFIG.date.day,
  WEDDING_CONFIG.date.hour,
  WEDDING_CONFIG.date.minute
);

function TimeReminder() {
  const { totalDays, ready, isExpired } = useCountdown(weddingDate);

  if (!ready || isExpired || totalDays > 30) return null;

  const message =
    totalDays > 13
      ? "결혼식이 한 달 앞으로 다가왔습니다"
      : totalDays > 6
        ? "결혼식이 2주도 채 남지 않았습니다"
        : "결혼식이 일주일 앞으로 다가왔습니다";

  return (
    <p className="text-[10px] text-text-muted/60 font-light -mt-6 mb-8">
      {message}
    </p>
  );
}

function FormGroup({
  label,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <label htmlFor={htmlFor} className="text-xs text-text-muted text-left">{label}</label>
        {hint && (
          <p className="text-[10px] text-text-muted/80 text-left">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex-1">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="py-2.5 text-sm border border-border rounded-full cursor-pointer text-text-muted transition-all peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-checked:font-medium text-center">
        {label}
      </div>
    </label>
  );
}

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

export default function RsvpForm({
  initialValues,
  editPassword,
  onSuccess,
  onCancel,
}: {
  initialValues: SavedRsvp | null;
  editPassword: string | null;
  onSuccess: (data: SavedRsvp) => void;
  onCancel?: () => void;
}) {
  const visitorId = useVisitorId();
  const isEditing = !!editPassword;
  const action = isEditing ? updateRsvp : submitRsvp;
  const [state, formAction, isPending] = useActionState(action, {
    success: false,
  });

  const [name, setName] = useState(initialValues?.name ?? "");
  const [side, setSide] = useState<string | null>(
    initialValues?.side ?? null
  );
  const [attendance, setAttendance] = useState<boolean | null>(
    initialValues ? initialValues.attendance : null
  );
  const [guestCount, setGuestCount] = useState(
    initialValues?.guest_count ?? 1
  );
  const [meal, setMeal] = useState<boolean | null>(
    initialValues ? initialValues.meal : null
  );

  const showSide = name.trim().length > 0;
  const showAttendance = showSide && side !== null;
  const showGuestDetails = showAttendance && attendance === true;
  const showSubmit =
    showAttendance &&
    attendance !== null &&
    (attendance === false || meal !== null);

  useEffect(() => {
    if (state.success && state.data) {
      onSuccess({
        ...state.data,
        submitted_at: new Date().toISOString(),
      });
    }
  }, [state.success, state.data, onSuccess]);

  return (
    <SectionWrapper id="rsvp" className="text-center">
      <h2 className="text-lg font-light text-primary mb-2 tracking-wider">
        참석 여부
      </h2>
      <p className="text-xs text-text-muted font-light mb-1">
        참석 여부를 알려주시면 준비에 큰 도움이 됩니다
      </p>
      <p className="text-[10px] text-text-muted/80 font-light mb-8 leading-relaxed">
        대략적인 인원 파악을 위한 것이니 부담 없이 알려주세요
        <br />
        언제든 수정하거나 삭제할 수 있습니다
      </p>
      <TimeReminder />

      <form action={formAction} className="max-w-sm mx-auto" data-1p-ignore>
        <input type="hidden" name="visitor_id" value={visitorId} />
        {isEditing && (
          <>
            <input type="hidden" name="id" value={initialValues!.id} />
            <input type="hidden" name="password" value={editPassword} />
          </>
        )}

        <div className="bg-bg-card border border-border rounded-xl p-5 space-y-5">
          <FormGroup label="이름" htmlFor="rsvp-name">
            <input
              id="rsvp-name"
              name="name"
              type="text"
              placeholder="성함을 입력해주세요"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary transition-colors"
            />
          </FormGroup>

          {showSide && (
            <motion.div {...fadeIn}>
              <FormGroup label="소속">
                <div className="flex gap-2.5">
                  <RadioOption
                    name="side"
                    value="groom"
                    label="신랑측"
                    checked={side === "groom"}
                    onChange={() => {
                      if (side !== "groom") {
                        setSide("groom");
                        setAttendance(null);
                        setGuestCount(1);
                        setMeal(null);
                      }
                    }}
                  />
                  <RadioOption
                    name="side"
                    value="bride"
                    label="신부측"
                    checked={side === "bride"}
                    onChange={() => {
                      if (side !== "bride") {
                        setSide("bride");
                        setAttendance(null);
                        setGuestCount(1);
                        setMeal(null);
                      }
                    }}
                  />
                </div>
              </FormGroup>
            </motion.div>
          )}

          {showAttendance && (
            <motion.div {...fadeIn}>
              <FormGroup label="참석 여부">
                <div className="flex gap-2.5">
                  <RadioOption
                    name="attendance"
                    value="true"
                    label="참석합니다"
                    checked={attendance === true}
                    onChange={() => setAttendance(true)}
                  />
                  <RadioOption
                    name="attendance"
                    value="false"
                    label="불참합니다"
                    checked={attendance === false}
                    onChange={() => {
                      setAttendance(false);
                      setMeal(null);
                    }}
                  />
                </div>
              </FormGroup>
            </motion.div>
          )}

          {showGuestDetails && (
            <motion.div {...fadeIn}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <FormGroup label="참석 인원">
                    <select
                      name="guest_count"
                      value={guestCount}
                      onChange={(e) =>
                        setGuestCount(Number(e.target.value))
                      }
                      className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary transition-colors"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n}명
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>
                <div className="flex-1">
                  <FormGroup label="식사 여부">
                    <div className="flex gap-2">
                      <RadioOption
                        name="meal"
                        value="true"
                        label="함"
                        checked={meal === true}
                        onChange={() => setMeal(true)}
                      />
                      <RadioOption
                        name="meal"
                        value="false"
                        label="안 함"
                        checked={meal === false}
                        onChange={() => setMeal(false)}
                      />
                    </div>
                  </FormGroup>
                </div>
              </div>
            </motion.div>
          )}

          {showSubmit && (
            <motion.div {...fadeIn} className="space-y-5">
              <FormGroup label="축하 메시지" hint="선택" htmlFor="rsvp-message">
                <textarea
                  id="rsvp-message"
                  name="message"
                  placeholder="축하의 말씀을 남겨주세요"
                  rows={2}
                  defaultValue={initialValues?.message ?? ""}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary resize-none transition-colors"
                />
              </FormGroup>

              {!isEditing && (
                <FormGroup label="비밀번호" hint="수정·삭제 시 필요 (4자 이상)" htmlFor="rsvp-password">
                  <input
                    id="rsvp-password"
                    name="password"
                    type="password"
                    autoComplete="off"
                    placeholder="4자 이상의 비밀번호를 설정해주세요"
                    required
                    minLength={4}
                    maxLength={50}
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary transition-colors"
                  />
                </FormGroup>
              )}
            </motion.div>
          )}
        </div>

        {showSubmit && (
          <motion.div {...fadeIn}>
            {state.error && (
              <p className="text-red-500 text-xs mt-3" role="alert">{state.error}</p>
            )}
            <div className={`mt-4 ${isEditing ? "flex gap-3" : ""}`}>
              {isEditing && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 text-sm border border-border text-text-muted rounded-full hover:bg-bg-card transition-colors"
                >
                  취소
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className={`py-3 text-sm bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 ${
                  isEditing ? "flex-1" : "w-full"
                }`}
              >
                {isPending
                  ? "전송 중..."
                  : isEditing
                    ? "수정하기"
                    : "전송하기"}
              </button>
            </div>
          </motion.div>
        )}

        {!isEditing && (
          <p className="text-[10px] text-text-muted/60 text-center mt-4 leading-relaxed">
            남겨주신 정보는 예식 준비에만 활용되며, 예식 후 2주 내에 모두 파기됩니다.
          </p>
        )}
      </form>
    </SectionWrapper>
  );
}
