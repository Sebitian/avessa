import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auth-heavy pages use cookies on almost every route; Cache Components
  // caused blocking-route / Suspense errors on /messages/[id].
  cacheComponents: false,
};

export default nextConfig;
