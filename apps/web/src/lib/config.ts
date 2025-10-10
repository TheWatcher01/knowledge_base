export const RAG_API_BASE = process.env.RAG_API_BASE ?? "";
export const RAG_API_TOKEN = process.env.RAG_API_TOKEN ?? "";
export const collectionName = (knId: string) => `kb_${knId}`;
