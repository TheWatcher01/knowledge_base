"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PenLine, Search, Trash2 } from "lucide-react";

import CreateUserForm, { CreatedUser } from "@/components/admin/users/CreateUserForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }),
        [],
    );

    const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);

    const summary = useMemo(() => {
        const active = users.filter((user) => !user.disabled).length;
        const disabledCount = users.length - active;
        const admins = users.filter((user) => user.role === "ADMIN").length;
        const editors = users.filter((user) => user.role === "EDITOR").length;
        return { active, disabled: disabledCount, admins, editors };
    }, [users]);

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
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                <SummaryTile
                    label="Total utilisateurs"
                    value={numberFormatter.format(totalCount)}
                    helper={`Page ${page} / ${totalPages}`}
                    accent="bg-blue-500"
                />
                <SummaryTile
                    label="Actifs"
                    value={numberFormatter.format(summary.active)}
                    helper="Utilisateurs actifs sur cette page"
                    accent="bg-emerald-500"
                />
                <SummaryTile
                    label="Désactivés"
                    value={numberFormatter.format(summary.disabled)}
                    helper="Utilisateurs inactifs sur cette page"
                    accent="bg-amber-500"
                />
                <SummaryTile
                    label="Admins & éditeurs"
                    value={numberFormatter.format(summary.admins + summary.editors)}
                    helper={`${numberFormatter.format(summary.admins)} admin${summary.admins > 1 ? "s" : ""} · ${numberFormatter.format(summary.editors)} éditeur${summary.editors > 1 ? "s" : ""}`}
                    accent="bg-purple-500"
                />
            </div>

            <Card className="border-border/60 bg-card/60 shadow-lg backdrop-blur">
                <CardHeader className="gap-4 md:flex md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold">Liste des utilisateurs</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Filtrez par e-mail ou nom, puis gérez les rôles et statuts.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                        <div className="relative md:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Rechercher un utilisateur"
                                className="w-full pl-9"
                            />
                            {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                        </div>
                        <div className="md:w-auto">
                            <CreateUserForm onSuccess={handleUserCreated} />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
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
                                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                            Aucun utilisateur ne correspond à votre recherche.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="group transition-colors hover:bg-muted/40">
                                            <TableCell className="align-top">
                                                <div className="font-medium text-foreground">{user.email}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Ajouté le {dateFormatter.format(new Date(user.createdAt))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-top text-foreground">
                                                {user.name ? (
                                                    <span className="font-medium">{user.name}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <RoleBadge role={user.role} />
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <StatusBadge disabled={user.disabled} />
                                            </TableCell>
                                            <TableCell className="align-top">
                                                <span className="text-sm text-muted-foreground">
                                                    {dateFormatter.format(new Date(user.createdAt))}
                                                </span>
                                            </TableCell>
                                            <TableCell className="align-top text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={loading}
                                                        className="gap-1 text-foreground"
                                                        onClick={() => openEditionDialog(user)}
                                                    >
                                                        <PenLine className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Modifier</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={loading}
                                                        className="gap-1 text-destructive hover:text-destructive"
                                                        onClick={() => openDeleteDialog(user)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Supprimer</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 px-6 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                    <span>
                        Affichage de <strong>{numberFormatter.format(users.length)}</strong> utilisateur
                        {users.length > 1 ? "s" : ""} sur <strong>{numberFormatter.format(totalCount)}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={!canGoPrevious} onClick={() => void fetchUsers(page - 1)}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Précédent
                        </Button>
                        <Button variant="outline" size="sm" disabled={!canGoNext} onClick={() => void fetchUsers(page + 1)}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Suivant
                        </Button>
                    </div>
                </CardFooter>
            </Card>

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

                        <label className="flex items-center justify-between gap-3 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
                            <span className="font-medium">Désactiver l&apos;utilisateur</span>
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={nextDisabled}
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                    setNextDisabled(event.target.checked)
                                }
                                disabled={loading}
                            />
                        </label>
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

type SummaryTileProps = {
    label: string;
    value: string;
    helper?: string;
    accent: string;
};

function SummaryTile({ label, value, helper, accent }: SummaryTileProps) {
    return (
        <div className="rounded-2xl border border-border/40 bg-card/50 p-4 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-semibold text-foreground">{value}</span>
                <span className={cn("h-2 w-2 rounded-full", accent)} aria-hidden />
            </div>
            {helper ? <p className="mt-2 text-sm text-muted-foreground">{helper}</p> : null}
        </div>
    );
}

function RoleBadge({ role }: { role: Role }) {
    const styles: Record<Role, string> = {
        ADMIN: "border-purple-500/40 bg-purple-500/10 text-purple-200",
        EDITOR: "border-sky-500/40 bg-sky-500/10 text-sky-200",
        VIEWER: "border-zinc-500/40 bg-zinc-500/10 text-zinc-200",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
                styles[role],
            )}
        >
            {role}
        </span>
    );
}

function StatusBadge({ disabled }: { disabled: boolean }) {
    if (disabled) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-300" aria-hidden />
                Désactivé
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
            Actif
        </span>
    );
}
