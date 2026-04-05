import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { prisma } from '@/lib/prisma'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale
  }

  // Load base messages from JSON file, fall back to English
  // Deep clone to avoid mutating the cached module object across requests
  let messages: Record<string, Record<string, string>>
  try {
    messages = JSON.parse(JSON.stringify((await import(`./messages/${locale}.json`)).default))
  } catch {
    messages = JSON.parse(JSON.stringify((await import(`./messages/en.json`)).default))
  }

  // Fetch DB overrides and merge on top
  try {
    const dbTranslations = await prisma.uITranslation.findMany({ where: { locale } })
    for (const t of dbTranslations) {
      if (!messages[t.namespace]) messages[t.namespace] = {}
      messages[t.namespace][t.key] = t.value
    }
  } catch {
    // DB might not have the table yet — silently fall back to JSON only
  }

  return { locale, messages }
})
