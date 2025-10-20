"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CHAT_CONVERSATIONS_UPDATED_EVENT } from "@/lib/chat-events";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";

interface ChatHistoryNavProps {
  kbId: string;
  onCountChange?: (count: number) => void;
}

interface ConversationNavItem {
  id: string;
  title: string;
  lastActivityAt: string;
}

const MAX_ITEMS = 30;

type ConversationsUpdatedDetail = {
  conversations?: Array<{ id: string; title: string; lastActivityAt: string }> | null;
};

export function ChatHistoryNav({ kbId, onCountChange }: ChatHistoryNavProps) {
  const t = useTranslations("kb.chatNav");
  const params = useSearchParams();
  const router = useRouter();
  const activeConversationId = params.get("conversation") ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ConversationNavItem[]>([]);
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
    function handleUpdate(event: Event) {
      const detail = (event as CustomEvent<ConversationsUpdatedDetail>).detail;
      const list = detail?.conversations ?? null;

      if (Array.isArray(list)) {
        setItems(
          list.map((conversation) => ({
            id: conversation.id,
            title: conversation.title || t("untitled"),
            lastActivityAt: conversation.lastActivityAt,
          })),
        );
        setLoading(false);
        setError(null);
        return;
      }

      void load();
    }

    window.addEventListener(CHAT_CONVERSATIONS_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(CHAT_CONVERSATIONS_UPDATED_EVENT, handleUpdate);
    };
  }, [load, t]);

  useEffect(() => {
    if (!loading) {
      onCountChange?.(items.length);
    }
  }, [items.length, loading, onCountChange]);

  const formattedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        formattedTime: formatRelativeTime(item.lastActivityAt),
      })),
    [items],
  );

  const handleDelete = useCallback(
    async (conversationId: string, title: string) => {
      if (deletingId) return;
      const confirmed = window.confirm(t("deleteConfirm", { title }));
      if (!confirmed) return;

      setDeletingId(conversationId);
      setError(null);

      try {
        const response = await fetch(`/api/kb/${kbId}/chat/conversations/${conversationId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        setItems((prev) => prev.filter((item) => item.id !== conversationId));

        if (conversationId === activeConversationId) {
          const url = new URL(window.location.href);
          url.searchParams.delete("conversation");
          router.replace(`${url.pathname}${url.search ? `?${url.searchParams.toString()}` : ""}`);
        }

        window.dispatchEvent(new CustomEvent(CHAT_CONVERSATIONS_UPDATED_EVENT));
      } catch (err) {
        console.warn("[chat-nav] failed to delete conversation", err);
        setError(t("deleteError"));
      } finally {
        setDeletingId(null);
      }
    },
    [activeConversationId, deletingId, kbId, router, t],
  );

  return (
    <div className="mt-2 space-y-2 pl-3">
      {loading ? (
        <p className="text-xs text-[var(--kb-text-subtle)]">{t("loading")}</p>
      ) : error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : formattedItems.length === 0 ? (
        <p className="text-xs text-[var(--kb-text-subtle)]">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1" role="list">
          {formattedItems.map((item) => {
            const href = `/kb/${kbId}/chat?conversation=${item.id}`;
            const isActive = item.id === activeConversationId;
            return (
              <li key={item.id} role="listitem" data-testid="chat-history-item">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Link
                    href={href}
                    className={cn(
                      "flex min-w-0 flex-1 flex-col rounded-md px-2 py-1 text-xs transition",
                      isActive
                        ? "bg-[color-mix(in_srgb,var(--kb-highlight)_28%,transparent_72%)] text-[var(--kb-text)]"
                        : "text-[var(--kb-text-subtle)] hover:bg-[color-mix(in_srgb,var(--kb-highlight)_18%,transparent_82%)] hover:text-[var(--kb-text)]",
                    )}
                  >
                    <span className="truncate font-medium">{item.title}</span>
                    {"\n"}
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--kb-text-subtle)_80%,transparent_20%)]">
                      {item.formattedTime}
                    </span>
                  </Link>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-[var(--kb-text-subtle)] hover:text-[var(--kb-text)]"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void handleDelete(item.id, item.title);
                    }}
                    disabled={deletingId === item.id}
                    data-testid="chat-history-delete"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                    <span className="sr-only">{t("delete")}</span>
                  </Button>
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
