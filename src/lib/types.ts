// lib/types.ts

export type Generation = 1 | 2 | 3 | 4

export type Track = 'storytelling' | 'lifestyle' | 'digital' | 'free'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type ContentType = 'photo' | 'video' | 'essay' | 'design' | 'map' | 'other'

export type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Profile {
  id: string
  name: string
  generation: Generation | null
  origin_region: string | null
  track: Track | null
  family_id: string | null
  points: number
  bio: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Family {
  id: string
  name: string
  origin_region: string | null
  invite_code: string
  created_by: string | null
  created_at: string
}

export interface Mission {
  id: string
  title: string
  description: string | null
  track: Track
  difficulty: Difficulty
  points: number
  is_family_mission: boolean
  family_bonus_multiplier: number
  is_active: boolean
  order_num: number
  created_at: string
}

export interface Submission {
  id: string
  user_id: string
  mission_id: string | null
  title: string | null
  content: string | null
  file_urls: string[] | null
  content_type: ContentType | null
  status: SubmissionStatus
  points_earned: number
  admin_comment: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  // 조인 데이터
  mission?: Mission
  profile?: Profile
}

export interface Badge {
  id: string
  name: string
  description: string | null
  icon: string | null
  condition_type: string | null
  condition_value: number | null
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface ArchiveItem {
  id: string
  user_id: string | null
  family_id: string | null
  title: string
  description: string | null
  content_type: ContentType | null
  file_urls: string[] | null
  region_tag: string | null
  tags: string[] | null
  is_public: boolean
  is_featured: boolean
  view_count: number
  submission_id: string | null
  created_at: string
  // 조인 데이터
  profile?: Profile
  family?: Family
}

export interface Ranking {
  id: string
  name: string
  generation: Generation | null
  origin_region: string | null
  track: Track | null
  points: number
  avatar_url: string | null
  rank: number
  submission_count: number
}

// 트랙 한글 이름
export const TRACK_LABELS: Record<Track, string> = {
  storytelling: '스토리텔링',
  lifestyle: '라이프스타일',
  digital: '디지털/아트',
  free: '자유주제',
}

// 트랙 이모지
export const TRACK_EMOJIS: Record<Track, string> = {
  storytelling: '📖',
  lifestyle: '🍜',
  digital: '🗺',
  free: '🎬',
}

// 트랙 색상 (Tailwind 클래스)
export const TRACK_COLORS: Record<Track, { bg: string; text: string; border: string }> = {
  storytelling: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  lifestyle: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  digital: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  free: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
}

// 난이도 한글
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '도전',
}

// 평남 지역 목록
export const PYEONGNAM_REGIONS = [
  '평양시',
  '진남포시',
  '대동군',
  '순천군',
  '맹산군',
  '양덕군',
  '성천군',
  '강동군',
  '중화군',
  '용강군',
  '강서군',
  '평원군',
  '안주군',
  '개천군',
  '영원군',
  '기타',
]
