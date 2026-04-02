import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { VideoForm } from '@/components/admin/VideoForm'

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [video, categories] = await Promise.all([
    prisma.video.findUnique({
      where: { id },
      include: { translations: true },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { translations: { where: { locale: 'en' } } },
    }),
  ])
  if (!video) notFound()

  const cats = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.translations[0]?.name ?? c.slug,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Video</h1>
      <VideoForm
        categories={cats}
        initialData={{
          ...video,
          thumbnailUrl: video.thumbnailUrl ?? '',
          publishedAt: video.publishedAt.toISOString(),
          translations: video.translations.map((t) => ({
            ...t,
            subtitle: t.subtitle ?? '',
            metaTitle: t.metaTitle ?? '',
            metaDesc: t.metaDesc ?? '',
            metaKeywords: t.metaKeywords ?? '',
          })),
        }}
      />
    </div>
  )
}
