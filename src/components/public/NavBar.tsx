import Link from 'next/link'
import LocaleSwitcher from './LocaleSwitcher'
import { getLocale } from 'next-intl/server'

export default async function NavBar() {
  const locale = await getLocale()

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e8e8' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center">
          <img src="/logo.svg" alt="Glen's Tech Corner" height={38} style={{ height: '38px', width: 'auto' }} />
        </Link>
        <LocaleSwitcher />
      </div>
    </nav>
  )
}
