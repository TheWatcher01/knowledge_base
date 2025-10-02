import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KnowledgeBaseTabs } from "./_components/kb-tabs";
import { KnowledgeBaseStudio } from "./_components/kb-studio";
import { getTranslations } from "next-intl/server";

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

    const t = await getTranslations({ locale, namespace: "kb.layout" });

    return (
        <div className="w-full bg-background">
            <div className="mx-auto flex w-full flex-col px-4 pt-4 pb-0 sm:px-6 sm:pt-6 sm:pb-0 lg:px-10 xl:h-[calc(100vh-8.3125rem)] xl:min-h-0 xl:overflow-hidden">
                <div className="grid gap-6 xl:flex-1 xl:min-h-0 xl:overflow-hidden xl:grid-cols-[280px_minmax(0,1fr)_320px] 2xl:grid-cols-[320px_minmax(0,1fr)_360px]">
                    <aside className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-card/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 xl:h-full xl:min-h-0 xl:overflow-y-auto">
                        <div>
                            <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{t("sources")}</h2>
                        </div>
                        <KnowledgeBaseTabs kbId={kb.id} />
                    </aside>

                    <div className="flex flex-col gap-4 xl:h-full xl:min-h-0">
                        <header className="sticky top-0 z-10 space-y-4 rounded-3xl border border-border/40 bg-card/95 px-6 py-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Knowledge Base</span>
                                <h1 className="text-3xl font-semibold tracking-tight text-foreground">{kb.name}</h1>
                                {kb.description ? (
                                    <p className="max-w-3xl text-sm text-muted-foreground">{kb.description}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">{t("missingDescription")}</p>
                                )}
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
    );
}
