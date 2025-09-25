import { defineConfig } from "next-intl/config";
import { routing } from "./src/i18n/routing";

export default defineConfig({
    ...routing,
    timeZone: "Europe/Paris",
});
