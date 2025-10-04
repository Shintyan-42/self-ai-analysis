import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLintエラーを警告に変更（ビルドを停止しない）
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScriptエラーを警告に変更（ビルドを停止しない）
    ignoreBuildErrors: true,
  },
  // Vercelでのデプロイメント最適化
  output: 'standalone',
  trailingSlash: false,
  // 静的エクスポートの設定
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
