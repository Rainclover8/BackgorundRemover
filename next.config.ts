import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    REMOVE_BG_API_KEY: process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY,
  },
};

export default nextConfig;
