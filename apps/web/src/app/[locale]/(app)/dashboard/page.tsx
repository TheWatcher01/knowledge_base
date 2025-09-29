import { getTranslations } from "next-intl/server";

type PageProps = {
    params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: PageProps) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "dashboard" });

    return (
        <section className="space-y-4">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
        </section>
    );
}
