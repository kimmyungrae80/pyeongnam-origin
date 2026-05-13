'use client'

// src/app/submit/page.tsx

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { TRACK_EMOJIS, TRACK_LABELS, type Mission, type ContentType, type Track } from '@/lib/types'

// ─── 플랫폼 정의 ──────────────────────────────────────────────
const VIDEO_PLATFORMS = [
  { name: 'YouTube', pattern: /youtube\.com|youtu\.be/, placeholder: 'https://youtu.be/...' },
  { name: 'Instagram', pattern: /instagram\.com/, placeholder: 'https://www.instagram.com/reel/...' },
  { name: 'TikTok', pattern: /tiktok\.com/, placeholder: 'https://www.tiktok.com/@...' },
]

function detectVideoPlatform(url: string) {
  for (const p of VIDEO_PLATFORMS) {
    if (p.pattern.test(url)) return p.name
  }
  return null
}

// ─── 업로드 가이드 데이터 ─────────────────────────────────────
const HASHTAG = '#평남오리진'

const GUIDE_PLATFORMS = [
  {
    key: 'youtube',
    name: 'YouTube',
    color: 'text-red-600',
    activeBg: 'bg-red-50 border-red-200 text-red-700',
    inactiveBg: 'border-gray-200 text-gray-500 hover:border-gray-300',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    steps: [
      {
        title: 'YouTube 앱 실행',
        desc: '앱 하단 중앙의 + 버튼을 탭하세요.',
        sub: '"동영상 업로드"를 선택합니다.',
      },
      {
        title: '영상 선택',
        desc: '갤러리에서 촬영한 영상을 선택하세요.',
        sub: '최대 15분, 2GB까지 업로드 가능합니다.',
      },
      {
        title: '제목 & 설명 입력',
        desc: '제목을 입력하고, 설명란에 아래 해시태그를 꼭 넣어주세요.',
        highlight: true,
      },
      {
        title: '공개 설정',
        desc: '"공개"를 선택해야 심사위원이 영상을 볼 수 있습니다.',
        sub: '비공개·일부 공개 설정 시 제출이 반려될 수 있습니다.',
        warn: true,
      },
      {
        title: '업로드 완료 후 링크 복사',
        desc: '업로드된 영상 클릭 → 공유 버튼(⎙) 탭 → "링크 복사"를 선택하세요.',
        sub: '복사한 링크를 아래 입력란에 붙여넣으면 완료입니다.',
      },
    ],
  },
  {
    key: 'instagram',
    name: 'Instagram',
    color: 'text-pink-600',
    activeBg: 'bg-pink-50 border-pink-200 text-pink-700',
    inactiveBg: 'border-gray-200 text-gray-500 hover:border-gray-300',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    steps: [
      {
        title: 'Instagram 앱 실행',
        desc: '하단 + 버튼을 탭하세요.',
        sub: '"릴스(Reels)"를 선택합니다. 일반 게시물보다 릴스 추천.',
      },
      {
        title: '영상 선택 & 편집',
        desc: '갤러리에서 영상을 선택하고 편집을 완료하세요.',
        sub: '릴스는 최대 90초, 일반 게시물은 최대 60초입니다.',
      },
      {
        title: '캡션에 해시태그 입력',
        desc: '다음 버튼 → 캡션 입력란에 아래 해시태그를 꼭 넣어주세요.',
        highlight: true,
      },
      {
        title: '공개 설정 확인',
        desc: '"모두에게" 공개로 설정되어 있는지 꼭 확인하세요.',
        sub: '비공개 계정이라면 공개 전환 후 게시해주세요.',
        warn: true,
      },
      {
        title: '게시 후 링크 복사',
        desc: '게시된 릴스 열기 → 우측 상단 ··· → "링크 복사"를 탭하세요.',
        sub: '복사한 링크를 아래 입력란에 붙여넣으면 완료입니다.',
      },
    ],
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    color: 'text-gray-900',
    activeBg: 'bg-gray-900 border-gray-900 text-white',
    inactiveBg: 'border-gray-200 text-gray-500 hover:border-gray-300',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.26 8.26 0 0 0 4.83 1.56V6.79a4.85 4.85 0 0 1-1.07-.1z" />
      </svg>
    ),
    steps: [
      {
        title: 'TikTok 앱 실행',
        desc: '하단 중앙 + 버튼을 탭하세요.',
        sub: '"업로드"를 선택해 갤러리에서 영상을 가져옵니다.',
      },
      {
        title: '영상 선택',
        desc: '갤러리에서 영상을 선택하고 편집을 완료하세요.',
        sub: '최대 10분, 4K 해상도까지 지원합니다.',
      },
      {
        title: '캡션에 해시태그 입력',
        desc: '다음 → 캡션 입력란에 아래 해시태그를 꼭 넣어주세요.',
        highlight: true,
      },
      {
        title: '공개 범위 설정',
        desc: '"모두"로 설정해야 심사위원이 영상을 볼 수 있습니다.',
        sub: '"나만 보기" 설정 시 제출이 반려될 수 있습니다.',
        warn: true,
      },
      {
        title: '게시 후 링크 복사',
        desc: '내 프로필에서 해당 영상 클릭 → 오른쪽 공유(→) → "링크 복사"를 탭하세요.',
        sub: '복사한 링크를 아래 입력란에 붙여넣으면 완료입니다.',
      },
    ],
  },
]

