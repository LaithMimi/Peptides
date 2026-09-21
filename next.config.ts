import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // This project maintains its own CLAUDE.md; see that file for a pointer
  // to node_modules/next/dist/docs/ for version-matched Next.js reference.
  agentRules: false,
  experimental: {
    serverActions: {
      // Server Actions already reject requests whose Origin differs from the
      // Host. List extra trusted hosts (e.g. the production domain when a
      // proxy rewrites Host) in ALLOWED_ORIGINS, comma-separated, host only.
      allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
    },
  },
};

export default withNextIntl(nextConfig);
