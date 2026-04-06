import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

const { serviceMock } = vi.hoisted(() => {
  process.env.GUEST_GALLERY_ADMIN_PASSWORD = "test-admin-pw";

  const fn = vi.fn;

  function createMock() {
    let chain: Record<string, unknown> = {};
    let result = { data: null as unknown, error: null as unknown };

    const rebuild = () => {
      chain = {};
      chain.select = fn(() => chain);
      chain.eq = fn(() => chain);
      chain.single = fn(() => Promise.resolve(result));
    };
    rebuild();

    return {
      from: fn(() => chain),
      setResult(r: { data?: unknown; error?: unknown }) {
        result = { data: r.data ?? null, error: r.error ?? null };
        rebuild();
      },
      get chain() { return chain; },
    };
  }

  return { serviceMock: createMock() };
});

vi.mock("@/lib/supabase", () => ({
  getServiceClient: () => serviceMock,
}));

import { hashPassword, isAdminPassword, verifyPassword } from "@/lib/auth";

describe("hashPassword", () => {
  it("평문을 bcrypt 해시로 변환한다", async () => {
    const hash = await hashPassword("test1234");
    expect(hash).not.toBe("test1234");
    expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);
  });

  it("해시된 값은 원본 비밀번호로 검증 가능하다", async () => {
    const hash = await hashPassword("mypassword");
    expect(await bcrypt.compare("mypassword", hash)).toBe(true);
  });

  it("잘못된 비밀번호는 검증 실패한다", async () => {
    const hash = await hashPassword("correct");
    expect(await bcrypt.compare("wrong", hash)).toBe(false);
  });
});

describe("isAdminPassword", () => {
  it("올바른 관리자 비밀번호 → true", () => {
    expect(isAdminPassword("test-admin-pw")).toBe(true);
  });

  it("잘못된 비밀번호 → false", () => {
    expect(isAdminPassword("wrong")).toBe(false);
  });

  it("빈 문자열 → false", () => {
    expect(isAdminPassword("")).toBe(false);
  });
});

describe("verifyPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("비밀번호 일치 시 success 반환한다", async () => {
    const hashed = await bcrypt.hash("1234", 10);
    serviceMock.setResult({ data: { password: hashed } });

    const result = await verifyPassword("guestbook", "id-1", "1234", "찾을 수 없습니다.");
    expect(result.success).toBe(true);
  });

  it("비밀번호 불일치 시 에러 반환한다", async () => {
    const hashed = await bcrypt.hash("1234", 10);
    serviceMock.setResult({ data: { password: hashed } });

    const result = await verifyPassword("guestbook", "id-1", "wrong", "찾을 수 없습니다.");
    expect(result.success).toBe(false);
    expect(result.error).toContain("비밀번호");
  });

  it("레코드 미존재 시 notFoundMessage 반환한다", async () => {
    serviceMock.setResult({ data: null });

    const result = await verifyPassword("guestbook", "id-1", "1234", "찾을 수 없습니다.");
    expect(result.success).toBe(false);
    expect(result.error).toBe("찾을 수 없습니다.");
  });
});
