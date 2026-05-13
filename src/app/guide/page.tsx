// src/app/guide/page.tsx

import Link from 'next/link'
import Navbar from '@/components/Navbar'

const TRACKS = [
  {
    emoji: '📖',
    name: '스토리텔링',
    color: 'bg-purple-50 border-purple-100',
    text: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-700',
    desc: '가족 인터뷰, 에세이, 역사 기록',
    examples: ['할아버지께 평양 시절 이야기 듣기', '가문의 피난 여정 글로 쓰기', '가족 사진첩 디지털 아카이빙'],
  },
  {
    emoji: '🍜',
    name: '라이프스타일',
    color: 'bg-orange-50 border-orange-100',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-700',
    desc: '음식·복식·생활문화 재해석',
    examples: ['평안도식 냉면 직접 만들기', '할머니 레시피 영상으로 기록', '전통 복식 현대적으로 재현'],
  },
  {
    emoji: '🗺',
    name: '디지털/아트',
    color: 'bg-teal-50 border-teal-100',
    text: 'text-teal-800',
    badge: 'bg-teal-100 text-teal-700',
    desc: 'VR·지도·디지털 아트·숏폼',
    examples: ['평양 옛 지도 디지털 복원', '가문 출신지 지도 제작', '평안남도 테마 디지털 일러스트'],
  },
  {
    emoji: '🎬',
    name: '자유주제',
    color: 'bg-amber-50 border-amber-100',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700',
    desc: '웹툰·팝아트·숏폼·뮤직',
    examples: ['뿌리 찾기 여정 숏폼 브이로그', '평남 테마 웹툰·일러스트', '가족 이야기를 담은 노래·시'],
  },
]

const STEPS = [
  {
    num: '1',
    title: '회원가입',
    icon: '✉️',
    color: 'bg-purple-100',
    desc: '이메일과 비밀번호로 30초 만에 가입합니다.',
    detail: '별도 서류나 심사 없이 누구든 바로 시작할 수 있습니다. 이름만 입력하면 됩니다.',
  },
  {
    num: '2',
    title: '프로필 설정 (온보딩)',
    icon: '🏡',
    color: 'bg-teal-100',
    desc: '내 세대, 출신 지역, 탐사 트랙을 선택합니다.',
    detail: '설정은 선택 사항이며 나중에 언제든지 변경할 수 있습니다. 가족 초대 코드가 있다면 이 단계에서 입력하세요.',
  },
  {
    num: '3',
    title: '미션 선택',
    icon: '📋',
    color: 'bg-orange-100',
    desc: '미션 센터에서 원하는 미션을 골라 시작합니다.',
    detail: '스토리텔링·라이프스타일·디지털/아트·자유주제 4개 트랙에서 내 취향에 맞는 미션을 선택합니다.',
  },
  {
    num: '4',
    title: '콘텐츠 제작 & 제출',
    icon: '🎨',
    color: 'bg-purple-100',
    desc: '사진은 직접 업로드, 영상은 유튜브·인스타·틱톡 링크로 제출합니다.',
    detail: '영상 업로드 가이드(어떻게 올리나요? 버튼)를 참고하면 플랫폼별 단계별 안내를 볼 수 있습니다.',
  },
  {
    num: '5',
    title: '심사 & 포인트 획득',
    icon: '⭐',
    color: 'bg-yellow-100',
    desc: '제출 후 1~3일 내 심사 결과가 통보됩니다.',
    detail: '승인되면 포인트와 배지가 지급되고, 우수작은 디지털 아카이브에 전시됩니다.',
  },
  {
    num: '6',
    title: '시상식',
    icon: '🏆',
    color: 'bg-green-100',
    desc: '2026년 12월 시상식에서 우수작을 발표합니다.',
    detail: '대상(50만원)·최우수상(30만원)·우수상(20만원)·장려상(10만원, 7명) 및 앰배서더 위촉.',
  },
]

const AWARDS = [
  { rank: '대상', prize: '50만원 상품권', count: '1명', emoji: '🥇', color: 'bg-yellow-50 border-yellow-200' },
  { rank: '최우수상', prize: '30만원 상품권', count: '1명', emoji: '🥈', color: 'bg-gray-50 border-gray-200' },
  { rank: '우수상', prize: '20만원 상품권', count: '1명', emoji: '🥉', color: 'bg-orange-50 border-orange-200' },
  { rank: '장려상', prize: '10만원 상품권', count: '7명', emoji: '🌟', color: 'bg-purple-50 border-purple-200' },
]

