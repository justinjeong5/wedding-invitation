import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname }]
      : [],
    // 모바일 전용 청첩장 — AVIF 인코딩은 비용 대비 이득이 적어 WebP 만 사용
    formats: ["image/webp"],
    // 모바일 해상도 범위 (DPR 1~3 × 360~430px)
    deviceSizes: [420, 640, 828, 1080],
    imageSizes: [96, 160, 256, 384],
    // 갤러리 일반 / 라이트박스 풀스크린 2단계
    qualities: [75, 85],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
