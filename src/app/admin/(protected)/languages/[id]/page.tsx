import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { updateLanguage } from '../actions'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditLanguagePage({ params }: Props) {
  const { id } = await params
  const lang = await prisma.language.findUnique({ where: { id } })
  if (!lang) notFound()

  const action = updateLanguage.bind(null, id)

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Edit Language</h1>
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Language Code</label>
          <input
            value={lang.code}
            disabled
            className="w-full border rounded-md px-3 py-2 text-sm font-mono bg-slate-50 text-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Language Name</label>
          <input
            name="name"
            required
            defaultValue={lang.name}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isActive" id="isActive" defaultChecked={lang.isActive} className="rounded" />
          <label htmlFor="isActive" className="text-sm text-slate-700">Active (visible on public site)</label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isDefault" id="isDefault" defaultChecked={lang.isDefault} disabled={lang.isDefault} className="rounded" />
          <label htmlFor="isDefault" className="text-sm text-slate-700">Default language</label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Save Changes</Button>
          <a href="/admin/languages">
            <Button variant="outline" type="button">Cancel</Button>
          </a>
        </div>
      </form>
    </div>
  )
}
