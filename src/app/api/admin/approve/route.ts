// src/app/api/admin/approve/route.ts
// 제출물 승인 + 포인트 지급

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // 관리자 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const submissionId = formData.get('submission_id') as string
  const points = parseInt(formData.get('points') as string)
  const userId = formData.get('user_id') as string

  try {
    // 1. 제출물 상태 업데이트
    await supabase.from('submissions').update({
      status: 'approved',
      points_earned: points,
      updated_at: new Date().toISOString(),
    }).eq('id', submissionId)

    // 2. 포인트 지급
    await supabase.rpc('increment_points', {
      user_id: userId,
      amount: points,
    })

    // 3. 배지 체크 (간단 버전 - 첫 미션 배지)
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'approved')

    if (count === 1) {
      // 첫 탐사 배지 부여
      const { data: firstBadge } = await supabase
        .from('badges')
        .select('id')
        .eq('condition_type', 'mission_count')
        .eq('condition_value', 1)
        .single()

      if (firstBadge) {
        await supabase.from('user_badges').upsert({
          user_id: userId,
          badge_id: firstBadge.id,
        }, { onConflict: 'user_id,badge_id', ignoreDuplicates: true })
      }
    }

  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/admin', request.url))
}
