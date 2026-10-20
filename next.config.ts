import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./data/**/*"],
    "/**/*": ["./data/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflarestorage.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/about",
        destination: "/#about",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/#contact",
        permanent: true,
      },
      {
        source: "/portfolio",
        destination: "/#work",
        permanent: true,
      },
      {
        source: "/portfolio/:slug*",
        destination: "/#work",
        permanent: true,
      },
      {
        source: "/services",
        destination: "/#quote",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
