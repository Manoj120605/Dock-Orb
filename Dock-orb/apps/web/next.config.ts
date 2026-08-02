import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  transpilePackages: ["@capsule-ai/shared-types"],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
