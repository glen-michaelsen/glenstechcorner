import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { routing } from '@/i18n/routing'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://glenstechcorner.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, videos] = await Promise.all([
    prisma.category.findMany({ where: { isPublished: true } }),
    prisma.video.findMany({ where: { isPublished: true }, include: { category: true } }),
  ])

  const entries: MetadataRoute.Sitemap = []

  // Home pages
  for (const locale of routing.locales) {
    entries.push({ url: `${BASE_URL}/${locale}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 })
  }

  // Category pages
  for (const locale of routing.locales) {
    for (const cat of categories) {
      entries.push({ url: `${BASE_URL}/${locale}/${cat.slug}`, lastModified: cat.updatedAt, changeFrequency: 'weekly', priority: 0.8 })
    }
  }

  // Video pages
  for (const locale of routing.locales) {
    for (const video of videos) {
      entries.push({ url: `${BASE_URL}/${locale}/${video.category.slug}/${video.slug}`, lastModified: video.updatedAt, changeFrequency: 'monthly', priority: 0.9 })
    }
  }

  return entries
}
