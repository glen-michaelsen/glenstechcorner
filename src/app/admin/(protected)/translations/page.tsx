import Link from 'next/link'
import { Button } from '@/components/ui/button'

const NAMESPACES = [
  { key: 'home', label: 'Home Page', description: 'Hero title, subtitle, section headings' },
  { key: 'nav', label: 'Navigation', description: 'Menu labels' },
  { key: 'footer', label: 'Footer', description: 'Tagline, copyright text' },
  { key: 'category', label: 'Category Page', description: 'Video count label, empty state' },
  { key: 'video', label: 'Video Page', description: 'Published label, back link, watch on YouTube' },
]

export default function TranslationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">UI Translations</h1>
        <p className="text-sm text-slate-500 mt-1">Manage static text strings for each page. Leave blank to use the default English text.</p>
      </div>

      <div className="grid gap-3">
        {NAMESPACES.map((ns) => (
          <div key={ns.key} className="bg-white rounded-lg border px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{ns.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{ns.description}</p>
            </div>
            <Link href={`/admin/translations/${ns.key}`}>
              <Button variant="outline" size="sm">Edit</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
