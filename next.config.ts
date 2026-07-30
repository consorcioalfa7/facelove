import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Image optimization configuration
  images: {
    // Local images from /public are allowed by default
    // Add remotePatterns here when using external image sources
    formats: ["image/avif", "image/webp"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
