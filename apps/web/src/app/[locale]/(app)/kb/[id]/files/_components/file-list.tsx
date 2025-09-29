"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";

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
};

type BusyState = "rename" | "replace" | "delete" | null;

export function FilesList({ files }: { files: FileEntry[] }) {
    const formatter = useFormatter();
    const tFiles = useTranslations("kb.files");

    return (
        <ul className="space-y-3">
            {files.map((file) => {
                const createdDate = formatter.dateTime(new Date(file.createdAt), { dateStyle: "medium" });
                const createdTime = formatter.dateTime(new Date(file.createdAt), { timeStyle: "short" });
                const createdLabel = tFiles("entryDate", { date: createdDate, time: createdTime });

                return (
                    <li
                        key={file.id}
                        className="rounded-xl border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] bg-[color-mix(in_srgb,var(--kb-surface)_90%,black_10%)] px-5 py-4 shadow-[0_18px_30px_-26px_rgba(0,0,0,0.55)]"
                    >
                        <FileRow file={{ ...file, createdLabel }} />
                    </li>
                );
            })}
        </ul>
    );
}

function FileRow({ file }: RowProps) {
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
        fileInputRef.current?.click();
    }

    const formattedSize = formatBytes(file.size);
    const originalName = file.source ?? file.title;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {isRenaming ? (
                    <form className="flex flex-col gap-2" onSubmit={handleRename}>
                        <input
                            className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-2 text-sm text-[var(--kb-text)] focus:border-[var(--kb-highlight)] focus:outline-none"
                            placeholder={tForm("titlePlaceholder")}
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            disabled={busy === "rename"}
                        />
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                className="rounded bg-[var(--kb-highlight)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                                disabled={busy === "rename"}
                            >
                                {busy === "rename" ? tActions("renaming") : tActions("renameSave")}
                            </button>
                            <button
                                type="button"
                                className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-[var(--kb-text)] hover:border-[var(--kb-highlight)]"
                                onClick={() => {
                                    setIsRenaming(false);
                                    setTitle(file.title);
                                    setError(null);
                                }}
                                disabled={busy === "rename"}
                            >
                                {tActions("renameCancel")}
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p className="text-sm font-medium text-[var(--kb-text)]">{file.title}</p>
                        <p className="text-xs uppercase tracking-wide text-[var(--kb-text-muted)]">{file.createdLabel}</p>
                    </>
                )}
                <p className="text-xs text-[var(--kb-text-subtle)]">{tActions("originalName", { name: originalName })}</p>
                <p className="text-xs text-[var(--kb-text-muted)]">{tActions("fileMeta", { size: formattedSize, type: file.mimeType })}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <a
                    href={`/api/files/${file.id}`}
                    download={originalName}
                    className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-[var(--kb-text)] hover:border-[var(--kb-highlight)]"
                >
                    {tActions("download")}
                </a>
                <button
                    type="button"
                    className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-[var(--kb-text)] hover:border-[var(--kb-highlight)]"
                    onClick={() => {
                        setIsRenaming(true);
                        setError(null);
                    }}
                    disabled={busy !== null || isRenaming}
                >
                    {tActions("rename")}
                </button>
                <button
                    type="button"
                    className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-[var(--kb-text)] hover:border-[var(--kb-highlight)]"
                    onClick={handleReplaceClick}
                    disabled={busy !== null || isRenaming}
                >
                    {busy === "replace" ? tActions("replacing") : tActions("replace")}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    type="button"
                    className="rounded border border-[color-mix(in_srgb,var(--kb-border)_65%,transparent_35%)] px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-500"
                    onClick={handleDelete}
                    disabled={busy !== null || isRenaming}
                >
                    {busy === "delete" ? tActions("deleting") : tActions("delete")}
                </button>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
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
