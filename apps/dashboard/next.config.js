/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ["@neon/ui", "@neon/api", "@neon/database"],
};

module.exports = nextConfig;
