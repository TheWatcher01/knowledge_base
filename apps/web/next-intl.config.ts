import defineConfig from "next-intl/config";
import { routing } from "./src/i18n/routing";

// @ts-expect-error next-intl's published types don't include the latest options yet
export default defineConfig({
  ...routing,
  timeZone: "Europe/Paris",
});
