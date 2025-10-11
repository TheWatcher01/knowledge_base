import { ragApiJson } from "./rag";

export type OllamaModelSummary = {
  name: string;
  modified_at?: string;
  size?: string;
  digest?: string;
};

export type ModelDefaults = {
  chat_model: string | null;
  embedding_model: string | null;
};

export async function listModels(): Promise<OllamaModelSummary[]> {
  const payload = (await ragApiJson("/api/v1/models")) as { models?: unknown };
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const models = (payload as { models?: unknown }).models;
  if (!Array.isArray(models)) {
    return [];
  }

  return models
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      name: String(entry.name ?? ""),
      modified_at: entry.modified_at ? String(entry.modified_at) : undefined,
      size: entry.size ? String(entry.size) : undefined,
      digest: entry.digest ? String(entry.digest) : undefined,
    }));
}

export async function pullModel(name: string): Promise<{ status: string; summary?: string }> {
  const payload = (await ragApiJson("/api/v1/models/pull", {
    method: "POST",
    body: JSON.stringify({ name }),
  })) as { status: string; summary?: string };
  return payload;
}

export async function deleteModel(name: string): Promise<{ status: string }> {
  const payload = (await ragApiJson(`/api/v1/models/${encodeURIComponent(name)}`, {
    method: "DELETE",
  })) as { status: string };
  return payload;
}

export async function getModelDefaults(): Promise<ModelDefaults> {
  const payload = (await ragApiJson("/api/v1/models/defaults")) as ModelDefaults;
  return {
    chat_model: payload?.chat_model ?? null,
    embedding_model: payload?.embedding_model ?? null,
  };
}

export async function setModelDefaults(data: {
  chat_model?: string;
  embedding_model?: string;
}): Promise<ModelDefaults> {
  const payload = (await ragApiJson("/api/v1/models/defaults", {
    method: "PATCH",
    body: JSON.stringify(data),
  })) as ModelDefaults;
  return {
    chat_model: payload?.chat_model ?? null,
    embedding_model: payload?.embedding_model ?? null,
  };
}
