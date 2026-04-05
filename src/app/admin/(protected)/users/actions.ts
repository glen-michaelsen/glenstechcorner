'use server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUser(formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const name = (formData.get('name') as string).trim()
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({ data: { email, name: name || null, passwordHash } })
  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function updateUser(id: string, formData: FormData) {
  const email = (formData.get('email') as string).trim().toLowerCase()
  const name = (formData.get('name') as string).trim()
  const password = formData.get('password') as string

  const data: { email: string; name: string | null; passwordHash?: string } = {
    email,
    name: name || null,
  }

  if (password && password.length > 0) {
    if (password.length < 6) throw new Error('Password must be at least 6 characters')
    data.passwordHash = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({ where: { id }, data })
  revalidatePath('/admin/users')
  redirect('/admin/users')
}

export async function deleteUser(formData: FormData) {
  const id = formData.get('id') as string
  const count = await prisma.user.count()
  if (count <= 1) throw new Error('Cannot delete the last admin user')
  await prisma.user.delete({ where: { id } })
  revalidatePath('/admin/users')
}
