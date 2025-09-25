import { authOptions } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";
import { AuthSessionProvider } from "@/components/session-provider";
import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import type { ReactNode } from "react";

export const metadata = {
  title: "Knowledge Base",
};

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect({ href: "/login", locale }); // Le helper ajoute automatiquement la locale courante
  }

  return (
    <AuthSessionProvider session={session}>
      <div key={locale} className="flex min-h-screen flex-col bg-background text-foreground">
        <AppNav userEmail={session.user?.email} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </AuthSessionProvider>
  );
}
