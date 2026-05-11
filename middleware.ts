// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 세션 쿠키를 redirect 응답에 복사 (세션 유지 핵심)
function redirectWithSession(to: string, request: NextRequest, supabaseResponse: NextResponse) {
  const url = request.nextUrl.clone()
  url.pathname = to
  url.search = ''
  const res = NextResponse.redirect(url)
  supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value, c))
  return res
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const protectedPaths = ['/dashboard', '/missions', '/submit', '/admin']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  // 1. 미인증 → 보호된 경로 접근 시 로그인 페이지로
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.search = ''
    url.searchParams.set('redirect', pathname)
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value, c))
    return res
  }

  // 2. 인증된 사용자: onboarding_completed 확인 (보호된 경로 or /onboarding 접근 시만)
  if (user && (isProtected || pathname === '/onboarding')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    const completed = profile?.onboarding_completed === true

    // 온보딩 미완료인데 대시보드 등 접근 → 온보딩으로
    if (!completed && isProtected) {
      return redirectWithSession('/onboarding', request, supabaseResponse)
    }

    // 온보딩 완료했는데 /onboarding 접근 → 대시보드로
    if (completed && pathname === '/onboarding') {
      return redirectWithSession('/dashboard', request, supabaseResponse)
    }
  }

  // 3. 이미 로그인된 상태로 /auth 접근 → 대시보드로
  if (user && pathname === '/auth') {
    return redirectWithSession('/dashboard', request, supabaseResponse)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
