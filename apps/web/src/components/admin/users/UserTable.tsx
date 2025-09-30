"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import CreateUserForm, { CreatedUser } from "@/components/admin/users/CreateUserForm";

type UserRow = {
    id: string;
    email: string;
    name: string | null;
    role: "VIEWER" | "EDITOR" | "ADMIN";
    disabled: boolean;
    createdAt: string;
};

type UserTableProps = {
    initialUsers: UserRow[];
    total: number;
    initialPage: number;
    pageSize: number;
};

export default function UserTable({ initialUsers, total, initialPage, pageSize }: UserTableProps) {
    const [users, setUsers] = useState<UserRow[]>(initialUsers);
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(total);

    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [nextRole, setNextRole] = useState<UserRow["role"]>("VIEWER");
    const [nextDisabled, setNextDisabled] = useState(false);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    async function fetchPage(nextPage: number) {
        setLoading(true);
        try {
            const res = await fetch(`/api/users?page=${nextPage}`);
            if (!res.ok) throw new Error("Unable to fetch users");
            const data = (await res.json()) as { users: UserRow[]; total: number };
            const normalized = data.users.map((user) => ({
                ...user,
                createdAt: new Date(user.createdAt).toISOString(),
            }));
            setUsers(normalized);
            setPage(nextPage);
            setTotalCount(data.total);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de récupérer les utilisateurs");
        } finally {
            setLoading(false);
        }
    }

    function openDialog(user: UserRow) {
        setSelectedUser(user);
        setNextRole(user.role);
        setNextDisabled(user.disabled);
        setDialogOpen(true);
    }

    async function handleSave() {
        if (!selectedUser) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${selectedUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: nextRole, disabled: nextDisabled }),
            });
            if (!res.ok) throw new Error(await res.text());

            const { user } = (await res.json()) as { user: UserRow };
            setUsers((prev) =>
                prev.map((row) => (row.id === user.id ? { ...row, role: user.role, disabled: user.disabled } : row)),
            );
            toast.success("Utilisateur mis à jour");
            setDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de mettre à jour l'utilisateur");
        } finally {
            setLoading(false);

        }
    }

    async function handleDelete(userId: string) {
        if (!window.confirm("Supprimer cet utilisateur ?")) return;
        setLoading(true);
        try {
            const currentCount = users.length;
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                throw new Error(payload?.message || "Suppression impossible");
            }

            setUsers((prev) => prev.filter((row) => row.id !== userId));
            setTotalCount((prev) => Math.max(0, prev - 1));
            toast.success("Utilisateur supprimé");

            if (currentCount === 1 && page > 1) {
                await fetchPage(page - 1);
            }
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Suppression impossible");
        } finally {
            setLoading(false);
        }
    }

    function handleUserCreated(user: CreatedUser) {
        setUsers((prev) => [
            { ...user, name: null },
            ...prev,
        ].slice(0, pageSize));
        setTotalCount((prev) => prev + 1);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end">
                <CreateUserForm onSuccess={handleUserCreated} />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Créé le</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    Aucun utilisateur trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell><div className="font-medium">{user.email}</div></TableCell>
                                    <TableCell>{user.name ?? "-"}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.disabled ? "Désactivé" : "Actif"}</TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openDialog(user)}>
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={loading}
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {page} sur {totalPages}
                    </p>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1 || loading} onClick={() => fetchPage(page - 1)}>
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages || loading}
                            onClick={() => fetchPage(page + 1)}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Modifier l&apos;utilisateur {selectedUser?.email}
                    </DialogTitle>
                    <DialogDescription>
                        Ajustez le rôle et le statut d’activation avant de sauvegarder.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rôle</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                value={nextRole}
                                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                                    setNextRole(event.target.value as UserRow["role"])
                                }
                                disabled={loading}
                            >
                                <option value="VIEWER">VIEWER</option>
                                <option value="EDITOR">EDITOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Désactiver l&apos;utilisateur</span>
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={nextDisabled}
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                    setNextDisabled(event.target.checked)
                                }
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} >Annuler</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
