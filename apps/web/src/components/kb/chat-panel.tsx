"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

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
import { ChevronDown, SquareIcon } from "lucide-react";

export const DEFAULT_MODEL = process.env.NEXT_PUBLIC_DEFAULT_CHAT_MODEL ?? "";
const DEFAULT_RERANK_MODEL = process.env.NEXT_PUBLIC_DEFAULT_RERANK_MODEL ?? "";

type ConversationMessage = {
  id: string | null;
  role: "user" | "assistant";
  content: string;
  sequence: number;
  isStreaming?: boolean;
  sources?: RagContextSource[] | null;
};

type RagContextSource = {
  id: string;
  kind: "vector" | "web" | "fallback";
  title: string | null;
  source: string | null;
};

type ModelOption = {
  id: string;
  label: string;
  provider?: string | null;
  source?: "ollama" | "openrouter" | string;
  description?: string | null;
  kind?: "chat" | "rerank";
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
  const pathname = usePathname();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  const [chatModels, setChatModels] = useState<ModelOption[]>([]);
  const [chatModelsLoading, setChatModelsLoading] = useState(true);
  const [chatModelsError, setChatModelsError] = useState<string | null>(null);
  const [selectedChatModel, setSelectedChatModel] = useState(DEFAULT_MODEL);

  const [rerankModels, setRerankModels] = useState<ModelOption[]>([]);
  const [rerankModelsError, setRerankModelsError] = useState<string | null>(null);
  const [selectedRerankModel, setSelectedRerankModel] = useState(DEFAULT_RERANK_MODEL);

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

  useEffect(() => {
    emitConversationsUpdated(conversations);
  }, [conversations, emitConversationsUpdated]);

  const setActiveConversationId = useCallback(
    (conversationId: string | null, options?: { syncSearchParams?: boolean }) => {
      const shouldSync = options?.syncSearchParams ?? true;
      const hasChanged = activeConversationIdRef.current !== conversationId;

      // Skip the next search-param synchronisation pass whenever we update the
      // active conversation from code or intentionally avoid syncing the URL.
      skipSearchParamSyncRef.current = hasChanged || !shouldSync;

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

      const currentParams = searchParams?.toString() ?? "";
      const current = new URLSearchParams(currentParams);
      if (conversationId) {
        current.set("conversation", conversationId);
      } else {
        current.delete("conversation");
      }
      const query = current.toString();
      const nextHref = query ? `${pathname}?${query}` : pathname ?? "/";

      const currentHref = currentParams ? `${pathname}?${currentParams}` : pathname ?? "/";
      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false });
      }
    },
    [router, searchParams, pathname],
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
              meta?: Record<string, unknown> | null;
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

        const { messages: conversationMessages, ...conversationSummary } = data.conversation;

        setConversations((prev) => {
          const nextSummary: ConversationSummary = {
            ...conversationSummary,
            meta: conversationSummary.meta ?? null,
          };
          const existingIndex = prev.findIndex((item) => item.id === nextSummary.id);

          return existingIndex === -1
            ? [...prev, nextSummary]
            : prev.map((item, index) => (index === existingIndex ? { ...item, ...nextSummary } : item));
        });

        setActiveConversationId(data.conversation.id, { syncSearchParams: false });
        setSelectedChatModel((current) => conversationSummary.model ?? current);
        const rerankFromMeta = extractRerankModel(conversationSummary.meta);
        setSelectedRerankModel((current) => {
          if (rerankFromMeta === undefined) {
            return current;
          }
          if (rerankFromMeta === null) {
            return "";
          }
          return rerankFromMeta;
        });
        const mappedMessages = conversationMessages.map((message) => {
          const metaSources = ((message.meta as { sources?: unknown } | null) ?? null)?.sources;
          return {
            id: message.id,
            role: message.role,
            content: message.content,
            sequence: message.sequence,
            sources: normalizeSources(metaSources),
          } satisfies ConversationMessage;
        });
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
      if (conversationParam === activeConversationId) {
        return;
      }
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
    } catch (error) {
      console.warn("[chat] Failed to load conversations", error);
    }
  }, [kbId]);

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

    if (isStreaming || pendingConversationIdRef.current) {
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
  }, [activeConversationId, isStreaming, t, updateStatus]);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      setChatModelsLoading(true);
      setChatModelsError(null);
      setRerankModelsError(null);

      try {
        const response = await fetch("/api/models");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as {
          chatModels?: unknown;
          models?: unknown;
          rerankModels?: unknown;
        };
        const chatList = normalizeModels(data.chatModels ?? data.models, {
          defaultSource: "ollama",
          defaultProvider: "Ollama",
          kind: "chat",
        });
        const rerankList = normalizeModels(data.rerankModels, {
          defaultSource: "openrouter",
          defaultProvider: "OpenRouter",
          kind: "rerank",
        });

        if (!cancelled) {
          setChatModels(chatList);
          setRerankModels(rerankList);

          setSelectedChatModel((current) => {
            if (current && chatList.some((option) => option.id === current)) {
              return current;
            }

            if (DEFAULT_MODEL && chatList.some((option) => option.id === DEFAULT_MODEL)) {
              return DEFAULT_MODEL;
            }

            const preferred =
              chatList.find((option) => option.id.toLowerCase().includes("llama")) ?? chatList[0];
            return preferred?.id ?? "";
          });

          setSelectedRerankModel((current) => {
            if (current && rerankList.some((option) => option.id === current)) {
              return current;
            }

            if (
              DEFAULT_RERANK_MODEL &&
              rerankList.some((option) => option.id === DEFAULT_RERANK_MODEL)
            ) {
              return DEFAULT_RERANK_MODEL;
            }

            return "";
          });
        }
      } catch (error) {
        console.warn("[chat] Failed to load models", error);
        if (!cancelled) {
          const message = t("modelsError");
          setChatModelsError(message);
          setRerankModelsError(t("modelsRerankError"));
          updateStatus(t("announceError", { message }), "assertive");
        }
      } finally {
        if (!cancelled) {
          setChatModelsLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      cancelled = true;
      abortControllerRef.current?.abort();
    };
  }, [t, updateStatus]);

  const currentChatModel = selectedChatModel ?? "";
  const currentRerankValue = selectedRerankModel ?? "";

  const canSend = useMemo(() => {
    return (
      !isStreaming &&
      input.trim().length > 0 &&
      kbId.length > 0 &&
      currentChatModel.trim().length > 0
    );
  }, [input, isStreaming, kbId.length, currentChatModel]);

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
      const metaPayload: Record<string, unknown> = {};
      if (currentRerankValue) {
        metaPayload.rerankModel = currentRerankValue;
      } else {
        metaPayload.rerankModel = null;
      }

      const payload: Record<string, unknown> = {
        kbId,
        question,
        model: currentChatModel,
        conversationId: activeConversationId ?? undefined,
      };
      if (currentRerankValue) {
        payload.rerankModel = currentRerankValue;
      }
      if (Object.keys(metaPayload).length > 0) {
        payload.meta = metaPayload;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      let contextSources: RagContextSource[] | null = null;
      const sourcesHeader = response.headers.get("X-Rag-Sources");
      if (sourcesHeader) {
        try {
          contextSources = normalizeSources(JSON.parse(sourcesHeader) as unknown);
        } catch (error) {
          console.warn("[chat] Failed to parse X-Rag-Sources", error);
        }
      }

      if (contextSources && contextSources.length > 0) {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessageId ? { ...message, sources: contextSources } : message,
          ),
        );
      }

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
  const rerankSelectId = `${baseId}-rerank-select`;
  const rerankStatusId = `${baseId}-rerank-status`;
  const messageFieldId = `${baseId}-message`;
  const errorMessageId = `${baseId}-error`;

  const defaultStatus = t("status");
  const statusDisplay = statusMessage || defaultStatus;
  const sourceLabels = useMemo(
    () => ({
      heading: t("sourcesHeading"),
      vector: t("sourceKindVector"),
      web: t("sourceKindWeb"),
      fallback: t("sourceKindFallback"),
      open: t("sourceLinkLabel"),
      unknown: t("sourceUnknown"),
    }),
    [t],
  );
  const rerankModelsLoading = chatModelsLoading && rerankModels.length === 0;
  const showChatModelHelper = Boolean(chatModelsLoading || chatModelsError);
  const chatModelHelperText = chatModelsLoading ? t("modelsLoading") : chatModelsError ?? "";
  const modelDescribedBy = showChatModelHelper ? modelStatusId : undefined;
  const showRerankHelper = Boolean(rerankModelsLoading || rerankModelsError);
  const rerankModelHelperText = rerankModelsLoading ? t("modelsRerankLoading") : rerankModelsError ?? "";
  const rerankModelDescribedBy = showRerankHelper ? rerankStatusId : undefined;
  const messageErrorId = streamError ? errorMessageId : undefined;
  const rerankOptions = useMemo(() => {
    const noneOption: ModelOption = {
      id: "",
      label: t("modelsRerankNone"),
      provider: null,
      source: "none",
      description: t("modelsRerankNoneDescription"),
      kind: "rerank",
    };
    return [noneOption, ...rerankModels];
  }, [rerankModels, t]);
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
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 py-4 sm:px-6 lg:px-0",
        className,
      )}
    >
      <Card className="flex h-full flex-col gap-6 rounded-3xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:p-6">
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
            <h2
              id={conversationTitleId}
              data-testid="chat-conversation-title"
              className="text-sm font-semibold text-foreground"
            >
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
                className="flex-1 overflow-hidden rounded-2xl border border-border/40 bg-card/80"
              >
                <ConversationContent className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
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
                      sourceLabels={sourceLabels}
                    />
                  ))}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            ) : null}

            <PromptInput onSubmit={handleSubmit} aria-busy={isStreaming ? "true" : "false"} className="mt-2">
              <PromptInputToolbar className="flex flex-col gap-4 px-4 py-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("modelsLabel")}</span>
                    {chatModels.length > 0 ? (
                      <PromptInputModelSelect
                        value={currentChatModel || undefined}
                        onValueChange={setSelectedChatModel}
                        disabled={isStreaming}
                      >
                        <PromptInputModelSelectTrigger
                          id={modelSelectId}
                          aria-describedby={modelDescribedBy}
                          aria-invalid={chatModelsError ? "true" : undefined}
                          aria-label={t("modelsAriaLabel")}
                        >
                          <PromptInputModelSelectValue placeholder={t("modelsPlaceholder")} />
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent>
                          {chatModels.map((option) => {
                            const secondary =
                              option.source === "openrouter"
                                ? `${option.provider ?? "OpenRouter"} • OpenRouter`
                                : option.provider ?? "Ollama (local)";

                            return (
                              <PromptInputModelSelectItem key={option.id} value={option.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">{option.label}</span>
                                  <span className="text-xs text-muted-foreground">{secondary}</span>
                                  {option.description ? (
                                    <span className="text-[11px] text-muted-foreground/80">
                                      {option.description}
                                    </span>
                                  ) : null}
                                </div>
                              </PromptInputModelSelectItem>
                            );
                          })}
                        </PromptInputModelSelectContent>
                      </PromptInputModelSelect>
                    ) : (
                      <Input
                        id={modelSelectId}
                        value={currentChatModel}
                        onChange={(event) => setSelectedChatModel(event.target.value)}
                        placeholder={t("modelsPlaceholder")}
                        aria-describedby={modelDescribedBy}
                        aria-invalid={chatModelsError ? "true" : undefined}
                        aria-label={t("modelsAriaLabel")}
                        disabled={isStreaming}
                      />
                    )}
                    {showChatModelHelper ? (
                      <span
                        id={modelStatusId}
                        className={cn(
                          "text-xs",
                          chatModelsError ? "text-red-600 dark:text-red-300" : "text-muted-foreground",
                        )}
                      >
                        {chatModelHelperText}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{t("modelsRerankLabel")}</span>
                    {rerankOptions.length > 0 ? (
                      <PromptInputModelSelect
                        value={currentRerankValue}
                        onValueChange={setSelectedRerankModel}
                        disabled={isStreaming}
                      >
                        <PromptInputModelSelectTrigger
                          id={rerankSelectId}
                          aria-describedby={rerankModelDescribedBy}
                          aria-invalid={rerankModelsError ? "true" : undefined}
                          aria-label={t("modelsRerankAriaLabel")}
                        >
                          <PromptInputModelSelectValue placeholder={t("modelsRerankPlaceholder")} />
                        </PromptInputModelSelectTrigger>
                        <PromptInputModelSelectContent>
                          {rerankOptions.map((option) => {
                            const key = option.id || "none";
                            let secondary = option.provider ?? "";
                            if (option.source === "openrouter") {
                              secondary = `${option.provider ?? "OpenRouter"} • OpenRouter`;
                            } else if (option.id === "") {
                              secondary = t("modelsRerankNoneSecondary");
                            }
                            return (
                              <PromptInputModelSelectItem key={key} value={option.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">{option.label}</span>
                                  {secondary ? (
                                    <span className="text-xs text-muted-foreground">{secondary}</span>
                                  ) : null}
                                  {option.description ? (
                                    <span className="text-[11px] text-muted-foreground/80">
                                      {option.description}
                                    </span>
                                  ) : null}
                                </div>
                              </PromptInputModelSelectItem>
                            );
                          })}
                        </PromptInputModelSelectContent>
                      </PromptInputModelSelect>
                    ) : (
                      <Input
                        id={rerankSelectId}
                        value={currentRerankValue}
                        onChange={(event) => setSelectedRerankModel(event.target.value)}
                        placeholder={t("modelsRerankPlaceholder")}
                        aria-describedby={rerankModelDescribedBy}
                        aria-invalid={rerankModelsError ? "true" : undefined}
                        aria-label={t("modelsRerankAriaLabel")}
                        disabled={isStreaming}
                      />
                    )}
                    {showRerankHelper ? (
                      <span
                        id={rerankStatusId}
                        className={cn(
                          "text-xs",
                          rerankModelsError ? "text-red-600 dark:text-red-300" : "text-muted-foreground",
                        )}
                      >
                        {rerankModelHelperText}
                      </span>
                    ) : null}
                  </div>
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

function extractRerankModel(meta: unknown): string | null | undefined {
  if (!meta || typeof meta !== "object") {
    return undefined;
  }
  const value = (meta as Record<string, unknown>).rerankModel;
  if (typeof value === "string") {
    return value;
  }
  if (value === null) {
    return null;
  }
  return undefined;
}

function normalizeModels(
  models: unknown,
  options: { defaultSource?: string; defaultProvider?: string; kind?: ModelOption["kind"] } = {},
): ModelOption[] {
  if (!Array.isArray(models)) {
    return [];
  }

  const defaultSource = options.defaultSource ?? "ollama";
  const defaultProvider = options.defaultProvider ?? null;

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

      let provider: string | null = null;
      if (typeof record.provider === "string") {
        provider = record.provider;
      } else if (meta && typeof meta === "object" && typeof (meta as Record<string, unknown>).provider === "string") {
        provider = (meta as Record<string, unknown>).provider as string;
      }

      let source: string | undefined;
      if (typeof record.source === "string") {
        source = record.source;
      } else if (meta && typeof meta === "object" && typeof (meta as Record<string, unknown>).source === "string") {
        source = (meta as Record<string, unknown>).source as string;
      }

      let description: string | null = null;
      if (typeof record.description === "string") {
        description = record.description;
      } else if (meta && typeof meta === "object" && typeof (meta as Record<string, unknown>).description === "string") {
        description = (meta as Record<string, unknown>).description as string;
      }

      if (!source) {
        source = defaultSource;
      }
      if (!provider && defaultProvider) {
        provider = defaultProvider;
      }

      return {
        id,
        label,
        provider,
        source,
        description,
        kind: options.kind,
      } satisfies ModelOption;
    })
    .filter(Boolean) as ModelOption[];
}

function normalizeSources(value: unknown): RagContextSource[] | null {
  if (!value) return null;
  const list = Array.isArray(value) ? value : (typeof value === "object" && Array.isArray((value as { sources?: unknown }).sources))
    ? ((value as { sources: unknown[] }).sources)
    : null;

  if (!list) return null;

  const normalized = list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : undefined;
      const kind = record.kind === "web" || record.kind === "fallback" || record.kind === "vector"
        ? record.kind
        : "vector";
      const title = typeof record.title === "string" ? record.title : null;
      const source = typeof record.source === "string" ? record.source : null;
      return {
        id: id ?? `${kind}-${createId()}`,
        kind,
        title,
        source,
      } satisfies RagContextSource;
    })
    .filter(Boolean) as RagContextSource[];

  return normalized.length > 0 ? normalized : null;
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
  sourceLabels: SourceLabels;
};

