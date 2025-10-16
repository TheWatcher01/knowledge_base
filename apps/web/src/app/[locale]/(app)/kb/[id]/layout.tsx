import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KnowledgeBaseTabs } from "./_components/kb-tabs";
import { KnowledgeBaseStudio } from "./_components/kb-studio";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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

    const [kb, documentGroups, chatCount] = await Promise.all([
        prisma.knowledgeBase.findFirst({
            where: { id, ownerId: userId },
            include: { _count: { select: { documents: true } } },
        }),
        prisma.document.groupBy({
            by: ["type"],
            _count: { _all: true },
            where: { kbId: id },
        }),
        prisma.chatConversation.count({ where: { kbId: id, userId } }),
    ]);

    if (!kb) {
        notFound();
    }

    const t = await getTranslations({ locale, namespace: "kb.layout" });
    const counts = {
        overview: kb._count.documents,
        notes: 0,
        files: 0,
        urls: 0,
        chat: chatCount,
    } as Record<"overview" | "notes" | "files" | "urls" | "chat", number>;

    for (const entry of documentGroups) {
        if (entry.type === "note") counts.notes = entry._count._all;
        if (entry.type === "file") counts.files = entry._count._all;
        if (entry.type === "url") counts.urls = entry._count._all;
    }

    return (
        <div className="w-full bg-background overflow-x-hidden">
            <div className="mx-auto flex w-full flex-col gap-6 px-4 pt-4 pb-0 sm:px-6 sm:pt-6 sm:pb-0 lg:px-10 xl:h-[calc(100vh-8.3125rem)] xl:min-h-0 xl:overflow-hidden">
                <div className="flex flex-col gap-6 overflow-hidden xl:flex-1 xl:min-h-0 xl:grid xl:grid-cols-[280px_minmax(0,1fr)_320px] 2xl:grid-cols-[320px_minmax(0,1fr)_360px]">
                    <aside className="hidden w-full flex-col gap-4 rounded-3xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:flex xl:h-full xl:min-h-0 xl:overflow-y-auto">
                        <div>
                            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{t("sources")}</h2>
                        </div>
                        <KnowledgeBaseTabs kbId={kb.id} counts={counts} />
                    </aside>

                    <div className="flex w-full flex-col gap-4 xl:h-full xl:min-h-0">
                        <header className="sticky top-0 z-10 space-y-4 rounded-3xl border border-border/40 bg-card/95 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6 sm:py-6">
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

                                <div className="flex flex-wrap items-center gap-2 lg:hidden">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                {t("sources")}
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-[min(20rem,90vw)] overflow-y-auto rounded-none">
                                            <SheetHeader>
                                                <SheetTitle>{t("sources")}</SheetTitle>
                                            </SheetHeader>
                                            <div className="mt-4">
                                                <KnowledgeBaseTabs kbId={kb.id} counts={counts} />
                                            </div>
                                        </SheetContent>
                                    </Sheet>

                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                {t("studioButton")}
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="w-[min(20rem,90vw)] overflow-y-auto rounded-none">
                                            <SheetHeader>
                                                <SheetTitle>{t("studioButton")}</SheetTitle>
                                            </SheetHeader>
                                            <div className="mt-4">
                                                <KnowledgeBaseStudio kbId={kb.id} />
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>
                        </header>
                        <div className="min-h-0 flex-1 overflow-y-auto rounded-3xl border border-border/40 bg-card/90 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:p-6">
                            <div className="lg:hidden">
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="studio">
                                        <AccordionTrigger>{t("studioAccordionTitle")}</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="rounded-3xl border border-border/40 bg-background/80 p-4">
                                                <KnowledgeBaseStudio kbId={kb.id} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                            {children}
                        </div>
                    </div>

                    <aside className="hidden w-full rounded-3xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:block xl:h-full xl:min-h-0 xl:overflow-y-auto">
                        <KnowledgeBaseStudio kbId={kb.id} />
                    </aside>
                </div>
            </div>
        </div>
    );
}
