import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/i18n-provider";
import { applyRequestLocale } from "@/i18n/server";
import { getMessages } from "@/i18n/get-messages";
import { locales, type Locale } from "@/i18n/config";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  applyRequestLocale(typedLocale); // Set the locale for the current request context
  const { messages } = await getMessages(typedLocale);

  return (
    <I18nProvider locale={typedLocale} messages={messages}>
      {children}
    </I18nProvider>
  );
}
