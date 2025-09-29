"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_CHAT_MODEL ?? "";

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

type ModelOption = {
    id: string;
    label: string;
};

export default function ChatPage() {
    const params = useParams<{ id: string }>();
    const kbId = params.id ?? "";
    const t = useTranslations("kb.chat");

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);

    const [models, setModels] = useState<ModelOption[]>([]);
    const [modelsLoading, setModelsLoading] = useState(true);
    const [modelsError, setModelsError] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

    const abortControllerRef = useRef<AbortController | null>(null);
    const latestAssistantIdRef = useRef<string | null>(null);
    const assistantContentRef = useRef<string>("");
    const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadModels() {
            setModelsLoading(true);
            setModelsError(null);

            try {
                const response = await fetch("/api/models");
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = (await response.json()) as { models?: unknown };
                const normalized = normalizeModels(data.models);
                if (!cancelled) {
                    setModels(normalized);
                    if (normalized.length === 0) {
                        setSelectedModel("");
                        return;
                    }

                    setSelectedModel((current) => {
                        if (current && normalized.some((option) => option.id === current)) {
                            return current;
                        }

                        if (
                            DEFAULT_MODEL &&
                            normalized.some((option) => option.id === DEFAULT_MODEL)
                        ) {
                            return DEFAULT_MODEL;
                        }

                        return normalized[0]?.id ?? "";
                    });
                }
            } catch (error) {
                console.warn("[chat] Failed to load models", error);
                if (!cancelled) {
                    setModelsError(t("modelsError"));
                }
            } finally {
                if (!cancelled) {
                    setModelsLoading(false);
                }
            }
        }

        loadModels();

        return () => {
            cancelled = true;
            abortControllerRef.current?.abort();
        };
    }, [t]);

    useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const trimmedInput = input.trim();
    const canSend =
        !isStreaming &&
        trimmedInput.length > 0 &&
        kbId.length > 0 &&
        selectedModel.trim().length > 0;

    function handleStop() {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        latestAssistantIdRef.current = null;
        setIsStreaming(false);
        setStreamError(t("errorAborted"));
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canSend) return;

        const question = input.trim();
        if (!selectedModel) {
            setStreamError(t("errorModelRequired"));
            return;
        }

        setInput("");
        setStreamError(null);

        const userMessage: ChatMessage = {
            id: createId(),
            role: "user",
            content: question,
        };

        const assistantMessage: ChatMessage = {
            id: createId(),
            role: "assistant",
            content: "",
        };

        latestAssistantIdRef.current = assistantMessage.id;
        assistantContentRef.current = "";
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setIsStreaming(true);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kbId, question, model: selectedModel }),
                signal: controller.signal,
            });

            if (!response.ok || !response.body) {
                let message = t("errorGeneric");
                try {
                    const payload = (await response.json()) as { error?: string };
                    if (payload?.error) {
                        message = payload.error;
                    }
                } catch (error) {
                    console.warn("[chat] Unable to parse error payload", error);
                    try {
                        const fallbackText = await response.text();
                        if (fallbackText) {
                            message = fallbackText;
                        }
                    } catch {}
                }
                setStreamError(message || t("errorGeneric"));
                finalizeAssistantResponse("");
                return;
            }

            await consumeEventStream(response, (delta) => {
                appendAssistant(delta);
            });

            finalizeAssistantResponse();
        } catch (error) {
            if (controller.signal.aborted) {
                setStreamError(t("errorAborted"));
            } else {
                console.error("[chat] Streaming error", error);
                setStreamError(t("errorGeneric"));
            }
            finalizeAssistantResponse();
        } finally {
            abortControllerRef.current = null;
            latestAssistantIdRef.current = null;
            setIsStreaming(false);
        }
    }

    function appendAssistant(chunk: string) {
        if (!latestAssistantIdRef.current || !chunk) return;

        assistantContentRef.current += chunk;

        setMessages((prev) =>
            prev.map((message) => {
                if (message.id !== latestAssistantIdRef.current) {
                    return message;
                }
                return {
                    ...message,
                    content: message.content + chunk,
                };
            }),
        );
    }

    function finalizeAssistantResponse() {
        if (!latestAssistantIdRef.current) {
            return;
        }

        const finalContent = assistantContentRef.current.trim().length > 0
            ? assistantContentRef.current
            : t("messageEmpty");

        setMessages((prev) =>
            prev.map((message) => {
                if (message.id !== latestAssistantIdRef.current) {
                    return message;
                }

                return {
                    ...message,
                    content: finalContent,
                };
            }),
        );
    }

    const modelSelector = models.length > 0 ? (
        <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value)}
            disabled={modelsLoading || isStreaming}
        >
            {models.map((option) => (
                <option key={option.id} value={option.id}>
                    {option.label}
                </option>
            ))}
        </select>
    ) : (
        <input
            className="w-full rounded border px-3 py-2 text-sm"
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value)}
            placeholder={t("modelsPlaceholder")}
            disabled={isStreaming}
        />
    );

    return (
        <section className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold">{t("title")}</h1>
                <p className="text-muted-foreground">{t("description", { id: kbId })}</p>
            </header>

            <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("historyTitle")}
                </h2>
                <div className="mt-4 flex max-h-[360px] flex-col gap-4 overflow-y-auto rounded-lg bg-muted/40 p-4">
                    {messages.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("empty")}</p>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl border px-3 py-2 text-sm leading-relaxed shadow-sm ${
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background text-foreground"
                                    }`}
                                >
                                    {message.content.trim().length > 0
                                        ? message.content
                                        : message.role === "assistant" && isStreaming
                                            ? t("messageStreaming")
                                            : t("messageEmpty")}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={scrollAnchorRef} />
                </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t("modelsLabel")}</span>
                        {modelSelector}
                        {modelsLoading ? (
                            <span className="text-xs text-muted-foreground">{t("modelsLoading")}</span>
                        ) : modelsError ? (
                            <span className="text-xs text-red-600">{modelsError}</span>
                        ) : null}
                    </label>
                </div>

                <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("label")}</span>
                    <textarea
                        className="min-h-[120px] rounded border px-3 py-2 text-sm"
                        placeholder={t("placeholder")}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        disabled={!kbId || isStreaming}
                        required
                    />
                </label>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="submit"
                        className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                        disabled={!canSend}
                    >
                        {isStreaming ? t("loading") : t("submit")}
                    </button>

                        {isStreaming ? (
                        <button
                            type="button"
                            onClick={handleStop}
                            className="rounded border px-3 py-2 text-sm font-medium"
                        >
                            {t("stop")}
                        </button>
                    ) : null}

                    {streamError ? (
                        <span className="text-sm text-red-600">{streamError}</span>
                    ) : null}
                </div>
            </form>
        </section>
    );
}

async function consumeEventStream(response: Response, onDelta: (delta: string) => void) {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let doneStreaming = false;

    const processBuffer = (flush = false) => {
        const segments = buffer.split("\n\n");
        buffer = flush ? "" : segments.pop() ?? "";

        for (const segment of segments) {
            const lines = segment.split("\n");
            for (const line of lines) {
                if (!line.startsWith("data:")) continue;
                const data = line.slice(5).trim();
                if (!data) continue;

                if (data === "[DONE]") {
                    doneStreaming = true;
                    return;
                }

                const fragment = extractContentDelta(data);
                if (fragment) {
                    onDelta(fragment);
                }
            }
        }
    };

    while (!doneStreaming) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        processBuffer();
    }

    const flushed = decoder.decode();
    if (flushed) {
        buffer += flushed;
    }

    if (buffer.length > 0 && !doneStreaming) {
        processBuffer(true);
    }
}

function extractContentDelta(rawData: string): string {
    try {
        const payload = JSON.parse(rawData) as Record<string, unknown>;

        const choices = payload.choices;
        if (Array.isArray(choices) && choices.length > 0) {
            const choice = choices[0] as Record<string, unknown>;
            const delta = choice.delta ?? choice.message ?? choice;
            const content = extractContentField(delta);
            if (content) return content;
        }

        const message = payload.message;
        if (message) {
            const content = extractContentField(message);
            if (content) return content;
        }

        if (typeof payload.response === "string") {
            return payload.response;
        }

        if (typeof payload.text === "string") {
            return payload.text;
        }
    } catch (error) {
        console.warn("[chat] Failed to parse SSE payload", error, rawData);
    }

    return "";
}

function extractContentField(source: unknown): string {
    if (!source) return "";
    if (typeof source === "string") return source;

    if (typeof source === "object") {
        const record = source as Record<string, unknown>;
        const direct = record.content;
        if (typeof direct === "string") {
            return direct;
        }
        if (Array.isArray(direct)) {
            return direct
                .map((entry) => {
                    if (!entry) return "";
                    if (typeof entry === "string") return entry;
                    if (typeof entry === "object" && "text" in entry && typeof (entry as { text?: unknown }).text === "string") {
                        return (entry as { text: string }).text;
                    }
                    return "";
                })
                .join("");
        }
    }

    return "";
}

function normalizeModels(models: unknown): ModelOption[] {
    if (!Array.isArray(models)) {
        return [];
    }

    return models
        .map((model) => {
            if (!model || typeof model !== "object") return null;
            const record = model as Record<string, unknown>;
            const id = typeof record.id === "string" && record.id.length > 0
                ? record.id
                : typeof record.name === "string"
                    ? record.name
                    : null;
            if (!id) return null;

            const meta = record.meta;
            let label = id;
            if (typeof record.name === "string" && record.name.length > 0) {
                label = record.name;
            } else if (meta && typeof meta === "object" && typeof (meta as Record<string, unknown>).display_name === "string") {
                label = (meta as Record<string, unknown>).display_name as string;
            }

            return { id, label } satisfies ModelOption;
        })
        .filter(Boolean) as ModelOption[];
}

function createId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
}
