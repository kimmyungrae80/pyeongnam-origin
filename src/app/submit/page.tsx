'use client'

// src/app/submit/page.tsx
// P7 - 콘텐츠 제출

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { TRACK_EMOJIS, TRACK_LABELS, type Mission, type ContentType, type Track } from '@/lib/types'

export default function SubmitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileUrls, setFileUrls] = useState<string[]>([])
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
            // 미션 제목으로 기본값
            setForm(f => ({ ...f, title: data.title }))
          }
        })
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      // 제출물 저장
      const { error: submitError } = await supabase.from('submissions').insert({
        user_id: user.id,
        mission_id: mission?.id ?? null,
        title: form.title,
        content: form.content,
        file_urls: fileUrls.length > 0 ? fileUrls : null,
        content_type: form.content_type,
        status: 'submitted',
      })

      if (submitError) throw submitError

      // 아카이브에도 저장 (공개 콘텐츠)
      if (fileUrls.length > 0 || form.content) {
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
          file_urls: fileUrls.length > 0 ? fileUrls : null,
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
                <label className="label-base">콘텐츠 유형</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'photo', label: '📸 사진', },
                    { value: 'video', label: '🎬 영상', },
                    { value: 'essay', label: '📝 에세이', },
                    { value: 'design', label: '🎨 디자인', },
                    { value: 'map', label: '🗺 지도', },
                    { value: 'other', label: '기타', },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, content_type: value as ContentType })}
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

              {/* 파일 업로드 */}
              <div>
                <label className="label-base">파일 업로드 (선택)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf"
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
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl mb-2">📎</div>
                        <div className="text-sm text-gray-500">클릭하여 파일 선택</div>
                        <div className="text-xs text-gray-400 mt-1">사진, 영상, PDF 가능</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

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
                  disabled={loading || uploading || (!form.title)}
                  className="flex-1 btn-primary py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? '제출 중...' : '제출하기 →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
