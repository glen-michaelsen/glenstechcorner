import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'da', 'de', 'fr', 'es', 'sv', 'no', 'nl', 'fi', 'pt', 'it', 'pl'],
  defaultLocale: 'en',
  localePrefix: 'always',
})

export type Locale = (typeof routing.locales)[number]
