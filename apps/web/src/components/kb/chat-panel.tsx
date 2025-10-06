"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

import { LiveMessage } from "@/components/a11y/live-message";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ChatStatus } from "ai";
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ui/shadcn-io/ai/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/shadcn-io/ai/conversation";
import { Message, MessageContent } from "@/components/ui/shadcn-io/ai/message";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { Loader } from "@/components/ui/shadcn-io/ai/loader";
import { Action } from "@/components/ui/shadcn-io/ai/actions";
import { Suggestions, Suggestion } from "@/components/ui/shadcn-io/ai/suggestion";
import { cn } from "@/lib/utils";
import {
  CHAT_CONVERSATIONS_UPDATED_EVENT,
  CHAT_CONVERSATION_RESET_REQUESTED_EVENT,
} from "@/lib/chat-events";
import { SquareIcon } from "lucide-react";

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
};

export function KnowledgeBaseChatPanel({ kbId, className }: KnowledgeBaseChatPanelProps) {
  const t = useTranslations("kb.chat");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
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
  const pendingConversationIdRef = useRef<string | null>(null);
  const skipSearchParamSyncRef = useRef(false);
  const previousKbIdRef = useRef(kbId);
  const currentKbIdRef = useRef(kbId);
  const activeConversationIdRef = useRef<string | null>(null);
  const loadConversationControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    currentKbIdRef.current = kbId;
  }, [kbId]);

  useEffect(() => {
    return () => {
      loadConversationControllerRef.current?.abort();
      loadConversationControllerRef.current = null;
    };
  }, []);

  const emitConversationsUpdated = useCallback(
    (conversations?: ConversationSummary[]) => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent(CHAT_CONVERSATIONS_UPDATED_EVENT, {
          detail: {
            conversations: conversations ?? null,
          },
        }),
      );
    },
    [],
  );

  const setActiveConversationId = useCallback(
    (conversationId: string | null, options?: { syncSearchParams?: boolean }) => {
      const shouldSync = options?.syncSearchParams ?? true;

      // Skip the next search-param synchronisation pass when we intentionally avoid syncing the URL.
      skipSearchParamSyncRef.current = !shouldSync;

      setActiveConversationIdState((current) => {
        if (current === conversationId) {
          return current;
        }
        return conversationId;
      });

      activeConversationIdRef.current = conversationId;

      if (!shouldSync) {
        return;
      }

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
    [router, searchParams],
  );

  const updateStatus = useCallback((message: string, tone: LiveTone = "polite") => {
    setStatusTone(tone);
    setStatusMessage(message);
  }, []);

  useEffect(() => {
    updateStatus(t("status"));
  }, [t, updateStatus]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleReset(event: Event) {
      const customEvent = event as CustomEvent<{ kbId?: string }>;
      const targetKbId = customEvent.detail?.kbId;

      if (targetKbId && targetKbId !== kbId) {
        return;
      }

      skipSearchParamSyncRef.current = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      latestAssistantIdRef.current = null;
      assistantContentRef.current = "";
      pendingConversationIdRef.current = null;
      setMessages([]);
      setInput("");
      setStreamError(null);
      setIsStreaming(false);
      setFocusTargetId(null);
      updateStatus(t("status"));
      setActiveConversationId(null);
    }

    window.addEventListener(
      CHAT_CONVERSATION_RESET_REQUESTED_EVENT,
      handleReset as EventListener,
    );

    return () => {
      window.removeEventListener(
        CHAT_CONVERSATION_RESET_REQUESTED_EVENT,
        handleReset as EventListener,
      );
    };
  }, [kbId, setActiveConversationId, t, updateStatus]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      loadConversationControllerRef.current?.abort();
      const controller = new AbortController();
      loadConversationControllerRef.current = controller;

      try {
        updateStatus(t("statusLoading"));
        const response = await fetch(`/api/kb/${kbId}/chat/conversations/${conversationId}` , {
          signal: controller.signal,
        });
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

        if (
          currentKbIdRef.current !== kbId ||
          activeConversationIdRef.current !== conversationId
        ) {
          return;
        }

        setActiveConversationId(data.conversation.id, { syncSearchParams: false });
        setSelectedModel((current) => data.conversation?.model ?? current);
        const mappedMessages = data.conversation.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          sequence: message.sequence,
        }));
        if (
          currentKbIdRef.current !== kbId ||
          activeConversationIdRef.current !== conversationId
        ) {
          return;
        }

        setMessages(mappedMessages);
        if (mappedMessages.length > 0) {
          setFocusTargetId(mappedMessages[mappedMessages.length - 1]?.id ?? null);
        }
        setStreamError(null);
        updateStatus(t("status"));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.warn("[chat] Failed to load conversation", error);
        setStreamError(t("historyLoadError"));
      } finally {
        if (loadConversationControllerRef.current === controller) {
          loadConversationControllerRef.current = null;
        }
      }
    },
    [kbId, t, updateStatus, setActiveConversationId],
  );

  useEffect(() => {
    const conversationParam = searchParams?.get("conversation");

    if (skipSearchParamSyncRef.current) {
      skipSearchParamSyncRef.current = false;
      return;
    }

    if (!conversationParam) {
      if (activeConversationId !== null) {
        setActiveConversationId(null, { syncSearchParams: false });
      }
      return;
    }

    if (conversationParam === activeConversationId) {
      return;
    }

    setActiveConversationId(conversationParam, { syncSearchParams: false });
    void loadConversation(conversationParam);
  }, [searchParams, activeConversationId, loadConversation, setActiveConversationId]);

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetch(`/api/kb/${kbId}/chat/conversations`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as { conversations?: ConversationSummary[] };
      const list = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(list);
      emitConversationsUpdated(list);
    } catch (error) {
      console.warn("[chat] Failed to load conversations", error);
    }
  }, [kbId, emitConversationsUpdated]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (previousKbIdRef.current === kbId) {
      return;
    }

    previousKbIdRef.current = kbId;

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    latestAssistantIdRef.current = null;
    assistantContentRef.current = "";
    pendingConversationIdRef.current = null;
    skipSearchParamSyncRef.current = false;

    setConversations([]);
    setInput("");
    setActiveConversationId(null);
  }, [kbId, setActiveConversationId]);

  useEffect(() => {
    if (activeConversationId !== null) {
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    latestAssistantIdRef.current = null;
    assistantContentRef.current = "";
    pendingConversationIdRef.current = null;
    setMessages([]);
    setStreamError(null);
    setIsStreaming(false);
    setFocusTargetId(null);
    updateStatus(t("status"));
  }, [activeConversationId, t, updateStatus]);

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

  const currentModelValue = selectedModel ?? "";

  const canSend = useMemo(() => {
    return (
      !isStreaming &&
      input.trim().length > 0 &&
      kbId.length > 0 &&
      currentModelValue.trim().length > 0
    );
  }, [input, isStreaming, kbId.length, currentModelValue]);

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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kbId,
          question,
          model: currentModelValue,
          conversationId: activeConversationId ?? undefined,
        }),
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
          } catch {
            // ignore secondary parsing failures
          }
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
        setActiveConversationId(conversationHeader, { syncSearchParams: false });
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
      setActiveConversationId(conversationId, { syncSearchParams: true });
      void loadConversations();
      void loadConversation(conversationId);
    } else {
      void loadConversations();
    }
  }


  const baseId = useMemo(() => `kb-chat-${kbId}`, [kbId]);
  const headingId = `${baseId}-heading`;
  const descriptionId = `${baseId}-description`;
  const conversationTitleId = `${baseId}-conversation-title`;
  const conversationStatusId = `${baseId}-conversation-status`;
  const modelSelectId = `${baseId}-model-select`;
  const modelStatusId = `${baseId}-model-status`;
  const messageFieldId = `${baseId}-message`;
  const errorMessageId = `${baseId}-error`;

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
  const quickSuggestions = useMemo(() => {
    const meta = activeConversation?.meta;
    if (!meta || typeof meta !== "object") {
      return [] as string[];
    }

    const raw = (meta as { suggestions?: unknown }).suggestions;
    if (!Array.isArray(raw)) {
      return [] as string[];
    }

    return raw
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 4);
  }, [activeConversation]);
  const chatStatus: ChatStatus | undefined = streamError
    ? "error"
    : isStreaming
      ? "streaming"
      : undefined;
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setInput(suggestion);

      if (typeof window !== "undefined") {
        const textarea = document.getElementById(messageFieldId) as HTMLTextAreaElement | null;
        textarea?.focus();
      }
    },
    [messageFieldId],
  );

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      className={cn("flex min-h-[540px] w-full flex-col gap-6", className)}
    >
      <Card className="flex h-full flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-2">
            <h1 id={headingId} className="text-2xl font-semibold">
              {t("title")}
            </h1>
            <p id={descriptionId} className="text-sm text-muted-foreground">
              {t("description", { id: kbId })}
            </p>
            <p className="text-xs text-muted-foreground">{statusDisplay}</p>
          </div>
        </div>

        <LiveMessage id={conversationStatusId} tone={statusTone} visuallyHidden>
          {statusDisplay}
        </LiveMessage>

        <div className="flex-1">
          <div className="flex min-h-[260px] flex-col gap-6">
            <div>
              <h2 id={conversationTitleId} className="text-sm font-semibold text-foreground">
                {activeConversationTitle}
              </h2>
              {activeConversation?.model ? (
                <p className="text-xs text-muted-foreground">{activeConversation.model}</p>
              ) : null}
            </div>

            {messages.length > 0 ? (
              <Conversation
                aria-labelledby={conversationTitleId}
                aria-describedby={conversationStatusId}
                aria-busy={isStreaming ? "true" : "false"}
                className="flex-1 rounded-2xl border border-border/40 bg-card/80"
              >
                <ConversationContent className="flex flex-1 flex-col gap-4 p-6">
                  {messages.map((message) => (
                    <ChatMessageItem
                      key={message.id ?? `${message.sequence}`}
                      message={message}
                      shouldFocus={focusTargetId === message.id}
                      onFocusComplete={() => setFocusTargetId(null)}
                      assistantLabel={t("messageAssistantLabel")}
                      userLabel={t("messageUserLabel")}
                      streamingLabel={t("messageStreaming")}
                      emptyLabel={t("messageEmpty")}
                    />
                  ))}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            ) : null}

            <PromptInput onSubmit={handleSubmit} aria-busy={isStreaming ? "true" : "false"} className="mt-2">
              <PromptInputToolbar className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-col gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t("modelsLabel")}</span>
                  {models.length > 0 ? (
                    <PromptInputModelSelect
                      value={currentModelValue || undefined}
                      onValueChange={setSelectedModel}
                      disabled={isStreaming}
                    >
                      <PromptInputModelSelectTrigger
                        id={modelSelectId}
                        aria-describedby={modelDescribedBy}
                        aria-invalid={modelsError ? "true" : undefined}
                        aria-label={t("modelsAriaLabel")}
                      >
                        <PromptInputModelSelectValue placeholder={t("modelsPlaceholder")} />
                      </PromptInputModelSelectTrigger>
                      <PromptInputModelSelectContent>
                        {models.map((option) => (
                          <PromptInputModelSelectItem key={option.id} value={option.id}>
                            {option.label}
                          </PromptInputModelSelectItem>
                        ))}
                      </PromptInputModelSelectContent>
                    </PromptInputModelSelect>
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
                    />
                  )}
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
                </div>
              </PromptInputToolbar>

              <div className="space-y-3 px-4 py-3">
                <label htmlFor={messageFieldId} className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t("label")}</span>
                  <PromptInputTextarea
                    id={messageFieldId}
                    name="message"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && isStreaming) {
                        event.preventDefault();
                        handleStop();
                      }
                    }}
                    placeholder={t("placeholder")}
                    disabled={!kbId || isStreaming || currentModelValue.trim().length === 0}
                    aria-describedby={messageErrorId}
                    aria-invalid={streamError ? "true" : undefined}
                    aria-label={t("label")}
                    className="min-h-[140px]"
                  />
                </label>
                {streamError ? (
                  <LiveMessage
                    id={errorMessageId}
                    tone="assertive"
                    className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 dark:border-red-500/30 dark:text-red-200"
                  >
                    {streamError}
                  </LiveMessage>
                ) : null}
                {quickSuggestions.length > 0 ? (
                  <Suggestions>
                    {quickSuggestions.map((suggestion) => (
                      <Suggestion key={suggestion} suggestion={suggestion} onClick={handleSuggestionClick} />
                    ))}
                  </Suggestions>
                ) : null}
              </div>

              <PromptInputToolbar className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isStreaming ? (
                    <>
                      <Loader size={14} />
                      <span>{t("messageStreaming")}</span>
                    </>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {isStreaming ? (
                    <PromptInputTools className="gap-2">
                      <Action tooltip={t("stop")} label={t("stop")} onClick={handleStop}>
                        <SquareIcon className="size-4" />
                      </Action>
                    </PromptInputTools>
                  ) : null}
                  <PromptInputSubmit
                    status={chatStatus}
                    disabled={!canSend}
                    aria-disabled={!canSend}
                    aria-label={isStreaming ? t("stop") : t("submit")}
                    size="default"
                  />
                </div>
              </PromptInputToolbar>
            </PromptInput>
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

type ChatMessageItemProps = {
  message: ConversationMessage;
  assistantLabel: string;
  userLabel: string;
  streamingLabel: string;
  emptyLabel: string;
  shouldFocus: boolean;
  onFocusComplete: () => void;
};

function ChatMessageItem({
  message,
  assistantLabel,
  userLabel,
  streamingLabel,
  emptyLabel,
  shouldFocus,
  onFocusComplete,
}: ChatMessageItemProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldFocus && contentRef.current) {
      contentRef.current.focus();
      onFocusComplete();
    }
  }, [shouldFocus, onFocusComplete]);

  const isAssistant = message.role === "assistant";
  const trimmedContent = message.content.trim();
  const showLoader = isAssistant && message.isStreaming && trimmedContent.length === 0;

  return (
    <Message from={message.role}>
      <MessageContent className="text-sm leading-relaxed">
        <div
          ref={contentRef}
          tabIndex={shouldFocus ? -1 : undefined}
          aria-live={isAssistant ? "polite" : undefined}
          aria-busy={isAssistant && message.isStreaming ? "true" : undefined}
          aria-label={isAssistant ? assistantLabel : userLabel}
          className="outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary group-[.is-user]:focus-visible:ring-offset-primary"
        >
          {isAssistant ? (
            showLoader ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader size={16} />
                <span>{streamingLabel}</span>
              </div>
            ) : trimmedContent.length > 0 ? (
              <Response>{message.content}</Response>
            ) : (
              <p className="text-muted-foreground">{emptyLabel}</p>
            )
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </MessageContent>
    </Message>
  );
}