// ─── 업로드 가이드 모달 ───────────────────────────────────────
function VideoGuideModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(HASHTAG)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const platform = GUIDE_PLATFORMS[activeTab]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="영상 업로드 가이드"
    >
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 카드 */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">영상 업로드 가이드</h2>
            <p className="text-xs text-gray-500 mt-0.5">플랫폼에 먼저 올린 뒤 링크를 제출하세요</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0 ml-3"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 해시태그 배너 */}
        <div className="mx-6 mt-4 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <p className="text-xs text-purple-600 font-medium mb-0.5">필수 해시태그</p>
            <p className="font-bold text-purple-800 text-lg tracking-tight">{HASHTAG}</p>
            <p className="text-xs text-purple-500 mt-0.5">캡션·설명란에 반드시 포함해주세요</p>
          </div>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 text-sm font-medium px-4 py-2 rounded-xl transition-all ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-purple-700 text-white hover:bg-purple-800'
            }`}
          >
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>

        {/* 플랫폼 탭 */}
        <div className="flex gap-2 px-6 mt-4 flex-shrink-0">
          {GUIDE_PLATFORMS.map((p, i) => (
            <button
              key={p.key}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border font-medium transition-all ${
                activeTab === i ? p.activeBg : p.inactiveBg
              }`}
            >
              {p.icon}
              {p.name}
            </button>
          ))}
        </div>

        {/* 단계별 가이드 — 스크롤 영역 */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {platform.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              {/* 번호 */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                activeTab === 0 ? 'bg-red-100 text-red-700' :
                activeTab === 1 ? 'bg-pink-100 text-pink-700' :
                'bg-gray-200 text-gray-700'
              }`}>
                {i + 1}
              </div>
              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{step.desc}</p>

                {/* 해시태그 강조 */}
                {step.highlight && (
                  <div className="mt-2 flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                    <span className="font-bold text-purple-800 text-sm">{HASHTAG}</span>
                    <button
                      onClick={handleCopy}
                      className="text-xs text-purple-600 underline flex-shrink-0"
                    >
                      {copied ? '✓ 복사됨' : '복사'}
                    </button>
                  </div>
                )}

                {/* 경고 메모 */}
                {step.warn && step.sub && (
                  <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                    ⚠ {step.sub}
                  </p>
                )}

                {/* 일반 서브텍스트 */}
                {!step.warn && step.sub && (
                  <p className="text-xs text-gray-400 mt-1">{step.sub}</p>
                )}
              </div>
            </div>
          ))}

          {/* 완료 안내 */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 mt-2">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-700">링크 복사 후</span> → 이 페이지 "영상 링크" 입력란에 붙여넣기 →
              플랫폼 자동 감지 후 제출하면 완료입니다.
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full btn-primary py-3 text-base"
          >
            확인, 업로드하러 갈게요 →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 메인 폼 ─────────────────────────────────────────────────
function SubmitForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileUrls, setFileUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [showGuide, setShowGuide] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    content: '',
    content_type: 'photo' as ContentType,
  })

  useEffect(() => {
    const missionId = searchParams.get('mission')
    if (missionId) {
      supabase.from('missions').select('*').eq('id', missionId).single()
        .then(({ data }) => {
          if (data) {
            setMission(data)
            setForm(f => ({ ...f, title: data.title }))
          }
        })
    }
  }, [])

  const handleCloseGuide = useCallback(() => setShowGuide(false), [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    const MAX_MB = 20
    const oversized = selected.filter(f => f.size > MAX_MB * 1024 * 1024)
    if (oversized.length > 0) {
      setError(`파일 크기는 ${MAX_MB}MB 이하만 가능합니다: ${oversized.map(f => f.name).join(', ')}`)
      return
    }

    setFiles(selected)
    setUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const urls: string[] = []
      for (const file of selected) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(path, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('submissions')
          .getPublicUrl(path)
        urls.push(publicUrl)
      }
      setFileUrls(urls)
    } catch (err: any) {
      setError('파일 업로드 중 오류가 발생했습니다: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const getEffectiveFileUrls = () => {
    if (form.content_type === 'video') {
      return videoUrl ? [videoUrl] : []
    }
    return fileUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.content_type === 'video' && !videoUrl.trim()) {
      setError('영상 링크를 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const effectiveUrls = getEffectiveFileUrls()

      const { error: submitError } = await supabase.from('submissions').insert({
        user_id: user.id,
        mission_id: mission?.id ?? null,
        title: form.title,
        content: form.content,
        file_urls: effectiveUrls.length > 0 ? effectiveUrls : null,
        content_type: form.content_type,
        status: 'submitted',
      })

      if (submitError) throw submitError

      if (effectiveUrls.length > 0 || form.content) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('family_id, origin_region')
          .eq('id', user.id)
          .single()

        await supabase.from('archive_items').insert({
          user_id: user.id,
          family_id: profile?.family_id ?? null,
          title: form.title,
          description: form.content,
          content_type: form.content_type,
          file_urls: effectiveUrls.length > 0 ? effectiveUrls : null,
          region_tag: profile?.origin_region ?? null,
          is_public: true,
        })
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || '제출 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const isVideoType = form.content_type === 'video'
  const detectedPlatform = videoUrl ? detectVideoPlatform(videoUrl) : null
  const isVideoUrlValid = videoUrl.startsWith('http') && detectedPlatform !== null

  const canSubmit = !!form.title && !loading && !uploading && (
    isVideoType ? !!videoUrl.trim() : true
  )

  if (success) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="card max-w-md w-full text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">제출 완료!</h2>
            <p className="text-sm text-gray-500 mb-6">
              심사 후 포인트가 지급됩니다.<br />
              보통 1~3일 내로 결과를 알려드립니다.
            </p>
            <div className="flex gap-3">
              <Link href="/missions" className="flex-1 btn-ghost border border-gray-200 text-center py-2.5">
                미션 더 하기
              </Link>
              <Link href="/dashboard" className="flex-1 btn-primary text-center py-2.5">
                대시보드 →
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />

      {/* 업로드 가이드 모달 */}
      {showGuide && <VideoGuideModal onClose={handleCloseGuide} />}

      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* 미션 정보 */}
          {mission && (
            <div className="card bg-purple-50 border-purple-100 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge-track-${mission.track}`}>
                  {TRACK_EMOJIS[mission.track as Track]} {TRACK_LABELS[mission.track as Track]}
                </span>
              </div>
              <h2 className="font-medium text-gray-900">{mission.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{mission.description}</p>
              <div className="text-purple-700 font-medium text-sm mt-2">
                완료 시 +{mission.points}p 획득
                {mission.is_family_mission && ` (가족 함께: ×${mission.family_bonus_multiplier})`}
              </div>
            </div>
          )}

          <div className="card">
            <h1 className="font-medium text-gray-900 mb-6 text-lg">
              {mission ? '미션 결과 제출' : '콘텐츠 업로드'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 콘텐츠 유형 */}
              <div>
                <label className="label-base">
                  콘텐츠 유형
                  <span className="ml-1.5 text-gray-400 font-normal text-xs">— 영상은 링크 제출, 사진은 직접 업로드</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'photo', label: '📸 사진' },
                    { value: 'video', label: '🎬 영상' },
                    { value: 'essay', label: '📝 에세이' },
                    { value: 'design', label: '🎨 디자인' },
                    { value: 'map', label: '🗺 지도' },
                    { value: 'other', label: '기타' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, content_type: value as ContentType })
                        setError('')
                      }}
                      className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                        form.content_type === value
                          ? 'border-purple-700 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="label-base">제목</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="작품 제목을 입력하세요"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* 영상: URL 입력 + 가이드 버튼 / 사진·기타: 파일 업로드 */}
              {isVideoType ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label-base mb-0">
                      영상 링크 <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowGuide(true)}
                      className="flex items-center gap-1.5 text-xs text-purple-700 font-medium bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span>🎬</span>
                      어떻게 올리나요?
                    </button>
                  </div>

                  <input
                    type="url"
                    className={`input-base ${videoUrl && !isVideoUrlValid ? 'border-red-300 focus:ring-red-400' : ''}`}
                    placeholder="https://youtu.be/... 또는 인스타그램·틱톡 링크"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />

                  {/* 플랫폼 감지 피드백 */}
                  {videoUrl ? (
                    <p className={`text-xs mt-1.5 ${isVideoUrlValid ? 'text-green-600' : 'text-amber-600'}`}>
                      {isVideoUrlValid
                        ? `✓ ${detectedPlatform} 링크 확인됨`
                        : '⚠ YouTube, Instagram, TikTok 링크만 지원됩니다'}
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {VIDEO_PLATFORMS.map(p => (
                        <span key={p.name} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                          {p.name}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400">링크 지원</span>
                    </div>
                  )}

                  {/* 해시태그 리마인더 */}
                  <div className="mt-3 flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5">
                    <span className="text-base">🏷</span>
                    <span className="text-xs text-purple-700">
                      업로드 시 <strong>{HASHTAG}</strong> 해시태그를 꼭 달아주세요.
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGuide(true)}
                      className="ml-auto text-xs text-purple-600 underline flex-shrink-0"
                    >
                      방법 보기
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label-base">
                    파일 업로드
                    {form.content_type === 'photo' && <span className="text-gray-400 font-normal ml-1">— JPG, PNG, GIF (최대 20MB)</span>}
                    {form.content_type !== 'photo' && <span className="text-gray-400 font-normal ml-1">(선택)</span>}
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 transition-colors">
                    <input
                      type="file"
                      multiple={form.content_type === 'photo'}
                      accept={form.content_type === 'photo' ? 'image/*' : 'image/*,.pdf'}
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {uploading ? (
                        <div className="text-gray-500 text-sm">업로드 중...</div>
                      ) : files.length > 0 ? (
                        <div>
                          <div className="text-green-600 text-sm mb-1">✓ {files.length}개 파일 준비됨</div>
                          <div className="text-xs text-gray-400">{files.map(f => f.name).join(', ')}</div>
                          <div className="text-xs text-purple-600 mt-2 underline">다른 파일 선택</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-3xl mb-2">📎</div>
                          <div className="text-sm text-gray-500">클릭하여 파일 선택</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {form.content_type === 'photo' ? '사진 여러 장 선택 가능' : '사진, PDF 가능'}
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* 내용 */}
              <div>
                <label className="label-base">
                  내용 <span className="text-gray-400 font-normal">(탐사 과정, 느낀 점 등)</span>
                </label>
                <textarea
                  className="input-base min-h-32 resize-none"
                  placeholder="어떤 과정으로 이 작품을 만들었나요? 가족과 어떤 이야기를 나눴나요?"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={5}
                />
              </div>

              {/* 도움말 */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 space-y-1">
                <p>💡 <strong>심사 기준:</strong> 평안남도와의 연결성, 창의성, 탐사 과정의 진정성</p>
                <p>📅 <strong>심사 기간:</strong> 제출 후 1~3일 내 결과 통보</p>
                <p>❓ 궁금한 점은 <Link href="/faq" className="text-purple-700 underline">FAQ</Link>를 확인하세요.</p>
              </div>

              {/* 에러 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* 제출 버튼 */}
              <div className="flex gap-3 pt-2">
                <Link href="/missions" className="flex-1 btn-ghost border border-gray-200 text-center py-3">
                  취소
                </Link>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 btn-primary py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? '제출 중...' : uploading ? '업로드 중...' : '제출하기 →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default function SubmitPage() {
  return (
    <Suspense>
      <SubmitForm />
    </Suspense>
  )
}
