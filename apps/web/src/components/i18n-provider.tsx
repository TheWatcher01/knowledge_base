// apps/web/src/components/i18n-provider.tsx
"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";

type Props = {
    locale: Locale; // Current locale passed by `[locale]` layout
    messages: Record<string, unknown>; // Dynamically typed catalog
    children: ReactNode;
};

export function I18nProvider({ locale, messages, children }: Props) {
    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone="Europe/Paris"
        >
            {children}
        </NextIntlClientProvider>
    );
}
