"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FileEntry = {
    id: string;
    title: string;
    source: string | null;
    mimeType: string;
    size: number;
    createdAt: string;
};

type RowProps = {
    file: FileEntry & { createdLabel: string };
    canEdit: boolean;
};

type BusyState = "rename" | "replace" | "delete" | null;

export function FilesList({ files, canEdit }: { files: FileEntry[]; canEdit: boolean }) {
    const formatter = useFormatter();
    const tFiles = useTranslations("kb.files");
    const tPermissions = useTranslations("kb.permissions");

    return (
        <div className="space-y-3">
            {!canEdit ? <p className="text-sm text-muted-foreground">{tPermissions("viewOnlyMessage")}</p> : null}
            <ul className="space-y-3">
                {files.map((file) => {
                    const createdDate = formatter.dateTime(new Date(file.createdAt), { dateStyle: "medium" });
                    const createdTime = formatter.dateTime(new Date(file.createdAt), { timeStyle: "short" });
                    const createdLabel = tFiles("entryDate", { date: createdDate, time: createdTime });

                    return (
                        <li
                            key={file.id}
                            className="rounded-2xl border border-border/30 bg-card/80 px-5 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60"
                        >
                            <FileRow file={{ ...file, createdLabel }} canEdit={canEdit} />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function FileRow({ file, canEdit }: RowProps) {
    const router = useRouter();
    const tActions = useTranslations("kb.fileActions");
    const tForm = useTranslations("kb.fileForm");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [title, setTitle] = useState(file.title);
    const [isRenaming, setIsRenaming] = useState(false);
    const [busy, setBusy] = useState<BusyState>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTitle(file.title);
    }, [file.title]);

    async function handleRename(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canEdit) {
            return;
        }
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError(tForm("titleRequired"));
            return;
        }

        if (trimmedTitle === file.title) {
            setIsRenaming(false);
            return;
        }

        setBusy("rename");
        setError(null);

        const formData = new FormData();
        formData.append("title", trimmedTitle);

        const response = await fetch(`/api/files/${file.id}`, {
            method: "PATCH",
            body: formData,
        });

        if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { error?: string };
            setError(payload?.error ?? tActions("renameError"));
            setBusy(null);
            return;
        }

        setBusy(null);
        setIsRenaming(false);
        router.refresh();
    }

    async function handleDelete() {
        if (!canEdit) {
            return;
        }
        if (!window.confirm(tActions("deleteConfirm", { title: file.title }))) {
            return;
        }

        setBusy("delete");
        setError(null);

        const response = await fetch(`/api/files/${file.id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { error?: string };
            setError(payload?.error ?? tActions("deleteError"));
            setBusy(null);
            return;
        }

        setBusy(null);
        router.refresh();
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (!canEdit) {
            event.target.value = "";
            return;
        }

        const nextFile = event.target.files?.[0];
        event.target.value = "";

        if (!nextFile) {
            return;
        }

        setBusy("replace");
        setError(null);

        const formData = new FormData();
        formData.append("file", nextFile);

        const response = await fetch(`/api/files/${file.id}`, {
            method: "PATCH",
            body: formData,
        });

        if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { error?: string };
            setError(payload?.error ?? tActions("replaceError"));
            setBusy(null);
            return;
        }

        setBusy(null);
        router.refresh();
    }

    function handleReplaceClick() {
        if (!canEdit) {
            return;
        }
        fileInputRef.current?.click();
    }

    const formattedSize = formatBytes(file.size);
    const originalName = file.source ?? file.title;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {isRenaming ? (
                    <form className="space-y-3" onSubmit={handleRename}>
                        <Input
                            placeholder={tForm("titlePlaceholder")}
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            disabled={!canEdit || busy === "rename"}
                            className="h-11 rounded-2xl border-border/40 bg-background"
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                className="rounded-full px-4"
                                disabled={!canEdit || busy === "rename"}
                            >
                                {busy === "rename" ? tActions("renaming") : tActions("renameSave")}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full px-4"
                                onClick={() => {
                                    setIsRenaming(false);
                                    setTitle(file.title);
                                    setError(null);
                                }}
                                disabled={!canEdit || busy === "rename"}
                            >
                                {tActions("renameCancel")}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-foreground">{file.title}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{file.createdLabel}</p>
                    </div>
                )}
                <p className="text-xs text-muted-foreground">{tActions("originalName", { name: originalName })}</p>
                <p className="text-xs text-muted-foreground">{tActions("fileMeta", { size: formattedSize, type: file.mimeType })}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" className="rounded-full px-4">
                    <a href={`/api/files/${file.id}`} download={originalName}>
                        {tActions("download")}
                    </a>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4"
                    onClick={() => {
                        if (!canEdit) {
                            return;
                        }
                        setIsRenaming(true);
                        setError(null);
                    }}
                    disabled={!canEdit || busy !== null || isRenaming}
                >
                    {tActions("rename")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4"
                    onClick={handleReplaceClick}
                    disabled={!canEdit || busy !== null || isRenaming}
                >
                    {busy === "replace" ? tActions("replacing") : tActions("replace")}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!canEdit}
                />
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-full px-4"
                    onClick={handleDelete}
                    disabled={!canEdit || busy !== null || isRenaming}
                >
                    {busy === "delete" ? tActions("deleting") : tActions("delete")}
                </Button>
            </div>

            {error ? <p className="text-xs text-red-500">{error}</p> : null}
        </div>
    );
}

function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exponent;

    return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
