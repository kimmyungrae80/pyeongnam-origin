// src/app/missions/page.tsx
// P6 - 미션 센터

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { TRACK_LABELS, TRACK_EMOJIS, DIFFICULTY_LABELS, type Track, type Difficulty } from '@/lib/types'

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: { track?: string; difficulty?: string }
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 미션 목록 + 내 완료 목록 (비로그인 시 submissions 없음)
  const [{ data: missions }, { data: submissions }] = await Promise.all([
    supabase.from('missions').select('*').eq('is_active', true).order('order_num'),
    user
      ? supabase.from('submissions').select('mission_id, status').eq('user_id', user.id)
      : Promise.resolve({ data: null }),
  ])

  const completedMissionIds = new Set(
    submissions?.filter(s => s.status === 'approved').map(s => s.mission_id) ?? []
  )
  const submittedMissionIds = new Set(
    submissions?.filter(s => s.status === 'submitted').map(s => s.mission_id) ?? []
  )

  // 필터 적용
  const filteredMissions = missions?.filter(m => {
    if (searchParams.track && m.track !== searchParams.track) return false
    if (searchParams.difficulty && m.difficulty !== searchParams.difficulty) return false
    return true
  })

  const tracks = Object.keys(TRACK_LABELS) as Track[]
  const difficulties = Object.keys(DIFFICULTY_LABELS) as Difficulty[]

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="section-title">미션 센터</h1>
            <p className="section-sub">
              내 취향과 재능에 맞는 미션을 골라 우리 가문의 이야기를 발굴하세요.
            </p>
          </div>

          {/* 필터 */}
          <div className="flex flex-wrap gap-3 mb-8">
            {/* 트랙 필터 */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/missions"
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  !searchParams.track
                    ? 'bg-purple-700 text-white border-purple-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                전체
              </Link>
              {tracks.map(track => (
                <Link
                  key={track}
                  href={`/missions?track=${track}`}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    searchParams.track === track
                      ? 'bg-purple-700 text-white border-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {TRACK_EMOJIS[track]} {TRACK_LABELS[track]}
                </Link>
              ))}
            </div>

            {/* 난이도 필터 */}
            <div className="flex flex-wrap gap-2">
              {difficulties.map(diff => (
                <Link
                  key={diff}
                  href={`/missions?${searchParams.track ? `track=${searchParams.track}&` : ''}difficulty=${diff}`}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    searchParams.difficulty === diff
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {DIFFICULTY_LABELS[diff]}
                </Link>
              ))}
            </div>
          </div>

          {/* 미션 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMissions?.map(mission => {
              const isCompleted = completedMissionIds.has(mission.id)
              const isSubmitted = submittedMissionIds.has(mission.id)

              return (
                <div
                  key={mission.id}
                  className={`card border-2 transition-all ${
                    isCompleted
                      ? 'border-green-100 bg-green-50/30'
                      : 'border-transparent hover:border-purple-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`badge-track-${mission.track}`}>
                        {TRACK_EMOJIS[mission.track as Track]} {TRACK_LABELS[mission.track as Track]}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        mission.difficulty === 'easy' ? 'bg-green-50 text-green-700' :
                        mission.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {DIFFICULTY_LABELS[mission.difficulty as Difficulty]}
                      </span>
                      {mission.is_family_mission && (
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                          가족 미션
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-purple-700 font-medium text-sm">+{mission.points}p</div>
                      {mission.is_family_mission && (
                        <div className="text-xs text-orange-600">
                          가족 함께: ×{mission.family_bonus_multiplier}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2">{mission.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{mission.description}</p>

                  <div className="flex items-center justify-between">
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 text-green-600 text-sm">
                        <span>✓</span>
                        <span>완료!</span>
                      </div>
                    ) : isSubmitted ? (
                      <div className="flex items-center gap-1.5 text-yellow-600 text-sm">
                        <span>⏳</span>
                        <span>심사 중</span>
                      </div>
                    ) : (
                      <div></div>
                    )}

                    {!isCompleted && !isSubmitted && (
                      <Link
                        href={user ? `/submit?mission=${mission.id}` : '/auth'}
                        className="ml-auto btn-primary text-sm px-4 py-2"
                      >
                        {user ? '시작하기 →' : '로그인 후 시작'}
                      </Link>
                    )}
                    {isCompleted && (
                      <Link
                        href={`/submit?mission=${mission.id}`}
                        className="ml-auto text-sm text-gray-400 hover:text-gray-600"
                      >
                        다시 제출
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredMissions?.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-500">해당 조건의 미션이 없습니다.</p>
              <Link href="/missions" className="text-purple-700 text-sm mt-2 inline-block hover:underline">
                전체 미션 보기
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
