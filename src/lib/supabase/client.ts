// lib/supabase/client.ts
// 브라우저(클라이언트 컴포넌트)에서 사용

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || supabaseUrl === 'undefined' || !supabaseUrl.startsWith('http')) {
  throw new Error(
    '[평남오리진] NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다. ' +
    '.env.local 파일을 확인하거나 배포 환경변수를 설정해주세요.'
  )
}

if (!supabaseKey || supabaseKey === 'undefined') {
  throw new Error(
    '[평남오리진] NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다. ' +
    '.env.local 파일을 확인하거나 배포 환경변수를 설정해주세요.'
  )
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey)
}
