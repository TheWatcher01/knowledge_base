"use client";

import { useFormatter, useTranslations } from "next-intl";

export type OverviewStats = {
    note: number;
    file: number;
    url: number;
};

export type OverviewNote = {
    id: string;
    title: string | null;
    content: string | null;
    createdAt: string;
};

type OverviewSectionProps = {
    stats: OverviewStats;
    notes: OverviewNote[];
};

export function OverviewSection({ stats, notes }: OverviewSectionProps) {
    const t = useTranslations("kb.overview");
    const formatter = useFormatter();

    const noteList = notes.slice(0, 3);

    return (
        <div className="flex h-full flex-col gap-6">
            <section className="grid flex-shrink-0 gap-4 sm:grid-cols-3">
                {(["note", "file", "url"] as const).map((key) => (
                    <article
                        key={key}
                        className="rounded-2xl border border-border/30 bg-card/85 px-5 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70"
                    >
                        <p className="text-sm text-muted-foreground">{t(`stats.${key}.label`)}</p>
                        <p className="mt-2 text-3xl font-semibold text-foreground">{stats[key]}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t(`stats.${key}.description`)}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)] lg:justify-items-stretch">
                <div className="rounded-3xl border border-border/30 bg-card/85 px-6 py-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
                    <h3 className="text-base font-semibold text-foreground">{t("latestNotes.title")}</h3>
                    <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                        {noteList.length === 0 ? (
                            <li className="text-muted-foreground">{t("latestNotes.empty")}</li>
                        ) : (
                            noteList.map((note) => {
                                const createdDate = new Date(note.createdAt);
                                const formattedDate = formatter.dateTime(createdDate, { dateStyle: "medium" });
                                const formattedTime = formatter.dateTime(createdDate, { timeStyle: "short" });

                                return (
                                    <li
                                        key={note.id}
                                        className="rounded-2xl border border-border/30 bg-background px-4 py-3 text-foreground shadow-sm"
                                    >
                                        <p className="font-medium">{note.title}</p>
                                        {note.content ? (
                                            <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">
                                                {note.content.trim()}
                                            </p>
                                        ) : null}
                                        <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                            {formattedDate} · {formattedTime}
                                        </p>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            </section>
        </div>
    );
}
