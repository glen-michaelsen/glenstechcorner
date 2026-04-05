import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

export default async function Footer() {
  const t = await getTranslations('footer')
  const locale = await getLocale()
  const year = new Date().getFullYear()

  const [topCategories, recentVideos] = await Promise.all([
    prisma.category.findMany({
      where: { isPublished: true },
      orderBy: { videos: { _count: 'desc' } },
      take: 6,
      include: {
        translations: { where: { locale } },
        _count: { select: { videos: { where: { isPublished: true } } } },
      },
    }),
    prisma.video.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: {
        translations: { where: { locale } },
        category: true,
      },
    }),
  ])

  return (
    <footer style={{ background: 'linear-gradient(145deg, #BF1725 0%, #8C1220 50%, #830B15 100%)' }} className="mt-0 pt-16 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Left — Logo + tagline */}
          <div className="flex flex-col gap-4">
            <Link href={`/${locale}`}>
              <img src="/logo-white.svg" alt="Glen's Tech Corner" style={{ height: '84px', width: 'auto' }} />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('tagline')}
            </p>
          </div>

          {/* Middle — Top categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
              {t('top_categories')}
            </h4>
            <ul className="space-y-2.5">
              {topCategories.map((cat) => {
                const name = cat.translations[0]?.name ?? cat.slug
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/${locale}/${cat.slug}`}
                      className="flex items-center justify-between group transition-opacity hover:opacity-80"
                    >
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        {cat.icon && <span>{cat.icon}</span>}
                        {name}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {cat._count.videos}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Right — Recent videos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
              {t('latest_videos')}
            </h4>
            <ul className="space-y-3">
              {recentVideos.map((video) => {
                const title = video.translations[0]?.title ?? video.slug
                const thumb = video.thumbnailUrl ?? `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`
                return (
                  <li key={video.id}>
                    <Link
                      href={`/${locale}/${video.category.slug}/${video.slug}`}
                      className="flex items-center gap-3 group transition-opacity hover:opacity-80"
                    >
                      <div className="shrink-0 rounded-md overflow-hidden" style={{ width: '56px', height: '36px' }}>
                        <Image
                          src={thumb}
                          alt={title}
                          width={56}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-white leading-snug line-clamp-2">{title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }} className="pt-6">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {t('copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  )
}
