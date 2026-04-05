import '@/app/globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={null}><GoogleAnalytics /></Suspense>
        {children}
      </body>
    </html>
  )
}
