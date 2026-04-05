'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Category {
  id: string
  slug: string
  name: string
}

interface TranslationData {
  locale: string
  title: string
  subtitle: string
  description: string
  metaTitle: string
  metaDesc: string
  metaKeywords: string
}

interface Language {
  code: string
  name: string
  isDefault: boolean
}

interface VideoFormProps {
  languages: Language[]
  categories: Category[]
  initialData?: {
    id: string
    slug: string
    youtubeId: string
    thumbnailUrl: string
    publishedAt: string
    isPublished: boolean
    categoryId: string
    translations: Array<{
      locale: string
      title: string
      subtitle: string | null
      description: string
      metaTitle: string | null
      metaDesc: string | null
      metaKeywords: string | null
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
  const cls = readOnly ? 'bg-slate-50 text-slate-600' : ''
  return (
    <div className="space-y-5">
      <div>
        <Label>Title</Label>
        <Input value={data.title} onChange={(e) => onChange('title', e.target.value)}
          placeholder={`Title in ${lang.name}`} readOnly={readOnly} className={cls} />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input value={data.subtitle} onChange={(e) => onChange('subtitle', e.target.value)}
          readOnly={readOnly} className={cls} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={data.description} onChange={(e) => onChange('description', e.target.value)}
          rows={6} readOnly={readOnly} className={cls} />
      </div>
      <div>
        <Label>Meta Title</Label>
        <Input value={data.metaTitle} onChange={(e) => onChange('metaTitle', e.target.value)}
          readOnly={readOnly} className={cls} />
      </div>
      <div>
        <Label>Meta Description</Label>
        <Textarea value={data.metaDesc} onChange={(e) => onChange('metaDesc', e.target.value)}
          rows={2} readOnly={readOnly} className={cls} />
      </div>
      <div>
        <Label>Meta Keywords</Label>
        <Input value={data.metaKeywords} onChange={(e) => onChange('metaKeywords', e.target.value)}
          readOnly={readOnly} className={cls} />
      </div>
    </div>
  )
}

const emptyTranslation = (locale: string): TranslationData => ({
  locale, title: '', subtitle: '', description: '', metaTitle: '', metaDesc: '', metaKeywords: '',
})

export function VideoForm({ languages, categories, initialData }: VideoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [youtubeId, setYoutubeId] = useState(initialData?.youtubeId ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? '')
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  )
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '')

  const defaultLang = languages.find((l) => l.isDefault) ?? languages[0]
  const otherLanguages = languages.filter((l) => !l.isDefault)
  const [rightLang, setRightLang] = useState(otherLanguages[0]?.code ?? '')

  const [translations, setTranslations] = useState<Record<string, TranslationData>>(
    Object.fromEntries(
      languages.map((lang) => {
        const existing = initialData?.translations.find((t) => t.locale === lang.code)
        return [lang.code, {
          locale: lang.code,
          title: existing?.title ?? '',
          subtitle: existing?.subtitle ?? '',
          description: existing?.description ?? '',
          metaTitle: existing?.metaTitle ?? '',
          metaDesc: existing?.metaDesc ?? '',
          metaKeywords: existing?.metaKeywords ?? '',
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
    const body = { slug, youtubeId, thumbnailUrl: thumbnailUrl || null, publishedAt, isPublished, categoryId, translations: Object.values(translations) }
    const url = initialData ? `/api/admin/videos/${initialData.id}` : '/api/admin/videos'
    const method = initialData ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { router.push('/admin/videos'); router.refresh() }
    else { alert('Error saving video'); setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General fields */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-layout-in-figma" required />
        </div>
        <div>
          <Label htmlFor="youtubeId">YouTube ID or URL</Label>
          <Input id="youtubeId" value={youtubeId} onChange={(e) => setYoutubeId(e.target.value)} placeholder="dQw4w9WgXcQ" required />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')} required>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="publishedAt">Published Date</Label>
          <Input id="publishedAt" type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
          <Input id="thumbnailUrl" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Leave blank to use YouTube thumbnail" />
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
                data={translations[defaultLang.code] ?? emptyTranslation(defaultLang.code)}
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
        <Button type="button" variant="outline" onClick={() => router.push('/admin/videos')}>Cancel</Button>
      </div>
    </form>
  )
}
