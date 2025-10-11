import { RAG_API_BASE, RAG_API_TOKEN, collectionName } from "./config";
import { mockRagApiJson, enableRagMock as enableRagMockInternal } from "./rag-mock";

export const RAG_SERVICE_DISABLED_MESSAGE = "RAG service integration is disabled.";

export type RagActionResult =
    | { ok: true }
    | { ok: false; error: string };

const isServer = typeof window === "undefined";

const USE_RAG_MOCK_FLAG =
    process.env.USE_RAG_MOCK === "true" ||
    process.env.NEXT_PUBLIC_USE_RAG_MOCK === "true";

function shouldUseRagMock(): boolean {
    if (USE_RAG_MOCK_FLAG) {
        return true;
    }
    if (isServer) {
        return Boolean((globalThis as { __USE_RAG_MOCK__?: boolean }).__USE_RAG_MOCK__);
    }
    return Boolean((window as { __RAG_MOCK_ENABLED?: boolean }).__RAG_MOCK_ENABLED);
}

async function performMock(path: string, init?: RequestInit) {
    if (isServer) {
        enableRagMockInternal();
    } else {
        (window as { __RAG_MOCK_ENABLED?: boolean }).__RAG_MOCK_ENABLED = true;
    }
    return mockRagApiJson(path, init);
}

function buildRequestUrl(path: string): string {
    const base = RAG_API_BASE || (isServer ? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001" : "");
    if (!base) {
        return path;
    }
    try {
        return new URL(path, base).toString();
    } catch {
        return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
    }
}

function parseErrorResponse(raw: string, status: number): string {
    let message = `HTTP ${status}`;
    if (raw) {
        const trimmed = raw.trim();
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            try {
                const data = JSON.parse(trimmed) as unknown;
                if (data && typeof data === "object") {
                    if ("detail" in data && typeof (data as { detail: unknown }).detail === "string") {
                        message = (data as { detail: string }).detail;
                    } else if ("message" in data && typeof (data as { message: unknown }).message === "string") {
                        message = (data as { message: string }).message;
                    } else {
                        message = trimmed;
                    }
                } else {
                    message = trimmed;
                }
            } catch {
                message = trimmed;
            }
        } else {
            message = trimmed;
        }
    }
    return message;
}

export async function ragApiJson(path: string, init?: RequestInit) {
    if (shouldUseRagMock()) {
        return performMock(path, init);
    }

    const target = buildRequestUrl(path);
    const res = await fetch(target, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${RAG_API_TOKEN}`,
            ...(init?.headers || {}),
        },
    });

    const raw = await res.text();

    if (!res.ok) {
        const message = parseErrorResponse(raw, res.status);
        throw new Error(message || `HTTP ${res.status}`);
    }

    if (!raw) {
        return {};
    }

    try {
        return JSON.parse(raw) as unknown;
    } catch {
        const snippet = raw.slice(0, 200).replace(/\s+/g, " ").trim();
        throw new Error(`Invalid JSON response (status ${res.status}): ${snippet}`);
    }
}

export async function triggerWebIngestion(params: { kbId: string; url: string; documentId: string }): Promise<RagActionResult> {
    if (!shouldUseRagMock() && (!RAG_API_BASE || !RAG_API_TOKEN)) {
        console.warn("[rag-service] integration disabled: RAG_API_BASE=", RAG_API_BASE, "RAG_API_TOKEN=", RAG_API_TOKEN ? "***" : undefined);
        return { ok: false, error: RAG_SERVICE_DISABLED_MESSAGE };
    }

    try {
        await ragApiJson("/api/v1/retrieval/process/web", {
            method: "POST",
            body: JSON.stringify({
                url: params.url,
                collection_name: collectionName(params.kbId),
                document_id: params.documentId,
            }),
        });

        return { ok: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[rag-service] Failed to trigger web ingestion", message);
        return { ok: false, error: message };
    }
}

export async function deleteFromCollection(params: { kbId: string; documentId: string }): Promise<RagActionResult> {
    if (!shouldUseRagMock() && (!RAG_API_BASE || !RAG_API_TOKEN)) {
        return { ok: false, error: RAG_SERVICE_DISABLED_MESSAGE };
    }

    try {
        await ragApiJson("/api/v1/retrieval/delete", {
            method: "POST",
            body: JSON.stringify({
                collection_name: collectionName(params.kbId),
                file_id: params.documentId,
            }),
        });

        return { ok: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[rag-service] Failed to delete entry from collection", message);
        return { ok: false, error: message };
    }
}
