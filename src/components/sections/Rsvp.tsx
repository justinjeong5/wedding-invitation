"use client";

import { useActionState, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import {
  submitRsvp,
  updateRsvp,
  verifyRsvpPassword,
  deleteRsvp,
} from "@/actions/rsvp";
import { useCountdown } from "@/hooks/useCountdown";
import { WEDDING_CONFIG } from "@/config/wedding";
import { useVisitorId } from "@/components/VisitTracker";

const STORAGE_KEY = "wedding_rsvp";

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

interface SavedRsvp {
  id: string;
  name: string;
  side: string;
  attendance: boolean;
  guest_count: number;
  meal: boolean;
  message: string | null;
  submitted_at: string;
}

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

function FormGroup({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <p className="text-xs text-text-muted text-left">{label}</p>
        {hint && (
          <p className="text-[10px] text-text-muted/80 text-left">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function PasswordPrompt({
  onVerified,
  onCancel,
  actionLabel,
  rsvpId,
  isDelete,
}: {
  onVerified: (password: string) => void;
  onCancel: () => void;
  actionLabel: string;
  rsvpId: string;
  isDelete?: boolean;
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    setError(null);

    if (isDelete) {
      const result = await deleteRsvp(rsvpId, password);
      if (result.success) {
        onVerified(password);
      } else {
        setError(result.error ?? "실패했습니다.");
      }
    } else {
      const result = await verifyRsvpPassword(rsvpId, password);
      if (result.success) {
        onVerified(password);
      } else {
        setError(result.error ?? "비밀번호가 일치하지 않습니다.");
      }
    }
    setLoading(false);
  };

  return (
    <motion.div {...fadeIn} className="mt-4">
      <div className="flex gap-2 max-w-xs mx-auto">
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="flex-1 min-w-0 px-3 py-2 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary"
          data-1p-ignore
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !password}
          className={`px-4 py-2 text-sm border rounded-lg transition-colors disabled:opacity-50 shrink-0 ${
            isDelete
              ? "text-red-500 border-red-200 hover:bg-red-50"
              : "text-primary border-primary/30 hover:bg-primary/5"
          }`}
        >
          {loading ? "확인 중..." : actionLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm text-text-muted border border-border rounded-lg hover:bg-bg transition-colors shrink-0"
        >
          취소
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </motion.div>
  );
}

function RsvpSummary({
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

function RsvpForm({
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

  // Progressive disclosure
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
          {/* Step 1: Name */}
          <FormGroup label="이름">
            <input
              name="name"
              type="text"
              placeholder="성함을 입력해주세요"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary transition-colors"
            />
          </FormGroup>

          {/* Step 2: Side */}
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

          {/* Step 3: Attendance */}
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

          {/* Step 4: Guest details */}
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

          {/* Step 5: Message + Password (password only for new) */}
          {showSubmit && (
            <motion.div {...fadeIn} className="space-y-5">
              <FormGroup label="축하 메시지" hint="선택">
                <textarea
                  name="message"
                  placeholder="축하의 말씀을 남겨주세요"
                  rows={2}
                  defaultValue={initialValues?.message ?? ""}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary resize-none transition-colors"
                />
              </FormGroup>

              {!isEditing && (
                <FormGroup label="비밀번호" hint="수정·삭제 시 필요">
                  <input
                    name="password"
                    type="password"
                    placeholder="비밀번호를 설정해주세요"
                    required
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-bg focus:outline-none focus:border-primary transition-colors"
                  />
                </FormGroup>
              )}
            </motion.div>
          )}
        </div>

        {/* Submit / Cancel */}
        {showSubmit && (
          <motion.div {...fadeIn}>
            {state.error && (
              <p className="text-red-500 text-xs mt-3">{state.error}</p>
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
      </form>
    </SectionWrapper>
  );
}

export default function Rsvp() {
  const [savedRsvp, setSavedRsvp] = useState<SavedRsvp | null>(null);
  const [editing, setEditing] = useState(false);
  const [editPassword, setEditPassword] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSavedRsvp(JSON.parse(saved));
    } catch {}
    setMounted(true);
  }, []);

  const handleSuccess = useCallback((data: SavedRsvp) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    setSavedRsvp(data);
    setEditing(false);
    setEditPassword(null);
    setJustSubmitted(true);
  }, []);

  const handleDelete = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSavedRsvp(null);
    setEditing(false);
    setEditPassword(null);
    setJustSubmitted(false);
  }, []);

  if (!mounted) {
    return (
      <SectionWrapper id="rsvp" className="text-center">
        <h2 className="text-lg font-light text-primary mb-2 tracking-wider">
          참석 여부
        </h2>
        <div className="h-64" />
      </SectionWrapper>
    );
  }

  if (savedRsvp && !editing) {
    return (
      <RsvpSummary
        data={savedRsvp}
        justSubmitted={justSubmitted}
        onEdit={(password) => {
          setEditPassword(password);
          setEditing(true);
          setJustSubmitted(false);
        }}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <RsvpForm
      initialValues={savedRsvp}
      editPassword={editPassword}
      onSuccess={handleSuccess}
      onCancel={() => {
        setEditing(false);
        setEditPassword(null);
      }}
    />
  );
}
