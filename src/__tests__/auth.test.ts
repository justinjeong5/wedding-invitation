import { describe, it, expect, vi } from "vitest";
import bcrypt from "bcryptjs";

// auth.ts가 supabase를 import하므로 모듈 모킹
vi.mock("@/lib/supabase", () => ({
  getServiceClient: vi.fn(),
}));

import { hashPassword } from "@/lib/auth";

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
