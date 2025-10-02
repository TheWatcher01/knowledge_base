"use client";

import { useId, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

export function CreateNoteForm({ kbId, canEdit }: { kbId: string; canEdit: boolean }) {
    const router = useRouter();
    const tForm = useTranslations("kb.noteForm");
    const tNotes = useTranslations("kb.notes");
    const tActions = useTranslations("kb.urlActions");
    const tPermissions = useTranslations("kb.permissions");

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const titleFieldId = useId();
    const contentFieldId = useId();
    const errorMessageId = useId();

    function resetForm() {
        setTitle("");
        setContent("");
        setError(null);
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

        setLoading(true);
        setError(null);

        const response = await fetch("/api/notebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kbId, title, content }),
        });

        if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { error?: string };
            setError(payload?.error ?? tForm("error"));
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
                            {tNotes("description")}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-5" onSubmit={handleSubmit} aria-busy={loading}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={titleFieldId}>
                                <span className="font-medium text-foreground">{tForm("titlePlaceholder")}</span>
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
                        </div>

                        <label className="flex flex-col gap-2 text-sm text-muted-foreground" htmlFor={contentFieldId}>
                            <span className="font-medium text-foreground">{tForm("contentPlaceholder")}</span>
                            <Textarea
                                id={contentFieldId}
                                className="min-h-[160px] rounded-2xl border-border/40 bg-background px-4 py-3 text-sm"
                                placeholder={tForm("contentPlaceholder")}
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                required
                                disabled={loading || !canEdit}
                                aria-invalid={!!error}
                                aria-errormessage={error ? errorMessageId : undefined}
                            />
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
