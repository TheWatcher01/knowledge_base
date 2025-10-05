"use client";

import { useTranslations } from "next-intl";

import { FileUploadForm } from "../files/file-upload-form";
import { FilesList } from "../files/file-list";

export type FileEntry = {
    id: string;
    title: string;
    source: string | null;
    mimeType: string;
    size: number;
    createdAt: string;
};

type FilesSectionProps = {
    kbId: string;
    canEdit: boolean;
    files: FileEntry[];
};

export function FilesSection({ kbId, canEdit, files }: FilesSectionProps) {
    const t = useTranslations("kb.files");

    return (
        <section className="flex h-full flex-col gap-6">
            <div className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-2 max-w-xl">
                        <h2 className="text-2xl font-semibold text-foreground">{t("title")}</h2>
                        <p className="text-sm text-muted-foreground">{t("description")}</p>
                    </div>
                    <FileUploadForm kbId={kbId} canEdit={canEdit} />
                </div>
            </div>

            {files.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border/40 bg-card/40 p-10 text-center shadow-sm">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
                    </div>
                </div>
            ) : (
                <section className="flex-1 space-y-3 overflow-y-auto pr-1">
                    <h3 className="text-base font-semibold text-foreground">{t("historyTitle")}</h3>
                    <FilesList files={files} canEdit={canEdit} />
                </section>
            )}
        </section>
    );
}
