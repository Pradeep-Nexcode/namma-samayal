import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow next/image to optimize images served from Cloudinary (recipe + ingredient
  // images live there). Without this, next/image would block external URLs.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
    // Modern formats — Next negotiates with the browser.
    formats: ["image/avif", "image/webp"],
  },

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
