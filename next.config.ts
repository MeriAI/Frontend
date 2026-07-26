import type { NextConfig } from "next";

const DEFAULT_UPSTREAM = "https://meriai-api.onrender.com";

function upstreamApiOrigin(): string {
  const configured =
    process.env.API_BASE_URL?.trim() ||
    process.env.MERIAI_API_UPSTREAM?.trim() ||
    DEFAULT_UPSTREAM;
  return configured.replace(/\/$/, "");
}

const upstream = upstreamApiOrigin();

const nextConfig: NextConfig = {
  env: {
    // Browser REST base. Default is the same-origin rewrite prefix.
    // Set to an absolute API origin to bypass the proxy (e.g. local CORS testing).
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/meriai",
    // WebSocket origin must be absolute (proxy paths cannot carry WS).
    NEXT_PUBLIC_WS_BASE_URL:
      process.env.NEXT_PUBLIC_WS_BASE_URL ??
      (process.env.NEXT_PUBLIC_API_BASE_URL?.startsWith("http")
        ? process.env.NEXT_PUBLIC_API_BASE_URL
        : upstream),
  },
  async rewrites() {
    // Same-origin REST proxy: /api/meriai/readyz → https://…/readyz
    // and /api/meriai/api/services → https://…/api/services
    return [
      {
        source: "/api/meriai/:path*",
        destination: `${upstream}/:path*`,
      },
    ];
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
