"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import CreateUserForm, { CreatedUser } from "@/components/admin/users/CreateUserForm";

const SEARCH_DEBOUNCE_MS = 400;

type Role = "VIEWER" | "EDITOR" | "ADMIN";

type UserRow = {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    disabled: boolean;
    createdAt: string;
};

type UserTableProps = {
    initialUsers: UserRow[];
    total: number;
    initialPage: number;
    pageSize: number;
    initialSearch: string;
};

export default function UserTable({ initialUsers, total, initialPage, pageSize, initialSearch }: UserTableProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [users, setUsers] = useState<UserRow[]>(initialUsers);
    const [page, setPage] = useState(initialPage);
    const [totalCount, setTotalCount] = useState(total);
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState(initialSearch ?? "");
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch ?? "");

    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [nextRole, setNextRole] = useState<Role>("VIEWER");
    const [nextDisabled, setNextDisabled] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);

    const isFirstSearch = useRef(true);

    useEffect(() => {
        setUsers(initialUsers);
        setTotalCount(total);
        setPage(initialPage);
    }, [initialUsers, total, initialPage]);

    useEffect(() => {
        setSearchTerm(initialSearch ?? "");
        setDebouncedSearch((initialSearch ?? "").trim());
        isFirstSearch.current = true;
    }, [initialSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (isFirstSearch.current) {
            isFirstSearch.current = false;
            return;
        }
        void fetchUsers(1, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    function updateUrl(nextPage: number, nextSearch: string) {
        const params = new URLSearchParams();
        params.set("page", String(nextPage));
        if (nextSearch) {
            params.set("search", nextSearch);
        }
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    async function fetchUsers(nextPage: number, search = debouncedSearch) {
        setLoading(true);
        try {
            updateUrl(nextPage, search);
            const query = new URLSearchParams();
            query.set("page", String(nextPage));
            if (search) query.set("search", search);

            const res = await fetch(`/api/users?${query.toString()}`, { cache: "no-store" });
            if (!res.ok) throw new Error(await res.text());

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

    function openEditionDialog(user: UserRow) {
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
            toast.success(`${user.email} mis à jour`);
            setDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de mettre à jour l'utilisateur");
        } finally {
            setLoading(false);
        }
    }

    function openDeleteDialog(user: UserRow) {
        setDeleteTarget(user);
        setDeleteDialogOpen(true);
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${deleteTarget.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => null);
                throw new Error(payload?.message || "Suppression impossible");
            }

            const { user } = (await res.json()) as { user: { id: string; email: string } };
            const remainingBeforeDelete = users.length;
            setUsers((prev) => prev.filter((row) => row.id !== user.id));
            setTotalCount((prev) => Math.max(0, prev - 1));
            toast.success(`${user.email} supprimé`);
            setDeleteDialogOpen(false);

            if (remainingBeforeDelete === 1 && page > 1) {
                await fetchUsers(page - 1, debouncedSearch);
            }
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Suppression impossible");
            setDeleteDialogOpen(false);
        } finally {
            setLoading(false);
            setDeleteTarget(null);
        }
    }

    function handleUserCreated(user: CreatedUser) {
        const normalized: UserRow = {
            ...user,
            name: null,
            createdAt: new Date(user.createdAt).toISOString(),
        };

        if (page === 1) {
            setUsers((prev) => [normalized, ...prev].slice(0, pageSize));
        } else {
            void fetchUsers(1, debouncedSearch);
        }
        setPage(1);
        updateUrl(1, debouncedSearch);
        setTotalCount((prev) => prev + 1);
    }

    const canGoPrevious = page > 1 && !loading;
    const canGoNext = page < totalPages && !loading;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Rechercher par e-mail ou nom"
                        className="w-full sm:w-80"
                    />
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
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
                                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                    Aucun utilisateur trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.email}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Ajouté le {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.name ?? "-"}</TableCell>
                                    <TableCell className="uppercase text-xs font-semibold">{user.role}</TableCell>
                                    <TableCell>
                                        {user.disabled ? (
                                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                                                Désactivé
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                                                Actif
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button variant="outline" size="sm" disabled={loading} onClick={() => openEditionDialog(user)}>
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={loading}
                                            onClick={() => openDeleteDialog(user)}
                                        >
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        Total&nbsp;: <strong>{totalCount}</strong>
                    </span>
                    <div className="space-x-2">
                        <Button variant="outline" size="sm" disabled={!canGoPrevious} onClick={() => void fetchUsers(page - 1)}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Précédent
                        </Button>
                        <Button variant="outline" size="sm" disabled={!canGoNext} onClick={() => void fetchUsers(page + 1)}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Suivant
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier l&apos;utilisateur {selectedUser?.email}</DialogTitle>
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
                                    setNextRole(event.target.value as Role)
                                }
                                disabled={loading}
                            >
                                <option value="VIEWER">Viewer</option>
                                <option value="EDITOR">Editor</option>
                                <option value="ADMIN">Admin</option>
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
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;utilisateur</DialogTitle>
                        <DialogDescription>
                            Cette action supprimera également les bases de connaissance associées à cet utilisateur.
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-sm">Confirmez la suppression de {deleteTarget?.email}.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={() => void confirmDelete()} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
