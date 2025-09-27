import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const originalEnv = { ...process.env };

function resetEnv() {
    process.env.OWUI_BASE = originalEnv.OWUI_BASE;
    process.env.OWUI_TOKEN = originalEnv.OWUI_TOKEN;
}

afterEach(() => {
    resetEnv();
    vi.restoreAllMocks();
    vi.resetModules();
});

describe("owui helpers", () => {
    test("triggerWebIngestion retourne une erreur quand OWUI est désactivé", async () => {
        delete process.env.OWUI_BASE;
        delete process.env.OWUI_TOKEN;
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

        const { triggerWebIngestion, OWUI_DISABLED_MESSAGE } = await import("@/lib/owui");
        const result = await triggerWebIngestion({ kbId: "kb_42", url: "https://example.com" });

        expect(result).toEqual({ ok: false, error: OWUI_DISABLED_MESSAGE });
        expect(warnSpy).toHaveBeenCalled();
    });

    test("triggerWebIngestion réussit quand OWUI répond correctement", async () => {
        process.env.OWUI_BASE = "http://owui.test";
        process.env.OWUI_TOKEN = "token-test";
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) });
        vi.stubGlobal("fetch", fetchMock);

        const { triggerWebIngestion } = await import("@/lib/owui");
        const result = await triggerWebIngestion({ kbId: "kb_99", url: "https://example.com" });

        expect(fetchMock).toHaveBeenCalledWith("http://owui.test/api/v1/retrieval/process/web", expect.objectContaining({
            method: "POST",
        }));
        expect(result).toEqual({ ok: true });
    });

    test("triggerWebIngestion relaie les erreurs de fetch", async () => {
        process.env.OWUI_BASE = "http://owui.test";
        process.env.OWUI_TOKEN = "token-test";
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
            text: () => Promise.resolve("KO"),
        }));

        const { triggerWebIngestion } = await import("@/lib/owui");
        await expect(triggerWebIngestion({ kbId: "kb_77", url: "https://example.com" })).resolves.toEqual({
            ok: false,
            error: "KO",
        });
        expect(warnSpy).toHaveBeenCalledWith("[owui] Failed to trigger web ingestion", "KO");
    });

    test("deleteFromCollection appelle l'API OWUI", async () => {
        process.env.OWUI_BASE = "http://owui.test";
        process.env.OWUI_TOKEN = "token-test";
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) });
        vi.stubGlobal("fetch", fetchMock);

        const { deleteFromCollection } = await import("@/lib/owui");
        const result = await deleteFromCollection({ kbId: "kb_1", documentId: "doc_123" });

        expect(fetchMock).toHaveBeenCalledWith("http://owui.test/api/v1/retrieval/delete", expect.objectContaining({
            method: "POST",
        }));
        expect(result).toEqual({ ok: true });
    });
});
