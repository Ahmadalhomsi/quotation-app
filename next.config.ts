import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.masoft.com.tr',
        port: '',
        pathname: '/product-images/**',
      },
    ],
  },
};

export default nextConfig;
