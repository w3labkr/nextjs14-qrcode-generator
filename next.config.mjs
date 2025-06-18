import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    return config;
  },
};

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,
};

export default withPWA(pwaConfig)(nextConfig);
