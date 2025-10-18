"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/shadcn-io/ai/loader";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const t = useTranslations("auth.register");
    const tForm = useTranslations("common.form");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setDialogOpen(true);
        setError(null);
        setMsg(null);

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const payload = await res.json().catch(() => ({}));

        setLoading(false);
        setDialogOpen(false);

        if (!res.ok) {
            setError(payload?.error ?? t("error"));
            return;
        }

        setMsg(t("success"));
        setEmail("");
        setPassword("");
    }

    return (
        <>
            <div className="min-h-svh bg-background">
                <div className="mx-auto flex min-h-svh w-full max-w-5xl items-center justify-center px-4 py-10">
                    <Card className="w-full max-w-md">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-2xl">{t("title")}</CardTitle>
                            <CardDescription>{t("subtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="register-email" className="text-sm font-medium text-foreground">
                                        {tForm("email")}
                                    </label>
                                    <Input
                                        id="register-email"
                                        placeholder={tForm("email")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="register-password" className="text-sm font-medium text-foreground">
                                        {tForm("password")}
                                    </label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        placeholder={tForm("password")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {t("submit")}
                                </Button>

                                {msg ? <p className="text-sm text-emerald-500">{msg}</p> : null}
                                {error ? (
                                    <p role="alert" className="text-sm text-destructive">
                                        {error}
                                    </p>
                                ) : null}
                            </form>
                        </CardContent>
                        <CardFooter className="justify-center text-sm text-muted-foreground">
                            {t("footer")}
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => !loading && setDialogOpen(open)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("dialogTitle")}</DialogTitle>
                        <DialogDescription>{t("dialogDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/40 px-4 py-3">
                        <Loader size={18} className="text-primary" aria-hidden="true" />
                        <span className="text-sm font-medium text-foreground">{t("signingUp")}</span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
