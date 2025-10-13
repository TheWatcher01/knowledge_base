function resolveRagApiBase(): string {
    const explicit = (process.env.RAG_API_BASE || process.env.NEXT_PUBLIC_RAG_API_BASE || "").trim();
    if (explicit.length > 0) {
        return explicit.replace(/\/+$/, "");
    }

    if (process.env.NODE_ENV === "development") {
        return "http://localhost:8000";
    }

    return "";
}

export const RAG_API_BASE = resolveRagApiBase();
export const RAG_API_TOKEN = (process.env.RAG_API_TOKEN || "").trim();
export const collectionName = (knId: string) => `kb_${knId}`;
