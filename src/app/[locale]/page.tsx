import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import VideoCard from '@/components/public/VideoCard'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Glen's Tech Corner — Simple tutorials for powerful tools",
    description: 'Free tutorials for Figma, Google Sheets, ChatGPT, Claude, Photoshop and more.',
    openGraph: {
      title: "Glen's Tech Corner",
      description: 'Free tutorials for Figma, Google Sheets, ChatGPT, Claude, Photoshop and more.',
      type: 'website',
    },
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('home')

  const [categories, recentVideos] = await Promise.all([
    prisma.category.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { where: { locale } },
        _count: { select: { videos: { where: { isPublished: true } } } },
      },
    }),
    prisma.video.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      include: {
        translations: { where: { locale } },
        category: true,
      },
    }),
  ])

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(145deg, #4D5958 0%, #3E4B4A 40%, #374241 100%)', minHeight: '480px' }} className="text-white flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full py-28">
          <div className="max-w-2xl">
            <div className="inline-block text-xs font-bold uppercase tracking-widest mb-6 px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em' }}>
              Free Tutorials
            </div>
            <h1 className="font-bold mb-5" style={{ fontSize: '3.5rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>{t('hero_title')}</h1>
            <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{t('hero_subtitle')}</p>
            <Link
              href="#categories"
              className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #BF1725, #830B15)', color: '#fff', fontSize: '15px', boxShadow: '0 4px 24px rgba(191,23,37,0.4)' }}
            >
              {t('browse_categories')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold mb-10" style={{ color: '#181818', letterSpacing: '-0.02em' }}>{t('browse_categories')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const name = cat.translations[0]?.name ?? cat.slug
            return (
              <Link key={cat.id} href={`/${locale}/${cat.slug}`}>
                <div className="group rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-xl cursor-pointer h-full flex flex-col items-center justify-center"
                  style={{ background: '#fff', border: '1px solid #ececec' }}>
                  {cat.icon && <div className="text-3xl mb-3">{cat.icon}</div>}
                  <h3 className="font-semibold text-sm transition-colors" style={{ color: '#181818' }}>
                    {name}
                  </h3>
                  <p className="text-xs mt-1.5 font-medium" style={{ color: '#BF1725' }}>{cat._count.videos} videos</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Recent Videos */}
      {recentVideos.length > 0 && (
        <section style={{ background: '#F0F0F0' }} className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-10" style={{ color: '#181818', letterSpacing: '-0.02em' }}>{t('latest_videos')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVideos.map((video) => {
              const translation = video.translations[0]
              if (!translation) return null
              return (
                <VideoCard
                  key={video.id}
                  slug={video.slug}
                  categorySlug={video.category.slug}
                  locale={locale}
                  youtubeId={video.youtubeId}
                  thumbnailUrl={video.thumbnailUrl}
                  title={translation.title}
                  subtitle={translation.subtitle ?? null}
                  publishedAt={video.publishedAt}
                />
              )
            })}
          </div>
        </div>
        </section>
      )}
    </div>
  )
}
