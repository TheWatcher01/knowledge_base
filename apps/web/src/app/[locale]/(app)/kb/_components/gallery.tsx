"use client";

import { useMemo, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { LayoutGrid, List, ArrowUpDown, CalendarClock, BookOpenText, Search, NotebookPen } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateKbForm } from "./create-kb-form";
import { DeleteKbButton } from "./delete-kb-button";
import { cn } from "@/lib/utils";

export type KnowledgeBaseGalleryItem = {
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
    };
};

type KnowledgeBaseGalleryProps = {
    items: KnowledgeBaseGalleryItem[];
    summary: {
        totalKb: number;
        totalDocuments: number;
        newestLabel: string | null;
    };
};

type ViewMode = "grid" | "list";
type SortMode = "recent" | "alphabetical";

export function KnowledgeBaseGallery({ items, summary }: KnowledgeBaseGalleryProps) {
    const t = useTranslations("kb.list");
    const formatter = useFormatter();

    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortMode, setSortMode] = useState<SortMode>("recent");
    const [search, setSearch] = useState("");

    const filteredItems = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        let next = items;

        if (normalizedSearch) {
            next = items.filter((item) => {
                const haystack = `${item.name} ${item.description ?? ""}`.toLowerCase();
                return haystack.includes(normalizedSearch);
            });
        }

        return next.slice().sort((a, b) => {
            if (sortMode === "alphabetical") {
                return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [items, search, sortMode]);

    return (
        <div className="flex w-full flex-1 flex-col gap-8 py-6">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">Notebook</p>
                    <h1 className="text-3xl font-semibold text-foreground">{t("title")}</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CalendarClock className="h-4 w-4" aria-hidden />
                            {t("summary.total.label")}: <strong className="font-semibold text-foreground">{summary.totalKb}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpenText className="h-4 w-4" aria-hidden />
                            {t("summary.documents.label")}: <strong className="font-semibold text-foreground">{summary.totalDocuments}</strong>
                        </span>
                    </div>
                    <CreateKbForm />
                </div>
            </header>

            <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t("search.placeholder")}
                        className="h-9 flex-1 border-0 bg-transparent focus-visible:ring-0"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <div className="flex items-center gap-1 rounded-full border border-border/40 bg-background/60 p-1">
                        <ToggleButton
                            active={viewMode === "grid"}
                            onClick={() => setViewMode("grid")}
                            title={t("view.grid")}
                        >
                            <LayoutGrid className="h-4 w-4" aria-hidden />
                        </ToggleButton>
                        <ToggleButton
                            active={viewMode === "list"}
                            onClick={() => setViewMode("list")}
                            title={t("view.list")}
                        >
                            <List className="h-4 w-4" aria-hidden />
                        </ToggleButton>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setSortMode((prev) => (prev === "recent" ? "alphabetical" : "recent"))}
                    >
                        <ArrowUpDown className="h-4 w-4" aria-hidden />
                        {sortMode === "recent" ? t("sort.recent") : t("sort.alphabetical")}
                    </Button>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-5 text-center">
                    <div className="rounded-3xl border border-border/40 bg-card/95 px-8 py-10 shadow-sm">
                        <h2 className="text-xl font-semibold text-foreground">{t("emptyTitle")}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{t("emptyDescription")}</p>
                        <div className="mt-6 flex flex-col items-center gap-3">
                            <CreateKbForm ctaSize="lg" ctaClassName="w-full sm:w-auto" />
                            <p className="text-xs text-muted-foreground/80">{t("emptyHelper")}</p>
                        </div>
                    </div>
                </div>
            ) : viewMode === "grid" ? (
                <GalleryGrid items={filteredItems} />
            ) : (
                <GalleryList items={filteredItems} formatter={formatter} />
            )}
        </div>
    );
}

type ToggleButtonProps = {
    active: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
};

function ToggleButton({ active, onClick, title, children }: ToggleButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-pressed={active}
            className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition",
                active
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted"
            )}
        >
            {children}
        </button>
    );
}

type GalleryGridProps = {
    items: KnowledgeBaseGalleryItem[];
};

function GalleryGrid({ items }: GalleryGridProps) {
    const tCards = useTranslations("kb.card");
    const tList = useTranslations("kb.list");

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((item) => (
                <article
                    key={item.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/40 bg-card shadow-[0_32px_120px_-70px_rgba(22,29,60,0.55)] transition-transform duration-300 hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-white/40 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80 dark:via-transparent" />
                    <div className="relative flex h-full flex-col gap-4 p-6">
                        <header className="space-y-2">
                            <h2 className="text-lg font-semibold text-foreground line-clamp-2">{item.name}</h2>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {item.description ?? tCards("emptyDescription")}
                            </p>
                        </header>

                        <dl className="mt-auto grid gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 rounded-full border border-border/30 bg-background/60 px-3 py-1">
                                <CalendarClock className="h-4 w-4" aria-hidden />
                                <span>{item.createdLabel}</span>
                                <span>· {item.recentLabel}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge>{tCards("documents", { count: item.stats.documents })}</Badge>
                                <Badge>{tCards("notes", { count: item.stats.notes })}</Badge>
                                <Badge>{tCards("files", { count: item.stats.files })}</Badge>
                                <Badge>{tCards("urls", { count: item.stats.urls })}</Badge>
                            </div>
                        </dl>

                        <div className="flex items-center justify-between gap-2 pt-2">
                            <Button asChild size="sm" className="gap-2">
                                <Link href={`/kb/${item.id}`}>
                                    <NotebookPen className="h-4 w-4" aria-hidden />
                                    {tList("open")}
                                </Link>
                            </Button>
                            <DeleteKbButton kbId={item.id} />
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

type GalleryListProps = {
    items: KnowledgeBaseGalleryItem[];
    formatter: ReturnType<typeof useFormatter>;
};

function GalleryList({ items, formatter }: GalleryListProps) {
    const t = useTranslations("kb.list");
    const tCards = useTranslations("kb.card");

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t("table.columns.name")}</TableHead>
                    <TableHead>{t("table.columns.created")}</TableHead>
                    <TableHead>{t("table.columns.documents")}</TableHead>
                    <TableHead className="text-right">{t("table.columns.actions")}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => {
                    const created = formatter.dateTime(new Date(item.createdAt), { dateStyle: "medium" });
                    return (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-foreground">{item.name}</span>
                                    {item.description ? (
                                        <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                                    ) : null}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm text-muted-foreground">
                                    <span>{created}</span>
                                    <span>{item.recentLabel}</span>
                                </div>
                            </TableCell>
                            <TableCell>{tCards("documents", { count: item.stats.documents })}</TableCell>
                            <TableCell className="flex justify-end gap-2">
                                <Button asChild size="sm" variant="secondary" className="gap-2">
                                    <Link href={`/kb/${item.id}`}>
                                        <NotebookPen className="h-4 w-4" aria-hidden />
                                        {t("open")}
                                    </Link>
                                </Button>
                                <DeleteKbButton kbId={item.id} />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

type BadgeProps = {
    children: React.ReactNode;
};

function Badge({ children }: BadgeProps) {
    return (
        <span className="rounded-full border border-border/30 bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {children}
        </span>
    );
}
