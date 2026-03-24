"use client";

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

export default function Calendar() {
  const { date } = WEDDING_CONFIG;
  const weddingDate = new Date(date.year, date.month - 1, date.day, date.hour, date.minute);
  const countdown = useCountdown(weddingDate);
  const calendarDays = generateCalendarDays(date.year, date.month);

  return (
    <SectionWrapper id="calendar" className="text-center">
      <h2 className="text-lg font-light text-primary mb-8 tracking-wider">
        예식 일시
      </h2>

      <p className="text-sm text-text-light font-light mb-6">
        {date.display}
      </p>

      {/* Calendar Grid */}
      <div className="max-w-xs mx-auto mb-8">
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
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            const isWeddingDay = day === date.day;
            const dayOfWeek = i % 7;
            return (
              <div
                key={i}
                className={`text-sm font-sans py-1.5 ${
                  day === null
                    ? ""
                    : isWeddingDay
                    ? "bg-primary text-white rounded-full font-medium"
                    : dayOfWeek === 0
                    ? "text-red-400"
                    : dayOfWeek === 6
                    ? "text-blue-400"
                    : "text-text"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* D-Day Countdown */}
      {!countdown.ready ? (
        <div className="flex justify-center gap-4 font-sans">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-12 mx-auto bg-border/50 rounded animate-pulse" />
              <div className="h-3 w-8 mx-auto mt-1 bg-border/30 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : !countdown.isExpired ? (
        <div className="flex justify-center gap-4 font-sans">
          {[
            { value: countdown.days, label: "Days" },
            { value: countdown.hours, label: "Hours" },
            { value: countdown.minutes, label: "Min" },
            { value: countdown.seconds, label: "Sec" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-light text-primary tabular-nums">
                {String(value).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-text-muted mt-1 tracking-wider uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </SectionWrapper>
  );
}
