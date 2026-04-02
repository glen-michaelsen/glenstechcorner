import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { slug, icon, sortOrder, isPublished, translations } = body

  const category = await prisma.category.create({
    data: {
      slug,
      icon: icon || null,
      sortOrder: sortOrder ?? 0,
      isPublished: isPublished ?? false,
      translations: {
        create: translations
          .filter((t: { name: string }) => t.name)
          .map(
            (t: {
              locale: string
              name: string
              description?: string
              metaTitle?: string
              metaDesc?: string
            }) => ({
              locale: t.locale,
              name: t.name,
              description: t.description || null,
              metaTitle: t.metaTitle || null,
              metaDesc: t.metaDesc || null,
            })
          ),
      },
    },
  })

  return NextResponse.json(category)
}
