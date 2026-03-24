"use client";

import { useState, useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { WEDDING_CONFIG } from "@/config/wedding";
import { useCountdown } from "@/hooks/useCountdown";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return days;
}

function daysBetween(a: Date, b: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bDay.getTime() - aDay.getTime()) / msPerDay);
}

export default function Calendar() {
  const { date } = WEDDING_CONFIG;
  const weddingDate = new Date(date.year, date.month - 1, date.day, date.hour, date.minute);
  const countdown = useCountdown(weddingDate);

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth() + 1;
  const todayD = today.getDate();

  const [viewYear, setViewYear] = useState<number>(date.year);
  const [viewMonth, setViewMonth] = useState<number>(date.month);
  const [selected, setSelected] = useState<{ y: number; m: number; d: number } | null>(null);

  const touchStartX = useRef(0);

  const calendarDays = generateCalendarDays(viewYear, viewMonth);

  const toKey = (y: number, m: number) => y * 12 + m;
  const minKey = toKey(todayY, todayM);
  const maxKey = toKey(date.year, date.month);
  const curKey = toKey(viewYear, viewMonth);

  const canPrev = curKey > minKey;
  const canNext = curKey < maxKey;

  const navigate = (dir: -1 | 1) => {
    if (dir === -1 && !canPrev) return;
    if (dir === 1 && !canNext) return;
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setViewYear(y);
    setViewMonth(m);
    setSelected(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      navigate(diff > 0 ? 1 : -1);
    }
  };

  const handleDayClick = (day: number) => {
    if (selected?.y === viewYear && selected?.m === viewMonth && selected?.d === day) {
      setSelected(null);
    } else {
      setSelected({ y: viewYear, m: viewMonth, d: day });
    }
  };

  const getSelectedInfo = () => {
    if (!selected) return null;
    const sel = new Date(selected.y, selected.m - 1, selected.d);
    const wedding = new Date(date.year, date.month - 1, date.day);
    const diff = daysBetween(sel, wedding);
    const isToday = selected.y === todayY && selected.m === todayM && selected.d === todayD;
    const prefix = isToday ? "오늘 — " : `${selected.m}월 ${selected.d}일 — `;

    if (diff === 0) return `${prefix}결혼식 당일`;
    if (diff > 0) return `${prefix}결혼식 ${diff}일 전`;
    return `${prefix}결혼식 ${Math.abs(diff)}일 후`;
  };

  return (
    <SectionWrapper id="calendar" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        예식 일시
      </h2>

      <p className="text-sm text-text-light font-light mb-6">
        {date.display}
      </p>

      {/* Calendar */}
      <div
        className="max-w-xs mx-auto mb-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            disabled={!canPrev}
            className="p-1 text-text-muted disabled:opacity-0 transition-opacity min-h-0"
            aria-label="이전 달"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm font-light text-text tracking-wider">
            {viewYear}년 {viewMonth}월
          </span>
          <button
            onClick={() => navigate(1)}
            disabled={!canNext}
            className="p-1 text-text-muted disabled:opacity-0 transition-opacity min-h-0"
            aria-label="다음 달"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`text-xs font-sans py-1 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-text-muted"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={i} />;

            const isWedding = viewYear === date.year && viewMonth === date.month && day === date.day;
            const isTodayCell = viewYear === todayY && viewMonth === todayM && day === todayD;
            const isSel = selected?.y === viewYear && selected?.m === viewMonth && selected?.d === day;
            const dow = i % 7;

            return (
              <button
                key={i}
                onClick={() => handleDayClick(day)}
                className={`text-sm font-sans py-1.5 rounded-full transition-colors min-h-0 ${
                  isWedding
                    ? "bg-primary text-white font-medium"
                    : isSel
                    ? "bg-primary/10 text-primary font-medium"
                    : isTodayCell
                    ? "ring-1 ring-primary/40 text-primary"
                    : dow === 0
                    ? "text-red-400"
                    : dow === 6
                    ? "text-blue-400"
                    : "text-text"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Selected date info */}
        <div className="h-6 mt-3">
          {selected && (
            <p className="text-xs text-primary font-light">
              {getSelectedInfo()}
            </p>
          )}
        </div>

        {/* Month dots */}
        {minKey < maxKey && (
          <div className="flex justify-center gap-1.5 mt-2">
            {Array.from({ length: maxKey - minKey + 1 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full transition-colors ${
                  i === curKey - minKey ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* D-Day Countdown */}
      {!countdown.ready ? (
        <div className="h-10" />
      ) : !countdown.isExpired ? (
        countdown.totalDays > 30 ? (
          <p className="text-sm text-text-light font-light">
            결혼식까지{" "}
            <span className="text-primary font-medium">
              {countdown.months > 0 && `${countdown.months}개월 `}
              {countdown.days}일
            </span>{" "}
            남았습니다
          </p>
        ) : countdown.totalDays > 7 ? (
          <div className="flex justify-center gap-4 font-sans">
            {[
              { value: countdown.totalDays, label: "일" },
              { value: countdown.hours, label: "시간" },
              { value: countdown.minutes, label: "분" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-light text-primary tabular-nums">
                  {String(value).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-text-muted mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center gap-4 font-sans">
            {[
              ...(countdown.totalDays > 0
                ? [{ value: countdown.totalDays, label: "일" }]
                : []),
              { value: countdown.hours, label: "시간" },
              { value: countdown.minutes, label: "분" },
              { value: countdown.seconds, label: "초" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-light text-primary tabular-nums">
                  {String(value).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-text-muted mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}
    </SectionWrapper>
  );
}
