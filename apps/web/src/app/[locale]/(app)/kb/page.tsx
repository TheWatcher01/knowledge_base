import { Link, redirect } from "@/i18n/navigation";
import type { ComponentType } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateKbForm } from "./_components/create-kb-form";
import { DeleteKbButton } from "./_components/delete-kb-button";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookMarked, CalendarClock, Files as FilesIcon, NotebookPen } from "lucide-react";

import type { KnowledgeBase } from "@prisma/client";

type PageProps = {
    params: Promise<{ locale: string }>;
};

type KnowledgeBaseWithCount = KnowledgeBase & { _count: { documents: number } };

export default async function KnowledgeBasesPage({ params }: PageProps) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        redirect({ href: "/login", locale });
    }
    const userId = (session as typeof session & { user: { id: string } }).user.id;

    const knowledgeBases = (await prisma.knowledgeBase.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { documents: true } } },
    })) satisfies KnowledgeBaseWithCount[];

    const tList = await getTranslations({ locale, namespace: "kb.list" });
    const tLayout = await getTranslations({ locale, namespace: "kb.layout" });

    const totalKb = knowledgeBases.length;
    const totalDocuments = knowledgeBases.reduce((acc, kb) => acc + kb._count.documents, 0);

    const dateFormatter = new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeZone: "UTC",
    });
    const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    const newestKb = knowledgeBases[0];
    const recentHelper = newestKb
        ? relativeFormatter.format(-Math.max(1, Math.round((Date.now() - newestKb.createdAt.getTime()) / 86_400_000)), "day")
        : tList("summary.empty");

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 py-6">
            <Card className="relative overflow-hidden border border-border/40 bg-card/95 px-8 py-8 shadow-[0_28px_110px_-64px_rgba(22,29,60,0.55)] backdrop-blur dark:bg-slate-950/55">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-white/60 to-transparent opacity-80 dark:via-transparent" />
                <div className="relative space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">Knowledge Base</p>
                    <h1 className="text-3xl font-semibold text-foreground">{tList("title")}</h1>
                    <p className="max-w-2xl text-base text-muted-foreground">{tList("subtitle")}</p>
                </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryTile
                    icon={BookMarked}
                    label={tList("summary.total.label")}
                    value={new Intl.NumberFormat(locale).format(totalKb)}
                    helper={tList("summary.total.helper", { page: 1, pages: 1 })}
                    accent="from-blue-500/20 via-blue-500/5 to-transparent dark:from-blue-400/50 dark:via-blue-400/15 dark:to-transparent"
                />
                <SummaryTile
                    icon={CalendarClock}
                    label={tList("summary.recent.label")}
                    value={newestKb ? newestKb.name : tList("summary.empty")}
                    helper={recentHelper}
                    accent="from-purple-500/20 via-purple-500/5 to-transparent dark:from-purple-400/50 dark:via-purple-400/15 dark:to-transparent"
                />
                <SummaryTile
                    icon={FilesIcon}
                    label={tList("summary.documents.label")}
                    value={new Intl.NumberFormat(locale).format(totalDocuments)}
                    helper={tList("summary.documents.helper", { count: totalDocuments })}
                    accent="from-emerald-500/20 via-emerald-500/5 to-transparent dark:from-emerald-400/50 dark:via-emerald-400/15 dark:to-transparent"
                />
            </div>

            <Card className="relative overflow-hidden border border-border/40 bg-card shadow-[0_36px_140px_-70px_rgba(22,29,60,0.45)] backdrop-blur dark:bg-slate-950/60">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-white/50 to-transparent opacity-75 transition-opacity duration-500 dark:via-transparent" />
                <CardHeader className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold">{tList("title")}</CardTitle>
                        <CardDescription>{tList("subtitle")}</CardDescription>
                    </div>
                    <div className="w-full md:w-auto">
                        <CreateKbForm />
                    </div>
                </CardHeader>
                <CardContent className="relative p-0">
                    {knowledgeBases.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 px-8 py-12 text-center text-muted-foreground">
                            <NotebookPen className="h-8 w-8 text-primary/70" aria-hidden />
                            <p>{tList("empty")}</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 p-6 sm:grid-cols-2">
                            {knowledgeBases.map((kb) => (
                                <article
                                    key={kb.id}
                                    className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card/95 p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/30 dark:bg-slate-950/55"
                                >
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-white/45 to-transparent opacity-65 transition-opacity duration-500 group-hover:opacity-90 dark:via-transparent" />
                                    <div className="relative flex h-full flex-col gap-5">
                                        <header className="space-y-2">
                                            <h2 className="text-lg font-semibold text-foreground">{kb.name}</h2>
                                            <p className="text-sm text-muted-foreground">
                                                {kb.description || tLayout("missingDescription")}
                                            </p>
                                        </header>
                                        <dl className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-3 py-1">
                                                <dt className="font-medium text-foreground">{tLayout("createdOn")}</dt>
                                                <dd>{dateFormatter.format(kb.createdAt)}</dd>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-3 py-1">
                                                <dt className="font-medium text-foreground">{tLayout("documents")}</dt>
                                                <dd>{tList("card.documents", { count: kb._count.documents })}</dd>
                                            </div>
                                        </dl>
                                        <div className="mt-auto flex items-center justify-between gap-2">
                                            <Button asChild size="sm" className="gap-2" variant="secondary">
                                                <Link href={`/kb/${kb.id}`}>
                                                    <NotebookPen className="h-4 w-4" aria-hidden />
                                                    {tList("open")}
                                                </Link>
                                            </Button>
                                            <DeleteKbButton kbId={kb.id} />
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

type SummaryTileProps = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
    helper: string;
    accent: string;
};

function SummaryTile({ icon: Icon, label, value, helper, accent }: SummaryTileProps) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/95 p-5 shadow-lg backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:border-primary/50 dark:bg-slate-950/45">
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-80",
                    accent,
                )}
            />
            <div className="relative space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{helper}</p>
            </div>
        </div>
    );
}
