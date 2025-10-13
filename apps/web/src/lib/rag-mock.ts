type ModelJobStatus = "queued" | "running" | "succeeded" | "failed";

type RagModel = {
    name: string;
    size?: string;
    modified_at?: string;
    digest?: string;
};

type RagDefaults = {
    chat_model: string | null;
    embedding_model: string | null;
};

type JobPhases = {
    phases: ModelJobStatus[];
    summary?: string;
    error?: string;
};

type RagMockConfig = {
    failModels: Set<string>;
};

type RagMockState = {
    models: RagModel[];
    defaults: RagDefaults;
    jobs: Map<string, {
        id: string;
        provider: string;
        model: string;
        phases: ModelJobStatus[];
        phaseIndex: number;
        summary?: string;
        error?: string;
        queuedAt: string;
        startedAt?: string;
        finishedAt?: string;
        updatedAt: string;
    }>;
    config: RagMockConfig;
};

declare global {
    var __RAG_MOCK_STATE__: RagMockState | undefined;
    var __USE_RAG_MOCK__: boolean | undefined;
}

const INITIAL_MODELS: RagModel[] = [
    { name: "llama3.1:8b", size: "4.7 GB", modified_at: "2025-10-01" },
    { name: "mxbai-embed-large", size: "1.4 GB", modified_at: "2025-08-17" },
];

function createDefaultState(): RagMockState {
    return {
        models: [...INITIAL_MODELS],
        defaults: { chat_model: null, embedding_model: null },
        jobs: new Map(),
        config: { failModels: new Set() },
    };
}

function getState(): RagMockState {
    if (!globalThis.__RAG_MOCK_STATE__) {
        globalThis.__RAG_MOCK_STATE__ = createDefaultState();
    }
    return globalThis.__RAG_MOCK_STATE__;
}

export function enableRagMock(): void {
    globalThis.__USE_RAG_MOCK__ = true;
}

export function resetRagMockState(options?: { failModels?: string[] }): void {
    globalThis.__RAG_MOCK_STATE__ = createDefaultState();
    if (options?.failModels?.length) {
        const state = getState();
        state.config.failModels = new Set(options.failModels.map((name) => name.toLowerCase()));
    }
}

export function getRagMockSnapshot() {
    const state = getState();
    return {
        models: [...state.models],
        defaults: { ...state.defaults },
        failModels: [...state.config.failModels],
        jobs: Array.from(state.jobs.values()).map(serializeJob),
    };
}

function jobPhasesFor(model: string, config: RagMockConfig): JobPhases {
    const normalized = model.toLowerCase();
    const shouldFail = config.failModels.has(normalized) || normalized.includes("demo-chat");
    if (shouldFail) {
      return {
          phases: ["queued", "failed"],
          error: `Model '${model}' failed`,
      };
    }
    return {
        phases: ["queued", "running", "succeeded"],
        summary: `Model '${model}' downloaded successfully`,
    };
}

