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
│   ├── layout.tsx            # RootLayout, OG metadata, font
│   ├── page.tsx              # 섹션 조합 (단일 페이지)
│   └── globals.css           # 디자인 토큰 (color, font)
├── config/
│   └── wedding.ts            # 모든 예식 데이터 단일 소스 (SSOT)
├── features/                 # 복잡 피처 (코로케이션)
│   ├── guest-gallery/        # 하객 갤러리 (업로드, 그리드, 라이트박스)
│   │   ├── GuestGallery.tsx, UploadForm.tsx, PhotoCard.tsx, ...
│   │   ├── actions.ts        # Server Actions
│   │   └── index.ts
│   ├── rsvp/                 # RSVP (폼, 대시보드, 통계)
│   │   ├── Rsvp.tsx, RsvpForm.tsx, RsvpDashboard.tsx, ...
│   │   ├── actions.ts
│   │   └── index.ts
│   └── guestbook/            # 방명록 (폼, 항목, 수정/삭제)
│       ├── Guestbook.tsx, GuestbookItem.tsx, ...
│       ├── actions.ts
│       └── index.ts
├── components/
│   ├── sections/             # 경량 섹션 컴포넌트
│   └── ui/                   # 공용 UI 컴포넌트
├── actions/
│   └── visit.ts              # 방문 기록/통계
├── hooks/                    # 공유 훅
├── lib/                      # 공유 유틸 (supabase, auth, date)
├── types/
│   └── index.ts
└── config/
```

## Time-Based Feature Controls

예식 타임라인에 따라 자동으로 기능이 전환됩니다. 모든 시간 로직은 `src/lib/date.ts`에 정의되어 있습니다.

### 타임라인

```
─── 예식 전 ──────────────── 7/11 00:00 ──── 7/11 12:30 ──── 7/11 24:00 ──── 7/14 00:00 ───
                              갤러리 오픈      예식 시작        예식 후 모드     작성 마감
```

| 시점 | 트리거 | 변경 내용 |
|------|--------|----------|
| **예식 당일 자정** (7/11 00:00) | `isGuestGalleryOpen()` | 하객 갤러리 섹션 공개, 안내 모달 활성화 |
| **예식 종료** (7/11 24:00) | `isAfterWedding()` | 달력·지도·RSVP·계좌 숨김, 감사 갤러리 표시 |
| **예식 3일 후** (7/14 00:00) | `isSubmissionClosed()` | 하객 갤러리 업로드·방명록 작성 폼 비활성화 (열람은 가능) |

### 기능별 가시성

| 섹션 | 예식 전 | 예식 당일 | 예식 후 | 마감 후 (D+3) |
|------|---------|----------|---------|--------------|
| 커버·인사말·커플 | O | O | O | O |
| 달력 | O | O | **X** | X |
| 갤러리 (사진) | O | O | O | O |
| 지도·교통안내 | O | O | **X** | X |
| RSVP | O | O | **X** | X |
| 연락처 | O | O | O | O |
| 계좌 | O | O | **X** | X |
| 감사 갤러리 | X | X | **O** | O |
| 하객 갤러리 (열람) | **X** | **O** | O | O |
| 하객 갤러리 (업로드) | X | O | O | **X** |
| 방명록 (열람) | O | O | O | O |
| 방명록 (작성) | O | O | O | **X** |

### 구현 구조

```
src/lib/date.ts                    ← 3개 시간 판별 함수 (서버 + 클라이언트 공용)
  ├── isGuestGalleryOpen()         ← 7/11 00:00 이후 true
  ├── isAfterWedding()             ← 7/11 24:00 이후 true
  └── isSubmissionClosed()         ← 7/14 00:00 이후 true

src/hooks/
  ├── useGuestGalleryOpen.ts       ← isGuestGalleryOpen + 관리자 프리뷰 오버라이드
  ├── useAfterWedding.ts           ← isAfterWedding + 관리자 프리뷰 오버라이드
  └── useSubmissionOpen.ts         ← !isSubmissionClosed + 관리자 프리뷰 오버라이드

src/components/ui/
  ├── AfterWeddingHide.tsx         ← 예식 후 자녀 숨김 (달력, 지도, RSVP, 계좌)
  ├── AfterWeddingShow.tsx         ← 예식 후 자녀 표시 (감사 갤러리)
  └── GuestGalleryGate.tsx         ← 갤러리 오픈 전 자녀 숨김
