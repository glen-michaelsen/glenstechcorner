'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveTranslations(formData: FormData) {
  const entries = Array.from(formData.entries()) as [string, string][]
  for (const [fieldKey, value] of entries) {
    // fieldKey format: "locale::namespace::key"
    const parts = fieldKey.split('::')
    if (parts.length !== 3) continue
    const [locale, namespace, key] = parts
    if (!value.trim()) {
      // Delete if empty (fall back to JSON default)
      await prisma.uITranslation.deleteMany({ where: { locale, namespace, key } })
    } else {
      await prisma.uITranslation.upsert({
        where: { locale_namespace_key: { locale, namespace, key } },
        update: { value: value.trim() },
        create: { locale, namespace, key, value: value.trim() },
      })
    }
  }
  revalidatePath('/admin/translations')
}
