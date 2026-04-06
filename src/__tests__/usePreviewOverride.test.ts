/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePreviewOverride } from "@/hooks/usePreviewOverride";

describe("usePreviewOverride", () => {
  afterEach(() => vi.useRealTimers());

  it("defaultFn 결과를 초기값으로 사용한다", () => {
    const { result } = renderHook(() =>
      usePreviewOverride("test-event", () => true)
    );
    expect(result.current).toBe(true);
  });

  it("defaultFn이 false면 false를 반환한다", () => {
    const { result } = renderHook(() =>
      usePreviewOverride("test-event", () => false)
    );
    expect(result.current).toBe(false);
  });

  it("enabled: true 이벤트 발생 시 true로 오버라이드한다", () => {
    const { result } = renderHook(() =>
      usePreviewOverride("test-override", () => false)
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("test-override", { detail: { enabled: true } })
      );
    });

    expect(result.current).toBe(true);
  });

  it("enabled: false 이벤트 발생 시 defaultFn 결과로 복원한다", () => {
    const { result } = renderHook(() =>
      usePreviewOverride("test-restore", () => false)
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("test-restore", { detail: { enabled: true } })
      );
    });
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("test-restore", { detail: { enabled: false } })
      );
    });
    expect(result.current).toBe(false);
  });

  it("언마운트 시 이벤트 리스너를 정리한다", () => {
    const spy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      usePreviewOverride("cleanup-test", () => true)
    );

    unmount();

    expect(spy).toHaveBeenCalledWith("cleanup-test", expect.any(Function));
    spy.mockRestore();
  });
});
