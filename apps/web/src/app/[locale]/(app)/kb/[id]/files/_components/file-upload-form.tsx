"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type FileUploadFormProps = {
    kbId: string;
};

export function FileUploadForm({ kbId }: FileUploadFormProps) {
    const router = useRouter();
    const tForm = useTranslations("kb.fileForm");
    const tFiles = useTranslations("kb.files");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [title, setTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError(tForm("titleRequired"));
            return;
        }

        if (!selectedFile) {
            setError(tForm("fileRequired"));
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("kbId", kbId);
        formData.append("title", trimmedTitle);
        formData.append("file", selectedFile);

        const response = await fetch("/api/files", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { error?: string };
            setError(payload?.error ?? tForm("genericError"));
            setLoading(false);
            return;
        }

        setTitle("");
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setLoading(false);
        router.refresh();
    }

    return (
        <section className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_70%,transparent_30%)] bg-[color-mix(in_srgb,var(--kb-surface)_92%,black_8%)] px-6 py-5 shadow-[0_18px_34px_-28px_rgba(0,0,0,0.6)]">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <h3 className="text-base font-medium text-[var(--kb-text)]">{tFiles("ctaTitle")}</h3>
                    <p className="text-sm text-[var(--kb-text-muted)]">{tFiles("ctaDescription")}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
                        <span className="font-medium text-[var(--kb-text)]">{tForm("titleLabel")}</span>
                        <input
                            className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
                            placeholder={tForm("titlePlaceholder")}
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            disabled={loading}
                            required
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-sm text-[var(--kb-text-subtle)]">
                        <span className="font-medium text-[var(--kb-text)]">{tForm("fileLabel")}</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
                            title={tForm("filePlaceholder")}
                            onChange={(event) => {
                                setSelectedFile(event.target.files?.[0] ?? null);
                            }}
                            disabled={loading}
                            required
                        />
                        <span className="text-xs text-[var(--kb-text-muted)]">{tForm("filePlaceholder")}</span>
                    </label>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        type="submit"
                        className="rounded bg-[var(--kb-highlight)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? tForm("submitting") : tForm("submit")}
                    </button>
                    {selectedFile && (
                        <span className="text-xs text-[var(--kb-text-muted)]">{selectedFile.name}</span>
                    )}
                    {error && <span className="text-sm text-red-600">{error}</span>}
                </div>
            </form>
        </section>
    );
}
