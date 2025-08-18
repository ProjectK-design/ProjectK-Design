import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for client-side rendering
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure trailing slash consistency
  trailingSlash: true,
  
  // Skip build-time pre-rendering of dynamic routes
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
