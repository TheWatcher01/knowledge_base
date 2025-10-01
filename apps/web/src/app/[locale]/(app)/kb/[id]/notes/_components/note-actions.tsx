"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type NoteActionsProps = {
    noteId: string;
    initialTitle: string;
    initialContent: string;
    canEdit: boolean;
};

export function NoteActions({ noteId, initialTitle, initialContent, canEdit }: NoteActionsProps) {
    // Hooks and local state
    const router = useRouter();
    const t = useTranslations("kb.noteActions");
    const tPermissions = useTranslations("kb.permissions");

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync initial values when props change
    useEffect(() => {
        if (!isEditing) {
            setTitle(initialTitle);
            setContent(initialContent);
        }
    }, [initialTitle, initialContent, isEditing]);

    function startEditing() {
        if (!canEdit) return;
        setError(null);
        setIsEditing(true);
    }

    function cancelEditing() {
        setTitle(initialTitle);
        setContent(initialContent);
        setError(null);
        setIsEditing(false);
    }

    async function submitEdition(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canEdit) return;

        setUpdating(true);
        setError(null);

        const response = await fetch(`/api/notebook/${noteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
        });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            setError(payload?.error ?? t("updateError"));
            setUpdating(false);
            return;
        }

        setUpdating(false);
        setIsEditing(false);
        router.refresh();
    }

    async function deleteNote() {
        if (!canEdit) return;

        if (!window.confirm(t("deleteConfirm"))) {
            return;
        }

        setDeleting(true);
        setError(null);

        const response = await fetch(`/api/notebook/${noteId}`, { method: "DELETE" });

        if (!response.ok) {
            const payload = await response.json().catch(() => null);
            setError(payload?.error ?? t("deleteError"));
            setDeleting(false);
            return;
        }

        router.refresh();
        setDeleting(false);
    }

    return (
        <div className="mt-4 space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!canEdit && <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p>}

            {isEditing ? (
                <form onSubmit={submitEdition} className="space-y-2">
                    <input
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        disabled={updating || !canEdit}
                        required
                    />
                    <textarea
                        className="min-h-[120px] w-full rounded border px-3 py-2 text-sm"
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        disabled={updating || !canEdit}
                        required
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                            disabled={updating || !canEdit}
                        >
                            {updating ? t("saveLoading") : t("save")}
                        </button>
                        <button
                            type="button"
                            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                            onClick={cancelEditing}
                            disabled={updating}
                        >
                            {t("cancel")}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="rounded border px-3 py-2 text-sm disabled:opacity-50"
                        onClick={startEditing}
                        disabled={deleting || !canEdit}
                    >
                        {t("edit")}
                    </button>
                    <button
                        type="button"
                        className="rounded bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50"
                        onClick={deleteNote}
                        disabled={deleting || !canEdit}
                    >
                        {deleting ? t("deleteLoading") : t("delete")}
                    </button>
                </div>
            )}
        </div>
    );
}
