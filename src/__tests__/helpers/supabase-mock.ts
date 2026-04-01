import { vi } from "vitest";

type MockResult = { data?: unknown; error?: { message: string } | null };

function createChain(result: MockResult = { data: null, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const terminal = vi.fn(() => Promise.resolve(result));

  // Each method returns the chain itself, except terminal methods
  chain.select = vi.fn(() => chain);
  chain.insert = vi.fn(() => Promise.resolve(result));
  chain.update = vi.fn(() => chain);
  chain.delete = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.lt = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(() => chain);
  chain.single = terminal;

  // Make the chain itself thenable for insert/update/delete that resolve directly
  chain.then = vi.fn((resolve: (v: MockResult) => void) => resolve(result));

  return chain;
}

function createStorageChain(result: MockResult = { data: null, error: null }) {
  return {
    upload: vi.fn(() => Promise.resolve(result)),
    remove: vi.fn(() => Promise.resolve(result)),
  };
}

export function createSupabaseMock() {
  let dbResult: MockResult = { data: null, error: null };
  let storageResult: MockResult = { data: null, error: null };
  let currentChain = createChain(dbResult);
  let currentStorageChain = createStorageChain(storageResult);

  const mock = {
    from: vi.fn(() => currentChain),
    storage: {
      from: vi.fn(() => currentStorageChain),
    },
    // Configure what the next DB operation returns
    setResult(result: MockResult) {
      dbResult = result;
      currentChain = createChain(dbResult);
    },
    setStorageResult(result: MockResult) {
      storageResult = result;
      currentStorageChain = createStorageChain(storageResult);
    },
    // Access the current chain for assertions
    get chain() {
      return currentChain;
    },
    get storageChain() {
      return currentStorageChain;
    },
  };

  return mock;
}
