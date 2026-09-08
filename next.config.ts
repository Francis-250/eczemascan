import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
  async redirects() {
    return [
      {
        source: "/doctor/:path*",
        destination: "/dermatologist/:path*",
        permanent: false,
      },
      {
        source: "/doctor",
        destination: "/dermatologist/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
