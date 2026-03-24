-- guest_photos 테이블
create table if not exists guest_photos (
  id uuid default gen_random_uuid() primary key,
  storage_path text not null,
  name text not null,
  caption text check (char_length(caption) <= 50),
  password text not null,
  created_at timestamptz default now()
);

-- 인덱스
create index if not exists idx_guest_photos_created_at on guest_photos (created_at desc);

-- RLS
alter table guest_photos enable row level security;

-- 누구나 조회 가능
create policy "guest_photos_select" on guest_photos
  for select using (true);

-- 누구나 삽입 가능
create policy "guest_photos_insert" on guest_photos
  for insert with check (true);

-- 삭제는 service role만 (Server Action에서 비밀번호 검증 후 삭제)
create policy "guest_photos_delete" on guest_photos
  for delete using (false);

-- Storage 버킷
insert into storage.buckets (id, name, public)
values ('guest-photos', 'guest-photos', true)
on conflict (id) do nothing;

-- Storage: 누구나 업로드 가능
create policy "guest_photos_storage_insert" on storage.objects
  for insert with check (bucket_id = 'guest-photos');

-- Storage: 누구나 조회 가능
create policy "guest_photos_storage_select" on storage.objects
  for select using (bucket_id = 'guest-photos');

-- Storage: 삭제는 service role만
create policy "guest_photos_storage_delete" on storage.objects
  for delete using (bucket_id = 'guest-photos' and false);
