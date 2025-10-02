"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FileUploadFormProps = {
    kbId: string;
    canEdit: boolean;
};

export function FileUploadForm({ kbId, canEdit }: FileUploadFormProps) {
    const router = useRouter();
    const tForm = useTranslations("kb.fileForm");
    const tPermissions = useTranslations("kb.permissions");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [title, setTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canEdit || loading) {
            return;
        }
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
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{tForm("titleLabel")}</span>
                    <Input
                        placeholder={tForm("titlePlaceholder")}
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        disabled={loading || !canEdit}
                        required
                        className="h-11 rounded-2xl border-border/40 bg-background"
                    />
                </label>

                <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{tForm("fileLabel")}</span>
                    <Input
                        ref={fileInputRef}
                        type="file"
                        placeholder={tForm("filePlaceholder")}
                        onChange={(event) => {
                            setSelectedFile(event.target.files?.[0] ?? null);
                        }}
                        disabled={loading || !canEdit}
                        required
                        className="rounded-2xl border-border/40 bg-background"
                    />
                    <span className="text-xs text-muted-foreground">{tForm("filePlaceholder")}</span>
                </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={loading || !canEdit} className="rounded-full px-6">
                    {loading ? tForm("submitting") : tForm("submit")}
                </Button>
                {selectedFile ? (
                    <span className="text-xs text-muted-foreground">{selectedFile.name}</span>
                ) : null}
                {error ? <span className="text-sm text-red-500">{error}</span> : null}
            </div>

            {!canEdit ? (
                <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p>
            ) : null}
        </form>
    );
}
