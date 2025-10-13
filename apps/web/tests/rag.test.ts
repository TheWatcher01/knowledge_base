import { afterEach, describe, expect, test, vi } from "vitest";

const originalEnv = { ...process.env };

function resetEnv() {
    process.env.RAG_API_BASE = originalEnv.RAG_API_BASE;
    process.env.RAG_API_TOKEN = originalEnv.RAG_API_TOKEN;
}

afterEach(() => {
    resetEnv();
    vi.restoreAllMocks();
    vi.resetModules();
});

describe("rag helpers", () => {
    test("triggerWebIngestion retourne une erreur quand le service RAG est désactivé", async () => {
        delete process.env.RAG_API_BASE;
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        const { triggerWebIngestion, RAG_SERVICE_DISABLED_MESSAGE } = await import("@/lib/rag");
        const result = await triggerWebIngestion({ kbId: "kb_42", url: "https://example.com", documentId: "doc_42" });

        expect(result).toEqual({ ok: false, error: RAG_SERVICE_DISABLED_MESSAGE });
        expect(warnSpy).toHaveBeenCalled();
    });

    test("triggerWebIngestion réussit quand le service RAG répond correctement", async () => {
        process.env.RAG_API_BASE = "http://rag.test";
        process.env.RAG_API_TOKEN = "token-test";
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue("{}") });
        vi.stubGlobal("fetch", fetchMock);

        const { triggerWebIngestion } = await import("@/lib/rag");
        const result = await triggerWebIngestion({ kbId: "kb_99", url: "https://example.com", documentId: "doc_99" });

        expect(fetchMock).toHaveBeenCalledWith("http://rag.test/api/v1/retrieval/process/web", expect.objectContaining({
            method: "POST",
        }));
        const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
        expect(body.document_id).toBe("doc_99");
        expect(result).toEqual({ ok: true });
    });

    test("triggerWebIngestion fonctionne sans token quand l'API est configurée", async () => {
        process.env.RAG_API_BASE = "http://rag.test";
        delete process.env.RAG_API_TOKEN;
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue("{}") });
        vi.stubGlobal("fetch", fetchMock);

        const { triggerWebIngestion } = await import("@/lib/rag");
        const result = await triggerWebIngestion({ kbId: "kb_55", url: "https://example.com", documentId: "doc_55" });

        const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
        expect(headers.Authorization).toBeUndefined();
        expect(result).toEqual({ ok: true });
    });

    test("triggerWebIngestion relaie les erreurs de fetch", async () => {
        process.env.RAG_API_BASE = "http://rag.test";
        process.env.RAG_API_TOKEN = "token-test";
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
            text: () => Promise.resolve("KO"),
        }));

        const { triggerWebIngestion } = await import("@/lib/rag");
        await expect(triggerWebIngestion({ kbId: "kb_77", url: "https://example.com", documentId: "doc_77" })).resolves.toEqual({
            ok: false,
            error: "KO",
        });
        expect(warnSpy).toHaveBeenCalledWith("[rag-service] Failed to trigger web ingestion", "KO");
    });

    test("deleteFromCollection appelle le service RAG", async () => {
        process.env.RAG_API_BASE = "http://rag.test";
        process.env.RAG_API_TOKEN = "token-test";
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue("{}") });
        vi.stubGlobal("fetch", fetchMock);

        const { deleteFromCollection } = await import("@/lib/rag");
        const result = await deleteFromCollection({ kbId: "kb_1", documentId: "doc_123" });

        expect(fetchMock).toHaveBeenCalledWith("http://rag.test/api/v1/retrieval/delete", expect.objectContaining({
            method: "POST",
        }));
        expect(result).toEqual({ ok: true });
    });
});
