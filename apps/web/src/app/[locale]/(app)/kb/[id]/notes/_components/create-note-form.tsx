"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function CreateNoteForm({ kbId, canEdit }: { kbId: string; canEdit: boolean }) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations("kb.noteForm");
    const tPermissions = useTranslations("kb.permissions");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canEdit || loading) {
            return;
        }
        setLoading(true);
        setError(null);

        const res = await fetch("/api/notebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kbId, title, content }),
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            setError(payload?.error ?? t("error"));
            setLoading(false);
            return;
        }

        setTitle("");
        setContent("");
        setLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
                <input
                    className="rounded border px-3 py-2 text-sm"
                    placeholder={t("titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading || !canEdit}
                />
            </div>
            <textarea
                className="min-h-[160px] w-full rounded border px-3 py-2 text-sm"
                placeholder={t("contentPlaceholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={loading || !canEdit}
            />
            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    disabled={loading || !canEdit}
                >
                    {loading ? t("submitting") : t("submit")}
                </button>
                {error && <span className="text-sm text-red-600">{error}</span>}
            </div>
            {!canEdit && (
                <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p>
            )}
        </form>
    );
}
