// src/app/archive/page.tsx
// P8 - 헤리티지 아카이브 (비회원도 열람 가능)

import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PYEONGNAM_REGIONS } from '@/lib/types'

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { region?: string; type?: string; q?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('archive_items')
    .select('*, profiles(name, generation, origin_region)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (searchParams.region) {
    query = query.eq('region_tag', searchParams.region)
  }
  if (searchParams.type) {
    query = query.eq('content_type', searchParams.type)
  }
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data: items } = await query.limit(24)

  const typeIcons: Record<string, string> = {
    photo: '📸',
    video: '🎬',
    essay: '📝',
    design: '🎨',
    map: '🗺',
    other: '📎',
  }

  const typeLabels: Record<string, string> = {
    photo: '사진',
    video: '영상',
    essay: '에세이',
    design: '디자인',
    map: '지도',
    other: '기타',
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="section-title">헤리티지 아카이브</h1>
            <p className="section-sub">
              평안남도 3·4세대가 발굴한 가문의 이야기들이 모입니다.
            </p>
          </div>

          {/* 검색 */}
          <form className="mb-6" method="get">
            <div className="flex gap-3">
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q}
                className="input-base flex-1"
                placeholder="제목, 지역, 키워드 검색..."
              />
              <button type="submit" className="btn-primary px-6">검색</button>
            </div>
          </form>

          {/* 필터 */}
          <div className="flex flex-wrap gap-2 mb-8">
            {/* 지역 필터 */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/archive"
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  !searchParams.region ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                전체 지역
              </Link>
              {PYEONGNAM_REGIONS.slice(0, 8).map(region => (
                <Link
                  key={region}
                  href={`/archive?region=${region}`}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    searchParams.region === region ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {region}
                </Link>
              ))}
            </div>

            {/* 유형 필터 */}
            <div className="flex flex-wrap gap-2 ml-2 pl-2 border-l border-gray-200">
              {Object.entries(typeLabels).map(([type, label]) => (
                <Link
                  key={type}
                  href={`/archive?${searchParams.region ? `region=${searchParams.region}&` : ''}type=${type}`}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    searchParams.type === type ? 'bg-purple-700 text-white border-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {typeIcons[type]} {label}
                </Link>
              ))}
            </div>
          </div>

          {/* 아이템 그리드 */}
          {items && items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => {
                const profile = item.profiles as any
                return (
                  <div key={item.id} className="card-hover group">
                    {/* 썸네일 */}
                    <div className="aspect-square bg-gradient-to-br from-purple-50 to-teal-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      {item.file_urls && item.file_urls[0] ? (
                        item.content_type === 'video' ? (
                          <div className="text-center">
                            <div className="text-4xl mb-1">🎬</div>
                            <div className="text-xs text-gray-500">영상</div>
                          </div>
                        ) : (
                          <img
                            src={item.file_urls[0]}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        )
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl mb-1">{typeIcons[item.content_type ?? 'other']}</div>
                          <div className="text-xs text-gray-500">{typeLabels[item.content_type ?? 'other']}</div>
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        {item.region_tag && (
                          <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                            {item.region_tag}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {typeIcons[item.content_type ?? 'other']}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs">
                          {profile?.name?.charAt(0) ?? '?'}
                        </div>
                        <span>{profile?.name ?? '익명'}</span>
                        {profile?.generation && (
                          <span className="text-gray-300">·</span>
                        )}
                        {profile?.generation && (
                          <span>{profile.generation}세대</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-gray-500 mb-2">아직 등록된 콘텐츠가 없습니다.</p>
              <Link href="/auth?mode=signup" className="text-purple-700 text-sm hover:underline">
                첫 번째 탐사자가 되어보세요 →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
