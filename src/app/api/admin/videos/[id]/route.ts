import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { extractYouTubeId } from '@/lib/youtube'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const {
    slug,
    youtubeId: rawYouTubeId,
    thumbnailUrl,
    publishedAt,
    isPublished,
    categoryId,
    translations,
  } = body

  const youtubeId = extractYouTubeId(rawYouTubeId) ?? rawYouTubeId

  await prisma.video.update({
    where: { id },
    data: {
      slug,
      youtubeId,
      thumbnailUrl: thumbnailUrl || null,
      publishedAt: new Date(publishedAt),
      isPublished,
      categoryId,
    },
  })

  for (const t of translations) {
    if (!t.title) continue
    await prisma.videoTranslation.upsert({
      where: { videoId_locale: { videoId: id, locale: t.locale } },
      create: {
        videoId: id,
        locale: t.locale,
        title: t.title,
        subtitle: t.subtitle || null,
        description: t.description || '',
        metaTitle: t.metaTitle || null,
        metaDesc: t.metaDesc || null,
        metaKeywords: t.metaKeywords || null,
      },
      update: {
        title: t.title,
        subtitle: t.subtitle || null,
        description: t.description || '',
        metaTitle: t.metaTitle || null,
        metaDesc: t.metaDesc || null,
        metaKeywords: t.metaKeywords || null,
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
  await prisma.video.delete({ where: { id } })
  revalidatePath('/[locale]', 'layout')
  return NextResponse.json({ success: true })
}
