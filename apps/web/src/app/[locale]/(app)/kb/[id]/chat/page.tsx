"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, NotebookPen } from "lucide-react";

import { cn } from "@/lib/utils";

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
                    if (!DEFAULT_MODEL && normalized.length > 0) {
                        setSelectedModel(normalized[0].id);
                    }
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

    const canSend = useMemo(() => {
        return !isStreaming && input.trim().length > 0 && kbId.length > 0;
    }, [input, isStreaming, kbId.length]);

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

    const streamingAssistantId = latestAssistantIdRef.current;

    const modelSelector = models.length > 0 ? (
        <div className="relative">
            <select
                className="w-full appearance-none rounded-xl border border-border/50 bg-slate-950/70 px-4 py-2 pr-10 text-sm font-medium text-foreground shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 hover:border-primary/60 hover:bg-primary/10"
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
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        </div>
    ) : (
        <input
            className="w-full rounded-xl border border-border/50 bg-slate-950/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
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

            <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-[0_32px_120px_-60px_rgba(22,29,60,0.35)] backdrop-blur dark:bg-slate-950/70">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        {t("historyTitle")}
                    </h2>
                    {isStreaming ? (
                        <span className="text-xs text-primary" aria-live="polite">
                            {t("messageStreaming")}
                        </span>
                    ) : null}
                </div>

                <div
                    className="mt-4 flex max-h-[380px] flex-col gap-4 overflow-y-auto rounded-2xl border border-border/40 bg-card/95 p-4 dark:bg-slate-950/60"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions"
                >
                    {messages.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                            <NotebookPen className="h-6 w-6 text-primary/70" aria-hidden />
                            <p>{t("empty")}</p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                role={message.role}
                                content={message.content}
                                isStreaming={isStreaming && streamingAssistantId === message.id}
                                streamingLabel={t("messageStreaming")}
                                emptyLabel={t("messageEmpty")}
                            />
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
                        className="min-h-[140px] resize-y rounded-2xl border border-border/50 bg-slate-950/70 px-4 py-3 text-sm text-foreground shadow-sm transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
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
                        className="rounded-full bg-gradient-to-r from-primary/80 to-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md transition disabled:opacity-50"
                        disabled={!canSend}
                    >
                        {isStreaming ? t("loading") : t("submit")}
                    </button>

                    {isStreaming ? (
                        <button
                            type="button"
                            onClick={handleStop}
                            className="rounded-full border border-border/50 px-5 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                        >
                            {t("stop")}
                        </button>
                    ) : null}

                    {streamError ? (
                        <span className="text-sm text-red-500" role="status">
                            {streamError}
                        </span>
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

type MessageBubbleProps = {
    role: "user" | "assistant";
    content: string;
    isStreaming: boolean;
    streamingLabel: string;
    emptyLabel: string;
};

function MessageBubble({ role, content, isStreaming, streamingLabel, emptyLabel }: MessageBubbleProps) {
    const displayContent = content.trim().length > 0
        ? content
        : role === "assistant" && isStreaming
            ? streamingLabel
            : emptyLabel;

    const wrapperClass = cn("flex", role === "user" ? "justify-end" : "justify-start");
    const bubbleClass = cn(
        "max-w-[80%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors",
        role === "user"
            ? "border-primary/40 bg-gradient-to-r from-primary/85 to-primary text-primary-foreground dark:from-primary/90"
            : "border-border/40 bg-card/95 text-foreground dark:bg-slate-950/80",
    );

    return (
        <div className={wrapperClass}>
            <div className={bubbleClass} role={role === "assistant" ? "article" : undefined}>
                <FormattedMessage content={displayContent} />
            </div>
        </div>
    );
}

function FormattedMessage({ content }: { content: string }) {
    const blocks = parseBlocks(content);

    return (
        <div className="space-y-3">
            {blocks.map((block, index) => {
                if (block.type === "list") {
                    return (
                        <ul key={index} className="list-disc space-y-1 pl-5">
                            {block.lines.map((line, lineIndex) => (
                                <li key={lineIndex} className="text-sm leading-relaxed text-foreground">
                                    {renderInline(line, `${index}-${lineIndex}`)}
                                </li>
                            ))}
                        </ul>
                    );
                }

                return (
                    <p key={index} className="text-sm leading-relaxed text-foreground">
                        {renderParagraph(block.lines)}
                    </p>
                );
            })}
        </div>
    );
}

function renderParagraph(lines: string[]): ReactNode {
    const last = lines.length - 1;
    return lines.map((line, index) => (
        <span key={index}>
            {renderInline(line, `p-${index}`)}
            {index < last ? <br /> : null}
        </span>
    ));
}

function renderInline(input: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = boldRegex.exec(input)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(input.slice(lastIndex, match.index));
        }
        nodes.push(
            <strong key={`${keyPrefix}-bold-${nodes.length}`} className="font-semibold text-primary">
                {match[1]}
            </strong>,
        );
        lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < input.length) {
        nodes.push(input.slice(lastIndex));
    }

    return nodes;
}

type ParsedBlock = { type: "list" | "paragraph"; lines: string[] };

function parseBlocks(content: string): ParsedBlock[] {
    const blocks: ParsedBlock[] = [];

    const rawBlocks = content
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);

    for (const block of rawBlocks) {
        const lines = block
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) continue;

        const isList = lines.every((line) => /^[-*•]\s+/.test(line));

        if (isList) {
            blocks.push({
                type: "list",
                lines: lines.map((line) => line.replace(/^[-*•]\s+/, "").trim()),
            });
            continue;
        }

        blocks.push({ type: "paragraph", lines });
    }

    if (blocks.length === 0) {
        blocks.push({ type: "paragraph", lines: [content] });
    }

    return blocks;
}
