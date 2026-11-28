import type { NextConfig } from "next";

const defaultProxyTarget =
  "https://filmbooking-api-h7bghwcydwb8eecn.japaneast-01.azurewebsites.net";

// Strip trailing slashes and any accidental trailing "/api" so rewrites never become "/api/api/*"
const apiProxyTarget = (process.env.API_PROXY_TARGET?.trim() || defaultProxyTarget)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiProxyTarget}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiProxyTarget}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
