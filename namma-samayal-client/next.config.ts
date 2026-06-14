import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Long-lived caching for hashed static assets — saves bandwidth on repeat
  // visits and bumps the Lighthouse "Use long cache lifetimes" check.
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
