'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { PYEONGNAM_REGIONS, TRACK_LABELS, type Track, type Generation } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    generation: '' as Generation | '',
    origin_region: '',
    track: '' as Track | '',
    bio: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        setForm({
          name: data.name || '',
          generation: data.generation || '',
          origin_region: data.origin_region || '',
          track: data.track || '',
          bio: data.bio || '',
        })
      }
      setLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (!user) throw new Error('로그인 정보 없음')

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: form.name,
          generation: form.generation || null,
          origin_region: form.origin_region || null,
          track: form.track || null,
          bio: form.bio || null,
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      setSuccess('프로필이 저장되었습니다!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || '저장 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h1 className="text-2xl font-medium text-gray-900 mb-1">프로필 수정</h1>
            <p className="text-sm text-gray-500 mb-8">내 정보를 수정합니다</p>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="이름을 입력하세요"
                />
              </div>

              {/* 세대 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">세대</label>
                <select
                  value={form.generation}
                  onChange={(e) => setForm({ ...form, generation: e.target.value as Generation | '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  <option value={1}>1세대 (할아버지/할머니)</option>
                  <option value={2}>2세대 (부모님)</option>
                  <option value={3}>3세대 (본인)</option>
                  <option value={4}>4세대 (자녀)</option>
                </select>
              </div>

              {/* 출신 지역 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">출신 지역</label>
                <select
                  value={form.origin_region}
                  onChange={(e) => setForm({ ...form, origin_region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  {PYEONGNAM_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* 선호 트랙 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선호 트랙</label>
                <select
                  value={form.track}
                  onChange={(e) => setForm({ ...form, track: e.target.value as Track | '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">선택하세요</option>
                  {Object.entries(TRACK_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 소개 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">소개</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="자신을 소개해주세요"
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-6 py-2 disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장하기'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-outline px-6 py-2"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
