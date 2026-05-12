import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",        // Static export for Cloudflare Pages
  images: {
    unoptimized: true,     // Required for static export
  },
  // reactCompiler disabled — causes Turbopack panics with motion/react inline
  // transition objects. Re-enable once React Compiler stable + motion compatible.
  // reactCompiler: true,
};

export default nextConfig;
