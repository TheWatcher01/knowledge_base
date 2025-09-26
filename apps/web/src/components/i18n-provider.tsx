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

const DEFAULT_TIME_ZONE = process.env.NEXT_PUBLIC_DEFAULT_TIME_ZONE ?? "Europe/Paris";

export function I18nProvider({ locale, messages, children }: Props) {
    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone={DEFAULT_TIME_ZONE}
        >
            {children}
        </NextIntlClientProvider>
    );
}
