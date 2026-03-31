import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatRelativeDate } from "@/lib/format";

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-31T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("30초 전 → '방금 전'", () => {
    expect(formatRelativeDate("2026-03-31T11:59:30Z")).toBe("방금 전");
  });

  it("5분 전 → '5분 전'", () => {
    expect(formatRelativeDate("2026-03-31T11:55:00Z")).toBe("5분 전");
  });

  it("3시간 전 → '3시간 전'", () => {
    expect(formatRelativeDate("2026-03-31T09:00:00Z")).toBe("3시간 전");
  });

  it("2일 전 → '2일 전'", () => {
    expect(formatRelativeDate("2026-03-29T12:00:00Z")).toBe("2일 전");
  });

  it("8일 전 → 날짜 형식", () => {
    expect(formatRelativeDate("2026-03-23T12:00:00Z")).toBe("2026.03.23");
  });
});
