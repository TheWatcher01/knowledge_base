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
        <section className="flex h-full flex-col gap-6">
            <div className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2 max-w-xl">
                        <h2 className="text-2xl font-semibold text-foreground">{t("title")}</h2>
                        <p className="text-sm text-muted-foreground">{t("description")}</p>
                    </div>
                    <FileUploadForm kbId={id} canEdit={canEdit} />
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border/40 bg-card/40 p-10 text-center shadow-sm">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
                    </div>
                </div>
            ) : (
                <section className="flex-1 space-y-3 overflow-y-auto pr-1">
                    <h3 className="text-base font-semibold text-foreground">{t("historyTitle")}</h3>
                    <FilesList files={entries} canEdit={canEdit} />
                </section>
            )}
        </section>
    );
}
