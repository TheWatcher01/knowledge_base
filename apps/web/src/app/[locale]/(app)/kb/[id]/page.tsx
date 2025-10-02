import { prisma } from "@/lib/prisma";
import { getFormatter, getTranslations } from "next-intl/server";

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function KnowledgeBaseOverviewPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { id, locale } = resolvedParams;

    const [groupedCounts, recentNotes, t, formatter] = await Promise.all([
        prisma.document.groupBy({
            by: ["type"],
            _count: { _all: true },
            where: { kbId: id },
        }),
        prisma.document.findMany({
            where: { kbId: id, type: "note" },
            orderBy: { createdAt: "desc" },
            take: 3,
        }),
        getTranslations({ locale, namespace: "kb.overview" }),
        getFormatter({ locale }),
    ]);

    const stats = { note: 0, file: 0, url: 0 } as Record<"note" | "file" | "url", number>;
    for (const item of groupedCounts) {
        if (item.type in stats) {
            stats[item.type as keyof typeof stats] = item._count._all;
        }
    }

    const statsContent = ["note", "file", "url"] as const;
    const nextStepsItems = ["files", "urls", "questions"] as const;

    return (
        <div className="flex h-full flex-col gap-6">
            <section className="grid flex-shrink-0 gap-4 sm:grid-cols-3">
                {statsContent.map((key) => (
                    <article
                        key={key}
                        className="rounded-2xl border border-border/30 bg-card/85 px-5 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70"
                    >
                        <p className="text-sm text-muted-foreground">{t(`stats.${key}.label`)}</p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">{stats[key]}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t(`stats.${key}.description`)}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="rounded-3xl border border-border/30 bg-card/85 px-6 py-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
                    <h2 className="text-lg font-semibold text-foreground">{t("nextSteps.title")}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{t("nextSteps.description")}</p>
                    <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {nextStepsItems.map((item) => (
                            <li key={item}>• {t(`nextSteps.items.${item}`)}</li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-3xl border border-border/30 bg-card/85 px-6 py-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
                    <h3 className="text-base font-semibold text-foreground">{t("latestNotes.title")}</h3>
                    <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {recentNotes.length === 0 ? (
                            <li className="text-muted-foreground">{t("latestNotes.empty")}</li>
                        ) : (
                            recentNotes.map((note) => {
                                const formattedDate = formatter.dateTime(note.createdAt, { dateStyle: "medium" });
                                const formattedTime = formatter.dateTime(note.createdAt, { timeStyle: "short" });

                                return (
                                    <li
                                        key={note.id}
                                        className="rounded-2xl border border-border/30 bg-background px-4 py-3 text-foreground shadow-sm"
                                    >
                                        <p className="font-medium">{note.title}</p>
                                        {note.source && (
                                            <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                                                {note.source.trim()}
                                            </p>
                                        )}
                                        <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                            {formattedDate} · {formattedTime}
                                        </p>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            </section>
        </div>
    );
}
