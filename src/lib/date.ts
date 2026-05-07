import { WEDDING_CONFIG } from "@/config/wedding";

const KST = "+09:00";

function kstDate(year: number, month: number, day: number, hour = 0, min = 0, sec = 0): Date {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mi = String(min).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return new Date(`${year}-${mm}-${dd}T${hh}:${mi}:${ss}${KST}`);
}

function nowKST(): Date {
  return new Date();
}

export function isAfterWedding(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  const weddingEnd = kstDate(year, month, day, 23, 59, 59);
  return nowKST() > weddingEnd;
}

export function isGuestGalleryOpen(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  const openDate = kstDate(year, month, day);
  return nowKST() >= openDate;
}

export function isSubmissionClosed(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  const closeDate = kstDate(year, month, day + 3);
  return nowKST() >= closeDate;
}

export function isDataDisposed(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  const disposeDate = kstDate(year, month, day + 14);
  return nowKST() >= disposeDate;
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bDay.getTime() - aDay.getTime()) / msPerDay);
}
