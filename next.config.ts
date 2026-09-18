import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // This project maintains its own CLAUDE.md; see that file for a pointer
  // to node_modules/next/dist/docs/ for version-matched Next.js reference.
  agentRules: false,
};

export default withNextIntl(nextConfig);
