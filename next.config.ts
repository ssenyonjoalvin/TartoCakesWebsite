import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90, 92, 95],
  },
  experimental: {
    serverActions: {
      // Multiple product images (up to 12 × 5MB) via multipart form upload
      bodySizeLimit: "60mb",
    },
  },
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-mariadb",
    "mariadb",
  ],
};

export default nextConfig;
