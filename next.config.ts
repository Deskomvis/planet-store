import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images directly from Cloudflare R2/CDN without using Vercel's
    // paid Image Optimization endpoint.
    unoptimized: true,
    // Admin can input any image URL for a product, so we allow any https host.
    // In production, tighten this to your own CDN/storage domain(s).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
