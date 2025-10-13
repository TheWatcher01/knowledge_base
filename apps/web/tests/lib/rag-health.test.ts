import { afterEach, describe, expect, it, vi } from "vitest";

const STATUS_PATH = "../../src/lib/rag-health";
const RAG_MODULE_PATH = "../../src/lib/rag";
const CONFIG_MODULE_PATH = "../../src/lib/config";

function mockRagModule(overrides: Partial<Record<string, unknown>>) {
  vi.doMock(RAG_MODULE_PATH, () => ({
    ragApiJson: vi.fn(),
    RAG_SERVICE_DISABLED_MESSAGE: "disabled",
    isRagMockEnabled: vi.fn().mockReturnValue(false),
    ...overrides,
  }));
}

function mockConfigModule(overrides: Partial<Record<string, unknown>>) {
  vi.doMock(CONFIG_MODULE_PATH, () => ({
    RAG_API_BASE: "",
    ...overrides,
  }));
}

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("getRagStatus", () => {
  it("returns mock status when mock is enabled", async () => {
    mockConfigModule({ RAG_API_BASE: "http://localhost:8000" });
    mockRagModule({
      isRagMockEnabled: vi.fn().mockReturnValue(true),
    });

    const { getRagStatus } = await import(STATUS_PATH);
    const result = await getRagStatus();

    expect(result).toEqual({ ok: true, state: "mock", message: null });
  });

  it("returns disabled status when RAG base is missing", async () => {
    mockConfigModule({ RAG_API_BASE: "" });
    mockRagModule({});

    const { getRagStatus } = await import(STATUS_PATH);
    const result = await getRagStatus();

    expect(result).toEqual({ ok: false, state: "disabled", message: "disabled" });
  });

  it("returns healthy when endpoint responds with ok", async () => {
    mockConfigModule({ RAG_API_BASE: "http://localhost:8000" });
    const ragApiJson = vi.fn().mockResolvedValue({ status: "ok" });
    mockRagModule({
      ragApiJson,
    });

    const { getRagStatus } = await import(STATUS_PATH);
    const result = await getRagStatus();

    expect(ragApiJson).toHaveBeenCalledWith("/health", { method: "GET" });
    expect(result).toEqual({ ok: true, state: "healthy", message: null });
  });

  it("returns error when endpoint throws", async () => {
    mockConfigModule({ RAG_API_BASE: "http://localhost:8000" });
    const ragApiJson = vi.fn().mockRejectedValue(new Error("boom"));
    mockRagModule({
      ragApiJson,
    });

    const { getRagStatus } = await import(STATUS_PATH);
    const result = await getRagStatus();

    expect(result.ok).toBe(false);
    expect(result.state).toBe("error");
    expect(result.message).toBe("boom");
  });
});
