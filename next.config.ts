import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
