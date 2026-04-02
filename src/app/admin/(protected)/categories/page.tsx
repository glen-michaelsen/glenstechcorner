import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { revalidatePath } from 'next/cache'

async function deleteCategory(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      translations: true,
      _count: { select: { videos: true } },
    },
  })

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
              const locales = cat.translations.map((t) => t.locale.toUpperCase())
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
                    <div className="flex gap-1">
                      {locales.map((l) => (
                        <Badge key={l} variant="outline" className="text-xs">
                          {l}
                        </Badge>
                      ))}
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
