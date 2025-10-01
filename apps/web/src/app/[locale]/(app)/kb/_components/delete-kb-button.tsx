"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteKbButton({ kbId }: { kbId: string }) {
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const t = useTranslations("kb.delete");

    async function onDelete() {
        setLoading(true);
        const res = await fetch(`/api/kb/${kbId}`, { method: "DELETE" });

        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            toast.error(payload?.error ?? t("error"));
            setLoading(false);
            setDialogOpen(false);
            return;
        }

        toast.success(t("success"));
        setLoading(false);
        setDialogOpen(false);
        router.refresh();
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={(next) => !loading && setDialogOpen(next)}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive transition-transform duration-200 hover:-translate-y-[1px] hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">{t("submit")}</span>
                    <span className="sr-only sm:hidden">{t("submit")}</span>
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("submit")}</DialogTitle>
                    <DialogDescription>{t("confirm")}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                        {t("cancel")}
                    </Button>
                    <Button variant="destructive" onClick={() => void onDelete()} disabled={loading} className="gap-2">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
                        {loading ? t("submitting") : t("submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
