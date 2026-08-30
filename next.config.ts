import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  logging: {
    incomingRequests: false,
  },
  serverExternalPackages: ["sequelize"],
};

export default nextConfig;
