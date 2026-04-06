import { describe, it, expect, vi, afterEach } from "vitest";
import {
  isAfterWedding,
  isGuestGalleryOpen,
  isSubmissionClosed,
  daysBetween,
} from "@/lib/date";

// KST 기준 시간을 UTC로 변환하여 테스트 (서버 환경 무관하게 동작)
// 예식일: 2026-07-11 12:30 KST

describe("isAfterWedding", () => {
  afterEach(() => vi.useRealTimers());

  it("예식 당일 23:59:58 KST → false", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T14:59:58Z")); // 23:59:58 KST
    expect(isAfterWedding()).toBe(false);
  });

  it("예식 다음날 00:00:00 KST → true", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T15:00:00Z")); // 7/12 00:00 KST
    expect(isAfterWedding()).toBe(true);
  });
});

describe("isGuestGalleryOpen", () => {
  afterEach(() => vi.useRealTimers());

  it("예식 전날 23:59 KST → false", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T14:59:00Z")); // 7/10 23:59 KST
    expect(isGuestGalleryOpen()).toBe(false);
  });

  it("예식 당일 00:00 KST → true", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-10T15:00:00Z")); // 7/11 00:00 KST
    expect(isGuestGalleryOpen()).toBe(true);
  });
});

describe("isSubmissionClosed", () => {
  afterEach(() => vi.useRealTimers());

  it("예식 당일 → false", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-11T03:00:00Z")); // 7/11 12:00 KST
    expect(isSubmissionClosed()).toBe(false);
  });

  it("예식 2일 후 23:59 KST → false", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T14:59:00Z")); // 7/13 23:59 KST
    expect(isSubmissionClosed()).toBe(false);
  });

  it("예식 3일 후 00:00 KST → true", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T15:00:00Z")); // 7/14 00:00 KST
    expect(isSubmissionClosed()).toBe(true);
  });
});

describe("daysBetween", () => {
  it("같은 날 → 0", () => {
    const a = new Date(2026, 6, 11);
    expect(daysBetween(a, a)).toBe(0);
  });

  it("a에서 b까지 양수 일수", () => {
    const a = new Date(2026, 3, 6);
    const b = new Date(2026, 6, 11);
    expect(daysBetween(a, b)).toBe(96);
  });

  it("b가 a보다 이전이면 음수", () => {
    const a = new Date(2026, 6, 11);
    const b = new Date(2026, 6, 1);
    expect(daysBetween(a, b)).toBe(-10);
  });
});
