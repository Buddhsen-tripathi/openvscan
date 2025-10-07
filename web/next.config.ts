import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers runtime: avoid Node APIs in server code
  images: {
    // Next/Image is supported on Workers with next-on-pages; use default loader
    // If you use remote images, configure domains here.
    remotePatterns: [],
  },
};

export default nextConfig;
