import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateNoteForm } from "./_components/create-note-form";
import { getFormatter, getTranslations } from "next-intl/server";

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function NotesPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { id, locale } = resolvedParams;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect({ href: "/login", locale });

    const kb = await prisma.knowledgeBase.findFirst({
        where: { id, ownerId: session.user.id },
    });
    if (!kb) redirect({ href: "/kb", locale });

    const [notes, t, formatter] = await Promise.all([
        prisma.document.findMany({
            where: { kbId: id, type: "note" },
            orderBy: { createdAt: "desc" },
        }),
        getTranslations({ namespace: "kb.notes" }),
        getFormatter(),
    ]);

    return (
        <section className="space-y-6">
            <CreateNoteForm kbId={id} />

            {notes.length === 0 ? (
                <p className="text-muted-foreground">{t("empty")}</p>
            ) : (
                <ul className="space-y-3">
                    {notes.map((note) => (
                        <li key={note.id} className="rounded border p-4">
                            <h3 className="text-lg font-medium">{note.title}</h3>
                            {note.source && (
                                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                    {note.source}
                                </p>
                            )}
                            <p className="mt-3 text-xs text-muted-foreground">
                                {formatter.dateTime(note.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
