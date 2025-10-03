"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CHAT_CONVERSATIONS_UPDATED_EVENT } from "@/lib/chat-events";

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
  const params = useSearchParams();
  const activeConversationId = params.get("conversation") ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ConversationNavItem[]>([]);

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

  const formattedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        formattedTime: formatRelativeTime(item.lastActivityAt),
      })),
    [items],
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
              <li key={item.id} role="listitem">
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col rounded-md px-2 py-1 text-xs transition",
                    isActive
                      ? "bg-[color-mix(in_srgb,var(--kb-highlight)_28%,transparent_72%)] text-[var(--kb-text)]"
                      : "text-[var(--kb-text-subtle)] hover:bg-[color-mix(in_srgb,var(--kb-highlight)_18%,transparent_82%)] hover:text-[var(--kb-text)]",
                  )}
                >
                  <span className="truncate font-medium">{item.title}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--kb-text-subtle)_80%,transparent_20%)]">
                    {item.formattedTime}
                  </span>
                </Link>
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
