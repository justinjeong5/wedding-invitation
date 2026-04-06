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

  return { serviceMock: createMock() };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {},
  getServiceClient: () => serviceMock,
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, hashPassword: vi.fn(), verifyPassword: vi.fn() };
});

import { getVisitStats } from "@/actions/visit";

describe("getVisitStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("잘못된 비밀번호 시 실패를 반환한다", async () => {
    const result = await getVisitStats("wrong");
    expect(result.success).toBe(false);
    expect(result.error).toContain("권한");
  });

  it("정상 인증 시 방문 통계를 반환한다", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mockData = [
      { visitor_id: "a", created_at: today.toISOString() },
      { visitor_id: "a", created_at: today.toISOString() },
      { visitor_id: "b", created_at: today.toISOString() },
      { visitor_id: "c", created_at: yesterday.toISOString() },
    ];

    serviceMock.chain.then = vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: mockData, error: null })
    );

    const result = await getVisitStats("test-admin");
    expect(result.success).toBe(true);
    expect(result.data!.totalVisits).toBe(4);
    expect(result.data!.uniqueVisitors).toBe(3);
    expect(result.data!.todayVisits).toBe(3);
    expect(result.data!.todayUniqueVisitors).toBe(2);
    expect(result.data!.returningVisitors).toBe(1);
    expect(result.data!.avgVisitsPerVisitor).toBe(1.3);
    expect(result.data!.dailyStats).toHaveLength(7);
  });

  it("DB 에러 시 실패를 반환한다", async () => {
    serviceMock.chain.then = vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: null, error: { message: "db error" } })
    );

    const result = await getVisitStats("test-admin");
    expect(result.success).toBe(false);
    expect(result.error).toContain("db error");
  });

  it("방문 데이터가 없으면 모두 0을 반환한다", async () => {
    serviceMock.chain.then = vi.fn((resolve: (v: unknown) => void) =>
      resolve({ data: [], error: null })
    );

    const result = await getVisitStats("test-admin");
    expect(result.success).toBe(true);
    expect(result.data!.totalVisits).toBe(0);
    expect(result.data!.uniqueVisitors).toBe(0);
    expect(result.data!.avgVisitsPerVisitor).toBe(0);
  });
});
