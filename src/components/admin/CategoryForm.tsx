'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface TranslationData {
  locale: string
  name: string
  description: string
  metaTitle: string
  metaDesc: string
}

interface Language {
  code: string
  name: string
  isDefault: boolean
}

interface CategoryFormProps {
  languages: Language[]
  initialData?: {
    id: string
    slug: string
    icon: string
    sortOrder: number
    isPublished: boolean
    translations: Array<{
      locale: string
      name: string
      description: string | null
      metaTitle: string | null
      metaDesc: string | null
    }>
  }
}

function TranslationFields({
  lang,
  data,
  onChange,
  readOnly,
}: {
  lang: Language
  data: TranslationData
  onChange: (field: string, value: string) => void
  readOnly?: boolean
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label>Name</Label>
        <Input
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder={`Category name in ${lang.name}`}
          readOnly={readOnly}
          className={readOnly ? 'bg-slate-50 text-slate-600' : ''}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          readOnly={readOnly}
          className={readOnly ? 'bg-slate-50 text-slate-600' : ''}
        />
      </div>
      <div>
        <Label>Meta Title</Label>
        <Input
          value={data.metaTitle}
          onChange={(e) => onChange('metaTitle', e.target.value)}
          readOnly={readOnly}
          className={readOnly ? 'bg-slate-50 text-slate-600' : ''}
        />
      </div>
      <div>
        <Label>Meta Description</Label>
        <Textarea
          value={data.metaDesc}
          onChange={(e) => onChange('metaDesc', e.target.value)}
          rows={2}
          readOnly={readOnly}
          className={readOnly ? 'bg-slate-50 text-slate-600' : ''}
        />
      </div>
    </div>
  )
}

export function CategoryForm({ languages, initialData }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [icon, setIcon] = useState(initialData?.icon ?? '')
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0)
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)

  const defaultLang = languages.find((l) => l.isDefault) ?? languages[0]
  const otherLanguages = languages.filter((l) => !l.isDefault)
  const [rightLang, setRightLang] = useState(otherLanguages[0]?.code ?? '')

  const [translations, setTranslations] = useState<Record<string, TranslationData>>(
    Object.fromEntries(
      languages.map((lang) => {
        const existing = initialData?.translations.find((t) => t.locale === lang.code)
        return [lang.code, {
          locale: lang.code,
          name: existing?.name ?? '',
          description: existing?.description ?? '',
          metaTitle: existing?.metaTitle ?? '',
          metaDesc: existing?.metaDesc ?? '',
        }]
      })
    )
  )

  function updateTranslation(locale: string, field: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const body = { slug, icon, sortOrder, isPublished, translations: Object.values(translations) }
    const url = initialData ? `/api/admin/categories/${initialData.id}` : '/api/admin/categories'
    const method = initialData ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { router.push('/admin/categories'); router.refresh() }
    else { alert('Error saving category'); setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General fields */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="figma" required />
        </div>
        <div>
          <Label htmlFor="icon">Icon (emoji)</Label>
          <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🎨" />
        </div>
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      {/* Two-column translation editor */}
      <div>
        <h3 className="font-medium text-slate-900 mb-3">Translations</h3>
        <div className="grid grid-cols-2 gap-6">
          {/* Left — default language */}
          {defaultLang && (
            <div className="bg-slate-50 rounded-lg border p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Default</span>
                <span className="text-sm font-semibold text-slate-700">{defaultLang.name}</span>
              </div>
              <TranslationFields
                lang={defaultLang}
                data={translations[defaultLang.code] ?? { locale: defaultLang.code, name: '', description: '', metaTitle: '', metaDesc: '' }}
                onChange={(field, value) => updateTranslation(defaultLang.code, field, value)}
              />
            </div>
          )}

          {/* Right — selected language */}
          <div className="bg-white rounded-lg border p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Translate to</span>
              <select
                value={rightLang}
                onChange={(e) => setRightLang(e.target.value)}
                className="text-sm font-semibold text-slate-700 border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                {otherLanguages.map((l) => (
                  <option key={l.code} value={l.code}>{l.name} ({l.code.toUpperCase()})</option>
                ))}
              </select>
            </div>
            {rightLang && translations[rightLang] ? (
              <TranslationFields
                lang={otherLanguages.find((l) => l.code === rightLang)!}
                data={translations[rightLang]}
                onChange={(field, value) => updateTranslation(rightLang, field, value)}
              />
            ) : (
              <p className="text-sm text-slate-400">No other languages active. Add one in Languages settings.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>Cancel</Button>
      </div>
    </form>
  )
}
