import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // This project maintains its own CLAUDE.md; see that file for a pointer
  // to node_modules/next/dist/docs/ for version-matched Next.js reference.
  agentRules: false,
  experimental: {
    // Quote requests are small text payloads; cap Server Action bodies well
    // below anything abusable (Next's default is 1 MB).
    serverActions: { bodySizeLimit: "100kb" },
  },
};

export default withNextIntl(nextConfig);
