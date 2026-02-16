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
    // @ts-expect-error: outputFileTracingIncludes is a valid next.js config but missing from types
    outputFileTracingIncludes: {
      '/api/**/*': ['./dev.db', './prisma/dev.db'],
    },
  },
};

export default nextConfig;
