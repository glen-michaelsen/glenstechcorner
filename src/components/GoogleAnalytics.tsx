'use client'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const GA_ID = 'G-RYGYC111PR'
const LIVE_DOMAIN = 'glenstechcorner.com'

function isLive() {
  if (typeof window === 'undefined') return false
  return window.location.hostname === LIVE_DOMAIN || window.location.hostname === `www.${LIVE_DOMAIN}`
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isLive()) return
    if (typeof window.gtag === 'undefined') return
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    window.gtag('config', GA_ID, { page_path: url })
  }, [pathname, searchParams])

  if (!isLive()) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  )
}
