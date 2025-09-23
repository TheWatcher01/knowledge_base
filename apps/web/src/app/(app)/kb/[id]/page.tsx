// apps/web/src/app/(app)/kb/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KnowledgeBaseTabs } from "./_components/kb-tabs";

export default async function KnowledgeBasePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const kb = await prisma.knowledgeBase.findFirst({
        where: { id: (await params).id, ownerId: session.user.id },

        include: { _count: { select: { documents: true } } },
    });

    if (!kb) notFound();

    return (
        <section className="flex w-full flex-col gap-6">
            <header className="flex flex-col gap-3">
                <div>
                    <h1 className="text-3xl font-semibold">{kb.name}</h1>
                    {kb.description && (
                        <p className="text-muted-foreground mt-1">{kb.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>
                        Créée le {kb.createdAt.toLocaleDateString()}
                    </span>
                    <span>{kb._count.documents} documents</span>
                </div>
            </header>

            <KnowledgeBaseTabs kbId={kb.id} />

            <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-2 text-xl font-semibold">Vue d’ensemble</h2>
                <p className="text-muted-foreground">
                    Tu pourras y afficher statistiques, derniers ajouts, etc.
                </p>
            </div>
        </section>
    );
}
