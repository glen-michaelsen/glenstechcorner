import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import { resolve } from 'path'

// libsql requires absolute path for local SQLite files
const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db'
const url = dbUrl.startsWith('file:./') || dbUrl.startsWith('file:../')
  ? `file:${resolve(process.cwd(), dbUrl.slice(5))}`
  : dbUrl
// PrismaLibSql is a factory that accepts a libsql config object
const adapter = new PrismaLibSql({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@glenstechcorner.com' },
    update: {},
    create: {
      email: 'admin@glenstechcorner.com',
      passwordHash,
      name: 'Glen',
    },
  })

  // Languages
  const languages = [
    { code: 'en', name: 'English', isDefault: true },
    { code: 'da', name: 'Dansk' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'sv', name: 'Svenska' },
    { code: 'no', name: 'Norsk' },
  ]
  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name },
      create: { code: lang.code, name: lang.name, isDefault: lang.isDefault ?? false, isActive: lang.code === 'en' || lang.code === 'da' },
    })
  }

  // Categories
  const categories = [
    {
      slug: 'figma',
      icon: '🎨',
      sortOrder: 1,
      isPublished: true,
      en: { name: 'Figma', description: 'Tutorials on Figma — the design tool for teams.' },
      da: { name: 'Figma', description: 'Tutorials til Figma — designværktøjet for teams.' },
    },
    {
      slug: 'google-sheets',
      icon: '📊',
      sortOrder: 2,
      isPublished: true,
      en: { name: 'Google Sheets', description: 'Master Google Sheets with practical tips.' },
      da: { name: 'Google Sheets', description: 'Bliv ekspert i Google Sheets med praktiske tips.' },
    },
    {
      slug: 'claude',
      icon: '🤖',
      sortOrder: 3,
      isPublished: true,
      en: { name: 'Claude', description: 'Get the most out of Claude AI.' },
      da: { name: 'Claude', description: 'Få mest muligt ud af Claude AI.' },
    },
    {
      slug: 'chatgpt',
      icon: '💬',
      sortOrder: 4,
      isPublished: true,
      en: { name: 'ChatGPT', description: 'Tips and tricks for ChatGPT.' },
      da: { name: 'ChatGPT', description: 'Tips og tricks til ChatGPT.' },
    },
    {
      slug: 'photoshop',
      icon: '🖼️',
      sortOrder: 5,
      isPublished: true,
      en: { name: 'Photoshop', description: 'Photoshop tutorials for beginners and pros.' },
      da: { name: 'Photoshop', description: 'Photoshop tutorials til begyndere og øvede.' },
    },
  ]

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { icon: cat.icon, sortOrder: cat.sortOrder, isPublished: cat.isPublished },
      create: { slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder, isPublished: cat.isPublished },
    })
    for (const [locale, t] of [['en', cat.en], ['da', cat.da]] as const) {
      await prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: created.id, locale } },
        update: { name: t.name, description: t.description },
        create: { categoryId: created.id, locale, name: t.name, description: t.description },
      })
    }
  }

  // Sample video in Figma category
  const figmaCategory = await prisma.category.findUnique({ where: { slug: 'figma' } })
  if (figmaCategory) {
    const video = await prisma.video.upsert({
      where: { slug: 'auto-layout-in-figma' },
      update: {},
      create: {
        slug: 'auto-layout-in-figma',
        youtubeId: 'dQw4w9WgXcQ', // placeholder
        publishedAt: new Date('2024-01-15'),
        isPublished: true,
        categoryId: figmaCategory.id,
      },
    })
    await prisma.videoTranslation.upsert({
      where: { videoId_locale: { videoId: video.id, locale: 'en' } },
      update: {},
      create: {
        videoId: video.id,
        locale: 'en',
        title: 'Auto Layout in Figma — Complete Guide',
        subtitle: 'Learn how to use Auto Layout to build responsive components',
        description: 'In this tutorial, we dive deep into Figma\'s Auto Layout feature. You\'ll learn how to create flexible, responsive components that adapt to content changes automatically.\n\nTopics covered:\n- What is Auto Layout?\n- Setting up your first Auto Layout frame\n- Horizontal and vertical layouts\n- Nesting Auto Layouts\n- Practical real-world examples',
        metaTitle: 'Auto Layout in Figma — Complete Guide | Glen\'s Tech Corner',
        metaDesc: 'Learn how to use Auto Layout in Figma to build responsive components. A step-by-step guide for beginners.',
        metaKeywords: 'figma, auto layout, figma tutorial, responsive design, figma components',
      },
    })
    await prisma.videoTranslation.upsert({
      where: { videoId_locale: { videoId: video.id, locale: 'da' } },
      update: {},
      create: {
        videoId: video.id,
        locale: 'da',
        title: 'Auto Layout i Figma — Komplet guide',
        subtitle: 'Lær at bruge Auto Layout til at bygge responsive komponenter',
        description: 'I denne tutorial dykker vi ned i Figma\'s Auto Layout funktion. Du lærer at oprette fleksible, responsive komponenter, der tilpasser sig indholdsændringer automatisk.',
        metaTitle: 'Auto Layout i Figma — Komplet guide | Glen\'s Tech Corner',
        metaDesc: 'Lær at bruge Auto Layout i Figma til at bygge responsive komponenter. En trin-for-trin guide til begyndere.',
        metaKeywords: 'figma, auto layout, figma tutorial, responsivt design, figma komponenter',
      },
    })
  }

  console.log('✅ Seed complete')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
