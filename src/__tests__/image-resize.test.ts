import { describe, it, expect } from "vitest";
import { validateImage, validateAspectRatio } from "@/features/guest-gallery/image-resize";

function createMockFile(name: string, size: number, type: string): File {
  const content = new Uint8Array(size).fill(0);
  return new File([content], name, { type });
}

describe("validateImage", () => {
  it("허용된 MIME 타입은 null을 반환한다", () => {
    const types = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    for (const type of types) {
      expect(validateImage(createMockFile("test", 1000, type))).toBeNull();
    }
  });

  it("허용되지 않은 MIME 타입은 에러 메시지를 반환한다", () => {
    expect(validateImage(createMockFile("test.gif", 1000, "image/gif"))).toContain(
      "형식"
    );
    expect(validateImage(createMockFile("test.bmp", 1000, "image/bmp"))).toContain(
      "형식"
    );
  });

  it("30MB 초과 파일은 에러 메시지를 반환한다", () => {
    const bigFile = createMockFile("big.jpg", 31 * 1024 * 1024, "image/jpeg");
    expect(validateImage(bigFile)).toContain("30MB");
  });

  it("30MB 이하 파일은 통과한다", () => {
    const file = createMockFile("ok.jpg", 29 * 1024 * 1024, "image/jpeg");
    expect(validateImage(file)).toBeNull();
  });
});

describe("validateAspectRatio", () => {
  it("일반 비율(4:3, 3:2, 16:9)은 null을 반환한다", () => {
    expect(validateAspectRatio(1920, 1440)).toBeNull(); // 4:3
    expect(validateAspectRatio(1920, 1280)).toBeNull(); // 3:2
    expect(validateAspectRatio(1920, 1080)).toBeNull(); // 16:9
  });

  it("세로 사진도 정상 통과한다", () => {
    expect(validateAspectRatio(1080, 1920)).toBeNull(); // 9:16
    expect(validateAspectRatio(1440, 1920)).toBeNull(); // 3:4
  });

  it("3:1 초과 비율은 에러 메시지를 반환한다", () => {
    expect(validateAspectRatio(4000, 1000)).toContain("비율"); // 4:1
    expect(validateAspectRatio(1000, 300)).toContain("비율"); // ~3.3:1
  });

  it("정확히 3:1 비율은 통과한다", () => {
    expect(validateAspectRatio(3000, 1000)).toBeNull(); // 3:1
  });

  it("정사각형은 통과한다", () => {
    expect(validateAspectRatio(1000, 1000)).toBeNull();
  });
});