type SourceLabels = {
  heading: string;
  vector: string;
  web: string;
  fallback: string;
  open: string;
  unknown: string;
};

function ChatMessageItem({
  message,
  assistantLabel,
  userLabel,
  streamingLabel,
  emptyLabel,
  shouldFocus,
  onFocusComplete,
  sourceLabels,
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
  const sources = isAssistant && Array.isArray(message.sources) ? message.sources ?? null : null;
  const hasSources = Boolean(sources && sources.length > 0);
  const kindLabels: Record<RagContextSource["kind"], string> = {
    vector: sourceLabels.vector,
    web: sourceLabels.web,
    fallback: sourceLabels.fallback,
  };

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

          {hasSources ? (
            <div className="mt-3">
              <details className="group rounded-lg border border-border/40 bg-muted/20 p-3">
                <summary className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {sourceLabels.heading}
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 ease-out group-open:-rotate-180" />
                </summary>
                <ul className="mt-2 space-y-2 text-xs">
                  {sources!.map((source, index) => {
                    const displayLabel = source.title?.trim() || source.source?.trim() || `${kindLabels[source.kind]} ${index + 1}`;
                    const kindLabel = kindLabels[source.kind] ?? sourceLabels.vector;
                    return (
                      <li
                        key={source.id || `${source.kind}-${index}`}
                        className="rounded-md bg-background/80 p-2 text-muted-foreground"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-foreground">{displayLabel ?? sourceLabels.unknown}</span>
                          <span className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                            {kindLabel}
                          </span>
                        </div>
                        {source.source ? (
                          <a
                            className="mt-1 inline-flex text-[11px] text-primary hover:underline"
                            href={source.source}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {sourceLabels.open}
                          </a>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </details>
            </div>
          ) : null}
        </div>
      </MessageContent>
    </Message>
  );
}
