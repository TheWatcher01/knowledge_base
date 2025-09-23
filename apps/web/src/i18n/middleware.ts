import createIntMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "./config";

export const handleI18nRouting = createIntMiddleware({
    locales,
    defaultLocale,
    localePrefix,
    localeDetection: true
});
