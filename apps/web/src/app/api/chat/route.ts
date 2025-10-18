import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { isRagMockEnabled, ragApiJson, RAG_SERVICE_DISABLED_MESSAGE } from "@/lib/rag";
import { RAG_API_BASE, RAG_API_TOKEN, collectionName } from "@/lib/config";
import { getOpenRouterConfig } from "@/lib/openrouter";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { assertRole, handleAuthError } from "@/lib/authz";
import { ChatMessageRole, Prisma } from "@prisma/client";

type RetrievedDoc = {
    text: string;
    source?: string | null;
    title?: string | null;
    kind?: "vector" | "web" | "fallback";
};

type RetrievedDocSummary = {
    id: string;
    kind: "vector" | "web" | "fallback";
    title: string | null;
    source: string | null;
};
type RetrievalResponse = {
    docs?: RetrievedDoc[];
    documents?: unknown;
};

function collectDocumentTexts(payload: RetrievalResponse | null | undefined): string[] {
    const texts: string[] = [];

    if (!payload || typeof payload !== "object") {
        return texts;
    }

    if (Array.isArray(payload.docs)) {
        for (const doc of payload.docs) {
            if (doc && typeof doc.text === "string") {
                texts.push(doc.text);
            }
        }
    }

    const enqueue = (value: unknown) => {
        if (typeof value === "string") {
            texts.push(value);
            return;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                enqueue(item);
            }
        }
    };

    if (payload.documents !== undefined) {
        enqueue(payload.documents);
    }

    return texts;
}

export const runtime = "nodejs";

