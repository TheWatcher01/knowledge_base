import { prisma } from "@/lib/prisma";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function KnowledgeBaseFilesPage({ params }: PageProps) {
    const { id } = await params;

    const files = await prisma.document.findMany({
        where: { kbId: id, type: "file" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <>
            <header className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-[var(--kb-text)]">Imported files</h2>
                <p className="text-sm text-[var(--kb-text-subtle)]">
                    Centralize here the documents (PDF, DOCX, etc.) that enrich this knowledge base.
                </p>
            </header>

            <section className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_92%,black_8%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-base font-medium text-[var(--kb-text)]">Import a document</h3>
                        <p className="text-sm text-[var(--kb-text-muted)]">
                            Upload and content extraction will be available in the next iteration.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[var(--kb-border)] bg-[color-mix(in_srgb,var(--kb-highlight)_20%,transparent_80%)] px-4 py-2 text-sm font-medium text-[var(--kb-text-muted)]"
                        disabled
                        aria-disabled="true"
                    >
                        Add a file (soon)
                    </button>
                </div>
            </section>

            {files.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--kb-border)_60%,transparent_40%)] bg-[color-mix(in_srgb,var(--kb-surface)_96%,black_4%)] px-6 py-10 text-center shadow-[0_16px_28px_-26px_rgba(0,0,0,0.55)]">
                    <h3 className="text-lg font-semibold text-[var(--kb-text)]">No files yet</h3>
                    <p className="mt-2 text-sm text-[var(--kb-text-muted)]">
                        When you add files, they will appear here with their import date and indexing status.
                    </p>
                </div>
            ) : (
                <section className="space-y-3">
                    <h3 className="text-base font-semibold text-[var(--kb-text)]">Import history</h3>
                    <ul className="space-y-3">
                        {files.map((file) => {
                            const created = file.createdAt.toLocaleDateString();
                            const createdTime = file.createdAt.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            return (
                                <li
                                    key={file.id}
                                    className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] bg-[color-mix(in_srgb,var(--kb-surface)_90%,black_10%)] px-5 py-4 shadow-[0_18px_30px_-26px_rgba(0,0,0,0.55)]"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-medium text-[var(--kb-text)]">{file.title}</p>
                                        <p className="text-xs uppercase tracking-wide text-[var(--kb-text-muted)]">
                                            Imported on {created} · {createdTime}
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
