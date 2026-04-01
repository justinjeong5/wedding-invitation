import { describe, it, expect, vi, beforeEach } from "vitest";

const { supabaseMock, serviceMock, mockBcryptCompare } = vi.hoisted(() => {
  const fn = vi.fn;

  function createMock() {
    let chain: Record<string, unknown> = {};
    let result = { data: null as unknown, error: null as unknown };
    let storageChain = { upload: fn(() => Promise.resolve({ error: null })), remove: fn(() => Promise.resolve({ error: null })) };

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
      storage: { from: fn(() => storageChain) },
      setResult(r: { data?: unknown; error?: unknown }) {
        result = { data: r.data ?? null, error: r.error ?? null };
        rebuild();
      },
      setStorageResult(r: { error?: unknown }) {
        storageChain = {
          upload: fn(() => Promise.resolve({ error: r.error ?? null })),
          remove: fn(() => Promise.resolve({ error: null })),
        };
      },
      get chain() { return chain; },
      get storageChain() { return storageChain; },
    };
  }

  // Must set env before module load (vi.stubEnv runs too late)
  process.env.GUEST_GALLERY_ADMIN_PASSWORD = "admin-secret";

  return {
    supabaseMock: createMock(),
    serviceMock: createMock(),
    mockBcryptCompare: fn(),
  };
});

vi.mock("@/lib/supabase", () => ({
  supabase: supabaseMock,
  getServiceClient: () => serviceMock,
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: vi.fn((pw: string) => Promise.resolve(`hashed_${pw}`)),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: mockBcryptCompare,
    hash: vi.fn((pw: string) => Promise.resolve(`hashed_${pw}`)),
  },
}));

import { uploadGuestPhoto, deleteGuestPhoto } from "@/actions/guest-gallery";

function createMockFile(
  name: string,
  size: number,
  type: string,
  bytes?: number[]
): File {
  const content = bytes
    ? new Uint8Array(bytes)
    : new Uint8Array(size).fill(0xff);
  return new File([content], name, { type });
}

function makeFormData(entries: Record<string, string | File>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

describe("uploadGuestPhoto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.setResult({ data: null, error: null });
    serviceMock.setStorageResult({ error: null });
  });

  it("필수 항목 누락 시 에러를 반환한다", async () => {
    const fd = makeFormData({ name: "홍길동" });
    const result = await uploadGuestPhoto({ success: false }, fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("필수");
  });

  it("허용되지 않은 MIME 타입 시 에러를 반환한다", async () => {
    const file = createMockFile("test.gif", 1000, "image/gif");
    const fd = makeFormData({ name: "홍길동", password: "1234", image: file });
    const result = await uploadGuestPhoto({ success: false }, fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("형식");
  });

  it("5MB 초과 시 에러를 반환한다", async () => {
    const file = createMockFile("big.jpg", 6 * 1024 * 1024, "image/jpeg");
    const fd = makeFormData({ name: "홍길동", password: "1234", image: file });
    const result = await uploadGuestPhoto({ success: false }, fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("5MB");
  });

  it("캡션 50자 초과 시 에러를 반환한다", async () => {
    const file = createMockFile("test.jpg", 100, "image/jpeg", [0xff, 0xd8, 0xff]);
    const fd = makeFormData({ name: "홍길동", password: "1234", caption: "가".repeat(51), image: file });
    const result = await uploadGuestPhoto({ success: false }, fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("50자");
  });

  it("magic bytes 불일치 시 에러를 반환한다", async () => {
    const file = createMockFile("fake.jpg", 100, "image/jpeg", [0x89, 0x50, 0x4e, 0x47]);
    const fd = makeFormData({ name: "홍길동", password: "1234", image: file });
    const result = await uploadGuestPhoto({ success: false }, fd);
    expect(result.success).toBe(false);
    expect(result.error).toContain("올바른 이미지");
  });

  it("정상 업로드 시 스토리지 + DB insert 후 성공 반환한다", async () => {
    const file = createMockFile("photo.jpg", 100, "image/jpeg", [0xff, 0xd8, 0xff, 0xe0]);
    const fd = makeFormData({ name: "홍길동", password: "1234", image: file });
    const result = await uploadGuestPhoto({ success: false }, fd);
    expect(result.success).toBe(true);
    expect(serviceMock.storage.from).toHaveBeenCalledWith("guest-photos");
    expect(serviceMock.from).toHaveBeenCalledWith("guest_photos");
  });
});

describe("deleteGuestPhoto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceMock.setResult({ data: null, error: null });
    serviceMock.setStorageResult({ error: null });
  });

  it("사진을 찾을 수 없으면 에러를 반환한다", async () => {
    serviceMock.chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
    const result = await deleteGuestPhoto("id-1", "1234");
    expect(result.success).toBe(false);
    expect(result.error).toContain("찾을 수 없습니다");
  });

  it("일반 삭제 시 비밀번호 검증 후 삭제한다", async () => {
    serviceMock.chain.single = vi.fn(() =>
      Promise.resolve({ data: { password: "hashed_1234", storage_path: "photo.jpg" }, error: null })
    );
    mockBcryptCompare.mockResolvedValueOnce(true);
    const result = await deleteGuestPhoto("id-1", "1234");
    expect(result.success).toBe(true);
    expect(mockBcryptCompare).toHaveBeenCalledWith("1234", "hashed_1234");
  });

  it("일반 삭제 시 비밀번호 불일치면 에러를 반환한다", async () => {
    serviceMock.chain.single = vi.fn(() =>
      Promise.resolve({ data: { password: "hashed_1234", storage_path: "photo.jpg" }, error: null })
    );
    mockBcryptCompare.mockResolvedValueOnce(false);
    const result = await deleteGuestPhoto("id-1", "wrong");
    expect(result.success).toBe(false);
    expect(result.error).toContain("비밀번호");
  });

  it("관리자 삭제 시 admin 비밀번호로 삭제한다", async () => {
    serviceMock.chain.single = vi.fn(() =>
      Promise.resolve({ data: { password: "hashed_1234", storage_path: "photo.jpg" }, error: null })
    );
    const result = await deleteGuestPhoto("id-1", "admin-secret", true);
    expect(result.success).toBe(true);
  });

  it("관리자 삭제 시 잘못된 admin 비밀번호면 에러를 반환한다", async () => {
    serviceMock.chain.single = vi.fn(() =>
      Promise.resolve({ data: { password: "hashed_1234", storage_path: "photo.jpg" }, error: null })
    );
    const result = await deleteGuestPhoto("id-1", "wrong-admin", true);
    expect(result.success).toBe(false);
    expect(result.error).toContain("권한");
  });
});
