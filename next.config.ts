import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin can input any image URL for a product, so we allow any https host.
    // In production, tighten this to your own CDN/storage domain(s).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
