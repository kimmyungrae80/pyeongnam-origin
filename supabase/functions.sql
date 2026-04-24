-- =============================================
-- supabase/functions.sql
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 포인트 증가 함수 (atomic 업데이트)
create or replace function increment_points(user_id uuid, amount int)
returns void as $$
begin
  update profiles
  set points = points + amount,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql security definer;

-- =============================================
-- 관리자 계정 설정 (가입 후 실행)
-- 아래 이메일을 실제 관리자 이메일로 바꾸세요
-- =============================================

-- update profiles
-- set is_admin = true
-- where id = (
--   select id from auth.users where email = '여기에_관리자_이메일'
-- );

-- =============================================
-- Storage 버킷 생성 (파일 업로드용)
-- Supabase 대시보드 → Storage → New bucket
-- 이름: submissions
-- Public: true
-- =============================================

-- Storage 정책 추가
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

create policy "로그인 유저 업로드 가능"
on storage.objects for insert
to authenticated
with check (bucket_id = 'submissions');

create policy "공개 파일 조회 가능"
on storage.objects for select
to public
using (bucket_id = 'submissions');

create policy "본인 파일 삭제 가능"
on storage.objects for delete
to authenticated
using (bucket_id = 'submissions' and auth.uid()::text = (storage.foldername(name))[1]);

select '함수 및 Storage 설정 완료!' as message;
