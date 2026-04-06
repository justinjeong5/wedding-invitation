/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { copyToClipboard } from "@/lib/clipboard";

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("Clipboard API로 텍스트를 복사한다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const result = await copyToClipboard("hello");
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("복사 후 toastMessage가 있으면 app-toast 이벤트를 발생시킨다", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    const handler = vi.fn();
    window.addEventListener("app-toast", handler);

    await copyToClipboard("text", "복사됨!");

    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toBe("복사됨!");

    window.removeEventListener("app-toast", handler);
  });

  it("toastMessage가 없으면 이벤트를 발생시키지 않는다", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    const handler = vi.fn();
    window.addEventListener("app-toast", handler);

    await copyToClipboard("text");

    expect(handler).not.toHaveBeenCalled();
    window.removeEventListener("app-toast", handler);
  });

  it("Clipboard API 실패 시 false를 반환한다", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("fail")) },
    });

    const result = await copyToClipboard("text");
    expect(result).toBe(false);
  });

  it("Clipboard API 미지원 시 fallback으로 복사한다", async () => {
    Object.assign(navigator, { clipboard: undefined });

    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const result = await copyToClipboard("fallback text");
    expect(result).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });
});
