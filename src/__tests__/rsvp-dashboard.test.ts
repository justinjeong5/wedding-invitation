import { describe, it, expect, vi, beforeEach } from "vitest";

const { serviceMock } = vi.hoisted(() => {
  process.env.GUEST_GALLERY_ADMIN_PASSWORD = "test-admin";

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
    serviceMock: createMock(),
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {},
  getServiceClient: () => serviceMock,
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
  };
});

import { getRsvpSummary } from "@/actions/rsvp";

describe("getRsvpSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("잘못된 비밀번호 시 실패를 반환한다", async () => {
    const result = await getRsvpSummary("wrong-password");
    expect(result.success).toBe(false);
    expect(result.error).toContain("권한");
  });

  it("빈 비밀번호 시 실패를 반환한다", async () => {
    const result = await getRsvpSummary("");
    expect(result.success).toBe(false);
    expect(result.error).toContain("권한");
  });

  it("정상 인증 시 집계 데이터를 반환한다", async () => {
    const mockData = [
      { side: "groom", attendance: true, guest_count: 2, meal: true },
      { side: "groom", attendance: true, guest_count: 3, meal: false },
      { side: "bride", attendance: false, guest_count: 0, meal: false },
      { side: "bride", attendance: true, guest_count: 1, meal: true },
    ];

    const chain = serviceMock.chain;
    chain.then = vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: mockData, error: null })
    );

    const result = await getRsvpSummary("test-admin");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      total: 4,
      attending: 3,
      notAttending: 1,
      groomSide: 2,
      brideSide: 2,
      totalGuests: 6,
      mealCount: 3,
    });
    expect(serviceMock.from).toHaveBeenCalledWith("rsvp");
  });

  it("DB 에러 시 실패를 반환한다", async () => {
    const chain = serviceMock.chain;
    chain.then = vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: null, error: { message: "db error" } })
    );

    const result = await getRsvpSummary("test-admin");
    expect(result.success).toBe(false);
    expect(result.error).toContain("실패");
  });
});
