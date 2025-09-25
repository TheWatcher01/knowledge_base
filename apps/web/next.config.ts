import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const alias = {
  "@": path.resolve(__dirname, "src"),
  "next-intl/config": path.resolve(__dirname, "next-intl.config.ts"),
};

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ...alias,
    };
    return config;
  },
  turbopack: {
    resolveAlias: alias,
  },
};

export default withNextIntl(nextConfig);
