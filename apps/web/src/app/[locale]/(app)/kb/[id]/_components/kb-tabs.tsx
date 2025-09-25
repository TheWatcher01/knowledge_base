"use client";

import { Link } from "@/i18n/navigation";
import { useSelectedLayoutSegments } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

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
        <nav className="rounded-2xl border border-[color-mix(in_srgb,var(--kb-border)_78%,transparent_22%)] bg-[color-mix(in_srgb,var(--kb-surface)_94%,black_6%)] p-1 shadow-[0_16px_32px_-26px_rgba(0,0,0,0.65)] backdrop-blur-sm">
            <ul className="flex flex-wrap items-center gap-1">
                {tabs.map((tab) => {
                    const href = tab.path ? `/kb/${kbId}/${tab.path}` : `/kb/${kbId}`;
                    const isActive = (activeSegment ?? undefined) === tab.segment;

                    return (
                        <li key={tab.key} className="relative">
                            <Link
                                href={href}
                                className={cn(
                                    "group relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200",
                                    isActive
                                        ? "bg-[color-mix(in_srgb,var(--kb-highlight)_28%,transparent_72%)] text-[var(--kb-text)] shadow-[inset_0_0_0_1px_rgba(187,218,255,0.35)]"
                                        : "text-[var(--kb-text-subtle)] hover:bg-[color-mix(in_srgb,var(--kb-highlight)_18%,transparent_82%)] hover:text-[var(--kb-text)]",
                                )}
                            >
                                <span>{t(tab.key)}</span>
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "absolute inset-x-2 -bottom-[6px] h-[2px] rounded-full bg-[var(--kb-accent)] transition-opacity duration-200",
                                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                                    )}
                                />
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
