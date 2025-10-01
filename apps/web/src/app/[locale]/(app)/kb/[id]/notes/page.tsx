import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateNoteForm } from "./_components/create-note-form";
import { NoteActions } from "./_components/note-actions";
import { getFormatter, getTranslations } from "next-intl/server";

type PageProps = {
    params: Promise<{ locale: string; id: string }>;
};

export default async function NotesPage({ params }: PageProps) {
    const { id, locale } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) redirect({ href: "/login", locale });
    const role = (session?.user?.role ?? "VIEWER") as "VIEWER" | "EDITOR" | "ADMIN";
    const canEdit = role !== "VIEWER";

    const kb = await prisma.knowledgeBase.findFirst({
        where: { id, ownerId: userId },
    });
    if (!kb) redirect({ href: "/kb", locale });

    const [notes, t, formatter] = await Promise.all([
        prisma.document.findMany({
            where: { kbId: id, type: "note" },
            orderBy: { createdAt: "desc" },
        }),
        getTranslations({ locale, namespace: "kb.notes" }),
        getFormatter({ locale }),
    ]);

    return (
        <section className="space-y-6">
            <CreateNoteForm kbId={id} canEdit={canEdit} />

            {notes.length === 0 ? (
                <p className="text-muted-foreground">{t("empty")}</p>
            ) : (
                <ul className="space-y-3">
                    {notes.map((note) => {
                        const formatted = formatter.dateTime(note.createdAt, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        });

                        const content = note.source ?? "";

                        return (
                            <li key={note.id} className="rounded border p-4">
                                <h3 className="text-lg font-medium">{note.title}</h3>

                                {content && (
                                    <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                        {content}
                                    </p>
                                )}
                                <p className="mt-3 text-xs text-muted-foreground">{formatted}</p>

                                <NoteActions
                                    noteId={note.id}
                                    initialTitle={note.title}
                                    initialContent={content}
                                    canEdit={canEdit}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
