// apps/web/src/i18n/server.ts
import { getTranslations, setRequestLocale } from "next-intl/server";
import { normalizeLocale } from "./config";

export function applyRequestLocale(rawLocale: string | undefined) {
    setRequestLocale(normalizeLocale(rawLocale));
}

export async function loadTranslations(rawLocale: string | undefined, namespace?: string) {
    return getTranslations({
        locale: normalizeLocale(rawLocale),
        namespace
    });
}