```

서버 액션(`uploadGuestPhoto`, `submitGuestbook`)에도 `isSubmissionClosed()` 체크가 있어 클라이언트 우회를 방지합니다.

### 관리자 프리뷰

모든 시간 기반 기능은 관리자 모드에서 토글로 미리 확인할 수 있습니다. `usePreviewOverride` 훅이 CustomEvent를 통해 실제 시간과 무관하게 상태를 오버라이드합니다.

## Infrastructure

```
[Browser] → [Vercel Edge] → [Next.js SSR/SSG]
                                    ↓
                              [Supabase]
                              ├── PostgreSQL (rsvp, guestbook, guest_photos)
                              └── Storage (guest-photos bucket)
```

- **정적 생성**: 대부분의 페이지는 빌드 타임에 생성 (SSG)
- **Server Actions**: RSVP, 방명록, 하객 갤러리 mutation은 서버 액션으로 처리. API Routes 대비 보일러플레이트 최소화
- **이미지**: 갤러리 사진은 `/public/images/` 정적 서빙, 하객 사진은 Supabase Storage

### Vercel

GitHub `master` 브랜치에 push하면 자동 배포. 별도 CI/CD 설정 없음.

- **Framework Preset**: Next.js (자동 감지)
- **Build Command**: `next build`
- **Output**: Static + Serverless Functions (Server Actions용)
- **Environment Variables**: Vercel 대시보드 → Settings → Environment Variables에서 아래 변수 설정 필요

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_KAKAO_APP_KEY=
GUEST_GALLERY_ADMIN_PASSWORD=
RESEND_API_KEY=
```

- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트 번들에 포함되므로 민감하지 않은 값만 사용
- `SUPABASE_SECRET_KEY`와 `GUEST_GALLERY_ADMIN_PASSWORD`는 서버 사이드(Server Actions)에서만 접근
- `RESEND_API_KEY`는 런타임 에러 발생 시 이메일 알림 발송에 사용 ([resend.com](https://resend.com)에서 무료 발급). 미설정 시 이메일 알림 없이 콘솔 로그만 출력
- 시간 기반 기능(갤러리 오픈, 작성 마감 등)은 코드에서 KST(`+09:00`) 오프셋을 명시하여 서버 환경(UTC)에 무관하게 정확히 동작 (`src/lib/date.ts`)

### Supabase

#### 이중 클라이언트 패턴

```
supabase (anon key)    → 읽기 전용 (클라이언트에서 목록 조회)
serviceClient (secret) → 쓰기/삭제 (Server Actions에서만 사용)
```

읽기에는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon key)를 사용하고, 쓰기/삭제에는 `SUPABASE_SECRET_KEY` (service role key)를 사용. service key는 RLS를 우회하므로 서버 사이드에서만 `getServiceClient()`로 생성.

#### Database Tables

```sql
-- RSVP (참석 여부)
create table rsvp (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  side text not null,           -- 'groom' | 'bride'
  attendance boolean not null,
  guest_count integer default 1,
  meal boolean default false,
  message text,
  password text not null,       -- bcrypt hash
  created_at timestamptz default now()
);

-- 방명록
create table guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  password text not null,       -- bcrypt hash
  edited boolean default false,
  created_at timestamptz default now()
);

-- 하객 사진
create table guest_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,   -- Storage 파일명
  name text not null,
  caption text,
  password text not null,       -- bcrypt hash
  created_at timestamptz default now()
);
```

#### Storage

- **Bucket**: `guest-photos` (public)
- **업로드 제한**: 5MB, JPEG/PNG/WebP/HEIC만 허용
- **파일명**: `{timestamp}-{random}.{ext}` 형식으로 충돌 방지
- **검증**: MIME 타입 + magic bytes 이중 검증
- **삭제**: DB 레코드 삭제 시 Storage 파일도 함께 삭제
- **실패 롤백**: Storage 업로드 성공 후 DB insert 실패 시 Storage 파일 삭제

#### 페이지네이션

방명록과 하객 갤러리 모두 커서 기반 페이지네이션 사용. `created_at` 기준 내림차순으로 `PAGE_SIZE + 1`개를 조회하여 다음 페이지 존재 여부를 판단.

```ts
// PAGE_SIZE + 1로 조회 → 초과분이 있으면 hasMore = true
const hasMore = rows.length > PAGE_SIZE;
return { entries: rows.slice(0, PAGE_SIZE), hasMore };
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
