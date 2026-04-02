import { prisma } from '@/lib/prisma'
import { VideoForm } from '@/components/admin/VideoForm'

export default async function NewVideoPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { translations: { where: { locale: 'en' } } },
  })
  const cats = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.translations[0]?.name ?? c.slug,
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Video</h1>
      <VideoForm categories={cats} />
    </div>
  )
}
