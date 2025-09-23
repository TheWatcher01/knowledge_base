import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KnowledgeBaseTabs } from "./_components/kb-tabs";

type LayoutProps = {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
};

export default async function KnowledgeBaseLayout({ children, params }: LayoutProps) {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect("/login");
    }

    const kb = await prisma.knowledgeBase.findFirst({
        where: { id, ownerId: session.user.id },
        include: { _count: { select: { documents: true } } },
    });

    if (!kb) {
        notFound();
    }

    return (
        <section className="flex w-full flex-col gap-6">
            <header className="rounded-2xl border border-[color-mix(in_srgb,var(--kb-border)_78%,transparent_22%)] bg-[color-mix(in_srgb,var(--kb-surface)_88%,black_12%)] px-6 py-6 shadow-[0_22px_44px_-32px_rgba(0,0,0,0.85)] backdrop-blur-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-3xl font-semibold tracking-tight text-[var(--kb-text)]">{kb.name}</h1>
                        {kb.description ? (
                            <p className="max-w-3xl text-base text-[var(--kb-text-subtle)]">{kb.description}</p>
                        ) : (
                            <p className="text-sm text-[var(--kb-text-subtle)]">
                                Add a description to provide context for this knowledge base.
                            </p>
                        )}
                    </div>

                    <dl className="flex flex-wrap gap-3 text-xs sm:text-sm text-[var(--kb-text-muted)]">
                        <div className="flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--kb-highlight)_20%,transparent_80%)] px-3 py-1">
                            <dt className="font-medium text-[var(--kb-text)]">Created on</dt>
                            <dd>
                                <time dateTime={kb.createdAt.toISOString()}>
                                    {kb.createdAt.toLocaleDateString()}
                                </time>
                            </dd>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--kb-highlight)_20%,transparent_80%)] px-3 py-1">
                            <dt className="font-medium text-[var(--kb-text)]">Documents</dt>
                            <dd>{kb._count.documents}</dd>
                        </div>
                    </dl>
                </div>
            </header>

            <KnowledgeBaseTabs kbId={kb.id} />

            <div className="rounded-2xl border border-[color-mix(in_srgb,var(--kb-border)_78%,transparent_22%)] bg-[color-mix(in_srgb,var(--kb-surface)_94%,black_6%)] px-6 py-6 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.75)] backdrop-blur-sm">
                <div className="flex flex-col gap-6">{children}</div>
            </div>
        </section>
    );
}
