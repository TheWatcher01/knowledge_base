import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KnowledgeBaseTabs } from "./_components/kb-tabs";
import { KnowledgeBaseStudio } from "./_components/kb-studio";
import { RagSyncTrigger } from "./_components/rag-sync-trigger";
import { KnowledgeBaseSectionProvider } from "./_components/kb-section-context";
import { getFormatter, getTranslations } from "next-intl/server";

type LayoutProps = {
    children: React.ReactNode;
    params: Promise<{ locale: string; id: string }>;
};

export default async function KnowledgeBaseLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    const { id, locale } = resolvedParams;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect({ href: "/login", locale });
    }
    const userId = (session as typeof session & { user: { id: string } }).user.id;

    const kb = await prisma.knowledgeBase.findFirst({
        where: { id, ownerId: userId },
        include: { _count: { select: { documents: true } } },
    });

    if (!kb) {
        notFound();
    }

    const [t, formatter, notesPreview, filesPreview, urlsPreview, noteCount, fileCount, urlCount, conversationCount] =
        await Promise.all([
            getTranslations({ locale, namespace: "kb.layout" }),
            getFormatter({ locale }),
            prisma.document.findMany({
                where: { kbId: id, type: "note" },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, title: true, createdAt: true },
            }),
            prisma.document.findMany({
                where: { kbId: id, type: "file" },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: { id: true, title: true, createdAt: true },
            }),
            prisma.document.findMany({
                where: { kbId: id, type: "url" },
                orderBy: { createdAt: "desc" },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    urlEntry: { select: { url: true } },
                },
            }),
            prisma.document.count({ where: { kbId: id, type: "note" } }),
            prisma.document.count({ where: { kbId: id, type: "file" } }),
            prisma.document.count({ where: { kbId: id, type: "url" } }),
            prisma.chatConversation.count({ where: { kbId: id, userId } }),
        ]);

    const resourcePreviews = {
        notes: notesPreview.map((note) => ({
            id: note.id,
            title: note.title,
            href: `/kb/${kb.id}/notes`,
            meta: formatter.dateTime(note.createdAt, { dateStyle: "short", timeStyle: "short" }),
        })),
        files: filesPreview.map((file) => ({
            id: file.id,
            title: file.title,
            href: `/kb/${kb.id}/files`,
            meta: formatter.dateTime(file.createdAt, { dateStyle: "short", timeStyle: "short" }),
        })),
        urls: urlsPreview.map((url) => ({
            id: url.id,
            title: url.title,
            href: `/kb/${kb.id}/urls`,
            meta: extractHostname(url.urlEntry?.url) || undefined,
        })),
    } satisfies Record<"notes" | "files" | "urls", Array<{ id: string; title: string; href: string; meta?: string }>>;

    const resourceCounts = {
        notes: noteCount,
        files: fileCount,
        urls: urlCount,
        chat: conversationCount,
    } as const;

    return (
        <KnowledgeBaseSectionProvider>
            <div className="w-full bg-background">
                <div className="mx-auto flex w-full flex-col px-4 pt-4 pb-0 sm:px-6 sm:pt-6 sm:pb-0 lg:px-10 xl:h-[calc(100vh-8.3125rem)] xl:min-h-0 xl:overflow-hidden">
                    <div className="grid gap-6 xl:flex-1 xl:min-h-0 xl:overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)_320px] 2xl:grid-cols-[320px_minmax(0,1fr)_360px]">
                        <aside className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 xl:h-full xl:min-h-0 xl:overflow-y-auto">
                            <div>
                                <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{t("sources")}</h2>
                            </div>
                            <KnowledgeBaseTabs kbId={kb.id} resources={resourcePreviews} counts={resourceCounts} />
                        </aside>

                        <div className="flex flex-col gap-4 xl:h-full xl:min-h-0">
                            <header className="sticky top-0 z-10 space-y-4 rounded-3xl border border-border/40 bg-card/95 px-6 py-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex min-w-0 flex-col gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Knowledge Base</span>
                                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{kb.name}</h1>
                                        {kb.description ? (
                                            <p className="max-w-3xl text-sm text-muted-foreground">{kb.description}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">{t("missingDescription")}</p>
                                        )}
                                    </div>

                                    <RagSyncTrigger kbId={kb.id} />
                                </div>
                            </header>
                            <div className="min-h-0 flex-1 overflow-y-auto rounded-3xl border border-border/40 bg-card/90 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                                {children}
                            </div>
                        </div>

                        <aside className="rounded-3xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 xl:h-full xl:min-h-0 xl:overflow-y-auto">
                            <KnowledgeBaseStudio kbId={kb.id} />
                        </aside>
                    </div>
                </div>
            </div>
        </KnowledgeBaseSectionProvider>
    );
}

function extractHostname(url?: string | null) {
    if (!url) return "";
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}
