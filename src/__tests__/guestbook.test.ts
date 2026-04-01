import { describe, it, expect, vi, beforeEach } from "vitest";

const { supabaseMock, serviceMock, mockVerifyPassword } = vi.hoisted(() => {
  const fn = vi.fn;

  function createMock() {
    let chain: Record<string, unknown> = {};
    let result = { data: null as unknown, error: null as unknown };

    const rebuild = () => {
      chain = {};
      chain.select = fn(() => chain);
      chain.insert = fn(() => Promise.resolve(result));
      chain.update = fn(() => chain);
      chain.delete = fn(() => chain);
      chain.eq = fn(() => chain);
      chain.lt = fn(() => chain);
      chain.order = fn(() => chain);
      chain.limit = fn(() => chain);
      chain.single = fn(() => Promise.resolve(result));
      chain.then = fn((resolve: (v: unknown) => void) => resolve(result));
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

  return {
    supabaseMock: createMock(),
    serviceMock: createMock(),
    mockVerifyPassword: fn(),
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: supabaseMock,
  getServiceClient: () => serviceMock,
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: vi.fn((pw: string) => Promise.resolve(`hashed_${pw}`)),
  verifyPassword: mockVerifyPassword,
}));

import {
  submitGuestbook,
  getGuestbookEntries,
  updateGuestbookEntry,
  deleteGuestbookEntry,
} from "@/actions/guestbook";

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

describe("submitGuestbook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setResult({ data: null, error: null });
  });

  it("필수 필드 누락 시 에러를 반환한다", async () => {
    const result = await submitGuestbook(
      { success: false },
      makeFormData({ name: "홍길동" })
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("모든 항목");
  });

  it("정상 입력 시 insert 호출 후 성공 반환한다", async () => {
    const fd = makeFormData({
      name: "홍길동",
      message: "결혼 축하합니다!",
      password: "1234",
    });

    const result = await submitGuestbook({ success: false }, fd);
    expect(result.success).toBe(true);
    expect(supabaseMock.from).toHaveBeenCalledWith("guestbook");
  });

  it("DB 에러 시 실패를 반환한다", async () => {
    supabaseMock.setResult({ data: null, error: { message: "db error" } });

    const fd = makeFormData({
      name: "홍길동",
      message: "축하해요",
      password: "1234",
    });

    const result = await submitGuestbook({ success: false }, fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("실패");
  });
});

describe("getGuestbookEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("정상 조회 시 entries와 hasMore를 반환한다", async () => {
    const rows = Array.from({ length: 11 }, (_, i) => ({
      id: `id-${i}`,
      name: `user-${i}`,
      message: `msg-${i}`,
      edited: false,
      created_at: new Date(2026, 0, i + 1).toISOString(),
    }));

    const chain = supabaseMock.chain;
    chain.then = vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: rows, error: null })
    );

    const result = await getGuestbookEntries();
    expect(result.entries).toHaveLength(10);
    expect(result.hasMore).toBe(true);
    expect(supabaseMock.from).toHaveBeenCalledWith("guestbook");
  });

  it("에러 시 빈 배열을 반환한다", async () => {
    const chain = supabaseMock.chain;
    chain.then = vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: null, error: { message: "error" } })
    );

    const result = await getGuestbookEntries();
    expect(result.entries).toEqual([]);
    expect(result.hasMore).toBe(false);
  });
});

describe("updateGuestbookEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.setResult({ data: null, error: null });
  });

  it("빈 메시지 시 에러를 반환한다", async () => {
    const result = await updateGuestbookEntry("id-1", "1234", "   ");
    expect(result.success).toBe(false);
    expect(result.error).toContain("메시지");
  });

  it("비밀번호 검증 후 정상 수정한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({ success: true });

    const result = await updateGuestbookEntry("id-1", "1234", "수정된 메시지");
    expect(result.success).toBe(true);
    expect(serviceMock.from).toHaveBeenCalledWith("guestbook");
  });

  it("비밀번호 불일치 시 에러를 반환한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({
      success: false,
      error: "비밀번호가 일치하지 않습니다.",
    });

    const result = await updateGuestbookEntry("id-1", "wrong", "수정");
    expect(result.success).toBe(false);
    expect(result.error).toContain("비밀번호");
  });
});

describe("deleteGuestbookEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.setResult({ data: null, error: null });
  });

  it("비밀번호 검증 후 정상 삭제한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({ success: true });

    const result = await deleteGuestbookEntry("id-1", "1234");
    expect(result.success).toBe(true);
    expect(serviceMock.from).toHaveBeenCalledWith("guestbook");
  });

  it("비밀번호 불일치 시 에러를 반환한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({
      success: false,
      error: "비밀번호가 일치하지 않습니다.",
    });

    const result = await deleteGuestbookEntry("id-1", "wrong");
    expect(result.success).toBe(false);
  });
});
