import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import VideoEmbed from '@/components/public/VideoEmbed'
import Link from 'next/link'
import { getYouTubeThumbnailUrl } from '@/lib/youtube'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'

interface Props {
  params: Promise<{ locale: string; category: string; videoSlug: string }>
}

export async function generateStaticParams() {
  const videos = await prisma.video.findMany({
    where: { isPublished: true },
    include: { category: true },
  })
  return routing.locales.flatMap((locale) =>
    videos.map((v) => ({ locale, category: v.category.slug, videoSlug: v.slug }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: categorySlug, videoSlug } = await params
  const video = await prisma.video.findUnique({
    where: { slug: videoSlug },
    include: {
      translations: { where: { locale: { in: [locale, 'en'] } } },
      category: true,
    },
  })
  if (!video) return {}
  const translation =
    video.translations.find((t) => t.locale === locale) ??
    video.translations.find((t) => t.locale === 'en')
  if (!translation) return {}

  const thumb = video.thumbnailUrl ?? getYouTubeThumbnailUrl(video.youtubeId)
  const title = translation.metaTitle ?? `${translation.title} | Glen's Tech Corner`
  const description = translation.metaDesc ?? translation.description.slice(0, 160)

  return {
    title,
    description,
    keywords: translation.metaKeywords ?? undefined,
    openGraph: {
      title: translation.title,
      description,
      images: [{ url: thumb }],
      type: 'video.other',
      videos: [`https://www.youtube.com/embed/${video.youtubeId}`],
    },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `/${loc}/${categorySlug}/${videoSlug}`])
      ),
    },
  }
}

export default async function VideoPage({ params }: Props) {
  const { locale, category: categorySlug, videoSlug } = await params
  const t = await getTranslations('video')

  const video = await prisma.video.findUnique({
    where: { slug: videoSlug, isPublished: true },
    include: {
      translations: { where: { locale: { in: [locale, 'en'] } } },
      category: {
        include: { translations: { where: { locale } } },
      },
    },
  })

  if (!video || video.category.slug !== categorySlug) notFound()

  const translation =
    video.translations.find((tr) => tr.locale === locale) ??
    video.translations.find((tr) => tr.locale === 'en')

  if (!translation) notFound()

  const catName = video.category.translations[0]?.name ?? video.category.slug
  const thumb = video.thumbnailUrl ?? getYouTubeThumbnailUrl(video.youtubeId)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: translation.title,
    description: translation.description,
    thumbnailUrl: thumb,
    uploadDate: video.publishedAt.toISOString(),
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-10" style={{ color: '#aaa' }}>
          <Link href={`/${locale}`} className="hover:opacity-70 transition-opacity" style={{ color: '#aaa' }}>Home</Link>
          <span style={{ color: '#ddd' }}>/</span>
          <Link href={`/${locale}/${categorySlug}`} className="hover:opacity-70 transition-opacity" style={{ color: '#aaa' }}>{catName}</Link>
          <span style={{ color: '#ddd' }}>/</span>
          <span style={{ color: '#181818' }} className="truncate max-w-xs">{translation.title}</span>
        </nav>

        {/* Title */}
        <h1 className="font-bold mb-3" style={{ fontSize: '2.25rem', lineHeight: 1.15, letterSpacing: '-0.03em', color: '#181818' }}>
          {translation.title}
        </h1>
        {translation.subtitle && (
          <p className="text-lg mb-3" style={{ color: '#555', lineHeight: 1.6 }}>{translation.subtitle}</p>
        )}
        <p className="text-xs font-semibold uppercase tracking-widest mb-10" style={{ color: '#BF1725' }}>
          {t('published')}: {new Date(video.publishedAt).toLocaleDateString(locale)}
        </p>

        {/* Video */}
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <VideoEmbed youtubeId={video.youtubeId} />
        </div>

        {/* Description */}
        <div className="mt-12 pt-10" style={{ borderTop: '1px solid #ececec' }}>
          <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#333' }}>
            {translation.description}
          </p>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid #ececec' }}>
          <Link
            href={`/${locale}/${categorySlug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#BF1725' }}
          >
            ← {t('back_to', { category: catName })}
          </Link>
        </div>
      </div>
    </>
  )
}
