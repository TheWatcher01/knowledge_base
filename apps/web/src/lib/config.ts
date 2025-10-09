const legacyBase = process.env.OWUI_BASE;
const legacyToken = process.env.OWUI_TOKEN;

export const RAG_API_BASE = process.env.RAG_API_BASE ?? legacyBase ?? "";
export const RAG_API_TOKEN = process.env.RAG_API_TOKEN ?? legacyToken ?? "";

export const OWUI_BASE = RAG_API_BASE;
export const OWUI_TOKEN = RAG_API_TOKEN;
export const collectionName = (knId: string) => `kb_${knId}`;
