"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSelectedLayoutSegments } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { CHAT_CONVERSATION_RESET_REQUESTED_EVENT } from "@/lib/chat-events";
import { Badge } from "@/components/ui/badge";

import { ChatHistoryNav } from "./chat-history-nav";

type TabKey = "overview" | "notes" | "files" | "urls" | "chat";

const COUNT_BADGE_BASE = "h-6 min-w-[2rem] justify-center gap-0 rounded-full px-2 text-[11px] font-semibold leading-none text-center";
const COUNT_BADGE_MUTED = "border-border/50 bg-background/80 text-muted-foreground";
const COUNT_BADGE_ACTIVE = "border-transparent bg-primary/90 text-primary-foreground shadow-sm";

const tabs: Array<{ segment: string | undefined; key: TabKey; path: string }> = [
    { segment: undefined, key: "overview", path: "" },
    { segment: "notes", key: "notes", path: "notes" },
    { segment: "files", key: "files", path: "files" },
    { segment: "urls", key: "urls", path: "urls" },
    { segment: "chat", key: "chat", path: "chat" },
];

export function KnowledgeBaseTabs({ kbId, counts }: { kbId: string; counts: Record<TabKey, number> }) {
    const segments = useSelectedLayoutSegments();
    const activeSegment = segments[0] ?? undefined;
    const t = useTranslations("kb.tabs");
    const tWorkspace = useTranslations("kb.workspace");
    const [chatCount, setChatCount] = useState(counts.chat ?? 0);

    useEffect(() => {
        setChatCount(counts.chat ?? 0);
    }, [counts.chat]);

    return (
        <nav>
            <ul className="flex flex-col gap-1">
                {tabs.map((tab) => {
                    const href = tab.path ? `/kb/${kbId}/${tab.path}` : `/kb/${kbId}`;
                    const isActive = (activeSegment ?? undefined) === tab.segment;

                    const countValue =
                        tab.key === "overview"
                            ? undefined
                            : tab.key === "chat"
                              ? chatCount
                              : counts[tab.key] ?? 0;
                    const badgeLabel =
                        typeof countValue === "number"
                            ? tWorkspace(`counts.${tab.key}`, { count: countValue })
                            : undefined;
                    return (
                        <li key={tab.key}>
                            <Link
                                href={href}
                                className={cn(
                                    "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                                    isActive
                                        ? "bg-[color-mix(in_srgb,var(--kb-highlight)_28%,transparent_72%)] text-[var(--kb-text)]"
                                        : "text-[var(--kb-text-subtle)] hover:bg-[color-mix(in_srgb,var(--kb-highlight)_18%,transparent_82%)] hover:text-[var(--kb-text)]",
                                )}
                                onClick={() => {
                                    if (typeof window !== "undefined" && tab.key === "chat") {
                                        window.dispatchEvent(
                                            new CustomEvent(CHAT_CONVERSATION_RESET_REQUESTED_EVENT, {
                                                detail: { kbId },
                                            }),
                                        );
                                    }
                                }}
                            >
                                <span>{t(tab.key)}</span>
                                {typeof countValue === "number" ? (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "ml-auto",
                                            COUNT_BADGE_BASE,
                                            isActive ? COUNT_BADGE_ACTIVE : COUNT_BADGE_MUTED,
                                        )}
                                        aria-label={badgeLabel}
                                        title={badgeLabel}
                                        data-testid={tab.key === "chat" ? "chat-tab-badge" : undefined}
                                    >
                                        {countValue}
                                    </Badge>
                                ) : null}
                            </Link>
                            {tab.key === "chat" ? (
                                <ChatHistoryNav kbId={kbId} onCountChange={setChatCount} />
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
