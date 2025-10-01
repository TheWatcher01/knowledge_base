import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { FileUploadForm } from "./_components/file-upload-form";
import { FilesList } from "./_components/file-list";

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function KnowledgeBaseFilesPage({ params }: PageProps) {
    const { id, locale } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) redirect({ href: "/login", locale });
    const role = (session?.user?.role ?? "VIEWER") as "VIEWER" | "EDITOR" | "ADMIN";
    const canEdit = role !== "VIEWER";

    const [files, t] = await Promise.all([
        prisma.document.findMany({
            where: { kbId: id, type: "file" },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                source: true,
                createdAt: true,
                fileAsset: {
                    select: {
                        size: true,
                        mimeType: true,
                    },
                },
            },
        }),
        getTranslations({ locale, namespace: "kb.files" }),
    ]);

    const entries = files.map((file) => ({
        id: file.id,
        title: file.title,
        source: file.source ?? null,
        mimeType: file.fileAsset?.mimeType ?? "application/octet-stream",
        size: file.fileAsset?.size ?? 0,
        createdAt: file.createdAt.toISOString(),
    }));

    return (
        <>
            <header className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-[var(--kb-text)]">{t("title")}</h2>
                <p className="text-sm text-[var(--kb-text-subtle)]">{t("description")}</p>
            </header>

            <FileUploadForm kbId={id} canEdit={canEdit} />

            {entries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--kb-border)_60%,transparent_40%)] bg-[color-mix(in_srgb,var(--kb-surface)_96%,black_4%)] px-6 py-10 text-center shadow-[0_16px_28px_-26px_rgba(0,0,0,0.55)]">
                    <h3 className="text-lg font-semibold text-[var(--kb-text)]">{t("emptyTitle")}</h3>
                    <p className="mt-2 text-sm text-[var(--kb-text-muted)]">{t("emptyDescription")}</p>
                </div>
            ) : (
                <section className="space-y-3">
                    <h3 className="text-base font-semibold text-[var(--kb-text)]">{t("historyTitle")}</h3>
                    <FilesList files={entries} canEdit={canEdit} />
                </section>
            )}
        </>
    );
}
