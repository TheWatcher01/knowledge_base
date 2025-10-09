import { OWUI_BASE, OWUI_TOKEN, collectionName } from "./config";

export const OWUI_DISABLED_MESSAGE = "RAG service integration is disabled.";

export type OwuiActionResult =
    | { ok: true }
    | { ok: false; error: string };

export async function owuiJson(path: string, init?: RequestInit) {
    const res = await fetch(`${OWUI_BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${OWUI_TOKEN}`,
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

export async function triggerWebIngestion(params: { kbId: string; url: string }): Promise<OwuiActionResult> {
    if (!OWUI_BASE || !OWUI_TOKEN) {
        console.warn("[rag-service] integration disabled: RAG_API_BASE=", OWUI_BASE, "RAG_API_TOKEN=", OWUI_TOKEN ? "***" : undefined);
        return { ok: false, error: OWUI_DISABLED_MESSAGE };
    }

    try {
        await owuiJson("/api/v1/retrieval/process/web", {
            method: "POST",
            body: JSON.stringify({
                url: params.url,
                collection_name: collectionName(params.kbId),
            }),
        });

        return { ok: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn("[rag-service] Failed to trigger web ingestion", message);
        return { ok: false, error: message };
    }
}

export async function deleteFromCollection(params: { kbId: string; documentId: string }): Promise<OwuiActionResult> {
    if (!OWUI_BASE || !OWUI_TOKEN) {
        return { ok: false, error: OWUI_DISABLED_MESSAGE };
    }

    try {
        await owuiJson("/api/v1/retrieval/delete", {
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
