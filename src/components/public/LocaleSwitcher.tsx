'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'

interface Props {
  locales: string[]
}

export default function LocaleSwitcher({ locales }: Props) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale as typeof locale })
  }

  if (locales.length <= 1) return null

  return (
    <div className="flex gap-1">
      {locales.map((loc) => (
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
