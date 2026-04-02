import { getTranslations } from 'next-intl/server'

export default async function Footer() {
  const t = await getTranslations('footer')
  const year = new Date().getFullYear()
  return (
    <footer style={{ background: '#181818' }} className="mt-0 py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-bold text-white text-base" style={{ letterSpacing: '-0.02em' }}>Glen&apos;s Tech Corner</p>
            <p className="mt-1 text-sm" style={{ color: '#555' }}>{t('tagline')}</p>
          </div>
          <p className="text-xs" style={{ color: '#444' }}>{t('copyright', { year })}</p>
        </div>
      </div>
    </footer>
  )
}
