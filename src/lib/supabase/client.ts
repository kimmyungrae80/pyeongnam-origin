// lib/supabase/client.ts
// 브라우저(클라이언트 컴포넌트)에서 사용
// 주의: NEXT_PUBLIC_ 변수는 반드시 리터럴 접근(process.env.NEXT_PUBLIC_*)으로만 인라인됨

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.'
    )
  }
  return createBrowserClient(supabaseUrl, supabaseKey)
}
