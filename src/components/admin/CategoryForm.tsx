'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export function CategoryForm({ languages, initialData }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [icon, setIcon] = useState(initialData?.icon ?? '')
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0)
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [translations, setTranslations] = useState<Record<string, TranslationData>>(
    Object.fromEntries(
      languages.map((lang) => {
        const existing = initialData?.translations.find((t) => t.locale === lang.code)
        return [
          lang.code,
          {
            locale: lang.code,
            name: existing?.name ?? '',
            description: existing?.description ?? '',
            metaTitle: existing?.metaTitle ?? '',
            metaDesc: existing?.metaDesc ?? '',
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
      icon,
      sortOrder,
      isPublished,
      translations: Object.values(translations),
    }
    const url = initialData
      ? `/api/admin/categories/${initialData.id}`
      : '/api/admin/categories'
    const method = initialData ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      router.push('/admin/categories')
      router.refresh()
    } else {
      alert('Error saving category')
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
            placeholder="figma"
            required
          />
        </div>
        <div>
          <Label htmlFor="icon">Icon (emoji)</Label>
          <Input
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🎨"
          />
        </div>
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
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
                  <Label>Name</Label>
                  <Input
                    value={translations[loc]?.name ?? ''}
                    onChange={(e) => updateTranslation(loc, 'name', e.target.value)}
                    placeholder={`Category name in ${lang.name}`}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={translations[loc]?.description ?? ''}
                    onChange={(e) => updateTranslation(loc, 'description', e.target.value)}
                    rows={3}
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
                  <Label>Meta Description (SEO override)</Label>
                  <Textarea
                    value={translations[loc]?.metaDesc ?? ''}
                    onChange={(e) => updateTranslation(loc, 'metaDesc', e.target.value)}
                    rows={2}
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
          onClick={() => router.push('/admin/categories')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
