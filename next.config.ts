import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 移除 X-Powered-By 头
  poweredByHeader: false,

  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30天
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 640, 900],
  },

  // 实验性功能
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@base-ui/react",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
    ],
  },
};

export default nextConfig;
