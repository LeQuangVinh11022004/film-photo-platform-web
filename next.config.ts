import type { NextConfig } from "next";

// Backend the browser should reach through the dev proxy (avoids CORS and
// self-signed certificate issues during local development).
// Default to https://localhost:7104 so ASP.NET Core UseHttpsRedirection on :5038
// does not issue a 307 cross-origin redirect that strips the Authorization header.
const apiProxyTarget = (process.env.API_PROXY_TARGET ?? "https://localhost:7104").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiProxyTarget}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiProxyTarget}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
