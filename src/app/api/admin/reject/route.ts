// src/app/api/admin/reject/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

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

  await supabase.from('submissions').update({
    status: 'rejected',
    updated_at: new Date().toISOString(),
  }).eq('id', submissionId)

  return NextResponse.redirect(new URL('/admin', request.url))
}
