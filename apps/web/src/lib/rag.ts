import { RAG_API_BASE, RAG_API_TOKEN, collectionName } from "./config";

export const RAG_SERVICE_DISABLED_MESSAGE = "RAG service integration is disabled.";

export type RagActionResult =
    | { ok: true }
    | { ok: false; error: string };

export async function ragApiJson(path: string, init?: RequestInit) {
    const res = await fetch(`${RAG_API_BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${RAG_API_TOKEN}`,
            ...(init?.headers || {}),
        },
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(errorText || `HTTP ${res.status}`);
    }

    const raw = await res.text();

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
    if (!RAG_API_BASE || !RAG_API_TOKEN) {
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
    if (!RAG_API_BASE || !RAG_API_TOKEN) {
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
