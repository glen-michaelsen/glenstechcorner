import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { revalidatePath } from 'next/cache'

const CAT_FIELDS = ['name', 'description', 'metaTitle', 'metaDesc'] as const
type CT = { name: string; description: string | null; metaTitle: string | null; metaDesc: string | null }

function catTranslationStatus(defaultT: CT | undefined, targetT: CT | undefined): 'full' | 'partial' | 'none' {
  if (!targetT) return 'none'
  if (!defaultT) return 'full'
  const needed = CAT_FIELDS.filter((f) => !!defaultT[f])
  const done = needed.filter((f) => !!targetT[f])
  if (done.length === needed.length) return 'full'
  if (done.length > 0) return 'partial'
  return 'none'
}

async function deleteCategory(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
}

export default async function CategoriesPage() {
  const [categories, activeLanguages] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: true,
        _count: { select: { videos: true } },
      },
    }),
    prisma.language.findMany({ where: { isActive: true } }),
  ])

  const defaultCode = activeLanguages.find((l) => l.isDefault)?.code ?? 'en'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/admin/categories/new">
          <Button>New Category</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Icon</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Name (EN)</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Videos</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Translations</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const enT = cat.translations.find((t) => t.locale === 'en')
              const defaultT = cat.translations.find((t) => t.locale === defaultCode)
              return (
                <tr key={cat.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">{cat.icon ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3">
                    {enT?.name ?? <span className="text-slate-400">No EN translation</span>}
                  </td>
                  <td className="px-4 py-3">{cat._count.videos}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cat.isPublished ? 'default' : 'secondary'}>
                      {cat.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {activeLanguages.map((lang) => {
                        const t = cat.translations.find((tr) => tr.locale === lang.code)
                        let style: React.CSSProperties | undefined
                        if (lang.isDefault) {
                          style = t ? { background: '#DCFCE7', color: '#166534' } : undefined
                        } else {
                          const status = catTranslationStatus(defaultT, t)
                          if (status === 'full') style = { background: '#DCFCE7', color: '#166534' }
                          else if (status === 'partial') style = { background: '#FEF9C3', color: '#854D0E' }
                        }
                        return (
                          <Badge
                            key={lang.code}
                            variant="outline"
                            className="text-xs border-0"
                            style={style}
                          >
                            {lang.code.toUpperCase()}
                          </Badge>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/categories/${cat.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={cat.id} />
                        <Button variant="destructive" size="sm" type="submit">Delete</Button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No categories yet.</p>
        )}
      </div>
    </div>
  )
}
