import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Photo uploads flow through Server Actions; the default request cap is 1MB.
    // Bucket enforces a 5MB image limit, so allow headroom for multipart overhead.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
