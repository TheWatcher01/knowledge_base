import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUsers } from "@/lib/users";
import { Suspense } from "react";
import UserTable from "@/components/admin/users/UserTable";


type PageProps = {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<{ page?: string }>;
};

export default async function AdminUsersPage({ params, searchParams }: PageProps) {
    const [resolvedParams, resolvedSearch] = await Promise.all([
        params,
        searchParams ?? Promise.resolve<{ page?: string }>({}),
    ]);

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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
                <p className="text-muted-foreground">
                    Créez, modifiez et gérez les utilisateurs.
                </p>
            </div>

            <Suspense fallback={<p>Chargement des utilisateurs...</p>}>
                <UserTable
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
