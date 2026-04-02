import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { slug, icon, sortOrder, isPublished, translations } = body

  await prisma.category.update({
    where: { id },
    data: {
      slug,
      icon: icon || null,
      sortOrder,
      isPublished,
    },
  })

  for (const t of translations) {
    if (!t.name) continue
    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: id, locale: t.locale } },
      create: {
        categoryId: id,
        locale: t.locale,
        name: t.name,
        description: t.description || null,
        metaTitle: t.metaTitle || null,
        metaDesc: t.metaDesc || null,
      },
      update: {
        name: t.name,
        description: t.description || null,
        metaTitle: t.metaTitle || null,
        metaDesc: t.metaDesc || null,
      },
    })
  }

  revalidatePath('/[locale]', 'layout')
  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.category.delete({ where: { id } })
  revalidatePath('/[locale]', 'layout')
  return NextResponse.json({ success: true })
}
