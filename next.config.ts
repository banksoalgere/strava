import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Turbopack is used automatically in dev mode
  // Build uses webpack to avoid the known _global-error prerendering issue
};

export default nextConfig;
