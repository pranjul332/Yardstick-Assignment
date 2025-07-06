/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  experimental: {
    serverComponentsExternalPackages: ["mongodb"],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix for MongoDB build issues
    if (isServer) {
      config.externals.push({
        mongodb: "mongodb",
      });
    }
    return config;
  },
  // Ensure environment variables are available during build
  generateBuildId: async () => {
    // You can return any string here, will be used as the build id
    return "build-" + Date.now();
  },
};

module.exports = nextConfig;
