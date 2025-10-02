import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUsers } from "@/lib/users";
import { Suspense } from "react";
import UserTable from "@/components/admin/users/UserTable";


type PageProps = {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<{ page?: string; search?: string }>;
};

export default async function AdminUsersPage({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const resolvedSearch = (await searchParams) ?? {};

    const locale = resolvedParams.locale;
    const pageParam = resolvedSearch?.page;
    const searchParam = resolvedSearch?.search ?? "";
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
        redirect(`/${locale}/dashboard`);
    }

    const page = Number(pageParam ?? 1);
    const { users, total } = await listUsers({ page, pageSize: 20 });
    const initialUsers = users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
    }));

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 py-6">
            <div className="rounded-3xl border border-border/50 bg-card/95 px-8 py-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">Administration</p>
                <h1 className="mt-3 text-3xl font-semibold text-foreground">Gestion des utilisateurs</h1>
                <p className="mt-2 max-w-2xl text-base text-muted-foreground">
                    Créez, modifiez et gérez les comptes de l&apos;espace de travail. Utilisez les raccourcis ci-dessous pour filtrer et ajuster les rôles.
                </p>
            </div>

            <Suspense fallback={<p>Chargement des utilisateurs...</p>}>
                <UserTable
                    locale={locale}
                    initialUsers={initialUsers}
                    total={total}
                    initialPage={page}
                    pageSize={20}
                    initialSearch={searchParam}
                />
            </Suspense>
        </div>
    );
}
