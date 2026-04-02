'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export default function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale as 'en' | 'da' })
  }

  return (
    <div className="flex gap-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          style={loc === locale
            ? { background: 'linear-gradient(135deg, #BF1725, #830B15)', color: '#fff', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }
            : { color: '#999', padding: '4px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }
          }
          className="transition-opacity hover:opacity-70"
        >
          {loc}
        </button>
      ))}
    </div>
  )
}
