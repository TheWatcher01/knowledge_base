import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getModelDefaults, listModels } from "@/lib/models";
import { getTranslations } from "next-intl/server";
import ModelTable from "@/components/admin/models/ModelTable";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminModelsPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations({ locale, namespace: "admin.models" });

  let initialModels: Awaited<ReturnType<typeof listModels>> = [];
  const initialDefaults = await getModelDefaults().catch(() => ({ chat_model: null, embedding_model: null }));
  let initialError: string | null = null;

  try {
    initialModels = await listModels();
  } catch (error) {
    initialError = error instanceof Error ? error.message : String(error);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 py-6">
      <div className="rounded-3xl border border-border/50 bg-card/95 px-8 py-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">Administration</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">{t("description")}</p>
      </div>

      <ModelTable
        initialModels={initialModels}
        initialDefaults={initialDefaults}
        initialError={initialError ?? undefined}
      />
    </div>
  );
}
