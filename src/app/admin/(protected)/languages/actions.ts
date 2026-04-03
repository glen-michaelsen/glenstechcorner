'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLanguage(formData: FormData) {
  const code = (formData.get('code') as string).toLowerCase().trim()
  const name = (formData.get('name') as string).trim()
  const isDefault = formData.get('isDefault') === 'on'
  if (isDefault) {
    await prisma.language.updateMany({ data: { isDefault: false } })
  }
  await prisma.language.create({ data: { code, name, isDefault, isActive: true } })
  revalidatePath('/admin/languages')
  redirect('/admin/languages')
}

export async function updateLanguage(id: string, formData: FormData) {
  const name = (formData.get('name') as string).trim()
  const isActive = formData.get('isActive') === 'on'
  const isDefault = formData.get('isDefault') === 'on'
  if (isDefault) {
    await prisma.language.updateMany({ data: { isDefault: false } })
  }
  await prisma.language.update({ where: { id }, data: { name, isActive, isDefault } })
  revalidatePath('/admin/languages')
  redirect('/admin/languages')
}

export async function deleteLanguage(formData: FormData) {
  const id = formData.get('id') as string
  const lang = await prisma.language.findUnique({ where: { id } })
  if (lang?.isDefault) throw new Error('Cannot delete the default language')
  await prisma.language.delete({ where: { id } })
  revalidatePath('/admin/languages')
}
