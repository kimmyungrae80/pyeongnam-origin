'use client'

// src/components/Navbar.tsx

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    getProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/guide', label: '가이드' },
    { href: '/archive', label: '아카이브' },
    { href: '/missions', label: '미션' },
    { href: '/faq', label: 'FAQ' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">평</span>
          </div>
          <span className="font-medium text-gray-900">
            평남 오리진
            <span className="text-purple-700 ml-1">·</span>
          </span>
        </Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* 우측 버튼 */}
        <div className="hidden md:flex items-center gap-3">
          {profile ? (
            <>
              {/* 포인트 */}
              <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                <span className="text-purple-700 text-xs">⭐</span>
                <span className="text-purple-700 text-xs font-medium">
                  {profile.points.toLocaleString()}p
                </span>
              </div>

              {/* 대시보드 */}
              <Link href="/dashboard">
                <div className="flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                  <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-700 text-xs font-medium">
                      {profile.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">{profile.name}</span>
                </div>
              </Link>

              {/* 로그아웃 */}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn-ghost">로그인</Link>
              <Link href="/auth?mode=signup" className="btn-primary">
                뿌리 찾기 시작 →
              </Link>
            </>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-50"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-600"></div>
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2.5 text-sm text-gray-700 hover:text-purple-700"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 mt-3 pt-3">
            {profile ? (
              <div>
                <div className="text-sm text-gray-700 mb-2">{profile.name} ({profile.points}p)</div>
                <Link href="/dashboard" className="block py-2 text-sm text-purple-700">대시보드</Link>
                <button onClick={handleLogout} className="block py-2 text-sm text-gray-400">로그아웃</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/auth" className="btn-ghost text-center">로그인</Link>
                <Link href="/auth?mode=signup" className="btn-primary text-center">시작하기</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
