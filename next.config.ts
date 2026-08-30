import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  logging: {
    incomingRequests: false,
  },
  serverExternalPackages: ["sequelize", "mysql2"],
};

export default nextConfig;
