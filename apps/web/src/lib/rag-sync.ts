import { OWUI_BASE, OWUI_TOKEN, collectionName } from "@/lib/config";
import { owuiJson, triggerWebIngestion, OWUI_DISABLED_MESSAGE } from "@/lib/rag";
import { prisma } from "@/lib/prisma";
import {
  listKnowledgeEntries,
  upsertKnowledgeEntry,
  markEmbedded,
  KnowledgeRecord,
} from "@/lib/knowledge-store";

const TEXT_INGEST_ENDPOINT = "/api/v1/retrieval/process/text";

export type RagSyncResult = {
  ok: boolean;
  collectionFound: boolean;
  reembeddedCount: number;
  errors: string[];
};

export async function ensureCollectionForKnowledgeBase(kbId: string): Promise<RagSyncResult> {
  if (!OWUI_BASE || !OWUI_TOKEN) {
    return {
      ok: false,
      collectionFound: false,
      reembeddedCount: 0,
      errors: [OWUI_DISABLED_MESSAGE],
    };
  }

  const targetCollection = collectionName(kbId);
  const collectionCheck = await checkCollectionExists(targetCollection);

  if (collectionCheck.exists) {
    return {
      ok: true,
      collectionFound: true,
      reembeddedCount: 0,
      errors: collectionCheck.warning ? [collectionCheck.warning] : [],
    };
  }

  const entries = await ensureKnowledgeEntries(kbId);
  if (entries.length === 0) {
    return {
      ok: false,
      collectionFound: false,
      reembeddedCount: 0,
      errors: [collectionCheck.error ?? "No knowledge entries available to re-ingest."],
    };
  }

  const errors: string[] = [];
  let successCount = 0;

  for (const entry of entries) {
    const result = await reembedEntry(kbId, entry);
    if (result.ok) {
      successCount += 1;
      await markEmbedded(entry.documentId);
    } else if (result.error) {
      errors.push(result.error);
    }
  }

  return {
    ok: errors.length === 0,
    collectionFound: false,
    reembeddedCount: successCount,
    errors: collectionCheck.error ? [collectionCheck.error, ...errors] : errors,
  };
}

type CollectionCheck = { exists: true; warning?: string } | { exists: false; error?: string };

async function checkCollectionExists(collectionName: string): Promise<CollectionCheck> {
  try {
    await owuiJson("/api/v1/retrieval/query/doc", {
      method: "POST",
      body: JSON.stringify({
        query: "ping",
        collection_name: collectionName,
        k: 1,
        hybrid: false,
      }),
    });

    return { exists: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (/not found/i.test(message) || /missing collection/i.test(message)) {
      return { exists: false };
    }

    if (/timeout/i.test(message)) {
      return { exists: false, error: "Timed out while checking collection on the RAG service." };
    }

    return {
      exists: false,
      error: `Unable to verify collection on the RAG service (${message})`,
    };
  }
}

type ReembedResult = { ok: true } | { ok: false; error?: string };

async function reembedEntry(kbId: string, entry: KnowledgeRecord): Promise<ReembedResult> {
  if (entry.ingestMethod === "web") {
    if (!entry.source) {
      return { ok: false, error: `Missing URL for document ${entry.documentId}` };
    }

    const ingestion = await triggerWebIngestion({ kbId, url: entry.source });
    if (!ingestion.ok && ingestion.error !== OWUI_DISABLED_MESSAGE) {
      return { ok: false, error: ingestion.error };
    }
    return { ok: true };
  }

  const content = entry.content ?? (await fetchTextContent(entry.documentId));
  if (!content) {
    return { ok: false, error: `No text content for document ${entry.documentId}` };
  }

  try {
    await owuiJson(TEXT_INGEST_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        name: entry.documentId,
        content,
        collection_name: collectionName(kbId),
      }),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function fetchTextContent(documentId: string): Promise<string | null> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      type: true,
      source: true,
      fileAsset: {
        select: { data: true, mimeType: true },
      },
    },
  });

  if (!document) {
    return null;
  }

  if (document.type === "note") {
    return typeof document.source === "string" ? document.source : null;
  }

  if (document.type === "file" && document.fileAsset) {
    if (!document.fileAsset.mimeType.startsWith("text/")) {
      return null;
    }
    return Buffer.from(document.fileAsset.data).toString("utf8");
  }

  return null;
}

async function ensureKnowledgeEntries(kbId: string): Promise<KnowledgeRecord[]> {
  let entries = await listKnowledgeEntries(kbId);
  if (entries.length > 0) {
    return entries;
  }

  const documents = await prisma.document.findMany({
    where: { kbId },
    include: {
      fileAsset: true,
      urlEntry: true,
    },
  });

  for (const doc of documents) {
    if (doc.type === "note") {
      await upsertKnowledgeEntry({
        kbId,
        documentId: doc.id,
        type: doc.type,
        ingestMethod: "text",
        content: typeof doc.source === "string" ? doc.source : null,
        source: null,
      });
    } else if (doc.type === "file") {
      const content = doc.fileAsset && doc.fileAsset.mimeType.startsWith("text/")
        ? Buffer.from(doc.fileAsset.data).toString("utf8")
        : null;
      await upsertKnowledgeEntry({
        kbId,
        documentId: doc.id,
        type: doc.type,
        ingestMethod: "text",
        content,
        source: doc.source,
        metadata: doc.fileAsset
          ? {
            mimeType: doc.fileAsset.mimeType,
            size: doc.fileAsset.size,
          }
          : null,
      });
    } else if (doc.type === "url" && doc.urlEntry) {
      await upsertKnowledgeEntry({
        kbId,
        documentId: doc.id,
        type: doc.type,
        ingestMethod: "web",
        content: null,
        source: doc.urlEntry.url,
        metadata: {
          status: doc.urlEntry.status,
        },
      });
    }
  }

  entries = await listKnowledgeEntries(kbId);
  return entries;
}
