import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateKbForm } from "./_components/create-kb-form";
import { DeleteKbButton } from "./_components/delete-kb-button";

export default async function KnowledgeBasesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const knowledgeBases = await prisma.knowledgeBase.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <section className="space-y-6 w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Knowledge Bases</h1>
                    <p className="text-muted-foreground">
                        Create, manage, and open your knowledge bases.
                    </p>
                </div>
                <CreateKbForm />
            </div>

            {knowledgeBases.length === 0 ? (
                <p className="text-muted-foreground">
                    No knowledge base yet. Create one to get started.
                </p>
            ) : (
                <ul className="space-y-3">
                    {knowledgeBases.map((kb) => (
                        <li
                            key={kb.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <div className="text-lg font-medium">{kb.name}</div>
                                {kb.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {kb.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/kb/${kb.id}`}
                                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                                >
                                    Open
                                </Link>
                                <DeleteKbButton kbId={kb.id} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
