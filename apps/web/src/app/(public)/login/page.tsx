"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
            setError(res.error || "Failed to login");
            return;
        }

        // redirect to home page
        router.replace("/dashboard");
        router.refresh();
    }

    return (
        <div className="max-w-sm mx-auto p-6 space-y-4">
            <h1 className="text-xl font-semibold">Login</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className="border rounded px-3 py-2 w-full"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input className="border rounded px-3 py-2 w-full"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Login"}
                </button>

                {error && <p className="text-red-600">{error}</p>}
            </form>

            <p className="text-sm">
                Do not have an account? Please contact the administrator.{" "}
                <a className="underline text-blue-600" href="/register">
                    Register
                </a>
            </p>
        </div>
    );
}
