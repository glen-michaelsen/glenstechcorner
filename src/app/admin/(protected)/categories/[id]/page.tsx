import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/admin/CategoryForm'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id },
    include: { translations: true },
  })
  if (!category) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Category: {category.slug}</h1>
      <CategoryForm
        initialData={{
          ...category,
          icon: category.icon ?? '',
          translations: category.translations.map((t) => ({
            ...t,
            description: t.description ?? '',
            metaTitle: t.metaTitle ?? '',
            metaDesc: t.metaDesc ?? '',
          })),
        }}
      />
    </div>
  )
}
