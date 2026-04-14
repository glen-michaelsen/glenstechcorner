import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { revalidatePath } from 'next/cache'

const VIDEO_FIELDS = ['title', 'subtitle', 'description', 'metaTitle', 'metaDesc', 'metaKeywords'] as const
type VT = { title: string; subtitle: string | null; description: string; metaTitle: string | null; metaDesc: string | null; metaKeywords: string | null }

function videoTranslationStatus(defaultT: VT | undefined, targetT: VT | undefined): 'full' | 'partial' | 'none' {
  if (!targetT) return 'none'
  if (!defaultT) return 'full'
  const needed = VIDEO_FIELDS.filter((f) => !!defaultT[f])
  const done = needed.filter((f) => !!targetT[f])
  if (done.length === needed.length) return 'full'
  if (done.length > 0) return 'partial'
  return 'none'
}

async function deleteVideo(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await prisma.video.delete({ where: { id } })
  revalidatePath('/admin/videos')
}

export default async function VideosPage() {
  const [videos, activeLanguages] = await Promise.all([
    prisma.video.findMany({
      orderBy: { publishedAt: 'desc' },
      include: {
        translations: true,
        category: { include: { translations: { where: { locale: 'en' } } } },
      },
    }),
    prisma.language.findMany({ where: { isActive: true } }),
  ])

  const defaultCode = activeLanguages.find((l) => l.isDefault)?.code ?? 'en'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Videos</h1>
        <Link href="/admin/videos/new">
          <Button>New Video</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Title (EN)</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Category</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Published</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Translations</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => {
              const enT = video.translations.find((t) => t.locale === 'en')
              const defaultT = video.translations.find((t) => t.locale === defaultCode)
              const catName = video.category.translations[0]?.name ?? video.category.slug
              return (
                <tr key={video.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {enT?.title ?? (
                      <span className="text-slate-400">No EN translation</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{catName}</td>
                  <td className="px-4 py-3">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={video.isPublished ? 'default' : 'secondary'}>
                      {video.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {activeLanguages.map((lang) => {
                        const t = video.translations.find((tr) => tr.locale === lang.code)
                        let style: React.CSSProperties | undefined
                        if (lang.isDefault) {
                          style = t ? { background: '#DCFCE7', color: '#166534' } : undefined
                        } else {
                          const status = videoTranslationStatus(defaultT, t)
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
                      <Link href={`/admin/videos/${video.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <form action={deleteVideo}>
                        <input type="hidden" name="id" value={video.id} />
                        <Button variant="destructive" size="sm" type="submit">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {videos.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No videos yet.</p>
        )}
      </div>
    </div>
  )
}
