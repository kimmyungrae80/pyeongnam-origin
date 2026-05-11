// src/app/page.tsx
// P1 - 랜딩 페이지

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // 통계 데이터 가져오기
  const [
    { count: userCount },
    { count: submissionCount },
    { data: featuredItems },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('archive_items').select('*').eq('is_featured', true).eq('is_public', true).limit(3),
  ])

  const tracks = [
    {
      emoji: '📖',
      title: '스토리텔링',
      desc: '가족 역사 인터뷰 · 에세이',
      color: 'bg-purple-50 border-purple-100',
      textColor: 'text-purple-800',
    },
    {
      emoji: '🍜',
      title: '라이프스타일',
      desc: '음식 · 복식 현대적 재해석',
      color: 'bg-orange-50 border-orange-100',
      textColor: 'text-orange-800',
    },
    {
      emoji: '🗺',
      title: '디지털/아트',
      desc: 'VR · 지도 · 디지털 아트',
      color: 'bg-teal-50 border-teal-100',
      textColor: 'text-teal-800',
    },
    {
      emoji: '🎬',
      title: '자유주제',
      desc: '숏폼 · 웹툰 · 팝아트',
      color: 'bg-amber-50 border-amber-100',
      textColor: 'text-amber-800',
    },
  ]

  return (
    <>
      <Navbar />

      <main className="pt-16">
        {/* 히어로 섹션 */}
        <section className="bg-gradient-to-br from-purple-50 via-white to-teal-50 px-4 py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-purple-100 text-purple-700 text-base font-semibold px-6 py-2.5 rounded-full mb-6 tracking-tight">
              2026 평안남도 제3·4세대 뿌리이음 프로젝트
            </div>

            <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-5 leading-tight">
              나의 평남,<br />
              <span className="text-purple-700">우리의 오리진</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
              할아버지의 보관함 속 보물을 찾고,<br />
              우리 가문의 이야기를 나만의 언어로 다시 씁니다.
            </p>
            <p className="text-base font-medium text-purple-700 mt-4 mb-10">
              우리가 찾아가는 평남의 뿌리 찾기
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth?mode=signup" className="btn-primary text-base px-8 py-3">
                뿌리 찾기 시작하기 →
              </Link>
              <Link href="/archive" className="btn-outline text-base px-8 py-3">
                아카이브 둘러보기
              </Link>
            </div>

            {/* 통계 */}
            <div className="flex justify-center gap-12 mt-14">
              <div>
                <div className="text-3xl font-medium text-purple-700">
                  {(userCount ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 mt-1">참여 중인 가문</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <div className="text-3xl font-medium text-teal-700">
                  {(submissionCount ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 mt-1">완료된 미션</div>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <div className="text-3xl font-medium text-orange-700">
                  {(featuredItems?.length ?? 0) + (submissionCount ?? 0)}
                </div>
                <div className="text-sm text-gray-400 mt-1">등록된 콘텐츠</div>
              </div>
            </div>
          </div>
        </section>

        {/* 참여 방법 */}
        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="section-title">어떻게 참여하나요?</h2>
            <p className="section-sub">정해진 답은 없습니다. 내가 잘하고 좋아하는 방식으로 뿌리를 탐색합니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">트랙 선택</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                스토리텔링, 라이프스타일, 디지털, 자유주제 중 내 취향에 맞는 트랙을 선택합니다.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">미션 수행</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                가족에게 질문하고, 기록하고, 창작합니다. 과정 자체가 평안남도의 새 역사가 됩니다.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">포인트 & 시상</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                미션 완료 시 포인트와 배지를 획득합니다. 우수작은 아카이브에 영구 전시됩니다.
              </p>
            </div>
          </div>

          {/* 트랙 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tracks.map((track) => (
              <Link
                href={`/missions?track=${track.title}`}
                key={track.title}
                className={`card-hover border ${track.color} text-center`}
              >
                <div className="text-3xl mb-3">{track.emoji}</div>
                <div className={`font-medium text-sm mb-1 ${track.textColor}`}>{track.title}</div>
                <div className="text-xs text-gray-500">{track.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* 도지사 서한문 */}
        <section className="bg-gray-900 text-white px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-purple-400 text-sm font-medium mb-6 text-center">
              도지사 서한문
            </div>
            <blockquote className="text-lg md:text-xl text-gray-200 leading-relaxed text-center mb-8 font-light">
              "이제 평안남도의 이야기는 여러분이 '주어'가 되어<br className="hidden md:block" />
              다시 써 내려가야 합니다. 이 여정은 단순히 과거를 찾는 일이 아니라,<br className="hidden md:block" />
              여러분 안에 흐르는 특별한 에너지를 발견하는 소중한 시간입니다."
            </blockquote>
            <div className="text-center text-gray-300 text-base font-medium">
              평안남도지사 정경조
            </div>
          </div>
        </section>

        {/* 일정 */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="section-title">2026년 추진 일정</h2>
          </div>
          <div className="relative">
            {/* 타임라인 선 */}
            <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>

            <div className="space-y-6">
              {[
                { month: '3~4월', title: '참여자 모집 및 홍보', desc: '청년회, 시군민회, 도민회 홍보 시작' },
                { month: '5~10월', title: '뿌리 탐색 활동', desc: '개인별 취향에 맞는 미션 수행 기간' },
                { month: '10월 31일', title: '공모 마감', desc: '최종 제출 마감일' },
                { month: '11월', title: '심사', desc: '도민 사회관계자 + 외부 전문가 + 청년 투표단 심사' },
                { month: '12월', title: '시상식 및 쇼케이스', desc: '우수작 발표 및 앰배서더 위촉' },
              ].map((item, i) => (
                <div key={i} className="flex md:items-center gap-6 md:gap-0">
                  <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:order-2 md:pl-12'}`}>
                    <div className="card">
                      <div className="text-purple-700 text-sm font-medium mb-1">{item.month}</div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{item.desc}</div>
                    </div>
                  </div>
                  {/* 중앙 점 */}
                  <div className="hidden md:flex md:w-0 justify-center">
                    <div className="w-3 h-3 bg-purple-700 rounded-full border-2 border-white shadow-sm z-10 relative -ml-1.5"></div>
                  </div>
                  <div className={`hidden md:block md:w-1/2 ${i % 2 === 0 ? 'md:order-2' : ''}`}></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 시상 안내 */}
        <section className="bg-purple-50 px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title">시상 안내</h2>
            <p className="section-sub">우수작은 상장 및 부상과 함께 평안남도 디지털 박물관에 영구 전시됩니다.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card bg-yellow-50 border-yellow-200 text-center">
                <div className="text-2xl mb-2">🥇</div>
                <div className="font-medium text-gray-900">대상</div>
                <div className="text-sm text-yellow-700 font-medium mt-1">50만원 상품권</div>
                <div className="text-xs text-gray-400 mt-1">1명</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl mb-2">🥈</div>
                <div className="font-medium text-gray-900">최우수상</div>
                <div className="text-sm text-gray-600 font-medium mt-1">30만원 상품권</div>
                <div className="text-xs text-gray-400 mt-1">1명</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl mb-2">🥉</div>
                <div className="font-medium text-gray-900">우수상</div>
                <div className="text-sm text-gray-600 font-medium mt-1">20만원 상품권</div>
                <div className="text-xs text-gray-400 mt-1">1명</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl mb-2">🌟</div>
                <div className="font-medium text-gray-900">장려상</div>
                <div className="text-sm text-gray-600 font-medium mt-1">10만원 상품권</div>
                <div className="text-xs text-gray-400 mt-1">7명</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-medium text-gray-900 mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-gray-500 mb-8">
              역사를 계승하는 시대를 넘어,<br />
              이제는 역사를 재해석하는 세대가 필요합니다.
            </p>
            <Link href="/auth?mode=signup" className="btn-primary text-base px-10 py-3.5">
              무료로 참여하기 →
            </Link>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="border-t border-gray-100 bg-gray-50 px-4 py-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="font-medium text-gray-900 mb-2">평남 오리진 플랫폼</div>
              <div className="text-sm text-gray-400 leading-relaxed">
                평안남도 제3·4세대 뿌리이음 프로젝트<br />
                평안남도 주관
              </div>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <div>
                <div className="font-medium text-gray-700 mb-2">페이지</div>
                <div className="space-y-1">
                  <Link href="/archive" className="block hover:text-purple-700">아카이브</Link>
                  <Link href="/missions" className="block hover:text-purple-700">미션</Link>
                  <Link href="/showcase" className="block hover:text-purple-700">쇼케이스</Link>
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-2">참여</div>
                <div className="space-y-1">
                  <Link href="/auth?mode=signup" className="block hover:text-purple-700">회원가입</Link>
                  <Link href="/auth" className="block hover:text-purple-700">로그인</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 space-y-1">
            <div>관리자 · 평안남도 비서실 정책보좌 김명래</div>
            <div>© 2026 평안남도. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </>
  )
}
