// src/app/admin/page.tsx
// P9 - 관리자 콘솔

import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { TRACK_LABELS, TRACK_EMOJIS, type Track } from '@/lib/types'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // 관리자 확인
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // 통계
  const [
    { count: totalUsers },
    { count: totalSubmissions },
    { count: pendingCount },
    { data: pendingSubmissions },
    { data: recentUsers },
    { data: rankings },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('submissions')
      .select('*, profiles(name, generation), missions(title, track, points)')
      .eq('status', 'submitted')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('rankings').select('*').limit(10),
  ])

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="section-title">관리자 콘솔</h1>
              <p className="text-sm text-gray-500">안녕하세요, {profile.name}님</p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/missions/new"
                className="btn-outline text-sm"
              >
                + 미션 추가
              </a>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-2xl font-medium text-purple-700">{totalUsers ?? 0}</div>
              <div className="text-xs text-gray-400 mt-1">총 회원수</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-medium text-teal-700">{totalSubmissions ?? 0}</div>
              <div className="text-xs text-gray-400 mt-1">총 제출수</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-medium text-yellow-600">{pendingCount ?? 0}</div>
              <div className="text-xs text-gray-400 mt-1">심사 대기</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-medium text-orange-700">
                {totalSubmissions && totalUsers
                  ? Math.round(totalSubmissions / (totalUsers || 1) * 10) / 10
                  : 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">인당 평균 제출</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 심사 대기 목록 */}
            <div className="card md:col-span-2">
              <h2 className="font-medium text-gray-900 mb-4">
                심사 대기
                {(pendingCount ?? 0) > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                    {pendingCount}건
                  </span>
                )}
              </h2>

              {pendingSubmissions && pendingSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {pendingSubmissions.map((sub) => {
                    const submitterProfile = sub.profiles as any
                    const missionInfo = sub.missions as any
                    return (
                      <div
                        key={sub.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">{sub.title}</span>
                            {missionInfo && (
                              <span className={`badge-track-${missionInfo.track} text-xs`}>
                                {TRACK_EMOJIS[missionInfo.track as Track]}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {submitterProfile?.name} ({submitterProfile?.generation}세대) ·{' '}
                            {missionInfo?.title ?? '자유 제출'} ·{' '}
                            {sub.content_type}
                          </div>
                          {sub.content && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{sub.content}</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <ApproveButton
                            submissionId={sub.id}
                            points={missionInfo?.points ?? 100}
                            userId={submitterProfile?.id ?? ''}
                          />
                          <RejectButton submissionId={sub.id} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  심사 대기 중인 제출물이 없습니다.
                </div>
              )}
            </div>

            {/* 랭킹 */}
            <div className="card">
              <h2 className="font-medium text-gray-900 mb-4">현재 랭킹 Top 10</h2>
              <div className="space-y-2">
                {rankings?.map((r: any, i) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">{r.name}</span>
                      <span className="text-xs text-gray-400 ml-1.5">
                        {r.generation}세대 · {r.origin_region ?? '-'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-purple-700">
                      {r.points?.toLocaleString()}p
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 가입자 */}
            <div className="card">
              <h2 className="font-medium text-gray-900 mb-4">최근 가입자</h2>
              <div className="space-y-3">
                {recentUsers?.map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-sm font-medium">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-400">
                        {u.generation ? `${u.generation}세대` : '세대 미설정'} ·{' '}
                        {u.origin_region ?? '지역 미설정'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

// 승인 버튼 (클라이언트 컴포넌트로 분리하는 게 좋지만 간단히 폼으로 처리)
function ApproveButton({ submissionId, points, userId }: {
  submissionId: string
  points: number
  userId: string
}) {
  return (
    <form action={`/api/admin/approve`} method="post">
      <input type="hidden" name="submission_id" value={submissionId} />
      <input type="hidden" name="points" value={points} />
      <input type="hidden" name="user_id" value={userId} />
      <button
        type="submit"
        className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        승인 +{points}p
      </button>
    </form>
  )
}

function RejectButton({ submissionId }: { submissionId: string }) {
  return (
    <form action={`/api/admin/reject`} method="post">
      <input type="hidden" name="submission_id" value={submissionId} />
      <button
        type="submit"
        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        반려
      </button>
    </form>
  )
}
