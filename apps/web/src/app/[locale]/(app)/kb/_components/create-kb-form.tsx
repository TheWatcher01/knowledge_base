"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateKbForm() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const tForm = useTranslations("kb.createForm");
    const tList = useTranslations("kb.list");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        const res = await fetch("/api/kb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            toast.error(payload?.error ?? tForm("error"));
            setIsLoading(false);
            return;
        }

        toast.success(tForm("success"));
        setName("");
        setDescription("");
        setIsLoading(false);
        setOpen(false);
        router.refresh();
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !isLoading && setOpen(next)}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2" variant="default">
                    <Plus className="h-4 w-4" aria-hidden />
                    {tList("cta")}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{tList("cta")}</DialogTitle>
                    <DialogDescription>{tList("subtitle")}</DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="kb-name" className="text-sm font-medium">
                            {tForm("namePlaceholder")}
                        </label>
                        <Input
                            id="kb-name"
                            autoFocus
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="kb-description" className="text-sm font-medium">
                            {tForm("descriptionPlaceholder")}
                        </label>
                        <Textarea
                            id="kb-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            {tForm("cancel")}
                        </Button>
                        <Button type="submit" disabled={isLoading} className="gap-2">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
                            {isLoading ? tForm("submitting") : tForm("submit")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
