import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // The integration guide names API_BASE_URL. Expose only this public API
    // origin to the browser under Next.js's client-safe convention.
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      process.env.API_BASE_URL ??
      "https://meriai-api.onrender.com",
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // File watching is disabled when requested to prevent preview flickering.
    if (dev && process.env.DISABLE_HMR === "true") {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
