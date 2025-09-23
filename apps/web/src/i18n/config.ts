export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';
export const localePrefix: "always" | "as-needed" | "never" = "always";

export function isLocale(value: string | undefined): value is Locale {
    return !!value && (locales as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | undefined): Locale {
    return isLocale(value) ? value : defaultLocale;
}
