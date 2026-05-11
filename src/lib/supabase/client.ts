// lib/supabase/client.ts
// 브라우저(클라이언트 컴포넌트)에서 사용

import { createBrowserClient } from '@supabase/ssr'

function getEnv(key: string): string {
  const value = (process.env[key] ?? '').trim()
  if (!value || value === 'undefined') {
    throw new Error(
      `[평남오리진] 환경변수 ${key}가 설정되지 않았습니다. ` +
      '.env.local 파일을 확인하거나 배포 환경변수를 설정해주세요.'
    )
  }
  return value
}

export function createClient() {
  return createBrowserClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}
