/**
 * @type {import('next').NextConfig}
 */
import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {},
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    fallback: {
      document: "/offline.html",
    },
  },
};

export default withPWA(nextConfig);
