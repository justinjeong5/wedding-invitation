# Wedding Invitation

모바일 청첩장 웹앱. GitHub push → Vercel 자동 배포.

**Live**: https://woorim-kyungha.vercel.app

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | framer-motion |
| Gallery | Swiper (EffectFade, Thumbs, Zoom) |
| Map | react-kakao-maps-sdk |
| DB / Storage | Supabase (PostgreSQL + Storage) |
| Auth | bcryptjs (방명록/RSVP 비밀번호 해싱) |
| Deploy | Vercel (자동 배포) |
| Font | Pretendard (본문), Noto Serif KR (제목) |

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # RootLayout, OG metadata, font
│   ├── page.tsx            # 섹션 조합 (단일 페이지)
│   └── globals.css         # 디자인 토큰 (color, font)
├── config/
│   └── wedding.ts          # 모든 예식 데이터 단일 소스 (SSOT)
├── components/
│   ├── sections/           # 13개 섹션 컴포넌트
│   │   ├── Cover.tsx       # 메인 커버 이미지 + 날짜
│   │   ├── Greeting.tsx    # 인사말
│   │   ├── Couple.tsx      # 신랑/신부 소개
│   │   ├── Calendar.tsx    # 달력 (직접 구현)
│   │   ├── Gallery.tsx     # 사진 갤러리 (Swiper)
│   │   ├── Location.tsx    # 지도 + 교통 안내
│   │   ├── Rsvp.tsx        # 참석 여부
│   │   ├── Contact.tsx     # 연락처
│   │   ├── Account.tsx     # 축의금 계좌
│   │   ├── Share.tsx       # 카카오/링크 공유
│   │   ├── GuestGallery.tsx # 하객 사진 업로드
│   │   ├── Guestbook.tsx   # 방명록
│   │   └── Footer.tsx
│   └── ui/                 # 공용 UI 컴포넌트
├── actions/                # Server Actions (mutations)
│   ├── rsvp.ts
│   ├── guestbook.ts
│   └── guest-gallery.ts
├── lib/
│   └── supabase.ts         # Supabase client (anon + service)
└── types/
    └── index.ts
```

## Infrastructure

```
[Browser] → [Vercel Edge] → [Next.js SSR/SSG]
                                    ↓
                              [Supabase]
                              ├── PostgreSQL (rsvp, guestbook, guest_photos)
                              └── Storage (guest-gallery bucket)
```

- **정적 생성**: 대부분의 페이지는 빌드 타임에 생성 (SSG)
- **Server Actions**: RSVP, 방명록, 하객 갤러리 mutation은 서버 액션으로 처리. API Routes 대비 보일러플레이트 최소화
- **Supabase 이중 클라이언트**: anon key (클라이언트 읽기) + service key (서버 액션 쓰기)
- **이미지**: 갤러리 사진은 `/public/images/` 정적 서빙, 하객 사진은 Supabase Storage

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_KAKAO_JS_KEY=
GUEST_GALLERY_ADMIN_PASSWORD=
```

## Lessons Learned

### framer-motion `whileInView` + 스크롤 복원 버그

`initial` + `whileInView` 조합은 페이지 새로고침 시 스크롤 위치가 복원되면 이미 뷰포트 안에 있는 요소를 감지하지 못한다. 요소가 `initial` 상태(숨김)에 고정되어 영원히 나타나지 않는 문제 발생.

**해결**: `whileInView` 대신 `useInView` 훅 + `animate` 프로퍼티 조합으로 교체. 마운트 시점에 뷰포트 체크가 즉시 동작한다.

```tsx
// Before (버그)
<motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>

// After (정상)
const ref = useRef(null);
const isInView = useInView(ref, { once: true });
<motion.div ref={ref} animate={{ opacity: isInView ? 1 : 0 }}>
```

### Swiper Thumbs 양방향 싱크

Hero 캐러셀과 썸네일 스트립을 양방향으로 싱크하려면 `thumbs` 모듈의 `swiper` 옵션에 destroyed 체크가 필수. Swiper 인스턴스가 리렌더링으로 파괴된 후 참조하면 에러 발생.

```tsx
thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
```

### 팝오버 메뉴 뷰포트 오버플로

그리드 좌측 끝 요소의 팝오버가 화면 밖으로 넘어가는 문제. `absolute` 포지셔닝으로는 부모 컨테이너 밖을 벗어남.

**해결**: `fixed` 포지셔닝 + `getBoundingClientRect()` + `Math.min/Math.max`로 뷰포트 내 클램핑.

```tsx
style={{
  top: ref.current.getBoundingClientRect().bottom + 4,
  left: Math.min(
    Math.max(8, ref.current.getBoundingClientRect().left - 140),
    window.innerWidth - menuWidth
  ),
}}
```

### 하객 사진 업로드 보안

파일 업로드 시 MIME 타입 검증만으로는 부족. 확장자 위조가 가능하므로 magic bytes 검증을 추가.

```ts
const MAGIC_BYTES = [
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/png",  [0x89, 0x50, 0x4e, 0x47]],
  ["image/webp", [0x52, 0x49, 0x46, 0x46]],
];
```

### Next.js 개발 서버 이미지 캐시

`public/` 디렉토리에 새 이미지 파일을 추가한 후 개발 서버에서 404가 발생하는 경우, `.next/` 캐시 디렉토리 삭제 후 재시작하면 해결된다. Hot reload로는 `public/` 변경이 반영되지 않을 수 있다.

### 1Password 자동완성 방지

청첩장의 비밀번호 필드(방명록 삭제, RSVP 수정 등)에 1Password가 자동완성을 추천하는 문제. `<form>`과 개별 `<input type="password">`에 `data-1p-ignore` 속성을 추가하여 해결.

## Design Decisions

- **달력**: 한 달만 표시하면 되므로 date 라이브러리 없이 직접 구현
- **라이트박스**: 별도 라이브러리 대신 Swiper Zoom 모듈 재사용 (번들 절약)
- **폼 처리**: API Routes 대신 Server Actions (보일러플레이트 최소)
- **비밀번호 해싱**: bcryptjs로 서버 사이드 해싱 (방명록/RSVP 수정·삭제 시 본인 확인)
- **색상 팔레트**: 아이보리 배경 + warm taupe primary + sage green 악센트

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
```
