import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "kbapp";

let client: MongoClient | null = null;
let database: Db | null = null;

// Singleton pattern to ensure a single MongoDB connection
export async function getDb(): Promise<Db> {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    database = client.db(dbName);

    // TTL indexes (idempotent)
    await database
      .collection("usage_events")
      .createIndex({ ts: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
    await database
      .collection("searx_cache")
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
    await database.collection("url_contents").createIndex({ url: 1 }, { unique: true });
    await database.collection("url_contents").createIndex({ status: 1 });
    await database.collection("kb_knowledge").createIndex({ kbId: 1 });
    await database.collection("kb_knowledge").createIndex({ documentId: 1 }, { unique: true });
  }
  return database!;
}
