"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { CHAT_CONVERSATIONS_UPDATED_EVENT } from "@/lib/chat-events";
import { useKnowledgeBaseSection } from "./kb-section-context";

interface ChatHistoryNavProps {
  kbId: string;
}

interface ConversationNavItem {
  id: string;
  title: string;
  lastActivityAt: string;
}

const MAX_ITEMS = 30;

export function ChatHistoryNav({ kbId }: ChatHistoryNavProps) {
  const t = useTranslations("kb.chatNav");
  const { activeConversationId, setActiveConversationId, setActiveSection } = useKnowledgeBaseSection();

  const [items, setItems] = useState<ConversationNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/kb/${kbId}/chat/conversations?limit=${MAX_ITEMS}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        conversations?: Array<{ id: string; title: string; lastActivityAt: string }>;
      };

      setItems(
        (data.conversations ?? []).map((conversation) => ({
          id: conversation.id,
          title: conversation.title || t("untitled"),
          lastActivityAt: conversation.lastActivityAt,
        })),
      );
    } catch (err) {
      console.warn("[chat-nav] failed to load history", err);
      setError(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [kbId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function handleUpdate() {
      void load();
    }

    window.addEventListener(CHAT_CONVERSATIONS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(CHAT_CONVERSATIONS_UPDATED_EVENT, handleUpdate);
    };
  }, [load]);

  const formattedItems = items.map((item) => ({
    ...item,
    formattedTime: formatRelativeTime(item.lastActivityAt),
  }));

  const handleDelete = useCallback(
    async (conversationId: string) => {
      if (deletingId) {
        return;
      }

      if (!window.confirm(t("deleteConfirm"))) {
        return;
      }

      setDeletingId(conversationId);
      try {
        const response = await fetch(`/api/kb/${kbId}/chat/conversations/${conversationId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        setItems((prev) => prev.filter((item) => item.id !== conversationId));
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
        }
        setError(null);
        window.dispatchEvent(new CustomEvent(CHAT_CONVERSATIONS_UPDATED_EVENT));
      } catch (err) {
        console.warn("[chat-nav] failed to delete conversation", err);
        setError(t("deleteError"));
      } finally {
        setDeletingId(null);
      }
    },
    [activeConversationId, deletingId, kbId, setActiveConversationId, t],
  );

  return (
    <div className="mt-2 space-y-2 pl-3">
      <p className="pr-3 text-xs font-medium text-[var(--kb-text)]">{t("heading")}</p>

      {loading ? (
        <p className="text-xs text-[var(--kb-text-subtle)]">{t("loading")}</p>
      ) : error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : formattedItems.length === 0 ? (
        <p className="text-xs text-[var(--kb-text-subtle)]">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1" role="list">
          {formattedItems.map((item) => {
            const isActive = item.id === activeConversationId;
            return (
              <li key={item.id} role="listitem">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConversationId(item.id);
                      setActiveSection("chat");
                    }}
                    className={cn(
                      "flex flex-1 flex-col rounded-md px-2 py-1 text-left text-xs transition",
                      isActive
                        ? "bg-[color-mix(in_srgb,var(--kb-highlight)_28%,transparent_72%)] text-[var(--kb-text)]"
                        : "text-[var(--kb-text-subtle)] hover:bg-[color-mix(in_srgb,var(--kb-highlight)_18%,transparent_82%)] hover:text-[var(--kb-text)]",
                    )}
                  >
                    <span className="truncate font-medium">{item.title}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--kb-text-subtle)_80%,transparent_20%)]">
                      {item.formattedTime}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-[var(--kb-text-subtle)] transition",
                      deletingId === item.id
                        ? "cursor-wait opacity-60"
                        : "hover:bg-[color-mix(in_srgb,var(--kb-highlight)_18%,transparent_82%)] hover:text-[var(--kb-text)]",
                    )}
                    aria-label={t("deleteLabel")}
                    onClick={() => handleDelete(item.id)}
                    disabled={Boolean(deletingId)}
                    aria-disabled={Boolean(deletingId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}
