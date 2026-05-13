// src/app/faq/page.tsx

import Link from 'next/link'
import Navbar from '@/components/Navbar'

const FAQ_SECTIONS = [
  {
    title: '참여 대상',
    icon: '👥',
    items: [
      {
        q: '누가 참여할 수 있나요?',
        a: '평안남도 출신 실향민의 후손이라면 누구든 참여할 수 있습니다. 세대 구분은 1세대(직접 실향하신 분)를 기준으로 2·3·4세대까지 모두 환영합니다. 거주 지역과 나이 제한은 없습니다.',
      },
      {
        q: '평안남도 출신인지 잘 모르겠어요.',
        a: '부모님 또는 조부모님께 여쭤보세요. 평양시, 진남포시, 대동군, 순천군, 맹산군, 양덕군, 성천군, 강동군, 중화군, 용강군, 강서군, 평원군, 안주군, 개천군, 영원군 등이 평안남도 지역입니다. 불확실한 경우 "기타"로 등록하셔도 됩니다.',
      },
      {
        q: '가족이 이미 가입해 있어요. 함께 참여할 수 있나요?',
        a: '네, 가족 초대 코드를 사용하면 같은 "가문"으로 연결되어 가족 미션을 함께 수행할 수 있습니다. 가족 미션 완료 시 포인트 보너스 배수가 적용됩니다.',
      },
    ],
  },
  {
    title: '미션 & 제출',
    icon: '📋',
    items: [
      {
        q: '미션은 어떻게 선택하나요?',
        a: '미션 센터에서 스토리텔링·라이프스타일·디지털/아트·자유주제 4개 트랙 중 관심 있는 트랙의 미션을 자유롭게 선택하면 됩니다. 온보딩에서 트랙을 선택하면 맞춤 추천을 받을 수 있습니다.',
      },
      {
        q: '사진과 영상은 어떻게 제출하나요?',
        a: '사진은 직접 업로드(JPG·PNG·GIF, 장당 20MB 이하)합니다. 영상은 유튜브·인스타그램·틱톡에 먼저 업로드한 뒤 해당 링크를 제출 페이지에 붙여넣는 방식입니다. 플랫폼 직접 업로드는 지원하지 않습니다.',
      },
      {
        q: '한 사람이 여러 미션을 제출할 수 있나요?',
        a: '네, 제한 없이 여러 미션을 수행하고 제출할 수 있습니다. 완료된 미션도 다시 제출할 수 있으며, 트랙을 다양하게 시도할수록 많은 포인트를 획득할 수 있습니다.',
      },
      {
        q: '에세이나 텍스트만으로도 제출이 가능한가요?',
        a: '네, 파일 업로드 없이 내용(텍스트)만으로도 제출 가능합니다. 에세이 트랙은 특히 글로 쓴 가족 이야기, 인터뷰 내용 등을 환영합니다.',
      },
    ],
  },
  {
    title: '심사 방법',
    icon: '⚖️',
    items: [
      {
        q: '심사는 어떻게 진행되나요?',
        a: '관리자가 제출된 콘텐츠를 검토한 뒤 승인/반려 처리합니다. 승인되면 포인트가 지급되고, 아카이브에 공개 전시됩니다. 심사 기간은 보통 1~3일입니다.',
      },
      {
        q: '최종 시상 심사 기준은 무엇인가요?',
        a: '평안남도와의 연결성, 창의성과 독창성, 탐사 과정의 진정성, 완성도를 종합적으로 평가합니다. 심사는 도민 사회관계자 + 외부 전문가 + 청년 투표단으로 구성된 심사위원단이 진행합니다.',
      },
      {
        q: '반려되면 다시 제출할 수 있나요?',
        a: '네, 반려 사유를 참고해 수정 후 같은 미션으로 다시 제출할 수 있습니다.',
      },
    ],
  },
  {
    title: '포인트 & 시상',
    icon: '🏆',
    items: [
      {
        q: '포인트는 어떻게 쌓이나요?',
        a: '미션마다 고유한 포인트가 있으며, 제출한 콘텐츠가 심사에서 승인될 때 포인트가 지급됩니다. 난이도가 높은 미션일수록 더 많은 포인트를 받습니다. 가족 미션을 함께 완료하면 보너스 배수가 적용됩니다.',
      },
      {
        q: '시상식은 언제인가요?',
        a: '2026년 12월에 시상식과 쇼케이스가 개최됩니다. 우수작은 상장·부상(상품권)과 함께 평안남도 디지털 박물관에 영구 전시됩니다.',
      },
      {
        q: '시상 규모는 어떻게 되나요?',
        a: '대상 1명(50만원), 최우수상 1명(30만원), 우수상 1명(20만원), 장려상 7명(각 10만원)이며, 수상자 전원에게 앰배서더 위촉장이 수여됩니다.',
      },
      {
        q: '공모 마감일은 언제인가요?',
        a: '2026년 10월 31일이 최종 제출 마감일입니다. 그 이후에는 접수가 불가합니다.',
      },
    ],
  },
  {
    title: '계정 & 기술',
    icon: '⚙️',
    items: [
      {
        q: '회원가입 없이도 아카이브를 볼 수 있나요?',
        a: '네, 아카이브 열람은 로그인 없이도 가능합니다. 미션 참여와 제출은 회원가입 후 로그인이 필요합니다.',
      },
      {
        q: '가입 후 이름·세대·지역을 변경할 수 있나요?',
        a: '대시보드의 프로필 설정에서 언제든지 변경 가능합니다.',
      },
      {
        q: '모바일에서도 사용할 수 있나요?',
        a: '네, 스마트폰과 태블릿에서 모두 사용 가능합니다. 사진 업로드와 영상 링크 제출도 모바일에서 지원됩니다.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-block bg-purple-100 text-purple-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              자주 묻는 질문
            </div>
            <h1 className="text-3xl font-medium text-gray-900 mb-3">무엇이든 물어보세요</h1>
            <p className="text-gray-500">
              평남 오리진 참여에 관한 궁금증을 모았습니다.<br />
              추가 문의는 관리자에게 연락해주세요.
            </p>
          </div>

          {/* FAQ 섹션 */}
          <div className="space-y-8">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{section.icon}</span>
                  <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
                </div>
                <div className="space-y-3">
                  {section.items.map((item, i) => (
                    <details
                      key={i}
                      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-900 text-sm pr-4">{item.q}</span>
                        <span className="flex-shrink-0 text-gray-400 text-lg transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 추가 문의 CTA */}
          <div className="mt-12 bg-purple-50 border border-purple-100 rounded-2xl px-6 py-8 text-center">
            <div className="text-2xl mb-3">💬</div>
            <h3 className="font-medium text-gray-900 mb-2">더 궁금한 점이 있으신가요?</h3>
            <p className="text-sm text-gray-500 mb-5">
              관리자에게 직접 문의하시면 빠르게 답변드리겠습니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/missions" className="btn-primary px-6 py-2.5">
                미션 시작하기 →
              </Link>
              <Link href="/archive" className="btn-ghost border border-gray-200 px-6 py-2.5">
                아카이브 보기
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
