"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BookMarked, FileText, Link2, NotebookPen, Search, Sparkles } from "lucide-react";

import { KnowledgeBaseChatPanel } from "@/components/kb/chat-panel";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { KnowledgeBaseStudio } from "../[id]/_components/kb-studio";

const COUNT_BADGE_BASE = "h-6 min-w-[2rem] justify-center gap-0 rounded-full px-2 text-[11px] font-semibold leading-none text-center";
const COUNT_BADGE_MUTED = "border-border/50 bg-background/80 text-muted-foreground";
const COUNT_BADGE_ACTIVE = "border-transparent bg-primary/90 text-primary-foreground shadow-sm";

export type KnowledgeBaseWorkspaceItem = {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    createdLabel: string;
    recentLabel: string;
    stats: {
        documents: number;
        notes: number;
        files: number;
        urls: number;
        chat: number;
    };
};

type KnowledgeBaseWorkspaceProps = {
    items: KnowledgeBaseWorkspaceItem[];
    initialId?: string;
};

export function KnowledgeBaseWorkspace({ items, initialId }: KnowledgeBaseWorkspaceProps) {
    const tList = useTranslations("kb.list");
    const tLayout = useTranslations("kb.layout");
    const tTabs = useTranslations("kb.tabs");
    const tWorkspace = useTranslations("kb.workspace");

    const [selectedId, setSelectedId] = useState(initialId ?? items[0]?.id ?? "");
    const [selectedIds, setSelectedIds] = useState<string[]>(() => {
        const first = initialId ?? items[0]?.id;
        return first ? [first] : [];
    });
    const [query, setQuery] = useState("");

    const selected = useMemo(() => {
        const targetId = selectedId || selectedIds[0] || "";
        return items.find((item) => item.id === targetId) ?? items[0];
    }, [items, selectedId, selectedIds]);

    const filteredItems = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return items;
        return items.filter((item) =>
            item.name.toLowerCase().includes(normalized) ||
            (item.description ?? "").toLowerCase().includes(normalized),
        );
    }, [items, query]);

    function handlePrimarySelect(id: string) {
        setSelectedId(id);
        setSelectedIds((prev) => {
            const without = prev.filter((value) => value !== id);
            return [id, ...without];
        });
    }

    function handleToggle(id: string, checked: boolean) {
        setSelectedIds((prev) => {
            if (checked) {
                if (prev.includes(id)) return prev;
                return [...prev, id];
            }
            const next = prev.filter((value) => value !== id);
            if (selectedId === id) {
                setSelectedId(next[0] ?? "");
            }
            return next;
        });
    }

    const selectionCount = selectedIds.length;
    const hasSelection = selectionCount > 0;
    const allVisibleSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id));

    function handleSelectAll() {
        if (allVisibleSelected) {
            const next = selectedIds.filter((id) => !filteredItems.some((item) => item.id === id));
            if (!next.includes(selected.id)) {
                next.unshift(selected.id);
            }
            setSelectedIds(next);
            return;
        }

        setSelectedIds((prev) => {
            const merged = new Set([...prev, ...filteredItems.map((item) => item.id)]);
            if (!merged.has(selected.id)) {
                merged.add(selected.id);
            }
            return Array.from(merged);
        });
    }

    function handleClearSelection() {
        setSelectedIds(selected.id ? [selected.id] : []);
    }

    if (!selected) {
        return (
            <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center">
                <div className="rounded-3xl border border-border/40 bg-card/95 p-8 text-center shadow-sm">
                    <h1 className="text-2xl font-semibold text-foreground">{tList("title")}</h1>
                    <p className="mt-2 text-muted-foreground">{tList("empty")}</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: tLayout("documents"), value: selected.stats.documents },
        { label: tTabs("notes"), value: selected.stats.notes },
        { label: tTabs("files"), value: selected.stats.files },
        { label: tTabs("urls"), value: selected.stats.urls },
    ];

    const navigationActions = [
        { key: 'overview' as const, label: tWorkspace('sourceLabels.overview'), href: `/kb/${selected.id}`, icon: NotebookPen, count: selected.stats.documents },
        { key: 'notes' as const, label: tWorkspace('sourceLabels.notes'), href: `/kb/${selected.id}/notes`, icon: NotebookPen, count: selected.stats.notes },
        { key: 'files' as const, label: tWorkspace('sourceLabels.files'), href: `/kb/${selected.id}/files`, icon: FileText, count: selected.stats.files },
        { key: 'urls' as const, label: tWorkspace('sourceLabels.urls'), href: `/kb/${selected.id}/urls`, icon: Link2, count: selected.stats.urls },
        { key: 'chat' as const, label: tWorkspace('sourceLabels.chat'), href: `/kb/${selected.id}/chat`, icon: Sparkles, count: selected.stats.chat ?? 0 },
    ];

    return (
        <div className="grid w-full max-w-full gap-6 overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)_300px] 2xl:grid-cols-[320px_minmax(0,1fr)_360px]">
            <aside className="flex w-full max-h-[calc(100vh-160px)] flex-col rounded-3xl border border-border/30 bg-card p-4 shadow-sm backdrop-blur dark:bg-slate-950/60">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {tWorkspace("sources")}
                    </h2>
                    {filteredItems.length > 0 ? (
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                        >
                            {allVisibleSelected ? tWorkspace("actions.unselectVisible") : tWorkspace("actions.selectVisible")}
                        </button>
                    ) : null}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border/30 bg-background px-3 py-2 text-sm shadow-sm">
                    <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={tWorkspace("searchPlaceholder")}
                        className="border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
                    />
                </div>

                {hasSelection ? (
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/40 bg-background/80 px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                            {tWorkspace("selection.count", { count: selectionCount })}
                        </span>
                        <button
                            type="button"
                            onClick={handleClearSelection}
                            className="font-medium text-primary transition hover:underline"
                        >
                            {tWorkspace("actions.clear")}
                        </button>
                    </div>
                ) : null}

                <div className="mt-4 space-y-2 overflow-y-auto pr-1 2xl:max-h-[70vh]">
                    {filteredItems.map((item) => {
                        const active = item.id === selected.id;
                        const isSelected = selectedIds.includes(item.id);
                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    "group relative flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition",
                                    active
                                        ? "border-primary/50 bg-primary/15 text-primary"
                                        : "border-transparent bg-background/60 text-foreground hover:border-primary/30 hover:bg-primary/10",
                                )}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handleToggle(item.id, Boolean(checked))}
                                    aria-label={tWorkspace("selection.toggle", { name: item.name })}
                                    className="mt-1"
                                />
                                <button
                                    type="button"
                                    onClick={() => handlePrimarySelect(item.id)}
                                    className="flex flex-1 flex-col items-start gap-1 text-left"
                                >
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <span className="font-semibold line-clamp-1">{item.name}</span>
                                        <span className="text-xs text-muted-foreground">{tWorkspace("documents", { count: item.stats.documents })}</span>
                                    </div>
                                    {item.description ? (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                                    ) : null}
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                COUNT_BADGE_BASE,
                                                active ? COUNT_BADGE_ACTIVE : COUNT_BADGE_MUTED,
                                            )}
                                            aria-label={tWorkspace("counts.overview", { count: item.stats.documents })}
                                            title={tWorkspace("counts.overview", { count: item.stats.documents })}
                                        >
                                            {item.stats.documents}
                                        </Badge>
                                        {item.stats.notes ? (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    COUNT_BADGE_BASE,
                                                    active ? COUNT_BADGE_ACTIVE : COUNT_BADGE_MUTED,
                                                )}
                                                aria-label={tWorkspace("counts.notes", { count: item.stats.notes })}
                                                title={tWorkspace("counts.notes", { count: item.stats.notes })}
                                            >
                                                {item.stats.notes}
                                            </Badge>
                                        ) : null}
                                        {item.stats.files ? (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    COUNT_BADGE_BASE,
                                                    active ? COUNT_BADGE_ACTIVE : COUNT_BADGE_MUTED,
                                                )}
                                                aria-label={tWorkspace("counts.files", { count: item.stats.files })}
                                                title={tWorkspace("counts.files", { count: item.stats.files })}
                                            >
                                                {item.stats.files}
                                            </Badge>
                                        ) : null}
                                        {item.stats.urls ? (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    COUNT_BADGE_BASE,
                                                    active ? COUNT_BADGE_ACTIVE : COUNT_BADGE_MUTED,
                                                )}
                                                aria-label={tWorkspace("counts.urls", { count: item.stats.urls })}
                                                title={tWorkspace("counts.urls", { count: item.stats.urls })}
                                            >
                                                {item.stats.urls}
                                            </Badge>
                                        ) : null}
                                        {item.stats.chat ? (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    COUNT_BADGE_BASE,
                                                    active ? COUNT_BADGE_ACTIVE : COUNT_BADGE_MUTED,
                                                )}
                                                aria-label={tWorkspace("counts.chat", { count: item.stats.chat })}
                                                title={tWorkspace("counts.chat", { count: item.stats.chat })}
                                            >
                                                {item.stats.chat}
                                            </Badge>
                                        ) : null}
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </aside>

            <section className="flex w-full flex-col gap-4">
                <div className="sticky top-0 z-10 shrink-0 space-y-4 rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 dark:bg-slate-950/70">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-foreground">{selected.name}</h2>
                            <p className="text-sm text-muted-foreground">
                                {selected.description || tLayout("missingDescription")}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="rounded-full border border-border/40 bg-background/60 px-3 py-1">
                                {tLayout("createdOn")} {selected.createdLabel}
                            </span>
                            <span className="rounded-full border border-border/40 bg-background/60 px-3 py-1">
                                {selected.recentLabel}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-3 rounded-2xl border border-border/30 bg-background px-4 py-3 shadow-sm"
                            >
                                <BookMarked className="h-4 w-4 text-muted-foreground" aria-hidden />
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                                    <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-4">
                        {navigationActions.map((action) => (
                            <Button key={action.key} asChild size="sm" variant="outline" className="gap-2">
                                <Link href={action.href} className="flex items-center gap-2">
                                    <action.icon className="h-4 w-4" aria-hidden />
                                    <span>{action.label}</span>
                                    <Badge
                                        variant="outline"
                                        className={cn("ml-1", COUNT_BADGE_BASE, COUNT_BADGE_MUTED)}
                                        aria-label={tWorkspace(`counts.${action.key}`, { count: action.count })}
                                        title={tWorkspace(`counts.${action.key}`, { count: action.count })}
                                    >
                                        {action.count}
                                    </Badge>
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-border/40 bg-card shadow-sm backdrop-blur dark:bg-slate-950/60">
                    <KnowledgeBaseChatPanel
                        key={selected.id}
                        kbId={selected.id}
                    />
                </div>
            </section>

            <aside className="w-full max-h-[calc(100vh-160px)] overflow-y-auto rounded-3xl border border-border/30 bg-card p-4 shadow-sm backdrop-blur dark:bg-slate-950/60">
                <KnowledgeBaseStudio kbId={selected.id} />
            </aside>
        </div>
    );
}
