"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const t = useTranslations("auth.login");
    const tForm = useTranslations("common.form");
    const tStatus = useTranslations("common.status");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // signin with credentials provider
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        // stop loading
        setLoading(false);


        if (res?.error) {
            setError(res.error || t("error"));
            return;
        }

        // redirect to home page once the credentials flow succeeded
        await router.replace("/dashboard");
    }

    return (
        <div className="max-w-sm mx-auto p-6 space-y-4">
            <h1 className="text-xl font-semibold">{t("title")}</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className="border rounded px-3 py-2 w-full"
                    type="email"
                    placeholder={tForm("email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input className="border rounded px-3 py-2 w-full"
                    type="password"
                    placeholder={tForm("password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? tStatus("loading") : t("submit")}
                </button>

                {error && <p className="text-red-600">{error}</p>}
            </form>

            <p className="text-sm">
                {t("prompt")}{" "}
                <Link className="underline text-blue-600" href="/register">
                    {t("register")}
                </Link>
            </p>
        </div>
    );
}
