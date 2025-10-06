import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
        globals: true,
        exclude: ["tests/e2e/**", "**/node_modules/**"],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@repo/shadcn-ui/components": path.resolve(__dirname, "src/components"),
            "@repo/shadcn-ui/lib": path.resolve(__dirname, "src/lib"),
        },
    },
});
