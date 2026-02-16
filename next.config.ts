import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.aladin.co.kr',
      },
    ],
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./dev.db', './prisma/dev.db'],
    },
  },
};

export default nextConfig;
