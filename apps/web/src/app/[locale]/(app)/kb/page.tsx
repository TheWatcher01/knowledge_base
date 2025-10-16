import { redirect } from "@/i18n/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { KnowledgeBaseGallery, KnowledgeBaseGalleryItem } from "./_components/gallery";

export default async function KnowledgeBasesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        redirect({ href: "/login", locale });
    }

    const knowledgeBases = await prisma.knowledgeBase.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { documents: true } } },
    });

    const kbIds = knowledgeBases.map((kb) => kb.id);
    const chatCounts = kbIds.length
        ? await prisma.chatConversation.groupBy({
              by: ["kbId"],
              _count: { _all: true },
              where: {
                  userId,
                  kbId: { in: kbIds },
              },
          })
        : [];
    const chatCountMap = new Map(chatCounts.map((entry) => [entry.kbId, entry._count._all]));

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
                chat: chatCountMap.get(kb.id) ?? 0,
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

    return <KnowledgeBaseGallery items={items} summary={summary} />;
}
