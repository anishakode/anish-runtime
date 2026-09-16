import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/policy";

const isDev = process.env.NODE_ENV === "development";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const isSecureOrigin = siteUrl.startsWith("https://");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Playwright and some hosts hit the app via 127.0.0.1; allow Next dev assets.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({ isDev, isSecureOrigin }),
      },
      {
        // Session-shaped and machine-readable surfaces must not be indexed.
        source: "/:path(ending|surface|fork|interview|evidence.json)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
