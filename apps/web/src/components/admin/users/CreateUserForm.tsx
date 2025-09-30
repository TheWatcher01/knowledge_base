"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const roles = [
    { value: "VIEWER", label: "Viewer" },
    { value: "EDITOR", label: "Editor" },
    { value: "ADMIN", label: "Admin" },
] as const;

type RoleValue = (typeof roles)[number]["value"];

export type CreatedUser = {
    id: string;
    email: string;
    role: RoleValue;
    disabled: boolean;
    createdAt: string;
};

export default function CreateUserForm({ onSuccess }: { onSuccess?: (user: CreatedUser) => void }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<RoleValue>("VIEWER");
    const [loading, setLoading] = useState(false);

    function resetForm() {
        setEmail("");
        setPassword("");
        setRole("VIEWER");
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                throw new Error(payload?.message || "Impossible de créer l'utilisateur");
            }

            const payload = await res.json();
            toast.success("Utilisateur créé");
            resetForm();
            setOpen(false);
            if (payload?.user) {
                onSuccess?.({
                    ...payload.user,
                    createdAt: new Date(payload.user.createdAt).toISOString(),
                });
            }
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)}>Nouvel utilisateur</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Créer un utilisateur</DialogTitle>
                    <DialogDescription>
                        Renseignez un email, un mot de passe provisoire et un rôle pour le nouveau compte.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="password">
                            Mot de passe
                        </label>
                        <Input
                            id="password"
                            type="text"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="role">
                            Rôle
                        </label>
                        <select
                            id="role"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                            value={role}
                            onChange={(event) => setRole(event.target.value as RoleValue)}
                        >
                            {roles.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Création..." : "Créer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
