// src/app/dashboard/page.tsx
// P5 - 개인 대시보드

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { TRACK_LABELS, TRACK_EMOJIS, DIFFICULTY_LABELS, type Track, type Difficulty } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // 프로필 + 제출물 + 배지 가져오기
  const [
    { data: profile },
    { data: submissions },
    { data: userBadges },
    { data: missions },
    { data: rankingData },
  ] = await Promise.all([
    supabase.from('profiles').select('*, families(name, origin_region, invite_code)').eq('id', user.id).maybeSingle(),
    supabase.from('submissions').select('*, missions(title, track, points)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id),
    supabase.from('missions').select('*').eq('is_active', true).order('order_num').limit(3),
    supabase.from('rankings').select('*').eq('id', user.id).maybeSingle(),
  ])

  const approvedCount = submissions?.filter(s => s.status === 'approved').length ?? 0
  const totalMissions = 10
  const progressPercent = Math.round((approvedCount / totalMissions) * 100)

  const trackCounts: Record<string, number> = {}
  submissions?.filter(s => s.status === 'approved').forEach(s => {
    const track = s.missions?.track
    if (track) trackCounts[track] = (trackCounts[track] || 0) + 1
  })

  const familyData = (profile as any)?.families ?? null

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* 프로필 미완성 배너 */}
          {!profile?.onboarding_completed && (
            <div className="mb-6 bg-purple-50 border border-purple-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-purple-900">프로필을 완성하면 맞춤 미션 추천을 받을 수 있어요</p>
                <p className="text-xs text-purple-600 mt-0.5">세대·출신지역·탐사 트랙을 설정해보세요 · <Link href="/faq" className="underline">참여 방법 FAQ</Link></p>
              </div>
              <Link
                href="/onboarding"
                className="flex-shrink-0 bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-purple-800 transition-colors"
              >
                프로필 설정하기 →
              </Link>
            </div>
          )}

          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-gray-900">
              안녕하세요, {profile?.name ?? '회원'}님 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.origin_region ? `${profile.origin_region} 출신` : '지역 미설정'} ·{' '}
              {profile?.track ? TRACK_EMOJIS[profile.track as Track] + ' ' + TRACK_LABELS[profile.track as Track] : '트랙 미설정'}
            </p>
          </div>

          {/* 상단 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card text-center">
              <div className="text-2xl font-medium text-purple-700">{(profile?.points ?? 0).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">누적 포인트</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-medium text-teal-700">{approvedCount}</div>
              <div className="text-xs text-gray-400 mt-1">완료 미션</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-medium text-orange-700">{userBadges?.length ?? 0}</div>
              <div className="text-xs text-gray-400 mt-1">획득 배지</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-medium text-gray-700">
                {(rankingData as any)?.rank ?? '-'}위
              </div>
              <div className="text-xs text-gray-400 mt-1">전체 랭킹</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 미션 진행률 */}
            <div className="md:col-span-2 space-y-6">
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-900">미션 진행률</h2>
                  <span className="text-purple-700 font-medium text-sm">{progressPercent}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5 mb-5">
                  <div
                    className="bg-purple-700 h-2.5 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* 트랙별 */}
                <div className="grid grid-cols-4 gap-3">
                  {(Object.keys(TRACK_LABELS) as Track[]).map((track) => {
                    const count = trackCounts[track] || 0
                    const max = 3 // 트랙당 최대 미션 수 (임의)
                    const pct = Math.round((count / max) * 100)
                    return (
                      <div key={track} className="text-center">
                        <div className="text-lg mb-1">{TRACK_EMOJIS[track]}</div>
                        <div className="text-xs text-gray-500 mb-1.5">{TRACK_LABELS[track]}</div>
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{count}/{max}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 추천 미션 */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-900">다음 추천 미션</h2>
                  <Link href="/missions" className="text-sm text-purple-700 hover:underline">전체 보기 →</Link>
                </div>
                <div className="space-y-3">
                  {missions?.map((mission, i) => (
                    <div
                      key={mission.id}
                      className={`p-4 rounded-xl border transition-all ${
                        i === 0 ? 'border-purple-200 bg-purple-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{mission.title}</span>
                            {mission.is_family_mission && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                가족미션
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge-track-${mission.track} text-xs`}>
                              {TRACK_EMOJIS[mission.track as Track]} {TRACK_LABELS[mission.track as Track]}
                            </span>
                            <span className="text-xs text-gray-400">
                              {DIFFICULTY_LABELS[mission.difficulty as Difficulty]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-purple-700 font-medium text-sm">+{mission.points}p</span>
                          <Link
                            href={`/missions/${mission.id}`}
                            className="text-xs bg-purple-700 text-white px-3 py-1.5 rounded-lg hover:bg-purple-800 transition-colors"
                          >
                            시작
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 우측: 배지 + 가족 연결 */}
            <div className="space-y-6">
              {/* 배지 */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-900">획득 배지</h2>
                </div>
                {userBadges && userBadges.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {userBadges.map((ub) => (
                      <div key={ub.id} className="text-center" title={(ub.badges as any)?.name}>
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-1">
                          {(ub.badges as any)?.icon ?? '🏅'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{(ub.badges as any)?.name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">🌱</div>
                    <p className="text-sm text-gray-400">첫 미션을 완료하면<br />배지를 획득합니다.</p>
                  </div>
                )}
              </div>

              {/* 가족 연결 */}
              <div className="card">
                <h2 className="font-medium text-gray-900 mb-4">우리 가문</h2>
                {familyData ? (
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">{familyData.name}</div>
                    <div className="text-xs text-gray-500 mb-4">{familyData.origin_region}</div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">가족 초대 코드</div>
                      <div className="font-mono font-medium text-gray-900 text-lg tracking-widest">
                        {familyData.invite_code}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        카카오톡으로 가족에게 공유하세요
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-sm text-gray-400 mb-3">아직 가문이 연결되지 않았습니다.</p>
                    <Link
                      href="/settings"
                      className="text-sm text-purple-700 hover:underline"
                    >
                      가문 만들기 →
                    </Link>
                  </div>
                )}
              </div>

              {/* 최근 제출 */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-gray-900">최근 제출</h2>
                </div>
                {submissions && submissions.length > 0 ? (
                  <div className="space-y-2">
                    {submissions.slice(0, 3).map((sub) => (
                      <div key={sub.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          sub.status === 'approved' ? 'bg-green-400' :
                          sub.status === 'submitted' ? 'bg-yellow-400' :
                          sub.status === 'rejected' ? 'bg-red-400' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-700 truncate">
                            {(sub.missions as any)?.title ?? sub.title ?? '미션'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {sub.status === 'approved' ? '승인됨' :
                             sub.status === 'submitted' ? '심사 중' :
                             sub.status === 'rejected' ? '반려됨' : '임시저장'}
                          </div>
                        </div>
                        {sub.status === 'approved' && (
                          <span className="text-xs text-green-600 font-medium">+{sub.points_earned}p</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-3">
                    아직 제출한 미션이 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
