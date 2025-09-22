import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              KB
            </span>
            <span>Knowledge Base</span>
          </div>
          <Link
            href="/login"
            className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Connexion
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center gap-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Centralisez votre savoir, collaborez en toute simplicité.
            </h1>
            <p className="text-muted-foreground text-lg">
              Knowledge Base vous aide à organiser vos notes, fichiers, liens et conversations grâce à une interface claire et sécurisée.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-md border px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t bg-card/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Knowledge Base</span>
          <span>Conçu pour vos équipes.</span>
        </div>
      </footer>
    </div>
  );
}
