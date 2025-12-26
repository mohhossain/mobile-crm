import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // <--- ADD THIS. Critical for Capacitor/Mobile.
    remotePatterns: [{ hostname: 'res.cloudinary.com' }],
  },
};

export default nextConfig;
