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
    father: { name: "정창우", relation: "아버지" },
    mother: { name: "권계", relation: "어머니" },
    tel: "010-7273-4775",
    fatherTel: "010-3725-4774",
    motherTel: "010-8760-4776",
    accounts: [
      {
        bank: "토스뱅크",
        number: "1000-2230-2438",
        holder: "정경하",
        kakaopayUrl: "https://qr.kakaopay.com/FEWX6F0KO",
        tossUrl: "",
      },
      {
        bank: "국민은행",
        number: "201-20-0577-174",
        holder: "정창우",
        relation: "부",
        kakaopayUrl: "",
        tossUrl: "",
      },
      {
        bank: "우체국",
        number: "103556-02-301250",
        holder: "권계",
        relation: "모",
        kakaopayUrl: "",
        tossUrl: "",
      },
    ],
  },

  bride: {
    name: "전우림",
    role: "신부",
    father: { name: "전병세", relation: "아버지" },
    mother: { name: "한도경", relation: "어머니" },
    tel: "010-8613-3135",
    fatherTel: "010-9162-6037",
    motherTel: "010-8778-3135",
    accounts: [
      {
        bank: "케이뱅크",
        number: "100-160-814463",
        holder: "전우림",
        kakaopayUrl: "https://qr.kakaopay.com/Ej7qxX4Wn",
        tossUrl: "",
      },
      {
        bank: "하나은행",
        number: "057-19-42345-2",
        holder: "전병세",
        relation: "부",
        kakaopayUrl: "",
        tossUrl: "",
      },
      {
        bank: "국민은행",
        number: "499402-01-056275",
        holder: "한도경",
        relation: "모",
        kakaopayUrl: "",
        tossUrl: "",
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
    images: [
      { src: "/images/gallery/19.jpg", alt: "정경하 전우림 웨딩 01", width: 1067, height: 1600 },
      { src: "/images/gallery/01.jpg", alt: "정경하 전우림 웨딩 02", width: 1067, height: 1600 },
      { src: "/images/gallery/02.jpg", alt: "정경하 전우림 웨딩 03", width: 1067, height: 1600 },
      { src: "/images/gallery/03.jpg", alt: "정경하 전우림 웨딩 04", width: 1600, height: 1067 },
      { src: "/images/gallery/04.jpg", alt: "정경하 전우림 웨딩 05", width: 1067, height: 1600 },
      { src: "/images/gallery/05.jpg", alt: "정경하 전우림 웨딩 06", width: 1600, height: 1067 },
      { src: "/images/gallery/06.jpg", alt: "정경하 전우림 웨딩 07", width: 1067, height: 1600 },
      { src: "/images/gallery/07.jpg", alt: "정경하 전우림 웨딩 08", width: 1600, height: 1067 },
      { src: "/images/gallery/08.jpg", alt: "정경하 전우림 웨딩 09", width: 1067, height: 1600 },
      { src: "/images/gallery/09.jpg", alt: "정경하 전우림 웨딩 10", width: 1067, height: 1600 },
      { src: "/images/gallery/10.jpg", alt: "정경하 전우림 웨딩 11", width: 1067, height: 1600 },
      { src: "/images/gallery/11.jpg", alt: "정경하 전우림 웨딩 12", width: 1067, height: 1600 },
      { src: "/images/gallery/12.jpg", alt: "정경하 전우림 웨딩 13", width: 1067, height: 1600 },
      { src: "/images/gallery/13.jpg", alt: "정경하 전우림 웨딩 14", width: 1600, height: 1067 },
      { src: "/images/gallery/14.jpg", alt: "정경하 전우림 웨딩 15", width: 1067, height: 1600 },
      { src: "/images/gallery/15.jpg", alt: "정경하 전우림 웨딩 16", width: 1067, height: 1600 },
      { src: "/images/gallery/16.jpg", alt: "정경하 전우림 웨딩 17", width: 1200, height: 1600 },
      { src: "/images/gallery/17.jpg", alt: "정경하 전우림 웨딩 18", width: 1200, height: 1600 },
      { src: "/images/gallery/18.jpg", alt: "정경하 전우림 웨딩 19", width: 1600, height: 1067 },
    ],
    layout: [
      [0],
      [1, 2],
      [3],
      { landscape: [5, 7], portrait: 4 },
      [6],
      [8, 9],
      [10],
      [11, 12],
      [13],
      [14, 15],
      [16, 17],
      [18],
    ],
  },

  afterWedding: {
    coverText: "THANK YOU",
    greeting: {
      title: "감사의 인사를 전합니다",
      message: `저희의 새로운 시작을 축복해 주신\n모든 분들께 진심으로 감사드립니다.\n\n여러분의 따뜻한 마음을 간직하며\n행복하게 살겠습니다.`,
    },
    photos: [
      { src: "/images/thankyou-01.jpg", alt: "감사 사진 1", width: 1600, height: 1067 },
      { src: "/images/thankyou-02.jpg", alt: "감사 사진 2", width: 1067, height: 1600 },
    ],
    photoCaption: "함께해 주신 모든 순간이 감사합니다",
  },

  bgm: {
    src: "/audio/bgm-v2.mp3",
    title: "Wedding BGM",
  },

  meta: {
    title: "정경하 & 전우림 결혼합니다",
    description:
      "2026년 7월 11일 토요일 오후 12시 30분 | 더컨벤션 잠실",
    ogImage: "/images/og-image-v2.jpg",
    siteUrl: "https://woorim-kyungha.vercel.app",
  },
} as const;

export type WeddingConfig = typeof WEDDING_CONFIG;