const TIMELINE = [
  { period: '3~4월', title: '참여자 모집', desc: '청년회·시군민회·도민회 홍보' },
  { period: '5~10월', title: '뿌리 탐색 활동', desc: '개인별 미션 수행 기간' },
  { period: '10월 31일', title: '공모 마감', desc: '최종 제출 마감' },
  { period: '11월', title: '심사', desc: '도민관계자·전문가·청년투표단' },
  { period: '12월', title: '시상식 & 쇼케이스', desc: '우수작 발표 및 앰배서더 위촉' },
]

export default function GuidePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-white">

        {/* 히어로 */}
        <section className="bg-gradient-to-br from-purple-50 via-white to-teal-50 px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-5 py-2 rounded-full mb-5">
              플랫폼 사용 안내서
            </div>
            <h1 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4 leading-tight">
              평남 오리진,<br />
              <span className="text-purple-700">이렇게 시작하세요</span>
            </h1>
            <p className="text-base text-gray-500 leading-relaxed max-w-xl mx-auto">
              회원가입부터 시상까지, 참여 방법과 주요 기능을 한눈에 확인하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link href="/auth?mode=signup" className="btn-primary px-8 py-3">
                지금 시작하기 →
              </Link>
              <a
                href="/pyeongnam-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost border border-gray-200 px-8 py-3"
              >
                인쇄용 1장 안내문 ↗
              </a>
            </div>
          </div>
        </section>

        {/* 배경 & 목적 */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 mb-4">왜 이 플랫폼을 만들었나요?</h2>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  평안남도 실향민 1세대가 고령화되면서, 그분들이 간직한 기억과 이야기가 사라질 위기에 처해 있습니다.
                  2세대는 부모님의 이야기를 들었지만 기록하지 못했고,
                  3·4세대는 그 기억에서 점점 멀어지고 있습니다.
                </p>
                <p>
                  <strong className="text-gray-900">평남 오리진</strong>은 이 이야기들을 디지털로 보존하고,
                  후손들이 각자의 방식으로 뿌리를 탐색·재해석할 수 있도록
                  평안남도가 직접 만든 플랫폼입니다.
                </p>
                <p>
                  과거를 찾는 것을 넘어, 평남의 이야기를 현재의 언어로 다시 쓰는 프로젝트입니다.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: '🏛', title: '주관', desc: '평안남도' },
                { icon: '🎯', title: '대상', desc: '평안남도 출신 실향민 후손 (3·4세대 중심)' },
                { icon: '📅', title: '기간', desc: '2026년 5월 ~ 10월 31일 (공모 마감)' },
                { icon: '🌐', title: '플랫폼', desc: 'pyeongnam-origin.vercel.app' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{item.title}</p>
                    <p className="text-sm text-gray-800">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 참여 대상 */}
        <section className="bg-purple-50 px-4 py-14">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">누가 참여할 수 있나요?</h2>
              <p className="text-sm text-gray-500">거주지·나이 제한 없이 평안남도 출신 가문이라면 누구든 환영합니다.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { gen: '1세대', emoji: '👴', desc: '직접 실향하신 분', sub: '본인의 기억을 기록해주세요' },
                { gen: '2세대', emoji: '👨', desc: '자녀 세대', sub: '부모님 이야기를 전달해주세요' },
                { gen: '3세대', emoji: '🙋', desc: '손자녀 세대', sub: '주요 참여 대상입니다' },
                { gen: '4세대', emoji: '👦', desc: '증손 세대', sub: '새로운 시각으로 재해석해요' },
              ].map((g) => (
                <div key={g.gen} className="bg-white rounded-2xl p-4 text-center border border-purple-100">
                  <div className="text-3xl mb-2">{g.emoji}</div>
                  <div className="font-semibold text-gray-900 text-sm">{g.gen}</div>
                  <div className="text-xs text-purple-700 font-medium mt-0.5">{g.desc}</div>
                  <div className="text-xs text-gray-400 mt-2 leading-relaxed">{g.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 단계별 사용법 */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">단계별 참여 방법</h2>
            <p className="text-sm text-gray-500">처음이라도 걱정 마세요. 6단계면 충분합니다.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="flex gap-4 bg-gray-50 rounded-2xl p-5">
                <div className={`w-10 h-10 ${step.color} rounded-xl flex items-center justify-center flex-shrink-0 text-lg`}>
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-medium">STEP {step.num}</span>
                    <span className="font-medium text-gray-900 text-sm">{step.title}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{step.desc}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 트랙 소개 */}
        <section className="bg-gray-50 px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">4가지 탐사 트랙</h2>
              <p className="text-sm text-gray-500">정해진 형식은 없습니다. 내가 가장 잘하는 방식으로 선택하세요.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {TRACKS.map((track) => (
                <div key={track.name} className={`rounded-2xl border p-5 ${track.color}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{track.emoji}</span>
                    <div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${track.badge}`}>
                        {track.name}
                      </span>
                      <p className={`text-xs mt-1 ${track.text}`}>{track.desc}</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {track.examples.map((ex) => (
                      <li key={ex} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-gray-400 mt-0.5">·</span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 주요 기능 */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">플랫폼 주요 기능</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: '🏅',
                title: '미션 & 포인트',
                desc: '미션마다 포인트가 있습니다. 승인된 미션 수만큼 포인트가 쌓이고, 가족 미션은 보너스 배수가 적용됩니다.',
              },
              {
                icon: '👨‍👩‍👧‍👦',
                title: '가문(Family) 연결',
                desc: '초대 코드로 가족끼리 연결해 같은 가문으로 활동합니다. 가문 단위 미션에서 협력하면 더 높은 포인트를 받습니다.',
              },
              {
                icon: '🗂',
                title: '디지털 아카이브',
                desc: '승인된 콘텐츠는 공개 아카이브에 영구 전시됩니다. 지역·트랙·가문별로 검색할 수 있습니다.',
              },
              {
                icon: '📊',
                title: '랭킹 & 배지',
                desc: '포인트 랭킹으로 다른 참여자들과 건전한 경쟁을 즐깁니다. 특정 조건 달성 시 배지가 자동으로 지급됩니다.',
              },
              {
                icon: '🎬',
                title: '영상 링크 제출',
                desc: 'YouTube·Instagram·TikTok에 올린 영상의 링크만 붙여넣으면 됩니다. 플랫폼 자동 감지와 업로드 가이드를 제공합니다.',
              },
              {
                icon: '📱',
                title: '모바일 최적화',
                desc: '스마트폰에서 모든 기능을 사용할 수 있습니다. 앱 설치 없이 브라우저에서 바로 접속합니다.',
              },
            ].map((f) => (
              <div key={f.title} className="card">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-medium text-gray-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 시상 & 일정 */}
        <section className="bg-purple-50 px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">시상 안내 & 추진 일정</h2>
              <p className="text-sm text-gray-500">우수작은 상장·부상과 함께 평안남도 디지털 박물관에 영구 전시됩니다.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* 시상 */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4 text-sm">시상 규모</h3>
                <div className="space-y-3">
                  {AWARDS.map((a) => (
                    <div key={a.rank} className={`flex items-center gap-3 rounded-xl border px-4 py-3 bg-white ${a.color}`}>
                      <span className="text-xl">{a.emoji}</span>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 text-sm">{a.rank}</span>
                        <span className="text-xs text-gray-400 ml-2">{a.count}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{a.prize}</span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 px-1">+ 수상자 전원 앰배서더 위촉</div>
                </div>
              </div>
              {/* 일정 */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4 text-sm">2026 추진 일정</h3>
                <div className="space-y-2">
                  {TIMELINE.map((t, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-20 flex-shrink-0 text-xs font-semibold text-purple-700 pt-1">{t.period}</div>
                      <div className="flex-1 bg-white rounded-xl px-3 py-2.5 border border-purple-100">
                        <p className="text-sm font-medium text-gray-900">{t.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 자주 묻는 질문 & CTA */}
        <section className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-3">준비됐나요?</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            지금 가입하면 바로 미션을 시작할 수 있습니다.<br />
            궁금한 점은 FAQ에서 확인하거나 관리자에게 문의하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=signup" className="btn-primary px-8 py-3 text-base">
              무료로 시작하기 →
            </Link>
            <Link href="/faq" className="btn-ghost border border-gray-200 px-8 py-3">
              자주 묻는 질문
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            관리자 · 평안남도 비서실 정책보좌 김명래
          </p>
        </section>

      </main>
    </>
  )
}
