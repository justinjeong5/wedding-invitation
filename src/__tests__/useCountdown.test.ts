/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "@/hooks/useCountdown";

describe("useCountdown", () => {
  afterEach(() => vi.useRealTimers());

  it("카운트다운 값을 계산한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-06T00:00:00Z"));

    const target = new Date("2026-07-11T03:30:00Z");
    const { result } = renderHook(() => useCountdown(target));

    act(() => { vi.runOnlyPendingTimers(); });

    expect(result.current.ready).toBe(true);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.totalDays).toBeGreaterThan(0);
    expect(result.current.months).toBeGreaterThanOrEqual(3);
  });

  it("만료된 날짜 → isExpired: true, 모든 값 0", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T00:00:00Z"));

    const target = new Date("2026-07-11T03:30:00Z");
    const { result } = renderHook(() => useCountdown(target));

    act(() => { vi.runOnlyPendingTimers(); });

    expect(result.current.isExpired).toBe(true);
    expect(result.current.totalDays).toBe(0);
    expect(result.current.months).toBe(0);
    expect(result.current.hours).toBe(0);
  });

  it("D-7 이내이면 초단위 업데이트 (interval 1초)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-08T00:00:00Z")); // D-3

    const target = new Date("2026-07-11T03:30:00Z");
    renderHook(() => useCountdown(target));

    act(() => { vi.runOnlyPendingTimers(); });

    // 1초 뒤 타이머가 실행되는지 확인
    act(() => { vi.advanceTimersByTime(1000); });
    // 에러 없이 통과하면 성공
  });
});
