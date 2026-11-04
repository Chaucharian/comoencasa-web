import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.10",
    "192.168.0.*",
    "localhost:3005",
    "localhost",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    localPatterns: [
      {
        pathname: "/menu/**",
      },
      {
        pathname: "/brand/**",
      },
      {
        pathname: "/api/media/**",
      },
    ],
  },
};

export default nextConfig;