async function loadFallbackDocuments(kbId: string): Promise<RetrievedDoc[]> {
    const documents = await prisma.document.findMany({
        where: { kbId },
        include: {
            fileAsset: true,
            urlEntry: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
    });

    const fallback: RetrievedDoc[] = [];

    const collectSegments = (...segments: (string | null | undefined)[]) =>
        segments.filter((segment): segment is string => typeof segment === "string" && segment.trim().length > 0);

    for (const doc of documents) {
        if (doc.type === "note") {
            const text = collectSegments(doc.title, doc.source)
                .join("\n\n")
                .trim();
            if (text) fallback.push({ text, title: doc.title ?? null, kind: "fallback" });
            continue;
        }

        if (doc.type === "file" && doc.fileAsset?.data) {
            const fileContent = Buffer.from(doc.fileAsset.data).toString("utf8");
            const text = collectSegments(doc.title, fileContent)
                .join("\n\n")
                .trim();
            if (text)
                fallback.push({ text, title: doc.title ?? null, source: doc.source ?? null, kind: "fallback" });
            continue;
        }

        if (doc.type === "url") {
            const summary = doc.urlEntry?.description ?? "";
            const source = doc.source ?? doc.urlEntry?.url ?? "";
            const text = collectSegments(doc.title, source, summary)
                .join("\n\n")
                .trim();
            if (text)
                fallback.push({
                    text,
                    title: doc.title ?? null,
                    source: source || null,
                    kind: "fallback",
                });
            continue;
        }
    }

    return fallback;
}

const ChatRequestSchema = z.object({
    kbId: z.string().uuid(),
    model: z.string().trim().min(1).max(120).optional(),
    question: z.string().trim().min(1),
    conversationId: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(120).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
    rerankModel: z.string().trim().min(1).max(120).optional(),
});

// POST /api/chat
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        assertRole(session, ["VIEWER", "EDITOR", "ADMIN"]);
        const userId = session!.user.id;

        let body: unknown;

        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parsed = ChatRequestSchema.safeParse(body ?? {});
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const { kbId, model, question, conversationId, title, meta, rerankModel } = parsed.data;

        const kb = await prisma.knowledgeBase.findFirst({
            where: { id: kbId, ownerId: userId },
            select: { id: true, name: true },
        });

        if (!kb) {
            return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
        }

        const resolved = await resolveConversation({
            kbId,
            userId,
            model,
            conversationId,
            title,
            meta,
            rerankModel,
            question,
        });

        if (!resolved) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const { conversation, history, nextSequence } = resolved;
        const resolvedModel = conversation.model ?? model ?? null;
        const openRouterConfig = getOpenRouterConfig();
        const useOpenRouter = Boolean(resolvedModel && resolvedModel.includes("/"));

    let docs: RetrievedDoc[] = [];

        try {
            const response = (await ragApiJson("/api/v1/retrieval/query/doc", {
                method: "POST",
                body: JSON.stringify({
                    query: question,
                    collection_name: collectionName(kbId),
                    k: 5,
                    hybrid: false,
                }),
            })) as RetrievalResponse;

            const normalized = collectDocumentTexts(response);

            docs = normalized.map((text) => ({ text, kind: "vector" as const }));
        } catch (error) {
            console.warn("[api/chat] Retrieval failed", error);
            docs = [];
        }

        if (RAG_API_BASE) {
            try {
                const webSearch = (await ragApiJson("/api/v1/search/web", {
                    method: "POST",
                    body: JSON.stringify({ query: question, max_results: 3 }),
                })) as {
                    results?: Array<{ title?: string | null; content?: string | null; url?: string | null }>;
                };

                const webDocs = (webSearch.results ?? [])
                    .map((item): RetrievedDoc | null => {
                        const pieces = [item.title, item.content, item.url]
                            .filter((segment): segment is string => typeof segment === "string" && segment.trim().length > 0);
                        if (pieces.length === 0) {
                            return null;
                        }
                        return {
                            text: pieces.join("\n"),
                            source: item.url ?? null,
                            title: item.title ?? null,
                            kind: "web" as const,
                        };
                    })
                    .filter((value): value is RetrievedDoc => value !== null);

                if (webDocs.length > 0) {
                    docs = [...docs, ...webDocs];
                }
            } catch (error) {
                console.warn("[api/chat] Web search augmentation failed", error);
            }
        }

        if (docs.length === 0) {
            try {
                docs = await loadFallbackDocuments(kbId);
            } catch (error) {
                console.warn("[api/chat] Fallback document load failed", error);
            }
        }

        const sources: RetrievedDocSummary[] = docs.slice(0, 10).map((doc, index) => {
            const kind = doc.kind ?? "vector";
            const labelIndex = index + 1;
            const baseTitle = doc.title?.trim() || null;
            const baseSource = doc.source?.trim() || null;
            return {
                id: `${kind}-${labelIndex}`,
                kind,
                title: baseTitle,
                source: baseSource,
            } satisfies RetrievedDocSummary;
        });

        const ctx = docs
            .map((doc, index) => {
                const prefix = doc.kind === "web" ? "WebDoc" : "Doc";
                const labelParts = [
                    `${prefix}${index + 1}`,
                    doc.title ? `– ${doc.title}` : null,
                    doc.source ? `(${doc.source})` : null,
                ].filter(Boolean);
                const label = labelParts.join(" ");
                return `${label}:\n${doc.text}`;
            })
            .join("\n\n");

        const prompt = `Réponds de façon concise en citant Doc1..N.\n\n${ctx}\n\nQuestion:\n${question}`;

        const upstreamMessages = buildUpstreamMessages({
            history,
            prompt,
        });

        let upstream: Response | null = null;
        const shouldMockChat = isRagMockEnabled();

        try {
            if (shouldMockChat) {
                upstream = createMockChatCompletionStream({
                    content: `Réponse simulée pour ${kb.name ?? "cette base"}.`,
                    model: resolvedModel ?? undefined,
                });
            } else if (useOpenRouter) {
                if (!openRouterConfig.enabled) {
                    return NextResponse.json(
                        { error: "OpenRouter API key missing" },
                        { status: 503 },
                    );
                }

                upstream = await fetch(`${openRouterConfig.baseUrl}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${openRouterConfig.apiKey}`,
                        "HTTP-Referer": openRouterConfig.referer,
                        "X-Title": openRouterConfig.appName,
                    },
                    body: JSON.stringify({
                        model: resolvedModel,
                        stream: true,
                        messages: upstreamMessages,
                    }),
                });
            } else {
                if (!RAG_API_BASE) {
                    return NextResponse.json({ error: RAG_SERVICE_DISABLED_MESSAGE }, { status: 503 });
                }

                upstream = await fetch(`${RAG_API_BASE}/api/v1/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(RAG_API_TOKEN ? { Authorization: `Bearer ${RAG_API_TOKEN}` } : {}),
                    },
                    body: JSON.stringify({
                        model: resolvedModel,
                        stream: true,
                        messages: upstreamMessages,
                    }),
                });
            }

            if (!upstream.ok || !upstream.body) {
                const message = await upstream.text();
                return NextResponse.json(
                    { error: message || "Upstream chat error" },
                    { status: upstream.status || 502 },
                );
            }

            const stream = createStreamingResponse({
                upstream,
                conversationId: conversation.id,
                question,
                sequence: nextSequence,
                model: resolvedModel,
                sources,
            });

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "X-Conversation-Id": conversation.id,
                    "X-Rag-Sources": JSON.stringify(sources),
                },
            });
        } catch (error) {
            console.error("[api/chat] Upstream request failed", error);
            return NextResponse.json({ error: "Failed to reach chat service" }, { status: 502 });
        }
    } catch (error) {
        return handleAuthError(error);
    }
}

async function resolveConversation(params: {
    kbId: string;
    userId: string;
    model?: string;
    conversationId?: string;
    title?: string;
    meta?: Record<string, unknown>;
    rerankModel?: string;
    question: string;
}) {
    const { kbId, userId, model, conversationId, title, meta, rerankModel, question } = params;

    if (conversationId) {
        const existing = await prisma.chatConversation.findFirst({
            where: { id: conversationId, kbId, userId },
            select: {
                id: true,
                model: true,
                meta: true,
                messages: {
                    orderBy: { sequence: "asc" },
                    select: {
                        role: true,
                        content: true,
                    },
                },
            },
        });

        if (!existing) {
            return null;
        }

        const updateData: Record<string, unknown> = {};
        if (model && existing.model !== model) {
            updateData.model = model;
            existing.model = model;
        }
        const nextMeta = mergeConversationMeta(existing.meta ?? null, meta, rerankModel);
        const existingMetaJson = JSON.stringify(existing.meta ?? null);
        const nextMetaJson = JSON.stringify(nextMeta);
        if (existingMetaJson !== nextMetaJson) {
            updateData.meta = nextMeta ?? null;
            existing.meta = nextMeta ?? null;
        }
        if (Object.keys(updateData).length > 0) {
            await prisma.chatConversation.update({
                where: { id: existing.id },
                data: updateData,
            });
        }

        return {
            conversation: {
                id: existing.id,
                model: existing.model,
            },
            history: existing.messages,
            nextSequence: existing.messages.length,
        };
    }

    const fallbackTitle = question.slice(0, 60) || "Conversation";
    const initialMeta = mergeConversationMeta(null, meta, rerankModel);
    const created = await prisma.chatConversation.create({
        data: {
            kbId,
            userId,
            title: title ?? fallbackTitle,
            model: model ?? null,
            meta: initialMeta ?? undefined,
        },
    });

    return {
        conversation: {
            id: created.id,
            model: created.model,
        },
        history: [] as Array<{ role: ChatMessageRole; content: string }>,
        nextSequence: 0,
    };
}

function mergeConversationMeta(
    existing: unknown,
    incoming: Record<string, unknown> | undefined,
    rerankModel?: string,
): Record<string, unknown> | null {
    const base = normalizeMetaRecord(existing);

    if (typeof rerankModel === "string" && rerankModel.length > 0) {
        base.rerankModel = rerankModel;
    }

    if (incoming) {
        for (const [key, value] of Object.entries(incoming)) {
            if (value === undefined) {
                continue;
            }
            if (value === null) {
                delete base[key];
            } else {
                base[key] = value;
            }
        }
    }

    return Object.keys(base).length > 0 ? base : null;
}

function normalizeMetaRecord(source: unknown): Record<string, unknown> {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
        return {};
    }

    const entries = Object.entries(source as Record<string, unknown>).filter(
        ([, value]) => value !== undefined,
    );
    return Object.fromEntries(entries);
}

function buildUpstreamMessages(params: {
    history: Array<{ role: ChatMessageRole; content: string }>;
    prompt: string;
}) {
    const { history, prompt } = params;
    const mapped = history.map((message) => ({
        role: message.role,
        content: message.content,
    }));

    return [...mapped, { role: "user", content: prompt }];
}

function createStreamingResponse(params: {
    upstream: Response;
    conversationId: string;
    question: string;
    sequence: number;
    model: string | null;
    sources: RetrievedDocSummary[];
}) {
    const { upstream, conversationId, question, sequence, sources } = params;
    const reader = upstream.body!.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    let buffered = "";
    let assistantContent = "";
    let doneStreaming = false;
    let completionEventSent = false;

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const controllerState = { closed: false, errored: false };
            const isClosedError = (error: unknown) =>
                error instanceof Error && error.message.includes("Controller is already closed");

            const enqueueSafe = (chunk: string) => {
                if (!chunk || controllerState.closed || controllerState.errored) return;
                try {
                    controller.enqueue(encoder.encode(chunk));
                } catch (error) {
                    if (isClosedError(error)) {
                        controllerState.closed = true;
                    } else {
                        throw error;
                    }
                }
            };

            const safeClose = () => {
                if (controllerState.closed || controllerState.errored) return;
                try {
                    controller.close();
                    controllerState.closed = true;
                } catch (error) {
                    if (isClosedError(error)) {
                        controllerState.closed = true;
                    } else {
                        throw error;
                    }
                }
            };

            const safeError = (error: unknown) => {
                if (controllerState.closed || controllerState.errored) return;
                try {
                    controller.error(error);
                    controllerState.errored = true;
                } catch (err) {
                    if (isClosedError(err)) {
                        controllerState.closed = true;
                    } else {
                        throw err;
                    }
                }
            };

            const signalCompletion = () => {
                if (completionEventSent || controllerState.closed || controllerState.errored) {
                    return;
                }

                const payload = JSON.stringify({
                    conversationId,
                    sequence: sequence + 1,
                    status: "completed",
                });

                enqueueSafe(`data: ${payload}\n\n`);
                enqueueSafe("data: [DONE]\n\n");
                completionEventSent = true;
            };

            try {
                await prisma.chatMessage.create({
                    data: {
                        conversationId,
                        role: ChatMessageRole.user,
                        content: question,
                        sequence,
                    },
                });

                await prisma.chatConversation.update({
                    where: { id: conversationId },
                    data: {
                        lastActivityAt: new Date(),
                    },
                });

                while (!doneStreaming) {
                    const { value, done } = await reader.read();
                    if (done) {
                        break;
                    }
                    if (!value) continue;

                    try {
                        controller.enqueue(value);
                    } catch (error) {
                        if (isClosedError(error)) {
                            controllerState.closed = true;
                            break;
                        }
                        throw error;
                    }

                    buffered += decoder.decode(value, { stream: true });
                    const { content, remainder, finished } = extractAssistantDelta(buffered);
                    buffered = remainder;
                    if (content) {
                        assistantContent += content;
                    }
                    if (finished) {
                        doneStreaming = true;
                    }
                }

                const tail = decoder.decode();
                const finalBuffer = buffered + tail;
                if (finalBuffer) {
                    const { content } = extractAssistantDelta(finalBuffer);
                    if (content) {
                        assistantContent += content;
                    }
                }

                await prisma.$transaction([
                    prisma.chatMessage.create({
                        data: {
                            conversationId,
                            role: ChatMessageRole.assistant,
                            content: assistantContent.trim(),
                            sequence: sequence + 1,
                            meta: sources.length > 0 ? ( { sources } as Prisma.JsonObject ) : undefined,
                        },
                    }),
                    prisma.chatConversation.update({
                        where: { id: conversationId },
                        data: {
                            lastActivityAt: new Date(),
                            updatedAt: new Date(),
                            model: resolvedModel ?? undefined,
                        },
                    }),
                ]);

                signalCompletion();
                safeClose();
            } catch (error) {
                if (error instanceof Error && error.message.includes("Controller is already closed")) {
                    console.warn("[api/chat] streaming pipeline stopped after consumer closed", error);
                } else {
                    console.error("[api/chat] streaming pipeline failed", error);
                }
                try {
                    if (!completionEventSent) {
                        signalCompletion();
                    }
                    safeError(error);
                } catch (secondary) {
                    console.warn("[api/chat] failed to signal stream error", secondary);
                }
            } finally {
                reader.releaseLock();
            }
        },
        cancel() {
            reader.cancel();
        },
    });

    return stream;
}

function createMockChatCompletionStream(params: { content: string; model?: string | null }) {
    const encoder = new TextEncoder();
    const payload = {
        choices: [
            {
                delta: { content: params.content },
                finish_reason: "stop",
            },
        ],
        model: params.model ?? null,
    };

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
        },
    });

    return new Response(stream, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
        },
    });
}

function extractAssistantDelta(buffer: string) {
    let content = "";
    let remainder = buffer;
    let finished = false;

    const segments = buffer.split(/\r?\n\r?\n/);
    remainder = segments.pop() ?? "";

    for (const segment of segments) {
        const lines = segment.split(/\r?\n/);
        for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data) continue;
            if (data === "[DONE]") {
                finished = true;
                continue;
            }

            try {
                const parsed = JSON.parse(data) as unknown;
                const text = extractAssistantText(parsed);
                content += text;
                if (!finished && isCompletionChunk(parsed)) {
                    finished = true;
                }
            } catch (error) {
                console.warn("[api/chat] Failed to parse SSE chunk", error);
                continue;
            }
        }
    }

    return { content, remainder, finished };
}

function extractAssistantText(payload: unknown): string {
    if (!payload || typeof payload !== "object") {
        return "";
    }

    const choices = (payload as { choices?: unknown }).choices;
    if (!Array.isArray(choices) || choices.length === 0) {
        return "";
    }

    const first = choices[0];
    if (!first || typeof first !== "object") {
        return "";
    }

    const delta = (first as { delta?: unknown }).delta;
    if (!delta || typeof delta !== "object") {
        return "";
    }

    const content = (delta as { content?: unknown }).content;
    return typeof content === "string" ? content : "";
}

function isCompletionChunk(payload: unknown): boolean {
    if (!payload || typeof payload !== "object") {
        return false;
    }

    const record = payload as Record<string, unknown>;

    if (record.done === true) {
        return true;
    }

    const status = record.status;
    if (typeof status === "string" && status.toLowerCase() === "completed") {
        return true;
    }

    const choices = record.choices;
    if (Array.isArray(choices) && choices.length > 0) {
        const first = choices[0];
        if (first && typeof first === "object") {
            const finishReason = (first as { finish_reason?: unknown }).finish_reason;
            if (typeof finishReason === "string" && finishReason.length > 0) {
                return true;
            }
        }
    }

    return false;
}
