import type { NextConfig } from "next";

type WebpackConfig = Parameters<NonNullable<NextConfig["webpack"]>>[0];
type WebpackContext = Parameters<NonNullable<NextConfig["webpack"]>>[1];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      pino: "pino/browser",
      "thread-stream": "next/dist/compiled/empty-module",
      "@react-native-async-storage/async-storage":
        "next/dist/compiled/empty-module",
    },
  },
  webpack: (config: WebpackConfig, { isServer }: WebpackContext) => {
    if (!isServer) {
      config.resolve = config.resolve ?? {};
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        pino: "pino/browser",
        "thread-stream": false,
        "@react-native-async-storage/async-storage": false,
      };
    }
    return config;
  },
};

export default nextConfig;
