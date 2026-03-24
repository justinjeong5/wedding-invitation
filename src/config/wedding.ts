export const WEDDING_CONFIG = {
  date: {
    year: 2026,
    month: 7,
    day: 11,
    hour: 12,
    minute: 30,
    dayOfWeek: "토요일",
    display: "2026년 7월 11일 토요일 오후 12시 30분",
  },

  venue: {
    name: "더컨벤션 잠실",
    hall: "3층 아모르홀",
    banquet: "12층 단독 연회장",
    address: "서울 송파구 올림픽로 319 3층",
    tel: "02-418-5000",
    directions: {
      subway: [
        { line: "2호선", detail: "잠실역 8번 출구 약 300m" },
        { line: "8호선", detail: "잠실역 9번 출구 약 30m" },
      ],
      bus: [
        { type: "일반", routes: "16, 32, 100, 101" },
        { type: "간선", routes: "310, 341, 360" },
        { type: "지선", routes: "2311, 3411" },
        { type: "광역·직행", routes: "1000, 1100, 1700" },
        { type: "공항", routes: "6000, 6006" },
      ],
      car: {
        newAddress: "송파구 올림픽로 319",
        oldAddress: "송파구 신천동 11-7",
      },
      parking: {
        main: "본관 주차장 (하객 2시간 무료)",
        overflow: "만차 시 잠실역 공영주차장 이용",
        tip: "주차장이 혼잡할 수 있으니 대중교통을 권장합니다",
      },
    },
    coordinates: {
      lat: 37.5157192,
      lng: 127.1057895,
    },
    naverMapUrl:
      "https://map.naver.com/v5/search/%EB%8D%94%EC%BB%A8%EB%B2%A4%EC%85%98%20%EC%9E%A0%EC%8B%A4",
    kakaoMapUrl:
      "https://map.kakao.com/link/to/더컨벤션 잠실,37.5157192,127.1057895",
    tmapUrl:
      "https://tmap.life/b9c1e2a0",
  },

  groom: {
    name: "정경하",
    role: "신랑",
    father: { name: "정○○", relation: "아버지" },
    mother: { name: "○○○", relation: "어머니" },
    tel: "010-0000-0000", // placeholder
    fatherTel: "010-0000-0000", // placeholder
    motherTel: "010-0000-0000", // placeholder
    accounts: [
      { bank: "○○은행", number: "000-000-000000", holder: "정경하" },
      {
        bank: "○○은행",
        number: "000-000-000000",
        holder: "정○○",
        relation: "부",
      },
    ],
  },

  bride: {
    name: "전우림",
    role: "신부",
    father: { name: "전○○", relation: "아버지" },
    mother: { name: "○○○", relation: "어머니" },
    tel: "010-0000-0000", // placeholder
    fatherTel: "010-0000-0000", // placeholder
    motherTel: "010-0000-0000", // placeholder
    accounts: [
      { bank: "○○은행", number: "000-000-000000", holder: "전우림" },
      {
        bank: "○○은행",
        number: "000-000-000000",
        holder: "전○○",
        relation: "부",
      },
    ],
  },

  greeting: {
    title: "소중한 분들을 초대합니다",
    message: `서로 다른 두 사람이 만나
하나의 길을 함께 걸어가고자 합니다.

저희의 새로운 시작을
축복해 주시면 감사하겠습니다.`,
  },

  gallery: {
    // 실제 사진으로 교체 시: .svg → .jpg (또는 .webp)로 확장자만 변경
    // featured: 섹션 사이에 배치되는 사진 (PhotoRevealPair, PhotoBreak)
    featured: [
      { src: "/images/gallery/gallery-01.svg", alt: "웨딩 사진 1" },
      { src: "/images/gallery/gallery-02.svg", alt: "웨딩 사진 2" },
      { src: "/images/gallery/gallery-07.svg", alt: "웨딩 사진 7" },
      { src: "/images/gallery/gallery-10.svg", alt: "웨딩 사진 10" },
    ],
    // images: Gallery 섹션에 표시되는 나머지 사진
    images: [3, 4, 5, 6, 8, 9, 11, 12].map((n) => ({
      src: `/images/gallery/gallery-${String(n).padStart(2, "0")}.svg`,
      alt: `웨딩 사진 ${n}`,
    })),
  },

  meta: {
    title: "정경하 & 전우림 결혼합니다",
    description:
      "2026년 7월 11일 토요일 오후 12시 30분 | 더컨벤션 잠실",
    ogImage: "/images/og-image.jpg",
    siteUrl: "https://woorim-kyungha.vercel.app",
  },
} as const;

export type WeddingConfig = typeof WEDDING_CONFIG;
