import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    incomingRequests: false,
  },

  serverExternalPackages: ["sequelize"],
};

export default nextConfig;
