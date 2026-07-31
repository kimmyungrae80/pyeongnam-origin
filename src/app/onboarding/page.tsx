'use client'

// src/app/onboarding/page.tsx
// P4-2 - 온보딩 (회원가입 후 프로필 설정)

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PYEONGNAM_REGIONS, TRACK_EMOJIS, TRACK_LABELS, type Track, type Generation } from '@/lib/types'

const STEPS = ['세대 선택', '지역 연결', '트랙 선택']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    generation: null as Generation | null,
    origin_region: '',
    track: null as Track | null,
    family_name: '',
    invite_code: '',
  })

  // 온보딩은 선택 사항 — 강제 리다이렉트 없음

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const handleComplete = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      let family_id: string | null = null

      if (form.invite_code) {
        const { data: family } = await supabase
          .from('families')
          .select('id')
          .eq('invite_code', form.invite_code)
          .maybeSingle()
        if (family) family_id = family.id
      } else if (form.family_name) {
        const { data: family, error: familyErr } = await supabase
          .from('families')
          .insert({
            name: form.family_name,
            origin_region: form.origin_region,
            created_by: user.id,
          })
          .select()
          .maybeSingle()
        if (familyErr) setError('가문 생성 오류: ' + familyErr.message)
        else if (family) family_id = family.id
      }

      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: user.id,
        name: user.user_metadata?.name || '이름없음',
        generation: form.generation,
        origin_region: form.origin_region,
        track: form.track,
        family_id,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })

      if (profileErr) {
        setError('프로필 저장 오류: ' + profileErr.message)
        return
      }

      // 저장 실제 확인 (RLS 조용한 실패 방어)
      const { data: saved } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle()

      if (!saved?.onboarding_completed) {
        setError('프로필 저장에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.')
        return
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const tracks = Object.entries(TRACK_LABELS) as [Track, string][]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* 진행 단계 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  i < step
                    ? 'bg-purple-700 text-white'
                    : i === step
                    ? 'bg-purple-700 text-white ring-4 ring-purple-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-purple-700' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          {/* Step 0: 세대 선택 */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-1">몇 세대이신가요?</h2>
              <p className="text-sm text-gray-500 mb-6">평안남도 실향민 1세대 기준입니다.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {([1, 2, 3, 4] as Generation[]).map((gen) => (
                  <button
                    key={gen}
                    onClick={() => setForm({ ...form, generation: gen })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.generation === gen
                        ? 'border-purple-700 bg-purple-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {gen === 1 ? '👴' : gen === 2 ? '👨' : gen === 3 ? '🙋' : '👦'}
                    </div>
                    <div className="font-medium text-gray-900">{gen}세대</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {gen === 1 ? '직접 실향하신 분' :
                       gen === 2 ? '자녀 세대' :
                       gen === 3 ? '손자녀 세대' : '증손 세대'}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={next}
                disabled={!form.generation}
                className="w-full btn-primary py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                다음 →
              </button>
            </div>
          )}

          {/* Step 1: 지역 연결 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-1">가문의 출신 지역은?</h2>
              <p className="text-sm text-gray-500 mb-6">
                할아버지/할머니가 살았던 평안남도 지역을 선택해주세요.
              </p>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {PYEONGNAM_REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => setForm({ ...form, origin_region: region })}
                    className={`py-2.5 px-3 rounded-xl text-sm border transition-all ${
                      form.origin_region === region
                        ? 'border-purple-700 bg-purple-50 text-purple-700 font-medium'
                        : 'border-gray-100 text-gray-700 hover:border-gray-200'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-5 mb-5">
                <p className="text-sm font-medium text-gray-700 mb-3">가문 설정 (선택)</p>
                <div className="space-y-3">
                  <div>
                    <label className="label-base">가문 이름</label>
                    <input
                      type="text"
                      className="input-base"
                      placeholder="예: 홍씨 가문"
                      value={form.family_name}
                      onChange={(e) => setForm({ ...form, family_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label-base">가족 초대 코드 (가족이 이미 가입했다면)</label>
                    <input
                      type="text"
                      className="input-base"
                      placeholder="예: ab12cd34"
                      value={form.invite_code}
                      onChange={(e) => setForm({ ...form, invite_code: e.target.value.toLowerCase() })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={prev} className="flex-1 btn-ghost border border-gray-200">← 이전</button>
                <button
                  onClick={next}
                  disabled={!form.origin_region}
                  className="flex-1 btn-primary py-3 disabled:opacity-40"
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 트랙 선택 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-1">어떤 방식으로 탐사할까요?</h2>
              <p className="text-sm text-gray-500 mb-6">
                정해진 답은 없습니다. 나중에 바꿀 수도 있어요.
              </p>

              <div className="space-y-3 mb-6">
                {tracks.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setForm({ ...form, track: key })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                      form.track === key
                        ? 'border-purple-700 bg-purple-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-3xl">{TRACK_EMOJIS[key]}</span>
                    <div>
                      <div className="font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {key === 'storytelling' ? '인터뷰, 에세이, 가족사 기록' :
                         key === 'lifestyle' ? '음식, 복식, 생활문화 재해석' :
                         key === 'digital' ? 'VR 지도, 디지털 아트, 숏폼' :
                         '형식 없음. 본인이 생각하는 뿌리의 의미를 자유롭게'}
                      </div>
                    </div>
                    {form.track === key && (
                      <div className="ml-auto text-purple-700">✓</div>
                    )}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={prev} className="flex-1 btn-ghost border border-gray-200">← 이전</button>
                <button
                  onClick={handleComplete}
                  disabled={!form.track || loading}
                  className="flex-1 btn-primary py-3 disabled:opacity-40"
                >
                  {loading ? '저장 중...' : '탐사 시작! →'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          나중에 설정에서 언제든지 변경할 수 있습니다.
        </p>
      </div>
    </div>
  )
}
