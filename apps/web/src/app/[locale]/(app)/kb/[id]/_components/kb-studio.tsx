"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
    AudioLines,
    BotMessageSquare,
    BrainCircuit,
    FileText,
    Milestone,
    Sparkles,
    Video,
} from "lucide-react";
import { useTranslations } from "next-intl";

type KnowledgeBaseStudioProps = {
    kbId: string;
    className?: string;
};

type StudioAction = {
    key: string;
    icon: React.ElementType;
    href: string;
};

export function KnowledgeBaseStudio({ kbId, className }: KnowledgeBaseStudioProps) {
    const t = useTranslations("kb.workspace");

    const studioActions: StudioAction[] = [
        { key: "audio", icon: AudioLines, href: `/kb/${kbId}/chat?mode=audio-summary` },
        { key: "video", icon: Video, href: `/kb/${kbId}/chat?mode=video-summary` },
        { key: "mindmap", icon: BrainCircuit, href: `/kb/${kbId}/chat?mode=mindmap` },
        { key: "report", icon: FileText, href: `/kb/${kbId}/chat?mode=report` },
        { key: "flashcards", icon: Milestone, href: `/kb/${kbId}/chat?mode=flashcards` },
        { key: "quiz", icon: BotMessageSquare, href: `/kb/${kbId}/chat?mode=quiz` },
    ];

    return (
        <section className={cn("flex flex-col gap-4", className)}>
            <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    {t("studio.title")}
                </h2>
                <p className="text-sm text-muted-foreground/80">{t("studio.description")}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {studioActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={action.key}
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-auto flex-col items-start gap-3 rounded-2xl border-border/30 bg-background px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm transition hover:border-primary/50 hover:bg-primary/10"
                        >
                            <Link href={action.href}>
                                <Icon className="h-5 w-5 text-primary" aria-hidden />
                                <span className="block text-start text-sm font-semibold text-foreground">
                                    {t(`studio.${action.key}`)}
                                </span>
                            </Link>
                        </Button>
                    );
                })}
            </div>

            <div className="rounded-2xl border border-border/30 bg-background p-4 text-sm text-muted-foreground shadow-sm">
                <p className="font-semibold text-foreground">{t("tip.title")}</p>
                <p className="mt-2">{t("tip.content")}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden />
                    <span>{t("studio.cta")}</span>
                </div>
            </div>
        </section>
    );
}
