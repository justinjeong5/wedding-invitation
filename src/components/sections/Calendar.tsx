"use client";

import { useState, useRef, useEffect } from "react";
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

  const [isAppleDevice, setIsAppleDevice] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsAppleDevice(/iPhone|iPad|iPod|Macintosh/.test(ua));
  }, []);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

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
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      navigate(diffX > 0 ? 1 : -1);
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

      <p className="text-sm text-text-light font-serif font-light mb-6">
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
              className={`text-xs py-1 ${
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
                className={`text-sm py-1.5 rounded-full transition-colors min-h-0 ${
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

      {/* Add to Calendar */}
      <div className="flex gap-2 justify-center mb-8">
        <button
          onClick={() => {
            const start = `${date.year}${String(date.month).padStart(2, "0")}${String(date.day).padStart(2, "0")}T${String(date.hour).padStart(2, "0")}${String(date.minute).padStart(2, "0")}00`;
            const endDate = new Date(date.year, date.month - 1, date.day, date.hour + 2, date.minute);
            const end = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, "0")}${String(endDate.getDate()).padStart(2, "0")}T${String(endDate.getHours()).padStart(2, "0")}${String(endDate.getMinutes()).padStart(2, "0")}00`;
            const params = new URLSearchParams({
              action: "TEMPLATE",
              text: `${WEDDING_CONFIG.groom.name} ♥ ${WEDDING_CONFIG.bride.name} 결혼식`,
              dates: `${start}/${end}`,
              details: `예식 ${WEDDING_CONFIG.venue.hall}\n연회 ${WEDDING_CONFIG.venue.banquet}`,
              location: `${WEDDING_CONFIG.venue.name}, ${WEDDING_CONFIG.venue.address}`,
              ctz: "Asia/Seoul",
            });
            window.open(`https://calendar.google.com/calendar/render?${params}`, "_blank", "noopener,noreferrer");
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors"
          style={{ minHeight: "auto" }}
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Google
        </button>
        {isAppleDevice && (
          <button
            onClick={() => {
              const pad = (n: number) => String(n).padStart(2, "0");
              const startUTC = new Date(Date.UTC(date.year, date.month - 1, date.day, date.hour - 9, date.minute));
              const endUTC = new Date(startUTC.getTime() + 2 * 60 * 60 * 1000);

              const formatUTC = (d: Date) =>
                `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

              const ics = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Wedding//Invitation//KO",
                "BEGIN:VEVENT",
                `DTSTART:${formatUTC(startUTC)}`,
                `DTEND:${formatUTC(endUTC)}`,
                `SUMMARY:${WEDDING_CONFIG.groom.name} ♥ ${WEDDING_CONFIG.bride.name} 결혼식`,
                `LOCATION:${WEDDING_CONFIG.venue.name}\\, ${WEDDING_CONFIG.venue.address}`,
                `DESCRIPTION:예식 ${WEDDING_CONFIG.venue.hall}\\n연회 ${WEDDING_CONFIG.venue.banquet}`,
                "END:VEVENT",
                "END:VCALENDAR",
              ].join("\r\n");

              const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "wedding.ics";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors"
            style={{ minHeight: "auto" }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            캘린더 저장
          </button>
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
