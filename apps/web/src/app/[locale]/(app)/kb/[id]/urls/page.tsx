import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { CreateUrlForm } from "./_components/create-url-form";
import { UrlsList } from "./_components/urls-list";

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function KnowledgeBaseUrlsPage({ params }: PageProps) {
    const { id, locale } = await params;

    const [urls, t] = await Promise.all([
        prisma.document.findMany({
            where: { kbId: id, type: "url" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
                urlEntry: {
                    select: {
                        url: true,
                        description: true,
                        status: true,
                        updatedAt: true,
                    },
                },
            },
        }),
        getTranslations({ locale, namespace: "kb.urls" }),
    ]);

    const entries = urls.flatMap((url) => {
        if (!url.urlEntry) {
            return [];
        }

        return [
            {
                id: url.id,
                title: url.title,
                url: url.urlEntry.url,
                description: url.urlEntry.description,
                status: url.urlEntry.status,
                createdAt: url.createdAt.toISOString(),
                updatedAt: url.urlEntry.updatedAt.toISOString(),
            },
        ];
    });

    return (
        <>
            <header className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-[var(--kb-text)]">{t("title")}</h2>
                <p className="text-sm text-[var(--kb-text-subtle)]">{t("description")}</p>
            </header>

            <CreateUrlForm kbId={id} />

            {entries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--kb-border)_60%,transparent_40%)] bg-[color-mix(in_srgb,var(--kb-surface)_96%,black_4%)] px-6 py-10 text-center shadow-[0_16px_28px_-26px_rgba(0,0,0,0.55)]">
                    <h3 className="text-lg font-semibold text-[var(--kb-text)]">{t("emptyTitle")}</h3>
                    <p className="mt-2 text-sm text-[var(--kb-text-muted)]">{t("emptyDescription")}</p>
                </div>
            ) : (
                <section className="space-y-4">
                    <h3 className="text-base font-semibold text-[var(--kb-text)]">{t("listTitle")}</h3>
                    <UrlsList urls={entries} />
                </section>
            )}
        </>
    );
}
