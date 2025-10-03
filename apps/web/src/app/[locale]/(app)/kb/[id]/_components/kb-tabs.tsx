"use client";

import { Link } from "@/i18n/navigation";
import { useSelectedLayoutSegments } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

import { ChatHistoryNav } from "./chat-history-nav";

const tabs = [
    { segment: undefined, key: "overview" as const, path: "" },
    { segment: "notes", key: "notes" as const, path: "notes" },
    { segment: "files", key: "files" as const, path: "files" },
    { segment: "urls", key: "urls" as const, path: "urls" },
    { segment: "chat", key: "chat" as const, path: "chat" },
];

export function KnowledgeBaseTabs({ kbId }: { kbId: string }) {
    const segments = useSelectedLayoutSegments();
    const activeSegment = segments[0] ?? undefined;
    const t = useTranslations("kb.tabs");

    return (
        <nav>
            <ul className="flex flex-col gap-1">
                {tabs.map((tab) => {
                    const href = tab.path ? `/kb/${kbId}/${tab.path}` : `/kb/${kbId}`;
                    const isActive = (activeSegment ?? undefined) === tab.segment;

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
                            >
                                <span>{t(tab.key)}</span>
                            </Link>
                            {tab.key === "chat" ? <ChatHistoryNav kbId={kbId} /> : null}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
