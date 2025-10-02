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
        <section className="flex h-full flex-col gap-6">
            <div className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold text-foreground">{t("title")}</h2>
                    <p className="text-sm text-muted-foreground">{t("description")}</p>
                </div>
                <div className="mt-6">
                    <CreateNoteForm kbId={id} canEdit={canEdit} />
                </div>
            </div>

            {notes.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border/40 bg-card/40 p-8 text-center shadow-sm">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{t("empty")}</h3>
                        <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
                    </div>
                </div>
            ) : (
                <ul className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {notes.map((note) => {
                        const formatted = formatter.dateTime(note.createdAt, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        });

                        const content = note.source ?? "";

                        return (
                            <li
                                key={note.id}
                                className="rounded-2xl border border-border/30 bg-background px-5 py-4 shadow-sm transition hover:border-primary/40"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-lg font-semibold text-foreground">{note.title}</h3>
                                        <span className="text-xs text-muted-foreground">{formatted}</span>
                                    </div>
                                    {content && (
                                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{content}</p>
                                    )}
                                </div>

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
