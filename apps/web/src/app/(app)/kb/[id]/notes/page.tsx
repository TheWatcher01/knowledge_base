import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateNoteForm } from "./_components/create-note-form";

export default async function NotesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const kb = await prisma.knowledgeBase.findFirst({
        where: { id, ownerId: session.user.id },
    });
    if (!kb) redirect("/kb");

    const notes = await prisma.document.findMany({
        where: { kbId: id, type: "note" },
        orderBy: { createdAt: "desc" },
    });

    return (
        <section className="space-y-6">
            <CreateNoteForm kbId={id} />

            {notes.length === 0 ? (
                <p className="text-muted-foreground">No notes yet.</p>
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
                                {note.createdAt.toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
