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

export type ModelJobStatus = "queued" | "running" | "succeeded" | "failed";

export type ModelJob = {
  id: string;
  provider: string;
  model: string;
  status: ModelJobStatus;
  summary: string | null;
  error: string | null;
  queued_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function normalizeJob(raw: unknown): ModelJob {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid job payload");
  }

  const job = raw as Record<string, unknown>;

  const id = job.id ? String(job.id) : undefined;
  const provider = job.provider ? String(job.provider) : undefined;
  const model = job.model ? String(job.model) : undefined;
  const status = job.status ? String(job.status) : undefined;

  if (!id || !provider || !model || !status) {
    throw new Error("Incomplete job payload");
  }

  if (!["queued", "running", "succeeded", "failed"].includes(status)) {
    throw new Error(`Unknown job status: ${status}`);
  }

  const asMaybeString = (value: unknown): string | null => {
    if (value == null) return null;
    return String(value);
  };

  return {
    id,
    provider,
    model,
    status: status as ModelJobStatus,
    summary: asMaybeString(job.summary),
    error: asMaybeString(job.error),
    queued_at: asMaybeString(job.queued_at ?? job.queuedAt),
    started_at: asMaybeString(job.started_at ?? job.startedAt),
    finished_at: asMaybeString(job.finished_at ?? job.finishedAt),
    created_at: asMaybeString(job.created_at ?? job.createdAt),
    updated_at: asMaybeString(job.updated_at ?? job.updatedAt),
  };
}

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

export async function pullModel(name: string): Promise<ModelJob> {
  const payload = (await ragApiJson("/api/v1/models/pull", {
    method: "POST",
    body: JSON.stringify({ name }),
  })) as { job?: unknown };

  if (!payload?.job) {
    throw new Error("Réponse inattendue du service RAG.");
  }

  return normalizeJob(payload.job);
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

export async function listModelJobs(limit: number = 20): Promise<ModelJob[]> {
  const payload = (await ragApiJson(`/api/v1/models/jobs?limit=${encodeURIComponent(limit)}`)) as {
    jobs?: unknown;
  };

  if (!payload?.jobs || !Array.isArray(payload.jobs)) {
    return [];
  }

  return payload.jobs.map((job) => normalizeJob(job)).filter(Boolean);
}

export async function getModelJob(jobId: string): Promise<ModelJob | null> {
  try {
    const payload = (await ragApiJson(`/api/v1/models/jobs/${encodeURIComponent(jobId)}`)) as unknown;
    return normalizeJob(payload);
  } catch (error) {
    if (error instanceof Error && /404|not found/i.test(error.message)) {
      return null;
    }
    throw error;
  }
}
