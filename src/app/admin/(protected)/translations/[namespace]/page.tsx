import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { saveTranslations } from '../actions'
import { Button } from '@/components/ui/button'

// The definition of all translatable keys per namespace
const NAMESPACE_KEYS: Record<string, { key: string; label: string; multiline?: boolean }[]> = {
  home: [
    { key: 'hero_title', label: 'Hero Title' },
    { key: 'hero_subtitle', label: 'Hero Subtitle' },
    { key: 'browse_categories', label: 'Browse Categories Button' },
    { key: 'latest_videos', label: 'Latest Videos Heading' },
  ],
  nav: [
    { key: 'home', label: 'Home Link' },
    { key: 'categories', label: 'Categories Link' },
  ],
  footer: [
    { key: 'tagline', label: 'Tagline', multiline: true },
    { key: 'copyright', label: 'Copyright (use {year} for current year)' },
    { key: 'top_categories', label: 'Top Categories heading' },
    { key: 'latest_videos', label: 'Latest Videos heading' },
  ],
  category: [
    { key: 'videos_count', label: 'Video Count (use {count})' },
    { key: 'no_videos', label: 'Empty State Message' },
  ],
  video: [
    { key: 'watch_on_youtube', label: 'Watch on YouTube' },
    { key: 'published', label: 'Published Label' },
    { key: 'back_to', label: 'Back Link (use {category})' },
  ],
}

const NAMESPACE_LABELS: Record<string, string> = {
  home: 'Home Page',
  nav: 'Navigation',
  footer: 'Footer',
  category: 'Category Page',
  video: 'Video Page',
}

interface Props {
  params: Promise<{ namespace: string }>
}

export default async function EditTranslationsPage({ params }: Props) {
  const { namespace } = await params
  const keys = NAMESPACE_KEYS[namespace]
  if (!keys) notFound()

  const [languages, dbTranslations] = await Promise.all([
    prisma.language.findMany({ where: { isActive: true }, orderBy: { isDefault: 'desc' } }),
    prisma.uITranslation.findMany({ where: { namespace } }),
  ])

  // Build lookup: locale -> key -> value
  const lookup: Record<string, Record<string, string>> = {}
  for (const t of dbTranslations) {
    if (!lookup[t.locale]) lookup[t.locale] = {}
    lookup[t.locale][t.key] = t.value
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <a href="/admin/translations" className="text-sm text-slate-500 hover:text-slate-700">← Back</a>
        <h1 className="text-2xl font-bold">{NAMESPACE_LABELS[namespace] ?? namespace}</h1>
      </div>

      <form action={saveTranslations}>
        <div className="bg-white rounded-lg border overflow-hidden">
          {/* Header row */}
          <div className="grid border-b bg-slate-50" style={{ gridTemplateColumns: `200px repeat(${languages.length}, 1fr)` }}>
            <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Field</div>
            {languages.map((lang) => (
              <div key={lang.code} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang.name} ({lang.code.toUpperCase()})
              </div>
            ))}
          </div>

          {/* Key rows */}
          {keys.map((field) => (
            <div
              key={field.key}
              className="grid border-b last:border-0"
              style={{ gridTemplateColumns: `200px repeat(${languages.length}, 1fr)` }}
            >
              <div className="px-4 py-3 flex flex-col justify-center border-r bg-slate-50">
                <p className="text-sm font-medium text-slate-700">{field.label}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{field.key}</p>
              </div>
              {languages.map((lang) => {
                const currentValue = lookup[lang.code]?.[field.key] ?? ''
                const fieldName = `${lang.code}::${namespace}::${field.key}`
                return (
                  <div key={lang.code} className="px-3 py-3 border-r last:border-0">
                    {field.multiline ? (
                      <textarea
                        name={fieldName}
                        defaultValue={currentValue}
                        placeholder={lang.isDefault ? '' : 'Leave blank to use default'}
                        rows={2}
                        className="w-full text-sm border rounded px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    ) : (
                      <input
                        name={fieldName}
                        defaultValue={currentValue}
                        placeholder={lang.isDefault ? '' : 'Leave blank to use default'}
                        className="w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <Button type="submit">Save Translations</Button>
          <a href="/admin/translations">
            <Button variant="outline" type="button">Cancel</Button>
          </a>
        </div>
      </form>
    </div>
  )
}
