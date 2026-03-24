"use client";

import { useState, useEffect } from "react";

interface CountdownResult {
  months: number;
  days: number;
  totalDays: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  ready: boolean;
}

export function useCountdown(targetDate: Date): CountdownResult {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const totalDays = Math.floor(
      (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const interval = totalDays <= 7 ? 1000 : 60000;
    const timer = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!now) {
    return {
      months: 0, days: 0, totalDays: 0,
      hours: 0, minutes: 0, seconds: 0,
      isExpired: false, ready: false,
    };
  }

  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      months: 0, days: 0, totalDays: 0,
      hours: 0, minutes: 0, seconds: 0,
      isExpired: true, ready: true,
    };
  }

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  let months =
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth());
  if (targetDate.getDate() < now.getDate()) {
    months--;
  }
  months = Math.max(0, months);

  const afterMonths = new Date(
    now.getFullYear(),
    now.getMonth() + months,
    now.getDate()
  );
  const remainingDays = Math.floor(
    (targetDate.getTime() - afterMonths.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    months,
    days: Math.max(0, remainingDays),
    totalDays,
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: false,
    ready: true,
  };
}
