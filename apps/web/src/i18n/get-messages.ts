import { normalizeLocale } from "./config";

export async function getMessages(rawLocale: string | undefined) {
    const locale = normalizeLocale(rawLocale);
    const messagesModule = await import(`./messages/${locale}.json`);
    return { locale, messages: messagesModule.default };
}
