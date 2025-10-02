"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <Input
                    placeholder={t("titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading || !canEdit}
                    className="h-11 rounded-2xl border-border/40 bg-background"
                />
            </div>
            <Textarea
                className="min-h-[160px] rounded-2xl border-border/40 bg-background px-4 py-3 text-sm"
                placeholder={t("contentPlaceholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={loading || !canEdit}
            />
            <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" className="rounded-full px-6" disabled={loading || !canEdit}>
                    {loading ? t("submitting") : t("submit")}
                </Button>
                {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
            {!canEdit && (
                <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p>
            )}
        </form>
    );
}
