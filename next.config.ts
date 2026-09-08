import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle @sparticuz/chromium on server
      config.externals = [...(config.externals || []), '@sparticuz/chromium'];
    }
    return config;
  },
};

export default nextConfig;
