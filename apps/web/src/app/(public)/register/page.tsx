"use client";

import { useState } from "react";

// Registration page
export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Handle form submission
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg(null);

        // Call the registration API
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        // Test read response
        const payload = await res.json().catch(() => ({}));

        // Handle response
        setLoading(false);

        // Display error message if registration failed
        if (!res.ok) {
            setError(payload?.error ?? "Failed to register");
            return;
        }

        // Display success message and clear form
        setMsg("Registration successful! You can now log in.");
        setEmail("");
        setPassword("");
    }

    return (
        <div className="max-w-sm mx-auto p-6 space-y-4">
            <h1 className="text-xl font-semibold">Register</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className="border rounded px-3 py-2 w-full"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
                />
                <input className="border rounded px-3 py-2 w-full"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
                {msg && <p className="text-green-600 text-sm">{msg}</p>}
                {error && <p className="text-red-600 text-sm">{error}</p>}
            </form>
        </div>
    );
}
