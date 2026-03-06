/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  experimental: { optimizePackageImports: ["lucide-react"] },
  webpack: (config, { isServer }) => {
    if (!isServer) config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    return config;
  },
};
module.exports = nextConfig;
