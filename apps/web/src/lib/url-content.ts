import { ObjectId } from "mongodb";
import { UrlStatus } from "@prisma/client";
import { getDb } from "@/lib/mongo";

const COLLECTION = "url_contents";

type UrlContentDocument = {
  url: string;
  html: string | null;
  text: string | null;
  status: UrlStatus;
  lastFetched: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Create or reuse the MongoDB document associated with the given URL.
 * Returns the external identifier when available, otherwise null.
 */
export async function createUrlContentPlaceholder(params: {
  url: string;
  status: UrlStatus;
}): Promise<string | null> {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    const db = await getDb();
    const collection = db.collection<UrlContentDocument>(COLLECTION);
    const now = new Date();
    const result = await collection.findOneAndUpdate(
      { url: params.url },
      {
        $setOnInsert: {
          url: params.url,
          html: null,
          text: null,
          lastFetched: null,
          createdAt: now,
        },
        $set: {
          status: params.status,
          updatedAt: now,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    if (!result) {
      return null;
    }

    const candidate = (result as { value?: unknown }).value ?? result;
    if (!candidate || typeof candidate !== "object" || !("_id" in candidate)) {
      return null;
    }

    const stored = candidate as { _id: unknown };
    if (!(stored._id instanceof ObjectId)) {
      return null;
    }

    return stored._id.toHexString();
  } catch (error) {
    console.warn("[url-content] Unable to create placeholder", error);
    return null;
  }
}

/**
 * Update the status of an existing url_contents document.
 * Silently no-ops when the external identifier is missing or MongoDB is unavailable.
 */
export async function updateUrlContentStatus(params: {
  externalId: string | null | undefined;
  status: UrlStatus;
}): Promise<void> {
  if (!params.externalId || !process.env.MONGODB_URI) {
    return;
  }

  try {
    const db = await getDb();
    const collection = db.collection<UrlContentDocument>(COLLECTION);

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(params.externalId);
    } catch {
      return;
    }

    await collection.updateOne(
      { _id: objectId },
      { $set: { status: params.status, updatedAt: new Date() } },
    );
  } catch (error) {
    console.warn("[url-content] Unable to update status", error);
  }
}
