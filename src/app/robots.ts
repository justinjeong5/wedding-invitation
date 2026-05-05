import type { MetadataRoute } from "next";

// 모바일 청첩장 — 지인 한정 비공개 의도. 검색엔진 인덱싱 차단.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
