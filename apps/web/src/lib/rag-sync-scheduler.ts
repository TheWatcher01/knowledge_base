import { ensureCollectionForKnowledgeBase } from "@/lib/rag-sync";
import { RAG_API_BASE } from "@/lib/config";

const pending: Map<string, NodeJS.Timeout> = new Map();

function clearPending(kbId: string) {
  const existing = pending.get(kbId);
  if (existing) {
    clearTimeout(existing);
    pending.delete(kbId);
  }
}

export function scheduleRagSync(kbId: string, options?: { delayMs?: number }) {
  clearPending(kbId);

  if (!RAG_API_BASE) {
    return;
  }

  if (process.env.NODE_ENV === "test") {
    return;
  }

  const delay = options?.delayMs ?? 0;

  const timeout = setTimeout(() => {
    pending.delete(kbId);
    ensureCollectionForKnowledgeBase(kbId).catch((error) => {
      console.warn("[rag-sync] scheduled reconciliation failed", kbId, error);
    });
  }, delay);

  pending.set(kbId, timeout);
}
