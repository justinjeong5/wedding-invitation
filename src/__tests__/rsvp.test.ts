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
      storage: { from: fn(() => ({ upload: fn(), remove: fn() })) },
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
    mockHashPassword: fn((pw: string) => Promise.resolve(`hashed_${pw}`)),
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

vi.stubGlobal(
  "crypto",
  Object.assign({}, globalThis.crypto, {
    randomUUID: () => "test-uuid-1234",
  })
);

import { submitRsvp, updateRsvp, deleteRsvp, verifyRsvpPassword } from "@/actions/rsvp";

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

describe("submitRsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.setResult({ data: null, error: null });
  });

  it("필수 필드 누락 시 에러를 반환한다", async () => {
    const result = await submitRsvp({ success: false }, makeFormData({ name: "홍길동" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("비밀번호");
  });

  it("정상 입력 시 insert 호출 후 성공 반환한다", async () => {
    const fd = makeFormData({
      name: "홍길동",
      side: "groom",
      attendance: "true",
      guest_count: "2",
      meal: "true",
      password: "1234",
    });

    const result = await submitRsvp({ success: false }, fd);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      id: "test-uuid-1234",
      name: "홍길동",
      side: "groom",
      attendance: true,
      guest_count: 2,
      meal: true,
    });
    expect(supabaseMock.from).toHaveBeenCalledWith("rsvp");
  });

  it("불참 시 guest_count=0, meal=false로 저장한다", async () => {
    const fd = makeFormData({
      name: "홍길동",
      side: "bride",
      attendance: "false",
      guest_count: "3",
      meal: "true",
      password: "1234",
    });

    const result = await submitRsvp({ success: false }, fd);
    expect(result.success).toBe(true);
    expect(result.data?.guest_count).toBe(0);
    expect(result.data?.meal).toBe(false);
  });

  it("DB 에러 시 실패를 반환한다", async () => {
    supabaseMock.setResult({ data: null, error: { message: "db error" } });

    const fd = makeFormData({
      name: "홍길동",
      side: "groom",
      attendance: "true",
      guest_count: "1",
      meal: "false",
      password: "1234",
    });

    const result = await submitRsvp({ success: false }, fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("실패");
  });
});

describe("updateRsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.setResult({ data: null, error: null });
  });

  it("필수 항목 누락 시 에러를 반환한다", async () => {
    const fd = makeFormData({ id: "id-1", password: "1234" });
    const result = await updateRsvp({ success: false }, fd);
    expect(result.success).toBe(false);
  });

  it("비밀번호 불일치 시 에러를 반환한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({
      success: false,
      error: "비밀번호가 일치하지 않습니다.",
    });

    const fd = makeFormData({
      id: "id-1",
      name: "홍길동",
      side: "groom",
      attendance: "true",
      guest_count: "1",
      meal: "false",
      password: "wrong",
    });

    const result = await updateRsvp({ success: false }, fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("비밀번호");
  });

  it("정상 수정 시 update 호출 후 성공 반환한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({ success: true });

    const fd = makeFormData({
      id: "id-1",
      name: "홍길동",
      side: "bride",
      attendance: "true",
      guest_count: "3",
      meal: "true",
      password: "1234",
      message: "축하합니다",
    });

    const result = await updateRsvp({ success: false }, fd);
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("홍길동");
    expect(serviceMock.from).toHaveBeenCalledWith("rsvp");
  });
});

describe("deleteRsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.setResult({ data: null, error: null });
  });

  it("비밀번호 불일치 시 에러를 반환한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({
      success: false,
      error: "비밀번호가 일치하지 않습니다.",
    });

    const result = await deleteRsvp("id-1", "wrong");
    expect(result.success).toBe(false);
  });

  it("정상 삭제 시 delete 호출 후 성공 반환한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({ success: true });

    const result = await deleteRsvp("id-1", "1234");
    expect(result.success).toBe(true);
    expect(serviceMock.from).toHaveBeenCalledWith("rsvp");
  });
});

describe("verifyRsvpPassword", () => {
  it("verifyPassword에 올바른 인자를 전달한다", async () => {
    mockVerifyPassword.mockResolvedValueOnce({ success: true });

    await verifyRsvpPassword("id-1", "1234");
    expect(mockVerifyPassword).toHaveBeenCalledWith(
      "rsvp",
      "id-1",
      "1234",
      "참석 정보를 찾을 수 없습니다."
    );
  });
});
