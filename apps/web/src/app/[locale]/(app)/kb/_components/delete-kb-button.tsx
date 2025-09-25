"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function DeleteKbButton({ kbId }: { kbId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = useTranslations("kb.delete");

    async function onDelete() {
        if (!confirm(t("confirm"))) return;
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/kb/${kbId}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            setError(payload?.error ?? t("error"));
            setLoading(false);
            return;
        }

        setLoading(false);
        router.refresh();
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                onClick={onDelete}
                className="rounded-md border border-destructive px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? t("submitting") : t("submit")}
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}
