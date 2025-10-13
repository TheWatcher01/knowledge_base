import { authOptions } from "@/lib/auth";
import { AppNav } from "@/components/app-nav";
import { AuthSessionProvider } from "@/components/session-provider";
import { NextAuthAbortFilter } from "@/components/dev/nextauth-abort-filter";
import { RscAbortTelemetry } from "@/components/telemetry/rsc-abort-telemetry";
import { getServerSession } from "next-auth";
import { redirect } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { RagStatusBanner } from "@/components/rag/rag-status-banner";
import { getRagStatus } from "@/lib/rag-health";

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
  const ragStatus = await getRagStatus();

  return (
    <AuthSessionProvider session={ensuredSession}>
      <NextAuthAbortFilter />
      <RscAbortTelemetry />
      <div key={locale} className="flex min-h-screen flex-col bg-background text-foreground">
        <AppNav
          userEmail={ensuredSession.user?.email ?? null}
          userRole={(ensuredSession.user?.role as "VIEWER" | "EDITOR" | "ADMIN" | null) ?? null}
        />
        <RagStatusBanner
          initialStatus={{
            ...ragStatus,
            checkedAt: new Date().toISOString(),
          }}
        />
        <main className="flex-1 px-8 py-8 md:px-12 lg:px-16">
          {children}
        </main>
      </div>
    </AuthSessionProvider>
  );
}
