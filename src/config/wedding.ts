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
    // 간편송금 링크 (설정 시 계좌 섹션에 버튼 표시)
    kakaopayUrl: "https://qr.kakaopay.com/FEWX6F0KO",
    tossUrl: "",
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
    kakaopayUrl: "", // 카카오페이 앱 > 더보기 > 송금코드 > 링크 복사 (예: "https://qr.kakaopay.com/Fd1234abcd")
    tossUrl: "",     // 토스 앱 > 전체 > 토스아이디 > 내 토스아이디 링크 복사 (예: "https://toss.me/username")
  },

  greeting: {
    title: "소중한 분들을 초대합니다",
    message: `서로 다른 두 사람이 만나
하나의 길을 함께 걸어가고자 합니다.

저희의 새로운 시작을
축복해 주시면 감사하겠습니다.`,
  },

  gallery: {
    images: [
      { src: "/images/gallery/gallery-01.jpg", alt: "함께 걷는 길", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-02.jpg", alt: "눈을 마주보며", width: 1440, height: 1920 },
      { src: "/images/gallery/gallery-03.jpg", alt: "나란히, 함께", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-04.jpg", alt: "소중한 순간", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-05.jpg", alt: "두 손을 맞잡고", width: 1440, height: 1920 },
      { src: "/images/gallery/gallery-06.jpg", alt: "행복한 미소", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-07.jpg", alt: "영원히 기억할 날", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-08.jpg", alt: "사랑의 약속", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-09.jpg", alt: "둘만의 시간", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-10.jpg", alt: "설레는 시작", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-11.jpg", alt: "꿈꾸던 오늘", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-12.jpg", alt: "함께여서 행복한", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-13.jpg", alt: "우리의 이야기", width: 1920, height: 1440 },
    ],
    layout: [
      [0],
      [2, 3, 5],
      { landscape: [6, 7, 8, 9], portrait: 1 },
      [10, 11, 12],
      [4],
    ],
  },

  afterWedding: {
    coverText: "THANK YOU",
    greeting: {
      title: "감사의 인사를 전합니다",
      message: `저희의 새로운 시작을 축복해 주신\n모든 분들께 진심으로 감사드립니다.\n\n여러분의 따뜻한 마음을 간직하며\n행복하게 살겠습니다.`,
    },
    photos: [
      { src: "/images/gallery/gallery-01.jpg", alt: "감사 사진 1", width: 1920, height: 1440 },
      { src: "/images/gallery/gallery-02.jpg", alt: "감사 사진 2", width: 1440, height: 1920 },
    ],
    photoCaption: "함께해 주신 모든 순간이 감사합니다",
  },

  bgm: {
    src: "/audio/bgm.mp3",
    title: "Wedding BGM",
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
