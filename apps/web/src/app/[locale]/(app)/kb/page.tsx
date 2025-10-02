import { redirect } from "@/i18n/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

import { KnowledgeBaseGallery, KnowledgeBaseGalleryItem } from "./_components/gallery";

export default async function KnowledgeBasesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        redirect({ href: "/login", locale });
    }

    const userId = session.user.id;

    const [knowledgeBases, tList] = await Promise.all([
        prisma.knowledgeBase.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { documents: true } } },
        }),
        getTranslations({ locale, namespace: "kb.list" }),
    ]);

    const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
    const relativeFormatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const now = Date.now();

    const items: KnowledgeBaseGalleryItem[] = await Promise.all(
        knowledgeBases.map(async (kb) => {
            const grouped = await prisma.document.groupBy({
                by: ["type"],
                _count: { _all: true },
                where: { kbId: kb.id },
            });

            const stats = {
                documents: kb._count.documents,
                notes: 0,
                files: 0,
                urls: 0,
            };

            for (const entry of grouped) {
                if (entry.type === "note") stats.notes = entry._count._all;
                if (entry.type === "file") stats.files = entry._count._all;
                if (entry.type === "url") stats.urls = entry._count._all;
            }

            const diffDays = Math.max(1, Math.round((now - kb.createdAt.getTime()) / 86_400_000));

            return {
                id: kb.id,
                name: kb.name,
                description: kb.description,
                createdAt: kb.createdAt.toISOString(),
                createdLabel: dateFormatter.format(kb.createdAt),
                recentLabel: relativeFormatter.format(-diffDays, "day"),
                stats,
            } satisfies KnowledgeBaseGalleryItem;
        }),
    );

    const summary = {
        totalKb: knowledgeBases.length,
        totalDocuments: knowledgeBases.reduce((acc, kb) => acc + kb._count.documents, 0),
        newestLabel:
            knowledgeBases.length > 0
                ? relativeFormatter.format(
                      -Math.max(1, Math.round((now - knowledgeBases[0].createdAt.getTime()) / 86_400_000)),
                      "day",
                  )
                : null,
    };

    if (items.length === 0) {
        return (
            <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center py-12">
                <div className="space-y-4 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">{tList("empty")}</h1>
                    <p className="text-muted-foreground">{tList("subtitle")}</p>
                </div>
            </div>
        );
    }

    return <KnowledgeBaseGallery items={items} summary={summary} />;
}
