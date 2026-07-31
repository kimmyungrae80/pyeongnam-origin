-- =============================================
-- 평남 오리진 플랫폼 DB 스키마
-- Supabase SQL Editor에서 전체 실행하세요
-- =============================================

-- 기존 테이블 삭제 (재실행 시)
drop table if exists user_badges cascade;
drop table if exists badges cascade;
drop table if exists submissions cascade;
drop table if exists missions cascade;
drop table if exists archive_items cascade;
drop table if exists family_members cascade;
drop table if exists families cascade;
drop table if exists profiles cascade;

-- =============================================
-- 1. profiles (회원 정보)
-- =============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  generation int check (generation in (1, 2, 3, 4)),
  origin_region text,           -- 출신 지역 (평양시, 대동군 등)
  track text check (track in ('storytelling', 'lifestyle', 'digital', 'free')),
  family_id uuid,
  points int default 0,
  bio text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- profiles는 회원가입 시 자동 생성되도록 트리거
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', '이름없음'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =============================================
-- 2. families (가문)
-- =============================================
create table families (
  id uuid default gen_random_uuid() primary key,
  name text not null,                   -- 예: "홍씨 가문"
  origin_region text,                   -- 예: "평양시 중구역"
  invite_code text unique default substr(md5(random()::text), 1, 8),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- profiles에 family_id 외래키 추가
alter table profiles
  add constraint fk_family foreign key (family_id) references families(id);

-- =============================================
-- 3. missions (미션 목록)
-- =============================================
create table missions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  track text check (track in ('storytelling', 'lifestyle', 'digital', 'free')),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'easy',
  points int default 100,
  is_family_mission boolean default false,   -- 가족 공동 미션 여부
  family_bonus_multiplier float default 1.0, -- 가족 함께 시 보너스 배수
  is_active boolean default true,
  order_num int default 0,
  created_at timestamptz default now()
);

-- 기본 미션 데이터 삽입
insert into missions (title, description, track, difficulty, points, is_family_mission, family_bonus_multiplier) values
  ('가족사진 5장 업로드', '우리 가문의 옛날 사진을 5장 이상 찾아 업로드하고 간단한 설명을 달아보세요.', 'storytelling', 'easy', 200, false, 1.0),
  ('할아버지/할머니 인터뷰 1분 영상', '1세대 가족에게 평안남도에 대해 인터뷰하는 1분짜리 영상을 만들어보세요.', 'storytelling', 'medium', 500, true, 1.5),
  ('가문의 고향 이야기 에세이', '우리 가문이 살았던 평남 지역의 이야기를 500자 이상 에세이로 써보세요.', 'storytelling', 'medium', 400, false, 1.0),
  ('우리 집 평남 음식 레시피 영상', '집에서 전해 내려오는 평남 음식(평양냉면, 어복쟁반 등)을 만드는 영상을 촬영해보세요.', 'lifestyle', 'medium', 500, false, 1.0),
  ('평남 전통 문양으로 굿즈 디자인', '평안남도 전통 문양이나 색을 활용해 나만의 굿즈 디자인을 만들어보세요.', 'lifestyle', 'hard', 700, false, 1.0),
  ('디지털 평남 지도 핀 등록', '할아버지/할머니가 살았던 곳, 다니던 학교, 추억의 장소를 지도에 핀으로 표시해보세요.', 'digital', 'easy', 300, true, 1.3),
  ('가상 고향 브이로그 제작', '평안남도 출신이라면 어떤 하루를 보낼지 상상해서 브이로그 형식으로 만들어보세요.', 'digital', 'hard', 800, false, 1.0),
  ('3세대 + 1세대 공동 인터뷰', '조부모님과 함께 앉아 평남에서의 삶을 주제로 대화하고 영상으로 기록해보세요.', 'storytelling', 'hard', 1000, true, 1.5),
  ('평남 관련 숏폼 영상 제작', '평안남도를 주제로 틱톡/릴스 형식의 60초 이하 숏폼 영상을 만들어보세요.', 'free', 'easy', 300, false, 1.0),
  ('우리 가문 족보 탐색기', '가문의 족보를 바탕으로 평남과 연결된 이야기를 정리해 웹툰이나 인포그래픽으로 표현해보세요.', 'free', 'hard', 900, false, 1.0);

