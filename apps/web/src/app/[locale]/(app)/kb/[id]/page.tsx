import { prisma } from "@/lib/prisma";
import { getFormatter, getTranslations } from "next-intl/server";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function KnowledgeBaseOverviewPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

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
        getTranslations({ namespace: "kb.overview" }),
        getFormatter(),
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
        <>
            <section className="grid gap-4 sm:grid-cols-3">
                {statsContent.map((key) => (
                    <article
                        key={key}
                        className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_95%,black_5%)] px-5 py-4 shadow-[0_18px_32px_-30px_rgba(0,0,0,0.6)]"
                    >
                        <p className="text-sm text-[var(--kb-text-subtle)]">{t(`stats.${key}.label`)}</p>
                        <p className="mt-2 text-3xl font-semibold text-[var(--kb-text)]">{stats[key]}</p>
                        <p className="mt-1 text-xs text-[var(--kb-text-muted)]">{t(`stats.${key}.description`)}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_92%,black_8%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
                    <h2 className="text-lg font-semibold text-[var(--kb-text)]">{t("nextSteps.title")}</h2>
                    <p className="mt-2 text-sm text-[var(--kb-text-subtle)]">{t("nextSteps.description")}</p>
                    <ul className="mt-4 space-y-3 text-sm text-[var(--kb-text-muted)]">
                        {nextStepsItems.map((item) => (
                            <li key={item}>• {t(`nextSteps.items.${item}`)}</li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_95%,black_5%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
                    <h3 className="text-base font-semibold text-[var(--kb-text)]">{t("latestNotes.title")}</h3>
                    <ul className="mt-4 space-y-3 text-sm text-[var(--kb-text-subtle)]">
                        {recentNotes.length === 0 ? (
                            <li className="text-[var(--kb-text-muted)]">{t("latestNotes.empty")}</li>
                        ) : (
                            recentNotes.map((note) => {
                                const formattedDate = formatter.dateTime(note.createdAt, { dateStyle: "medium" });
                                const formattedTime = formatter.dateTime(note.createdAt, { timeStyle: "short" });

                                return (
                                    <li
                                        key={note.id}
                                        className="rounded-lg border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] bg-[color-mix(in_srgb,var(--kb-surface)_90%,black_10%)] px-4 py-3 text-[var(--kb-text)] shadow-[0_14px_28px_-24px_rgba(0,0,0,0.55)]"
                                    >
                                        <p className="font-medium">{note.title}</p>
                                        {note.source && (
                                            <p className="mt-1 whitespace-pre-line text-xs text-[var(--kb-text-subtle)]">
                                                {note.source.trim()}
                                            </p>
                                        )}
                                        <p className="mt-2 text-[11px] uppercase tracking-wide text-[var(--kb-text-muted)]">
                                            {formattedDate} · {formattedTime}
                                        </p>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            </section>
        </>
    );
}
