import { describe, it, expect, vi, afterEach } from "vitest";
import { isAfterWedding } from "@/lib/date";

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
