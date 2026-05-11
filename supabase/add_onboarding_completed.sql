-- =============================================
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. onboarding_completed 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- 2. INSERT RLS 정책 추가 (트리거 미실행 시 upsert가 INSERT 시도해도 작동하도록)
DROP POLICY IF EXISTS "본인 프로필 생성 가능" ON profiles;
CREATE POLICY "본인 프로필 생성 가능" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. 기존에 generation/track이 이미 있는 유저는 완료 처리
UPDATE profiles
  SET onboarding_completed = true
  WHERE generation IS NOT NULL AND track IS NOT NULL;

SELECT '완료! onboarding_completed 컬럼 추가 및 기존 유저 마이그레이션 완료' AS message;
