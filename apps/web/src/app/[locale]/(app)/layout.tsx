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
  const { locale } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect({ href: "/login", locale });
  }

  const ensuredSession = session as NonNullable<typeof session>;

  return (
    <AuthSessionProvider session={ensuredSession}>
      <div key={locale} className="flex min-h-screen flex-col bg-background text-foreground">
        <AppNav userEmail={ensuredSession.user?.email ?? null} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </AuthSessionProvider>
  );
}
