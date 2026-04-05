import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { VideoChart } from '@/components/admin/VideoChart'

export default async function AdminDashboard() {
  const [allVideos, allCategories, activeLanguages] = await Promise.all([
    prisma.video.findMany({
      orderBy: { publishedAt: 'asc' },
      include: { translations: { select: { locale: true } } },
    }),
    prisma.category.findMany({
      include: { translations: { select: { locale: true } } },
    }),
    prisma.language.findMany({ where: { isActive: true }, select: { code: true, name: true } }),
  ])

  const activeCodes = activeLanguages.map((l) => l.code)

  // ── Chart data: videos added per month over last 12 months ──
  const now = new Date()
  const months: { month: string; count: number; key: string }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      month: d.toLocaleString('en', { month: 'short', year: '2-digit' }),
      count: 0,
    })
  }
  for (const video of allVideos) {
    const d = new Date(video.publishedAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const slot = months.find((m) => m.key === key)
    if (slot) slot.count++
  }

  // ── Categories missing translations ──
  const categoriesMissingTranslations = allCategories
    .map((cat) => {
      const translatedLocales = cat.translations.map((t) => t.locale)
      const missing = activeCodes.filter((c) => !translatedLocales.includes(c))
      return { ...cat, missing }
    })
    .filter((cat) => cat.missing.length > 0)

  // ── Videos missing translations ──
  const videosMissingTranslations = allVideos
    .map((video) => {
      const translatedLocales = video.translations.map((t) => t.locale)
      const missing = activeCodes.filter((c) => !translatedLocales.includes(c))
      return { ...video, missing }
    })
    .filter((video) => video.missing.length > 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your content</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Videos', value: allVideos.length },
          { label: 'Categories', value: allCategories.length },
          { label: 'Active Languages', value: activeLanguages.length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl border px-6 py-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Videos added — last 12 months</h2>
        <VideoChart data={months.map(({ month, count }) => ({ month, count }))} />
      </div>

      {/* Bottom two columns */}
      <div className="grid grid-cols-2 gap-6">

        {/* Categories missing translations */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Categories missing translations</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: categoriesMissingTranslations.length > 0 ? '#FEE2E2' : '#DCFCE7', color: categoriesMissingTranslations.length > 0 ? '#991B1B' : '#166534' }}>
              {categoriesMissingTranslations.length}
            </span>
          </div>
          {categoriesMissingTranslations.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">All categories are fully translated ✓</p>
          ) : (
            <ul className="divide-y">
              {categoriesMissingTranslations.map((cat) => (
                <li key={cat.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{cat.icon} {cat.slug}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Missing: {cat.missing.map((c) => c.toUpperCase()).join(', ')}
                    </p>
                  </div>
                  <Link href={`/admin/categories/${cat.id}`} className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                    Edit →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Videos missing translations */}
        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Videos missing translations</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: videosMissingTranslations.length > 0 ? '#FEE2E2' : '#DCFCE7', color: videosMissingTranslations.length > 0 ? '#991B1B' : '#166534' }}>
              {videosMissingTranslations.length}
            </span>
          </div>
          {videosMissingTranslations.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">All videos are fully translated ✓</p>
          ) : (
            <ul className="divide-y max-h-96 overflow-y-auto">
              {videosMissingTranslations.map((video) => (
                <li key={video.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-[220px]">{video.slug}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Missing: {video.missing.map((c) => c.toUpperCase()).join(', ')}
                    </p>
                  </div>
                  <Link href={`/admin/videos/${video.id}`} className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors shrink-0">
                    Edit →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
