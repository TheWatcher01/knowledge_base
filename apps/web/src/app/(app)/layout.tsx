import { authOptions } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";
import { AuthSessionProvider } from "@/components/session-provider";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const metadata = {
  title: "Knowledge Base",
};

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthSessionProvider session={session}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <AppNav userEmail={session.user?.email} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </AuthSessionProvider>
  );
}
