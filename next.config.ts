import type { NextConfig } from "next";
const withPWA = require("next-pwa");

const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
}) satisfies NextConfig;

export default nextConfig;
