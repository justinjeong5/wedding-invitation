import { describe, it, expect, vi, afterEach } from "vitest";
import { isAfterWedding, isGuestGalleryOpen, daysBetween } from "@/lib/date";

describe("isAfterWedding", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("예식 전 날짜 → false", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10, 12, 0, 0));
    expect(isAfterWedding()).toBe(false);
  });

  it("예식 당일 → false (23:59:59까지)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 11, 23, 59, 58));
    expect(isAfterWedding()).toBe(false);
  });

  it("예식 다음날 → true", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 12, 0, 0, 0));
    expect(isAfterWedding()).toBe(true);
  });
});

describe("isGuestGalleryOpen", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("전날 오전 → false", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10, 11, 59, 59));
    expect(isGuestGalleryOpen()).toBe(false);
  });

  it("전날 낮 12시 이후 → true", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 10, 12, 0, 1));
    expect(isGuestGalleryOpen()).toBe(true);
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
