"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { set } from "zod";


export function CreateKbForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const res = await fetch("/api/kb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            setError(payload?.error ?? "Failed to create knowledge base");
            setIsLoading(false);
            return;
        }

        setName("");
        setDescription("");
        setIsLoading(false);
        router.refresh();
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm-items-center">
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Knowledge Base Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                disabled={isLoading}
            >
                {isLoading ? "Creating..." : "Create"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
    );
}
