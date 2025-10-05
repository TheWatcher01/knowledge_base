"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { ChatHistoryNav } from "./chat-history-nav";
import { useKnowledgeBaseSection } from "./kb-section-context";

type NavKey = "overview" | "notes" | "files" | "urls" | "chat";
type ResourceKey = Exclude<NavKey, "overview" | "chat">;

type ResourcePreviewItem = {
    id: string;
    title: string | null;
    meta?: string;
    href?: string;
};

type ResourcePreviewMap = Partial<Record<ResourceKey, ResourcePreviewItem[]>>;
type CountMap = Partial<Record<Exclude<NavKey, "overview">, number>>;

type KnowledgeBaseTabsProps = {
    kbId: string;
    resources?: ResourcePreviewMap;
    counts?: CountMap;
};

const navItems: Array<{
    key: NavKey;
    collapsible?: boolean;
}> = [
    { key: "overview", collapsible: false },
    { key: "notes", collapsible: false },
    { key: "files", collapsible: false },
    { key: "urls", collapsible: false },
    { key: "chat", collapsible: true },
];

export function KnowledgeBaseTabs({ kbId, resources, counts }: KnowledgeBaseTabsProps) {
    const t = useTranslations("kb.tabs");
    const { activeSection, setActiveSection } = useKnowledgeBaseSection();

    const [openMap, setOpenMap] = useState<Record<NavKey, boolean>>(() => ({
        overview: false,
        notes: false,
        files: false,
        urls: false,
        chat: true,
    }));
    useEffect(() => {
        if (activeSection !== "chat") return;
        setOpenMap((prev) => {
            if (prev.chat) {
                return prev;
            }
            return { ...prev, chat: true };
        });
    }, [activeSection]);

    const toggle = (key: NavKey) => {
        setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <nav aria-label={t("navLabel") ?? "Navigation"}>
            <ul className="flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = activeSection === item.key;
                    const isOpen = openMap[item.key];
                    const regionId = `kb-nav-${item.key}`;
                    const isPreviewSection = item.key !== "overview" && item.key !== "chat";
                    const previewItems = isPreviewSection
                        ? resources?.[item.key as ResourceKey] ?? []
                        : [];
                    const sectionCount =
                        item.key === "overview"
                            ? undefined
                            : counts?.[item.key as Exclude<NavKey, "overview">];
                    const sectionLabel = t(item.key);
                    const isCollapsible = item.collapsible !== false;

                    return (
                        <li key={item.key} className="flex flex-col">
                            <div
                                className={cn(
                                    "rounded-lg border border-transparent bg-transparent",
                                    isOpen && "border-[color-mix(in_srgb,var(--kb-highlight)_28%,transparent_72%)]",
                                )}
                            >
                                <div className="flex items-center gap-2 pr-3">
                                    {isCollapsible ? (
                                        <button
                                            type="button"
                                            className={cn(
                                                "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                isActive
                                                    ? "bg-[color-mix(in_srgb,var(--kb-highlight)_28%,transparent_72%)] text-[var(--kb-text)]"
                                                    : "text-[var(--kb-text-subtle)] hover:bg-[color-mix(in_srgb,var(--kb-highlight)_18%,transparent_82%)] hover:text-[var(--kb-text)]",
                                            )}
                                            aria-expanded={isOpen}
                                            aria-controls={regionId}
                                            onClick={() => {
                                                setActiveSection(item.key);
                                                if (item.key !== "chat") {
                                                    setOpenMap((prev) => ({ ...prev, [item.key]: true }));
                                                }
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{sectionLabel}</span>
                                                {typeof sectionCount === "number" ? (
                                                    <span className="rounded-full bg-[color-mix(in_srgb,var(--kb-highlight)_24%,transparent_76%)] px-2 py-0.5 text-[11px] font-semibold text-[var(--kb-text-subtle)]">
                                                        {sectionCount}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className={cn(
                                                "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                isActive
                                                    ? "bg-[color-mix(in_srgb,var(--kb-highlight)_28%,transparent_72%)] text-[var(--kb-text)]"
                                                    : "text-[var(--kb-text-subtle)] hover:bg-[color-mix(in_srgb,var(--kb-highlight)_18%,transparent_82%)] hover:text-[var(--kb-text)]",
                                            )}
                                            aria-label={t("viewAll", { section: sectionLabel })}
                                            onClick={() => setActiveSection(item.key)}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{sectionLabel}</span>
                                                {typeof sectionCount === "number" ? (
                                                    <span className="rounded-full bg-[color-mix(in_srgb,var(--kb-highlight)_24%,transparent_76%)] px-2 py-0.5 text-[11px] font-semibold text-[var(--kb-text-subtle)]">
                                                        {sectionCount}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </button>
                                    )}
                                    <span aria-hidden className="h-8 w-8" />
                                    {isCollapsible ? (
                                        <button
                                            type="button"
                                            className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-full text-[var(--kb-text-subtle)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                                isOpen ? "text-[var(--kb-text)]" : "hover:text-[var(--kb-text)]",
                                            )}
                                            aria-expanded={isOpen}
                                            aria-controls={regionId}
                                            aria-label={t("toggleSectionAria", { section: sectionLabel })}
                                            onClick={() => toggle(item.key)}
                                        >
                                            <ChevronDown
                                                className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    isOpen ? "rotate-180" : "rotate-0",
                                                )}
                                                aria-hidden
                                            />
                                        </button>
                                    ) : null}
                                </div>

                                {isCollapsible ? (
                                    <div
                                        id={regionId}
                                        role="region"
                                        aria-hidden={!isOpen}
                                        className={cn(
                                            "overflow-hidden pl-3 text-xs transition-[max-height,opacity] duration-200",
                                            isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
                                        )}
                                    >
                                        {item.key === "chat" ? (
                                            isOpen ? <ChatHistoryNav kbId={kbId} /> : null
                                        ) : (
                                            <div className="space-y-2 py-2">
                                                {previewItems.length > 0 ? (
                                                    <ul className="flex flex-col gap-1" role="list">
                                                        {previewItems.map((preview) => (
                                                        <li key={preview.id} className="flex flex-col rounded-md bg-[color-mix(in_srgb,var(--kb-background)_96%,transparent_4%)] px-2 py-1.5">
                                                            <span className="truncate text-[var(--kb-text)]">
                                                                {preview.title?.trim() ?? t("previewUntitled")}
                                                            </span>
                                                            {preview.meta ? (
                                                                <span className="text-[10px] uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--kb-text-subtle)_92%,transparent_8%)]">
                                                                    {preview.meta}
                                                                </span>
                                                            ) : null}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="px-2 text-[var(--kb-text-subtle)]">
                                                    {t("previewEmpty", { section: sectionLabel })}
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-[var(--kb-text-subtle)] transition hover:text-[var(--kb-text)]"
                                                onClick={() => {
                                                    setActiveSection(item.key);
                                                    setOpenMap((prev) => ({ ...prev, [item.key]: true }));
                                                }}
                                            >
                                                {t("viewAll", { section: sectionLabel })}
                                            </button>
                                        </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
