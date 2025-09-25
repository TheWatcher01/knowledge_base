import { getRequestConfig } from "next-intl/server";
import { getMessages } from "./get-messages";
import { normalizeLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = normalizeLocale(await requestLocale);
  const { messages } = await getMessages(locale);

  return {
    locale,
    messages,
    timeZone: "Europe/Paris",
  };
});
