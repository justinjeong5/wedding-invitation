/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThrottledRefresh } from "@/hooks/useThrottledRefresh";

describe("useThrottledRefresh", () => {
  afterEach(() => vi.useRealTimers());

  it("refresh 호출 시 fetchFn을 실행한다", async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useThrottledRefresh(fetchFn));

    await act(async () => {
      const promise = result.current.refresh();
      vi.advanceTimersByTime(300);
      await promise;
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("쿨다운 중 재호출은 무시한다", async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useThrottledRefresh(fetchFn));

    await act(async () => {
      const promise = result.current.refresh();
      vi.advanceTimersByTime(300);
      await promise;
    });

    await act(async () => {
      await result.current.refresh(); // 쿨다운 중이라 무시됨
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("5초 쿨다운 후 재호출이 가능하다", async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useThrottledRefresh(fetchFn));

    await act(async () => {
      const promise = result.current.refresh();
      vi.advanceTimersByTime(300);
      await promise;
    });

    act(() => { vi.advanceTimersByTime(5000); });

    await act(async () => {
      const promise = result.current.refresh();
      vi.advanceTimersByTime(300);
      await promise;
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("refresh 중 refreshing이 true가 된다", async () => {
    vi.useFakeTimers();
    let resolveFetch: () => void;
    const fetchFn = vi.fn(() => new Promise<void>((r) => { resolveFetch = r; }));
    const { result } = renderHook(() => useThrottledRefresh(fetchFn));

    expect(result.current.refreshing).toBe(false);

    let promise: Promise<void>;
    act(() => { promise = result.current.refresh(); });

    expect(result.current.refreshing).toBe(true);

    await act(async () => {
      resolveFetch!();
      vi.advanceTimersByTime(300);
      await promise!;
    });

    expect(result.current.refreshing).toBe(false);
  });

  it("silentRefresh는 쿨다운 없이 실행된다", async () => {
    vi.useFakeTimers();
    const fetchFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useThrottledRefresh(fetchFn));

    await act(async () => { await result.current.silentRefresh(); });
    await act(async () => { await result.current.silentRefresh(); });
    await act(async () => { await result.current.silentRefresh(); });

    expect(fetchFn).toHaveBeenCalledTimes(3);
  });
});
