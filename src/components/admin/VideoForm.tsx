'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [translations, setTranslations] = useState<Record<string, TranslationData>>(
    Object.fromEntries(
      languages.map((lang) => {
        const existing = initialData?.translations.find((t) => t.locale === lang.code)
        return [
          lang.code,
          {
            locale: lang.code,
            title: existing?.title ?? '',
            subtitle: existing?.subtitle ?? '',
            description: existing?.description ?? '',
            metaTitle: existing?.metaTitle ?? '',
            metaDesc: existing?.metaDesc ?? '',
            metaKeywords: existing?.metaKeywords ?? '',
          },
        ]
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
    const body = {
      slug,
      youtubeId,
      thumbnailUrl: thumbnailUrl || null,
      publishedAt,
      isPublished,
      categoryId,
      translations: Object.values(translations),
    }
    const url = initialData ? `/api/admin/videos/${initialData.id}` : '/api/admin/videos'
    const method = initialData ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      router.push('/admin/videos')
      router.refresh()
    } else {
      alert('Error saving video')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-layout-in-figma"
            required
          />
        </div>
        <div>
          <Label htmlFor="youtubeId">YouTube ID or URL</Label>
          <Input
            id="youtubeId"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            placeholder="dQw4w9WgXcQ"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="publishedAt">Published Date</Label>
          <Input
            id="publishedAt"
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
          <Input
            id="thumbnailUrl"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="Leave blank to use YouTube thumbnail"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-slate-900 mb-3">Translations</h3>
        <Tabs defaultValue="en">
          <TabsList>
            {languages.map((lang) => (
              <TabsTrigger key={lang.code} value={lang.code}>
                {lang.code.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          {languages.map((lang) => {
            const loc = lang.code
            return (
              <TabsContent key={loc} value={loc} className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={translations[loc]?.title ?? ''}
                    onChange={(e) => updateTranslation(loc, 'title', e.target.value)}
                    placeholder={`Video title in ${lang.name}`}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={translations[loc]?.subtitle ?? ''}
                    onChange={(e) => updateTranslation(loc, 'subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={translations[loc]?.description ?? ''}
                    onChange={(e) => updateTranslation(loc, 'description', e.target.value)}
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Meta Title (SEO override)</Label>
                  <Input
                    value={translations[loc]?.metaTitle ?? ''}
                    onChange={(e) => updateTranslation(loc, 'metaTitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Meta Description (SEO override, max 160 chars)</Label>
                  <Textarea
                    value={translations[loc]?.metaDesc ?? ''}
                    onChange={(e) => updateTranslation(loc, 'metaDesc', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Meta Keywords (comma separated)</Label>
                  <Input
                    value={translations[loc]?.metaKeywords ?? ''}
                    onChange={(e) => updateTranslation(loc, 'metaKeywords', e.target.value)}
                  />
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/videos')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
