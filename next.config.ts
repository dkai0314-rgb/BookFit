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
  outputFileTracingIncludes: {
    '/**/*': ['./dev.db', './prisma/dev.db'],
  },
  experimental: {
  },
};

export default nextConfig;
