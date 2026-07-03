import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/streaming-home-hub",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
