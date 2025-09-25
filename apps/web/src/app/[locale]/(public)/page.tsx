import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect, Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (session) redirect({ href: "/dashboard", locale });

  const [tLanding, tCommon] = await Promise.all([
    getTranslations({ namespace: "landing" }),
    getTranslations({ namespace: "common" }),
  ]);
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {tCommon("brand.short")}
            </span>
            <span>{tCommon("brand.name")}</span>
          </div>
          <Link
            href="/login"
            className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {tCommon("cta.login")}
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {tLanding("headline")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {tLanding("subheadline")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              {tLanding("heroLogin")}
            </Link>
            <Link
              href="/register"
              className="rounded-md border px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              {tLanding("heroSignup")}
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>{tLanding("footer.copyright", { year: currentYear })}</span>
          <span>{tLanding("footer.tagline")}</span>
        </div>
      </footer>
    </div>
  );
}
