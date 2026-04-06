import { WEDDING_CONFIG } from "@/config/wedding";

export function isAfterWedding(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  const weddingEnd = new Date(year, month - 1, day, 23, 59, 59);
  return new Date() > weddingEnd;
}

export function isGuestGalleryOpen(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  const openDate = new Date(year, month - 1, day, 0, 0, 0);
  return new Date() >= openDate;
}

export function isSubmissionClosed(): boolean {
  const { year, month, day } = WEDDING_CONFIG.date;
  const closeDate = new Date(year, month - 1, day + 3, 0, 0, 0);
  return new Date() >= closeDate;
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bDay.getTime() - aDay.getTime()) / msPerDay);
}
