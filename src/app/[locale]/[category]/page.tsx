import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import VideoCard from '@/components/public/VideoCard'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

interface Props {
  params: Promise<{ locale: string; category: string }>
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ where: { isPublished: true } })
  return routing.locales.flatMap((locale) =>
    categories.map((cat) => ({ locale, category: cat.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug } = await params
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: { translations: { where: { locale } } },
  })
  if (!category) return {}
  const t = category.translations[0]
  const name = t?.name ?? category.slug
  return {
    title: t?.metaTitle ?? `${name} Tutorials | Glen's Tech Corner`,
    description: t?.metaDesc ?? t?.description ?? `${name} tutorials and guides.`,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `/${loc}/${categorySlug}`])
      ),
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { locale, category: categorySlug } = await params
  const t = await getTranslations('category')

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug, isPublished: true },
    include: {
      translations: { where: { locale } },
      videos: {
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
        include: { translations: { where: { locale } } },
      },
    },
  })

  if (!category) notFound()

  const catName = category.translations[0]?.name ?? category.slug
  const catDescription = category.translations[0]?.description

  return (
    <div>
      {/* Category header */}
      <div style={{ background: 'linear-gradient(145deg, #4D5958 0%, #374241 100%)' }} className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            {category.icon && <span className="text-4xl">{category.icon}</span>}
            <h1 className="font-bold text-white" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>{catName}</h1>
          </div>
          {catDescription && <p className="max-w-2xl mt-2" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{catDescription}</p>}
          <p className="text-xs font-bold uppercase tracking-widest mt-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {t('videos_count', { count: category.videos.length })}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {category.videos.length === 0 ? (
          <p style={{ color: '#999' }}>{t('no_videos')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.videos.map((video) => {
              const translation = video.translations[0] ?? null
              if (!translation) return null
              return (
                <VideoCard
                  key={video.id}
                  slug={video.slug}
                  categorySlug={category.slug}
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
        )}
      </div>
    </div>
  )
}
