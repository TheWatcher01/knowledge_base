import { prisma } from "@/lib/prisma";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function KnowledgeBaseOverviewPage({ params }: PageProps) {
    const { id } = await params;

    const [groupedCounts, recentNotes] = await Promise.all([
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
    ]);

    const stats = { note: 0, file: 0, url: 0 } as Record<"note" | "file" | "url", number>;
    for (const item of groupedCounts) {
        if (item.type in stats) {
            stats[item.type as keyof typeof stats] = item._count._all;
        }
    }

    return (
        <>
            <section className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: "Notes",
                        value: stats.note,
                        description: "Ideas, meeting minutes, and contextual information.",
                    },
                    {
                        label: "Files",
                        value: stats.file,
                        description: "Documents imported to enrich the knowledge base.",
                    },
                    {
                        label: "URLs",
                        value: stats.url,
                        description: "External links used as references.",
                    },
                ].map((stat) => (
                    <article
                        key={stat.label}
                        className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_95%,black_5%)] px-5 py-4 shadow-[0_18px_32px_-30px_rgba(0,0,0,0.6)]"
                    >
                        <p className="text-sm text-[var(--kb-text-subtle)]">{stat.label}</p>
                        <p className="mt-2 text-3xl font-semibold text-[var(--kb-text)]">{stat.value}</p>
                        <p className="mt-1 text-xs text-[var(--kb-text-muted)]">{stat.description}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_92%,black_8%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
                    <h2 className="text-lg font-semibold text-[var(--kb-text)]">Next steps</h2>
                    <p className="mt-2 text-sm text-[var(--kb-text-subtle)]">
                        Plan upcoming actions to enrich this knowledge base.
                    </p>
                    <ul className="mt-4 space-y-3 text-sm text-[var(--kb-text-muted)]">
                        <li>• Add key files and check their ingestion.</li>
                        <li>• Enter reference URLs to keep the context up to date.</li>
                        <li>• Prepare sample questions for the future chat interface.</li>
                    </ul>
                </div>

                <div className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_95%,black_5%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
                    <h3 className="text-base font-semibold text-[var(--kb-text)]">Latest notes</h3>
                    <ul className="mt-4 space-y-3 text-sm text-[var(--kb-text-subtle)]">
                        {recentNotes.length === 0 ? (
                            <li className="text-[var(--kb-text-muted)]">
                                No notes yet. Add your first note from the “Notes” tab.
                            </li>
                        ) : (
                            recentNotes.map((note) => {
                                const formattedDate = note.createdAt.toLocaleDateString();
                                const formattedTime = note.createdAt.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

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
