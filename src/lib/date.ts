import { WEDDING_CONFIG } from "@/config/wedding";

export function isAfterWedding(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  const weddingEnd = new Date(year, month - 1, day, 23, 59, 59);
  return new Date() > weddingEnd;
}

export function isGuestGalleryOpen(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  // 예식 전날 낮 12시부터 공개
  const openDate = new Date(year, month - 1, day - 1, 12, 0, 0);
  return new Date() > openDate;
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bDay.getTime() - aDay.getTime()) / msPerDay);
}
