import { prisma } from '@/lib/prisma'
import { CategoryForm } from '@/components/admin/CategoryForm'

export default async function NewCategoryPage() {
  const languages = await prisma.language.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Category</h1>
      <CategoryForm languages={languages} />
    </div>
  )
}
