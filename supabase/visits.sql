-- visits 테이블
create table if not exists visits (
  id uuid default gen_random_uuid() primary key,
  visitor_id text not null,
  visited_at timestamptz default now()
);

-- 인덱스
create index if not exists idx_visits_visited_at on visits (visited_at desc);
create index if not exists idx_visits_visitor_id on visits (visitor_id);

-- RLS
alter table visits enable row level security;

-- 누구나 삽입 가능
create policy "visits_insert" on visits
  for insert with check (true);

-- 조회는 service role만 (통계 조회는 서버에서만)
create policy "visits_select" on visits
  for select using (false);

-- 기존 테이블에 visitor_id 컬럼 추가
alter table rsvp add column if not exists visitor_id text;
alter table guestbook add column if not exists visitor_id text;
alter table guest_photos add column if not exists visitor_id text;
