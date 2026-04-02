import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { extractYouTubeId } from '@/lib/youtube'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

  const video = await prisma.video.create({
    data: {
      slug,
      youtubeId,
      thumbnailUrl: thumbnailUrl || null,
      publishedAt: new Date(publishedAt),
      isPublished: isPublished ?? false,
      categoryId,
      translations: {
        create: translations
          .filter((t: { title: string }) => t.title)
          .map(
            (t: {
              locale: string
              title: string
              subtitle?: string
              description: string
              metaTitle?: string
              metaDesc?: string
              metaKeywords?: string
            }) => ({
              locale: t.locale,
              title: t.title,
              subtitle: t.subtitle || null,
              description: t.description || '',
              metaTitle: t.metaTitle || null,
              metaDesc: t.metaDesc || null,
              metaKeywords: t.metaKeywords || null,
            })
          ),
      },
    },
  })

  return NextResponse.json(video)
}
