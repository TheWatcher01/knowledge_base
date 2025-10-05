"use client";

import { useFormatter, useTranslations } from "next-intl";

import { CreateNoteForm } from "../notes/create-note-form";
import { NoteActions } from "../notes/note-actions";

export type NoteEntry = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
};

type NotesSectionProps = {
    kbId: string;
    canEdit: boolean;
    notes: NoteEntry[];
};

export function NotesSection({ kbId, canEdit, notes }: NotesSectionProps) {
    const t = useTranslations("kb.notes");
    const formatter = useFormatter();

    return (
        <section className="flex h-full flex-col gap-6">
            <div className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold text-foreground">{t("title")}</h2>
                        <p className="text-sm text-muted-foreground">{t("description")}</p>
                    </div>
                    <CreateNoteForm kbId={kbId} canEdit={canEdit} />
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
                        const createdAt = new Date(note.createdAt);
                        const formatted = formatter.dateTime(createdAt, {
                            dateStyle: "medium",
                            timeStyle: "short",
                        });

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
                                    {note.content ? (
                                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note.content}</p>
                                    ) : null}
                                </div>

                                <NoteActions
                                    noteId={note.id}
                                    initialTitle={note.title}
                                    initialContent={note.content}
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
