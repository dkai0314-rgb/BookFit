import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
  },
  async redirects() {
    return [
      // W6 — 이달의북핏 + 북핏레터 통합 → /bookfit-letter
      { source: '/curation', destination: '/bookfit-letter?kind=monthly_pick', permanent: false },
      { source: '/curation/category/:category', destination: '/bookfit-letter', permanent: false },
      { source: '/curation/:slug', destination: '/bookfit-letter', permanent: false },
      { source: '/admin/curations', destination: '/admin/letters', permanent: false },
      { source: '/admin/curations/:id', destination: '/admin/letters', permanent: false },
      { source: '/admin/bookfit-letter', destination: '/admin/letters', permanent: false },
    ];
  },
};

export default nextConfig;
