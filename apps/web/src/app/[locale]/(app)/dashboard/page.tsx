import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
    const t = await getTranslations({ namespace: "dashboard" });

    return (
        <section className="space-y-4">
            <h1 className="text-2xl font-semibold">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
        </section>
    );
}
