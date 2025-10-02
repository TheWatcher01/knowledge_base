"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { LiveMessage } from "@/components/a11y/live-message";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type FileUploadFormProps = {
    kbId: string;
    canEdit: boolean;
};

export function FileUploadForm({ kbId, canEdit }: FileUploadFormProps) {
    const router = useRouter();
    const tForm = useTranslations("kb.fileForm");
    const tFiles = useTranslations("kb.files");
    const tActions = useTranslations("kb.urlActions");
    const tPermissions = useTranslations("kb.permissions");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const titleFieldId = useId();
    const fileFieldId = useId();
    const errorMessageId = useId();

    function resetForm() {
        setTitle("");
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    function handleDialogOpenChange(next: boolean) {
        if (!canEdit) {
            setOpen(false);
            return;
        }

        if (!next && loading) {
            return;
        }

        setOpen(next);

        if (!next) {
            resetForm();
        }
    }

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

        resetForm();
        setLoading(false);
        setOpen(false);
        router.refresh();
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Dialog open={open} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        className="rounded-full px-6"
                        disabled={!canEdit}
                        aria-disabled={!canEdit}
                    >
                        {tForm("submit")}
                    </Button>
                </DialogTrigger>

                <DialogContent
                    showCloseButton
                    className="sm:max-w-xl rounded-3xl border border-border/40 bg-card/95 px-6 py-6 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/90"
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                        requestAnimationFrame(() => {
                            const field = document.getElementById(titleFieldId);
                            field?.focus();
                        });
                    }}
                >
                    <DialogHeader className="space-y-2 text-left">
                        <DialogTitle className="text-2xl font-semibold text-foreground">
                            {tForm("submit")}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {tFiles("ctaDescription")}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-5" onSubmit={handleSubmit} aria-busy={loading}>
                        <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={titleFieldId}>
                            <span className="font-medium text-foreground">{tForm("titleLabel")}</span>
                            <Input
                                id={titleFieldId}
                                placeholder={tForm("titlePlaceholder")}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                disabled={loading || !canEdit}
                                required
                                className="h-11 rounded-2xl border-border/40 bg-background focus-ring"
                                aria-invalid={!!error}
                                aria-errormessage={error ? errorMessageId : undefined}
                            />
                        </label>

                        <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={fileFieldId}>
                            <span className="font-medium text-foreground">{tForm("fileLabel")}</span>
                            <Input
                                id={fileFieldId}
                                ref={fileInputRef}
                                type="file"
                                onChange={(event) => {
                                    setSelectedFile(event.target.files?.[0] ?? null);
                                }}
                                disabled={loading || !canEdit}
                                required
                                className="rounded-2xl border-border/40 bg-background"
                                aria-invalid={!!error}
                                aria-errormessage={error ? errorMessageId : undefined}
                            />
                            <span className="text-xs text-muted-foreground">{tForm("filePlaceholder")}</span>
                            {selectedFile ? (
                                <span className="text-xs text-muted-foreground">{selectedFile.name}</span>
                            ) : null}
                        </label>

                        {error ? (
                            <LiveMessage tone="assertive" id={errorMessageId} className="text-sm text-red-500">
                                {error}
                            </LiveMessage>
                        ) : null}

                        <DialogFooter className="gap-3">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={loading}>
                                    {tActions("cancel")}
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                className="rounded-full px-6"
                                disabled={loading || !canEdit}
                                aria-disabled={loading || !canEdit}
                            >
                                {loading ? tForm("submitting") : tForm("submit")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {!canEdit ? (
                <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p>
            ) : null}
        </div>
    );
}
