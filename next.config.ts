import type { NextConfig } from "next";

// Backend the browser should reach through the dev proxy (avoids CORS and
// self-signed certificate issues during local development).
const apiProxyTarget = (process.env.API_PROXY_TARGET ?? "http://localhost:5038").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiProxyTarget}/api/:path*` }];
  },
};

export default nextConfig;
