import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.0.10",
    "192.168.0.*",
    "localhost:3005",
    "localhost",
  ],
};

export default nextConfig;
