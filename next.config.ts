import type { NextConfig } from 'next'

// R2 の公開配信（カスタムドメイン）の画像を next/image で使えるようにする
const r2 = process.env.R2_PUBLIC_BASE_URL ? new URL(process.env.R2_PUBLIC_BASE_URL) : null

const nextConfig: NextConfig = {
  // e2e 用サーバーは別の出力先を使う（開発サーバーと同時に動かせるように）
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: r2
      ? [
          {
            protocol: r2.protocol.replace(':', '') as 'https' | 'http',
            hostname: r2.hostname,
            pathname: '/**',
          },
        ]
      : [],
  },
  // better-sqlite3 はローカル開発専用のネイティブモジュール
  serverExternalPackages: ['better-sqlite3'],
}

export default nextConfig
