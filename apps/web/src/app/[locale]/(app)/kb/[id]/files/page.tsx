import { prisma } from "@/lib/prisma";
import { getFormatter, getTranslations } from "next-intl/server";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function KnowledgeBaseFilesPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const [files, t, formatter] = await Promise.all([
        prisma.document.findMany({
            where: { kbId: id, type: "file" },
            orderBy: { createdAt: "desc" },
        }),
        getTranslations({ namespace: "kb.files" }),
        getFormatter(),
    ]);

    return (
        <>
            <header className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-[var(--kb-text)]">{t("title")}</h2>
                <p className="text-sm text-[var(--kb-text-subtle)]">{t("description")}</p>
            </header>

            <section className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_92%,black_8%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-medium text-[var(--kb-text)]">{t("ctaTitle")}</h3>
                        <p className="text-sm text-[var(--kb-text-muted)]">{t("ctaDescription")}</p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[var(--kb-border)] bg-[color-mix(in_srgb,var(--kb-highlight)_20%,transparent_80%)] px-4 py-2 text-sm font-medium text-[var(--kb-text-muted)]"
                        disabled
                        aria-disabled="true"
                    >
                        {t("ctaDisabled")}
                    </button>
                </div>
            </section>

            {files.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--kb-border)_60%,transparent_40%)] bg-[color-mix(in_srgb,var(--kb-surface)_96%,black_4%)] px-6 py-10 text-center shadow-[0_16px_28px_-26px_rgba(0,0,0,0.55)]">
                    <h3 className="text-lg font-semibold text-[var(--kb-text)]">{t("emptyTitle")}</h3>
                    <p className="mt-2 text-sm text-[var(--kb-text-muted)]">{t("emptyDescription")}</p>
                </div>
            ) : (
                <section className="space-y-3">
                    <h3 className="text-base font-semibold text-[var(--kb-text)]">{t("historyTitle")}</h3>
                    <ul className="space-y-3">
                        {files.map((file) => {
                            const created = formatter.dateTime(file.createdAt, { dateStyle: "medium" });
                            const createdTime = formatter.dateTime(file.createdAt, { timeStyle: "short" });

                            return (
                                <li
                                    key={file.id}
                                    className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] bg-[color-mix(in_srgb,var(--kb-surface)_90%,black_10%)] px-5 py-4 shadow-[0_18px_30px_-26px_rgba(0,0,0,0.55)]"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium text-[var(--kb-text)]">{file.title}</p>
                                        <p className="text-xs uppercase tracking-wide text-[var(--kb-text-muted)]">
                                            {t("entryDate", { date: created, time: createdTime })}
                                        </p>
                                        {file.source && (
                                            <p className="mt-2 text-xs text-[var(--kb-text-subtle)]">
                                                {file.source.substring(0, 180)}
                                                {file.source.length > 180 ? "…" : ""}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </>
    );
}
