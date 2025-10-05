"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

import { LiveMessage } from "@/components/a11y/live-message";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CHAT_CONVERSATIONS_UPDATED_EVENT } from "@/lib/chat-events";

export const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_CHAT_MODEL ?? "";

type ConversationMessage = {
  id: string | null;
  role: "user" | "assistant";
  content: string;
  sequence: number;
  isStreaming?: boolean;
};

type ModelOption = {
  id: string;
  label: string;
};

type ConversationSummary = {
  id: string;
  title: string;
  model: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  archived: boolean;
  pinned: boolean;
  meta?: Record<string, unknown> | null;
};

type LiveTone = "polite" | "assertive";

type KnowledgeBaseChatPanelProps = {
  kbId: string;
  className?: string;
  activeConversationId?: string | null;
  onConversationChange?: (conversationId: string | null) => void;
};

export function KnowledgeBaseChatPanel({
  kbId,
  className,
  activeConversationId: controlledConversationId,
  onConversationChange,
}: KnowledgeBaseChatPanelProps) {
  const t = useTranslations("kb.chat");
  const searchParams = useSearchParams();
  const router = useRouter();
  const isControlled = typeof onConversationChange === "function";

  const headingId = useId();
  const descriptionId = useId();
  const conversationTitleId = useId();
  const conversationStatusId = useId();
  const modelSelectId = useId();
  const modelStatusId = useId();
  const messageFieldId = useId();
  const errorMessageId = useId();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [internalConversationId, setInternalConversationId] = useState<string | null>(
    searchParams?.get("conversation") ?? null,
  );
  const activeConversationId = isControlled ? controlledConversationId ?? null : internalConversationId;
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const [models, setModels] = useState<ModelOption[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<LiveTone>("polite");
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const latestAssistantIdRef = useRef<string | null>(null);
  const assistantContentRef = useRef<string>("");
  const scrollAnchorRef = useRef<HTMLLIElement | null>(null);
  const initialConversationLoadedRef = useRef(false);
  const pendingConversationIdRef = useRef<string | null>(null);
  const lastLoadedConversationRef = useRef<string | null>(null);
  const emitConversationsUpdated = useCallback(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent(CHAT_CONVERSATIONS_UPDATED_EVENT));
  }, []);

  const setActiveConversationId = useCallback(
    (conversationId: string | null) => {
      if (isControlled) {
        onConversationChange?.(conversationId);
        return;
      }

      setInternalConversationId(conversationId);
      const current = new URLSearchParams(searchParams?.toString());
      if (conversationId) {
        current.set("conversation", conversationId);
      } else {
        current.delete("conversation");
      }
      const query = current.toString();
      const href = query ? `?${query}` : "";
      router.replace(href, { scroll: false });
    },
    [isControlled, onConversationChange, router, searchParams],
  );

  const updateStatus = useCallback((message: string, tone: LiveTone = "polite") => {
    setStatusTone(tone);
    setStatusMessage(message);
  }, []);

  useEffect(() => {
    updateStatus(t("status"));
  }, [t, updateStatus]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        updateStatus(t("statusLoading"));
        const response = await fetch(`/api/kb/${kbId}/chat/conversations/${conversationId}`);
        if (response.status === 404) {
          if (activeConversationId === conversationId) {
            setActiveConversationId(null);
          }
          lastLoadedConversationRef.current = null;
          initialConversationLoadedRef.current = false;
          setMessages([]);
          setFocusTargetId(null);
          setStreamError(t("historyLoadError"));
          updateStatus(t("historyLoadError"), "assertive");
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as {
          conversation?: {
            id: string;
            title: string;
            model: string | null;
            summary: string | null;
            createdAt: string;
            updatedAt: string;
            lastActivityAt: string;
            archived: boolean;
            pinned: boolean;
            meta?: Record<string, unknown> | null;
            messages: Array<{
              id: string;
              role: "user" | "assistant";
              content: string;
              sequence: number;
              createdAt: string;
            }>;
          };
        };

        if (!data.conversation) {
          throw new Error("Missing conversation payload");
        }

        if (data.conversation.id !== activeConversationId) {
          setActiveConversationId(data.conversation.id);
        }
        lastLoadedConversationRef.current = data.conversation.id;
        setSelectedModel((current) => data.conversation?.model ?? current);
        const mappedMessages = data.conversation.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          sequence: message.sequence,
        }));
        setMessages(mappedMessages);
        if (mappedMessages.length > 0) {
          setFocusTargetId(mappedMessages[mappedMessages.length - 1]?.id ?? null);
        }
        setStreamError(null);
        updateStatus(t("status"));
      } catch (error) {
        console.warn("[chat] Failed to load conversation", error);
        setStreamError(t("historyLoadError"));
        updateStatus(t("historyLoadError"), "assertive");
      }
    },
    [activeConversationId, kbId, t, updateStatus, setActiveConversationId],
  );

  const tryAutoSelectConversation = useCallback(
    (items: ConversationSummary[]) => {
      if (initialConversationLoadedRef.current) return;
      if (items.length === 0) return;
      const first = items[0];
      if (!first) return;
      initialConversationLoadedRef.current = true;
      setActiveConversationId(first.id);
      void loadConversation(first.id);
    },
    [loadConversation, setActiveConversationId],
  );

  useEffect(() => {
    if (isControlled) {
      return;
    }

    const conversationParam = searchParams?.get("conversation") ?? null;
    if (conversationParam && conversationParam !== internalConversationId) {
      initialConversationLoadedRef.current = true;
      setInternalConversationId(conversationParam);
      void loadConversation(conversationParam);
      return;
    }

    if (!conversationParam && internalConversationId) {
      setInternalConversationId(null);
    }
  }, [isControlled, searchParams, internalConversationId, loadConversation]);

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    const nextId = controlledConversationId ?? null;
    if (!nextId) {
      return;
    }

    if (lastLoadedConversationRef.current === nextId) {
      return;
    }

    initialConversationLoadedRef.current = true;
    lastLoadedConversationRef.current = nextId;
    void loadConversation(nextId);
  }, [controlledConversationId, isControlled, loadConversation]);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(`/api/kb/${kbId}/chat/conversations`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as { conversations?: ConversationSummary[] };
      const list = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(list);
      tryAutoSelectConversation(list);
      emitConversationsUpdated();
    } catch (error) {
      console.warn("[chat] Failed to load conversations", error);
      setStreamError(t("historyLoadError"));
    }
  }, [emitConversationsUpdated, kbId, t, tryAutoSelectConversation]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

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

          setSelectedModel((current) => {
            if (current && normalized.some((option) => option.id === current)) {
              return current;
            }

            if (DEFAULT_MODEL && normalized.some((option) => option.id === DEFAULT_MODEL)) {
              return DEFAULT_MODEL;
            }

            const preferred = normalized.find((option) => option.id.toLowerCase().includes("llama")) ?? normalized[0];
            return preferred?.id ?? "";
          });
        }
      } catch (error) {
        console.warn("[chat] Failed to load models", error);
        if (!cancelled) {
          const message = t("modelsError");
          setModelsError(message);
          updateStatus(t("announceError", { message }), "assertive");
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
  }, [t, updateStatus]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeConversationId || isStreaming || pendingConversationIdRef.current) {
      return;
    }

    if (messages.length === 0) {
      return;
    }

    setMessages([]);
    setStreamError(null);
    setFocusTargetId(null);
  }, [activeConversationId, isStreaming, messages.length]);


  const currentModelValue = selectedModel ?? "";

  const canSend = useMemo(() => {
    return (
      !isStreaming &&
      input.trim().length > 0 &&
      kbId.length > 0 &&
      currentModelValue.trim().length > 0
    );
  }, [input, isStreaming, kbId.length, currentModelValue]);

  function handleSendButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (!canSend) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleStop() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    latestAssistantIdRef.current = null;
    setIsStreaming(false);

    const abortMessage = t("errorAborted");
    setStreamError(abortMessage);
    updateStatus(t("announceError", { message: abortMessage }), "assertive");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const question = input.trim();
    if (!currentModelValue) {
      const message = t("errorModelRequired");
      setStreamError(message);
      updateStatus(t("announceError", { message }), "assertive");
      return;
    }

    setInput("");
    setStreamError(null);
    updateStatus(t("announceSending"));
    initialConversationLoadedRef.current = true;

    const nextSequence = messages.length;

    const userMessage: ConversationMessage = {
      id: createId(),
      role: "user",
      content: question,
      sequence: nextSequence,
    };

    const assistantMessageId = createId();
    const assistantMessage: ConversationMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      sequence: nextSequence + 1,
      isStreaming: true,
    };

    latestAssistantIdRef.current = assistantMessageId;
    assistantContentRef.current = "";
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setFocusTargetId(assistantMessageId);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const requestBody: Record<string, unknown> = {
        kbId,
        question,
        model: currentModelValue,
      };
      if (activeConversationId) {
        requestBody.conversationId = activeConversationId;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        let message = t("errorGeneric");
        const status = response.status;
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
          } catch {
            // ignore secondary parsing failures
          }
        }
        if (status === 404) {
          setActiveConversationId(null);
          lastLoadedConversationRef.current = null;
          initialConversationLoadedRef.current = false;
        }

        setStreamError(message);
        finalizeAssistantResponse("", {
          message: t("announceError", { message }),
          tone: "assertive",
        }, null);
        return;
      }

      const conversationHeader = response.headers.get("X-Conversation-Id");
      if (conversationHeader && conversationHeader !== activeConversationId) {
        setActiveConversationId(conversationHeader);
      }

      pendingConversationIdRef.current = conversationHeader ?? activeConversationId ?? null;

      await consumeEventStream(response, appendAssistant);

      finalizeAssistantResponse(undefined, undefined, pendingConversationIdRef.current);
    } catch (error) {
      if (controller.signal.aborted) {
        const abortMessage = t("errorAborted");
        setStreamError(abortMessage);
        finalizeAssistantResponse("", {
          message: t("announceError", { message: abortMessage }),
          tone: "assertive",
        }, pendingConversationIdRef.current);
      } else {
        console.error("[chat] Streaming error", error);
        const message = t("errorGeneric");
        setStreamError(message);
        finalizeAssistantResponse("", {
          message: t("announceError", { message }),
          tone: "assertive",
        }, pendingConversationIdRef.current);
      }
    } finally {
      pendingConversationIdRef.current = null;
      abortControllerRef.current = null;
      latestAssistantIdRef.current = null;
      setIsStreaming(false);
    }
  }

  function appendAssistant(chunk: string) {
    if (!latestAssistantIdRef.current || !chunk) return;

    const wasEmpty = assistantContentRef.current.length === 0;
    assistantContentRef.current += chunk;

    if (wasEmpty) {
      updateStatus(t("messageStreaming"));
    }

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

  function finalizeAssistantResponse(
    fallback = "",
    statusOverride?: { message: string; tone?: LiveTone },
    conversationId: string | null = null,
  ) {
    if (!latestAssistantIdRef.current) {
      return;
    }

    const finalContent =
      assistantContentRef.current.trim().length > 0
        ? assistantContentRef.current
        : fallback || t("messageEmpty");

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== latestAssistantIdRef.current) {
          return message;
        }

        return {
          ...message,
          content: finalContent,
          isStreaming: false,
        };
      }),
    );

    assistantContentRef.current = "";

    if (statusOverride) {
      updateStatus(statusOverride.message, statusOverride.tone);
    } else {
      updateStatus(t("announceResponseComplete"));
    }

    if (conversationId) {
      void loadConversations();
      void loadConversation(conversationId);
    } else {
      void loadConversations();
    }
  }


  const defaultStatus = t("status");
  const statusDisplay = statusMessage || defaultStatus;
  const showModelHelper = Boolean(modelsLoading || modelsError);
  const modelHelperText = modelsLoading ? t("modelsLoading") : modelsError ?? "";
  const modelDescribedBy = showModelHelper ? modelStatusId : undefined;
  const messageErrorId = streamError ? errorMessageId : undefined;
  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );
  const activeConversationTitle = activeConversation
    ? activeConversation.title || t("untitledConversation")
    : t("newConversationTitle");

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={cn("flex min-h-[540px] w-full flex-col gap-6", className)}
    >
      <Card className="flex h-full flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 id={headingId} className="text-2xl font-semibold">
              {t("title")}
            </h1>
            <p id={descriptionId} className="text-sm text-muted-foreground">
              {t("description", { id: kbId })}
            </p>
            <p className="text-xs text-muted-foreground">{statusDisplay}</p>
          </div>
          <div className="h-9" />
        </div>

        <LiveMessage id={conversationStatusId} tone={statusTone} visuallyHidden>
          {statusDisplay}
        </LiveMessage>

        {/* Suppression du panneau interne de conversations: la liste est désormais gérée dans la sidebar de gauche (Sources > Chat) */}
        <div className="flex-1">
          <div className="flex min-h-[260px] flex-col gap-4 rounded-3xl border border-border/40 bg-card/90 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 id={conversationTitleId} className="text-sm font-semibold text-foreground">
                  {activeConversationTitle}
                </h2>
                {activeConversation?.model ? (
                  <p className="text-xs text-muted-foreground">{activeConversation.model}</p>
                ) : null}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ul
                className="flex h-full flex-col gap-4 overflow-y-auto overscroll-y-contain pr-1"
                role="list"
                aria-labelledby={conversationTitleId}
                aria-describedby={conversationStatusId}
                aria-live="polite"
                aria-relevant="additions text"
                aria-busy={isStreaming ? "true" : "false"}
              >
                {messages.length === 0 ? (
                  <li
                    className="flex flex-1 flex-col justify-center gap-2 rounded-xl border border-dashed border-border/30 bg-background/60 p-6 text-left text-sm text-muted-foreground dark:border-border/50"
                    role="listitem"
                    aria-label={t("empty")}
                  >
                    <p className="text-base font-semibold text-foreground">{t("empty")}</p>
                    <p className="text-sm text-muted-foreground">{t("emptyHelper")}</p>
                  </li>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id ?? `${message.sequence}`}
                      role={message.role}
                      content={message.content}
                      isStreaming={Boolean(message.isStreaming)}
                      streamingLabel={t("messageStreaming")}
                      emptyLabel={t("messageEmpty")}
                      ariaLabel={
                        message.role === "user"
                          ? t("messageUserLabel")
                          : t("messageAssistantLabel")
                      }
                      shouldFocus={focusTargetId === message.id}
                      onFocusComplete={() => setFocusTargetId(null)}
                    />
                  ))
                )}

                <li ref={scrollAnchorRef} role="presentation" aria-hidden className="h-px" />
              </ul>
            </div>

            <form
              className="space-y-5"
              onSubmit={handleSubmit}
              aria-busy={isStreaming ? "true" : "false"}
            >
              <div className="grid gap-4 sm:grid-cols-2">
              <label htmlFor={modelSelectId} className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t("modelsLabel")}</span>
                <div className="relative">
                  {models.length > 0 ? (
                    <Select
                      value={currentModelValue || undefined}
                      onValueChange={setSelectedModel}
                      disabled={isStreaming}
                    >
                      <SelectTrigger
                        id={modelSelectId}
                        aria-describedby={modelDescribedBy}
                        aria-invalid={modelsError ? "true" : undefined}
                        aria-label={t("modelsAriaLabel")}
                      >
                        <SelectValue placeholder={t("modelsPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={modelSelectId}
                      value={currentModelValue}
                      onChange={(event) => setSelectedModel(event.target.value)}
                      placeholder={t("modelsPlaceholder")}
                      aria-describedby={modelDescribedBy}
                      aria-invalid={modelsError ? "true" : undefined}
                      aria-label={t("modelsAriaLabel")}
                      disabled={isStreaming}
                      className="h-11 rounded-2xl border border-border/40 bg-background px-4 text-sm font-medium text-foreground shadow-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-border/50 dark:bg-slate-950/70"
                    />
                  )}
                </div>

                {showModelHelper ? (
                  <span
                    id={modelStatusId}
                    className={cn(
                      "text-xs",
                      modelsError ? "text-red-600 dark:text-red-300" : "text-muted-foreground",
                    )}
                  >
                    {modelHelperText}
                  </span>
                ) : null}
              </label>
              </div>

              <label htmlFor={messageFieldId} className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t("label")}</span>
                <Textarea
                  id={messageFieldId}
                  name="message"
                  className="min-h-[140px] rounded-2xl border border-border/40 bg-background px-4 py-3 text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border/50 dark:bg-slate-950/70"
                  placeholder={t("placeholder")}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    const isModifier = event.metaKey || event.ctrlKey;
                    if (isModifier && event.key === "Enter") {
                      event.preventDefault();
                      if (canSend) {
                        event.currentTarget.form?.requestSubmit();
                      }
                    }
                    if (event.key === "Escape" && isStreaming) {
                      event.preventDefault();
                      handleStop();
                    }
                  }}
                  disabled={!kbId || isStreaming || currentModelValue.trim().length === 0}
                  aria-describedby={messageErrorId}
                  aria-invalid={streamError ? "true" : undefined}
                  required
                />
              </label>

              {streamError ? (
                <LiveMessage
                  id={errorMessageId}
                  tone="assertive"
                  className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 dark:border-red-500/30 dark:text-red-200"
                >
                  {streamError}
                </LiveMessage>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  size="lg"
                  onClick={handleSendButtonClick}
                  aria-disabled={!canSend}
                  data-disabled={!canSend || undefined}
                  className={cn("rounded-full px-6", !canSend && "cursor-not-allowed opacity-60")}
                >
                  {isStreaming ? t("loading") : t("submit")}
                </Button>

                {isStreaming ? (
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    onClick={handleStop}
                    className="rounded-full px-6"
                  >
                    {t("stop")}
                  </Button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </Card>
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
      if (typeof record.label === "string" && record.label.length > 0) {
        label = record.label;
      } else if (typeof record.name === "string" && record.name.length > 0) {
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
  ariaLabel: string;
  shouldFocus: boolean;
  onFocusComplete: () => void;
};

function MessageBubble({
  role,
  content,
  isStreaming,
  streamingLabel,
  emptyLabel,
  ariaLabel,
  shouldFocus,
  onFocusComplete,
}: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const displayContent = content.trim().length > 0
    ? content
    : role === "assistant" && isStreaming
      ? streamingLabel
      : emptyLabel;

  const wrapperClass = cn("flex", role === "user" ? "justify-end" : "justify-start");
  const bubbleClass = cn(
    "max-w-full rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors sm:max-w-[75%]",
    "break-words break-anywhere",
    role === "user"
      ? "border-primary/40 bg-gradient-to-r from-primary/85 to-primary text-primary-foreground dark:from-primary/90"
      : "border-border/40 bg-card/95 text-foreground dark:bg-slate-950/80",
  );

  useEffect(() => {
    if (shouldFocus && bubbleRef.current) {
      bubbleRef.current.focus();
      onFocusComplete();
    }
  }, [shouldFocus, onFocusComplete]);

  return (
    <li
      role="listitem"
      aria-label={ariaLabel}
      data-role={role}
      className={wrapperClass}
    >
      <article
        ref={bubbleRef}
        className={cn(bubbleClass, "whitespace-pre-wrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60")}
        tabIndex={shouldFocus ? -1 : undefined}
        aria-live={role === "assistant" && isStreaming ? "polite" : undefined}
        aria-busy={role === "assistant" && isStreaming ? "true" : undefined}
      >
        <FormattedMessage content={displayContent} />
      </article>
    </li>
  );
}

type ParsedBlock = { type: "list" | "paragraph"; lines: string[] };

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
