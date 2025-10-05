"use client";

import { useTranslations } from "next-intl";

import { CreateUrlForm } from "../urls/create-url-form";
import { UrlsList } from "../urls/urls-list";

export type UrlEntry = {
    id: string;
    title: string | null;
    url: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
};

type UrlsSectionProps = {
    kbId: string;
    canEdit: boolean;
    urls: UrlEntry[];
};

export function UrlsSection({ kbId, canEdit, urls }: UrlsSectionProps) {
    const t = useTranslations("kb.urls");

    return (
        <section className="flex h-full flex-col gap-6 min-h-0">
            <div className="rounded-3xl border border-border/40 bg-card/95 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-semibold text-foreground">{t("title")}</h2>
                        <p className="text-sm text-muted-foreground">{t("description")}</p>
                    </div>
                    <CreateUrlForm kbId={kbId} canEdit={canEdit} />
                </div>
            </div>

            {urls.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-border/40 bg-card/40 p-10 text-center shadow-sm min-h-0">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h3>
                        <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
                    </div>
                </div>
            ) : (
                <section className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
                    <h3 className="text-base font-semibold text-foreground">{t("listTitle")}</h3>
                    <UrlsList urls={urls} canEdit={canEdit} />
                </section>
            )}
        </section>
    );
}
