import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { CreateUrlForm } from "./_components/create-url-form";
import { UrlsList } from "./_components/urls-list";

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function KnowledgeBaseUrlsPage({ params }: PageProps) {
    const { id, locale } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) redirect({ href: "/login", locale });
    const role = (session?.user?.role ?? "VIEWER") as "VIEWER" | "EDITOR" | "ADMIN";
    const canEdit = role !== "VIEWER";

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
        <section className="flex h-full flex-col gap-6 min-h-0">
            <div className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold text-foreground">{t("title")}</h2>
                        <p className="text-sm text-muted-foreground">{t("description")}</p>
                    </div>
                    <CreateUrlForm kbId={id} canEdit={canEdit} />
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border/40 bg-card/40 p-10 text-center shadow-sm min-h-0">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
                    </div>
                </div>
            ) : (
                <section className="flex-1 min-h-0 space-y-3">
                    <h3 className="text-base font-semibold text-foreground">{t("listTitle")}</h3>
                    <UrlsList urls={entries} canEdit={canEdit} />
                </section>
            )}
        </section>
    );
}
