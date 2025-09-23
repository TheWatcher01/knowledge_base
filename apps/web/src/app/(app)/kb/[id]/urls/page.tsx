import { prisma } from "@/lib/prisma";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function KnowledgeBaseUrlsPage({ params }: PageProps) {
    const { id } = await params;

    const urls = await prisma.document.findMany({
        where: { kbId: id, type: "url" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <>
            <header className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-[var(--kb-text)]">Online resources</h2>
                <p className="text-sm text-[var(--kb-text-subtle)]">
                    List reference web pages for this knowledge base and keep them easily accessible.
                </p>
            </header>

            <section className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_92%,black_8%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-medium text-[var(--kb-text)]">Add a link</h3>
                        <p className="text-sm text-[var(--kb-text-muted)]">
                            The enrichment form will be available soon (validation, normalization, and indexing).
                        </p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[var(--kb-border)] bg-[color-mix(in_srgb,var(--kb-highlight)_20%,transparent_80%)] px-4 py-2 text-sm font-medium text-[var(--kb-text-muted)]"
                        disabled
                        aria-disabled="true"
                    >
                        Add a URL (coming soon)
                    </button>
                </div>
            </section>

            {urls.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--kb-border)_60%,transparent_40%)] bg-[color-mix(in_srgb,var(--kb-surface)_96%,black_4%)] px-6 py-10 text-center shadow-[0_16px_28px_-26px_rgba(0,0,0,0.55)]">
                    <h3 className="text-lg font-semibold text-[var(--kb-text)]">No link saved</h3>
                    <p className="mt-2 text-sm text-[var(--kb-text-muted)]">
                        Soon you will be able to store relevant URLs here, with a summary of the content and their indexing status.
                    </p>
                </div>
            ) : (
                <section className="space-y-4">
                    <h3 className="text-base font-semibold text-[var(--kb-text)]">Saved links</h3>
                    <ul className="space-y-3">
                        {urls.map((url) => {
                            const created = url.createdAt.toLocaleDateString();
                            const createdTime = url.createdAt.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            return (
                                <li
                                    key={url.id}
                                    className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] bg-[color-mix(in_srgb,var(--kb-surface)_90%,black_10%)] px-5 py-4 shadow-[0_18px_30px_-26px_rgba(0,0,0,0.55)]"
                                >
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm font-medium text-[var(--kb-text)]">{url.title ?? "Untitled link"}</p>
                                        {url.source ? (
                                            <a
                                                href={url.source}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex w-fit items-center gap-2 text-sm text-[var(--kb-accent)] underline underline-offset-4 hover:text-[var(--kb-accent-strong)]"
                                            >
                                                Open link in new tab
                                            </a>
                                        ) : (
                                            <p className="text-xs italic text-[var(--kb-text-muted)]">
                                                URL not provided — please complete to facilitate access.
                                            </p>
                                        )}

                                        <p className="text-[11px] uppercase tracking-wide text-[var(--kb-text-muted)]">
                                            Added on {created} · {createdTime}
                                        </p>
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