function generateId(): string {
    const cryptoObj: Crypto | undefined = globalThis.crypto;
    if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
        return cryptoObj.randomUUID();
    }
    return `mock-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function registerJob(model: string, provider: string): Record<string, unknown> {
    const state = getState();
    const { phases, summary, error } = jobPhasesFor(model, state.config);
    const id = generateId();
    const queuedAt = new Date().toISOString();
    state.jobs.set(id, {
        id,
        provider,
        model,
        phases,
        phaseIndex: 0,
        summary,
        error,
        queuedAt,
        updatedAt: queuedAt,
    });
    return {
        job: serializeJob(state.jobs.get(id)!),
    };
}

function advanceJob(job: RagMockState["jobs"][string], state: RagMockState): void {
    if (job.phaseIndex < job.phases.length - 1) {
        job.phaseIndex += 1;
        job.updatedAt = new Date().toISOString();
        if (job.phases[job.phaseIndex] === "running") {
            job.startedAt = job.startedAt ?? job.updatedAt;
        }
        if (job.phases[job.phaseIndex] === "succeeded" || job.phases[job.phaseIndex] === "failed") {
            job.finishedAt = job.finishedAt ?? job.updatedAt;
        }
        const status = job.phases[job.phaseIndex];
        if (status === "succeeded") {
            const exists = state.models.some((model) => model.name === job.model);
            if (!exists) {
                state.models.push({ name: job.model });
            }
        }
        if (status === "failed") {
            state.models = state.models.filter((model) => model.name !== job.model);
        }
    }
}

function serializeJob(job: RagMockState["jobs"][string]): Record<string, unknown> {
    const status = job.phases[job.phaseIndex];
    return {
        id: job.id,
        provider: job.provider,
        model: job.model,
        status,
        summary: status === "succeeded" ? job.summary ?? null : null,
        error: status === "failed" ? job.error ?? null : null,
        queued_at: job.queuedAt,
        started_at: job.startedAt ?? null,
        finished_at: job.finishedAt ?? null,
        created_at: job.queuedAt,
        updated_at: job.updatedAt,
    };
}

function listJobs(limit: number | undefined): Record<string, unknown> {
    const state = getState();
    const entries = Array.from(state.jobs.values()).sort((a, b) => (a.queuedAt < b.queuedAt ? 1 : -1));
    const selected = typeof limit === "number" ? entries.slice(0, limit) : entries;
    selected.forEach((job) => {
        advanceJob(job, state);
    });
    return { jobs: selected.map(serializeJob) };
}

function getJobById(jobId: string): Record<string, unknown> | null {
    const state = getState();
    const job = state.jobs.get(jobId);
    if (!job) {
        return null;
    }
    advanceJob(job, state);
    return serializeJob(job);
}

function deleteModel(name: string): Record<string, unknown> {
    const state = getState();
    const before = state.models.length;
    state.models = state.models.filter((model) => model.name !== name);
    if (state.defaults.chat_model === name) {
        state.defaults.chat_model = null;
    }
    if (state.defaults.embedding_model === name) {
        state.defaults.embedding_model = null;
    }
    if (state.models.length === before) {
        return { error: "Model not found" };
    }
    return { status: "deleted", name };
}

function updateDefaults(payload: Record<string, unknown> | null): { status: number; body: Record<string, unknown> } {
    const state = getState();
    const nextChat = typeof payload?.chat_model === "string" ? payload!.chat_model : undefined;
    const nextEmbedding = typeof payload?.embedding_model === "string" ? payload!.embedding_model : undefined;

    const ensureInstalled = (model: string | undefined): boolean => {
        if (!model) return true;
        if (state.config.failModels.has(model.toLowerCase())) {
            return false;
        }
        return state.models.some((entry) => entry.name === model);
    };

    if (nextChat !== undefined && !ensureInstalled(nextChat)) {
        return {
            status: 404,
            body: { detail: `Model '${nextChat}' is not installed on Ollama.` },
        };
    }

    if (nextEmbedding !== undefined && !ensureInstalled(nextEmbedding)) {
        return {
            status: 404,
            body: { detail: `Model '${nextEmbedding}' is not installed on Ollama.` },
        };
    }

    if (nextChat !== undefined) {
        state.defaults.chat_model = nextChat;
    }
    if (nextEmbedding !== undefined) {
        state.defaults.embedding_model = nextEmbedding;
    }

    return {
        status: 200,
        body: { ...state.defaults },
    };
}

export async function mockRagApiJson(path: string, init?: RequestInit): Promise<unknown> {
    const url = new URL(path, "http://mock.local");
    const method = (init?.method ?? "GET").toUpperCase();
    switch (true) {
        case url.pathname === "/api/v1/models" && method === "GET": {
            const state = getState();
            return { models: state.models };
        }
        case url.pathname === "/api/v1/models" && method === "DELETE": {
            const name = url.searchParams.get("name");
            if (!name) {
                return { error: "Model name is required" };
            }
            return deleteModel(name);
        }
        case url.pathname.startsWith("/api/v1/models/") && method === "DELETE": {
            const name = decodeURIComponent(url.pathname.split("/").pop() ?? "");
            return deleteModel(name);
        }
        case url.pathname === "/api/v1/models/pull" && method === "POST": {
            const bodyText = typeof init?.body === "string" ? init.body : undefined;
            const payload = bodyText ? (JSON.parse(bodyText) as { name?: string }) : {};
            const model = payload.name ?? "unknown";
            return registerJob(model, "ollama");
        }
        case url.pathname === "/api/v1/models/defaults" && method === "GET": {
            const state = getState();
            return { ...state.defaults };
        }
        case url.pathname === "/api/v1/models/defaults" && method === "PATCH": {
            const bodyText = typeof init?.body === "string" ? init.body : undefined;
            const payload = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : null;
            const result = updateDefaults(payload);
            if (result.status >= 400) {
                throw Object.assign(new Error(result.body.detail as string), {
                    status: result.status,
                });
            }
            return result.body;
        }
        case url.pathname === "/api/v1/retrieval/process/web" && method === "POST": {
            return { status: "queued" };
        }
        case url.pathname === "/api/v1/models/jobs" && method === "GET": {
            const limitParam = url.searchParams.get("limit");
            const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
            return listJobs(Number.isNaN(limit ?? NaN) ? undefined : limit);
        }
        case url.pathname.startsWith("/api/v1/models/jobs/") && method === "GET": {
            const jobId = url.pathname.split("/").pop() ?? "";
            const job = getJobById(jobId);
            if (!job) {
                throw Object.assign(new Error("Job not found"), { status: 404 });
            }
            return job;
        }
        default:
            throw new Error(`Mock RAG endpoint not implemented for ${method} ${path}`);
    }
}
