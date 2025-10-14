"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/shadcn-io/ai/loader";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const t = useTranslations("auth.login");
    const tForm = useTranslations("common.form");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setDialogOpen(true);
        setError(null);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (res?.error) {
            setError(res.error || t("error"));
            setLoading(false);
            setDialogOpen(false);
            return;
        }

        await router.replace("/dashboard");
        setLoading(false);
        setDialogOpen(false);
    }

    return (
        <>
            <div className="min-h-svh bg-background">
                <div className="mx-auto flex min-h-svh w-full max-w-5xl items-center justify-center px-4">
                    <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-card/80 p-6 shadow-lg backdrop-blur-sm">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
                                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
                            </div>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                                        {tForm("email")}
                                    </label>
                                    <input
                                        id="email"
                                        className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        type="email"
                                        placeholder={tForm("email")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                                        {tForm("password")}
                                    </label>
                                    <input
                                        id="password"
                                        className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        type="password"
                                        placeholder={tForm("password")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-60"
                                    disabled={loading}
                                >
                                    {t("submit")}
                                </button>

                                {error ? (
                                    <p role="alert" className="text-sm text-destructive">
                                        {error}
                                    </p>
                                ) : null}
                            </form>

                            <p className="text-sm text-muted-foreground">
                                {t("prompt")}{" "}
                                <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register">
                                    {t("register")}
                                </Link>
                            </p>
                        </div>
                    </div>
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
                        <span className="text-sm font-medium text-foreground">{t("signingIn")}</span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
