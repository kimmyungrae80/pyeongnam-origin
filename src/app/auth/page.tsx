'use client'

// src/app/auth/page.tsx
// P4 - 로그인 / 회원가입

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name },
          },
        })
        if (signUpError) throw signUpError

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (signInError) throw signInError

        router.push('/onboarding')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (error) throw error

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('generation, track')
            .eq('id', user.id)
            .single()
          if (!profile?.generation || !profile?.track) {
            router.push('/onboarding')
            return
          }
        }
        const redirect = searchParams.get('redirect') || '/dashboard'
        router.push(redirect)
        router.refresh()
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else if (err.message.includes('User already registered')) {
        setError('이미 등록된 이메일입니다. 로그인해주세요.')
      } else if (err.message.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. Supabase 대시보드에서 "Confirm email"을 OFF로 설정해주세요.')
      } else if (err.message.includes('email rate limit')) {
        setError('이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.')
      } else {
        setError(err.message || '오류가 발생했습니다. 다시 시도해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-purple-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">평</span>
              </div>
              <span className="font-medium text-gray-900 text-lg">평남 오리진</span>
            </div>
          </Link>
          <h1 className="text-2xl font-medium text-gray-900">
            {mode === 'login' ? '다시 돌아오셨군요' : '뿌리 탐사를 시작합니다'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login'
              ? '계속 탐사를 이어가세요'
              : '우리 가문의 이야기를 나만의 언어로 발견합니다'}
          </p>
        </div>

        {/* 카드 */}
        <div className="card">
          {/* 탭 */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-gray-900 font-medium shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-gray-900 font-medium shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 (회원가입만) */}
            {mode === 'signup' && (
              <div>
                <label className="label-base">이름</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="홍길동"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            )}

            {/* 이메일 */}
            <div>
              <label className="label-base">이메일</label>
              <input
                type="email"
                className="input-base"
                placeholder="example@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="label-base">비밀번호</label>
              <input
                type="password"
                className="input-base"
                placeholder={mode === 'signup' ? '8자 이상' : '비밀번호 입력'}
                minLength={mode === 'signup' ? 8 : undefined}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {/* 에러 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* 제출 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? '처리 중...'
                : mode === 'login'
                ? '로그인'
                : '회원가입 후 탐사 시작 →'}
            </button>
          </form>

          {/* 회원가입 안내 */}
          {mode === 'signup' && (
            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              가입 시 개인정보 처리방침에 동의하게 됩니다.<br />
              수집된 정보는 뿌리이음 프로젝트 운영에만 사용됩니다.
            </p>
          )}
        </div>

        {/* 가족 초대 링크로 왔을 때 안내 */}
        {searchParams.get('family') && (
          <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-800 text-center">
            가족이 초대했습니다. 가입 후 가문에 자동으로 연결됩니다.
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600">← 메인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