-- =============================================
-- 4. submissions (제출물)
-- =============================================
create table submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  mission_id uuid references missions(id),
  title text,
  content text,                    -- 텍스트 내용 (에세이 등)
  file_urls text[],                -- 업로드된 파일 URL 배열
  content_type text check (content_type in ('photo', 'video', 'essay', 'design', 'map', 'other')),
  status text check (status in ('draft', 'submitted', 'approved', 'rejected')) default 'submitted',
  points_earned int default 0,
  admin_comment text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- 5. badges (배지)
-- =============================================
create table badges (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text,                       -- 이모지 또는 아이콘 코드
  condition_type text,             -- 'mission_count', 'points', 'track_complete' 등
  condition_value int,
  created_at timestamptz default now()
);

insert into badges (name, description, icon, condition_type, condition_value) values
  ('첫 탐사', '첫 번째 미션을 완료했습니다.', '🌱', 'mission_count', 1),
  ('가족사진 발굴가', '가족사진 미션을 완료했습니다.', '📸', 'mission_specific', 1),
  ('이야기꾼', '스토리텔링 트랙 미션 3개를 완료했습니다.', '📖', 'track_count', 3),
  ('맛 계승자', '라이프스타일 트랙 미션을 완료했습니다.', '🍜', 'track_count', 1),
  ('디지털 탐험가', '디지털 트랙 미션을 완료했습니다.', '🗺', 'track_count', 1),
  ('세대 이음', '가족 미션을 완료했습니다.', '🤝', 'family_mission', 1),
  ('뿌리 대사', '포인트 1000점을 달성했습니다.', '⭐', 'points', 1000),
  ('평남의 자랑', '포인트 5000점을 달성했습니다.', '🏆', 'points', 5000);

-- =============================================
-- 6. user_badges (유저 배지 획득 기록)
-- =============================================
create table user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  badge_id uuid references badges(id),
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- =============================================
-- 7. archive_items (아카이브)
-- =============================================
create table archive_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  family_id uuid references families(id),
  title text not null,
  description text,
  content_type text check (content_type in ('photo', 'video', 'essay', 'design', 'map', 'other')),
  file_urls text[],
  region_tag text,                 -- 관련 평남 지역
  tags text[],                     -- 추가 태그
  is_public boolean default true,
  is_featured boolean default false,  -- 쇼케이스 노출 여부
  view_count int default 0,
  submission_id uuid references submissions(id),
  created_at timestamptz default now()
);

-- =============================================
-- 8. RLS (Row Level Security) 설정
-- =============================================

-- profiles
alter table profiles enable row level security;
create policy "누구나 프로필 조회 가능" on profiles for select using (true);
create policy "본인 프로필만 수정 가능" on profiles for update using (auth.uid() = id);

-- families
alter table families enable row level security;
create policy "누구나 가문 조회 가능" on families for select using (true);
create policy "로그인 유저는 가문 생성 가능" on families for insert with check (auth.role() = 'authenticated');

-- missions
alter table missions enable row level security;
create policy "누구나 미션 조회 가능" on missions for select using (true);

-- submissions
alter table submissions enable row level security;
create policy "본인 제출물 조회" on submissions for select using (auth.uid() = user_id);
create policy "공개 제출물 조회" on submissions for select using (is_public = true);
create policy "로그인 유저 제출 가능" on submissions for insert with check (auth.role() = 'authenticated');
create policy "본인 제출물 수정 가능" on submissions for update using (auth.uid() = user_id);

-- archive_items
alter table archive_items enable row level security;
create policy "공개 아카이브 조회" on archive_items for select using (is_public = true);
create policy "본인 아카이브 전체 조회" on archive_items for select using (auth.uid() = user_id);

-- badges, user_badges
alter table badges enable row level security;
create policy "누구나 배지 조회" on badges for select using (true);
alter table user_badges enable row level security;
create policy "본인 배지 조회" on user_badges for select using (auth.uid() = user_id);

-- =============================================
-- 9. 랭킹 뷰 (자동 계산)
-- =============================================
create or replace view rankings as
  select
    p.id,
    p.name,
    p.generation,
    p.origin_region,
    p.track,
    p.points,
    p.avatar_url,
    rank() over (order by p.points desc) as rank,
    count(s.id) as submission_count
  from profiles p
  left join submissions s on s.user_id = p.id and s.status = 'approved'
  group by p.id
  order by p.points desc;

-- =============================================
-- 완료!
-- =============================================
select 'DB 스키마 생성 완료!' as message;
