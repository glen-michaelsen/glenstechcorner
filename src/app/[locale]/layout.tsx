import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import NavBar from '@/components/public/NavBar'
import Footer from '@/components/public/Footer'
import { routing } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const languages = await prisma.language.findMany({ where: { isActive: true }, select: { code: true } })
  return languages.map((l) => ({ locale: l.code }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // Check it's a valid routing locale first
  if (!routing.locales.includes(locale as typeof routing.locales[number])) notFound()
  // Then check it's an active language in DB
  const language = await prisma.language.findUnique({ where: { code: locale, isActive: true } })
  if (!language) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </NextIntlClientProvider>
  )
}
