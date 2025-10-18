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
                <div className="mx-auto flex min-h-svh w-full max-w-5xl items-center justify-center px-4 py-10">
                    <Card className="w-full max-w-md">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-2xl">{t("title")}</CardTitle>
                            <CardDescription>{t("subtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                                        {tForm("email")}
                                    </label>
                                    <Input
                                        id="email"
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
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={tForm("password")}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {t("submit")}
                                </Button>

                                {error ? (
                                    <p role="alert" className="text-sm text-destructive">
                                        {error}
                                    </p>
                                ) : null}
                            </form>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <span>{t("prompt")}</span>
                            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register">
                                {t("register")}
                            </Link>
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
                        <span className="text-sm font-medium text-foreground">{t("signingIn")}</span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
