import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongo";

const COLLECTION = "kb_knowledge";

export type KnowledgeIngestMethod = "text" | "web";

export type KnowledgeRecord = {
  _id: ObjectId;
  kbId: string;
  documentId: string;
  type: string;
  ingestMethod: KnowledgeIngestMethod;
  content: string | null;
  source: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  lastEmbeddedAt: Date | null;
};

function isMongoAvailable() {
  return Boolean(process.env.MONGODB_URI);
}

type UpsertParams = {
  kbId: string;
  documentId: string;
  type: string;
  ingestMethod: KnowledgeIngestMethod;
  content?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function upsertKnowledgeEntry(params: UpsertParams): Promise<void> {
  if (!isMongoAvailable()) {
    return;
  }

  try {
    const db = await getDb();
    const collection = db.collection<KnowledgeRecord>(COLLECTION);
    const now = new Date();

    const content =
      params.content !== undefined ? sanitizeContent(params.content) : undefined;
    const metadata = params.metadata ?? undefined;

    const update: Record<string, unknown> = {
      ingestMethod: params.ingestMethod,
      updatedAt: now,
    };

    if (params.source !== undefined) {
      update.source = params.source ?? null;
    }
    if (content !== undefined) {
      update.content = content;
    }
    if (metadata !== undefined) {
      update.metadata = metadata;
    }

    await collection.updateOne(
      { documentId: params.documentId },
      {
        $setOnInsert: {
          kbId: params.kbId,
          documentId: params.documentId,
          type: params.type,
          createdAt: now,
          lastEmbeddedAt: null,
        },
        $set: update,
      },
      { upsert: true },
    );
  } catch (error) {
    console.warn("[knowledge-store] Unable to upsert entry", error);
  }
}

export async function markEmbedded(documentId: string): Promise<void> {
  if (!isMongoAvailable()) {
    return;
  }

  try {
    const db = await getDb();
    await db.collection<KnowledgeRecord>(COLLECTION).updateOne(
      { documentId },
      { $set: { lastEmbeddedAt: new Date(), updatedAt: new Date() } },
    );
  } catch (error) {
    console.warn("[knowledge-store] Unable to mark embedded", error);
  }
}

export async function markNeedsEmbedding(documentId: string): Promise<void> {
  if (!isMongoAvailable()) {
    return;
  }

  try {
    const db = await getDb();
    await db.collection<KnowledgeRecord>(COLLECTION).updateOne(
      { documentId },
      { $set: { lastEmbeddedAt: null, updatedAt: new Date() } },
    );
  } catch (error) {
    console.warn("[knowledge-store] Unable to mark entry as stale", error);
  }
}

export async function listKnowledgeEntries(kbId: string): Promise<KnowledgeRecord[]> {
  if (!isMongoAvailable()) {
    return [];
  }

  try {
    const db = await getDb();
    return db.collection<KnowledgeRecord>(COLLECTION).find({ kbId }).toArray();
  } catch (error) {
    console.warn("[knowledge-store] Unable to list entries", error);
    return [];
  }
}

export async function removeKnowledgeEntry(documentId: string): Promise<void> {
  if (!isMongoAvailable()) {
    return;
  }

  try {
    const db = await getDb();
    await db.collection<KnowledgeRecord>(COLLECTION).deleteOne({ documentId });
  } catch (error) {
    console.warn("[knowledge-store] Unable to remove entry", error);
  }
}

export async function removeKnowledgeEntriesForKb(kbId: string): Promise<void> {
  if (!isMongoAvailable()) {
    return;
  }

  try {
    const db = await getDb();
    await db.collection<KnowledgeRecord>(COLLECTION).deleteMany({ kbId });
  } catch (error) {
    console.warn("[knowledge-store] Unable to remove entries for kb", error);
  }
}

function sanitizeContent(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  // Prevent storing excessively large payloads
  const maxLength = 200_000; // ~200 KB of UTF-8 characters
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

export function knowledgeStoreAvailable(): boolean {
  return isMongoAvailable();
}
