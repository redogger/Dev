/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to avoid double-mount issues with Monaco
  webpack: (config) => {
    // Monaco Editor worker configuration
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

module.exports = nextConfig;
