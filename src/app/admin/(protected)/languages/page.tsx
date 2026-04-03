import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteLanguage } from './actions'

export default async function LanguagesPage() {
  const languages = await prisma.language.findMany({ orderBy: { code: 'asc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Languages</h1>
        <Link href="/admin/languages/new">
          <Button>New Language</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Code</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Default</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((lang) => (
              <tr key={lang.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-bold">{lang.code}</td>
                <td className="px-4 py-3">{lang.name}</td>
                <td className="px-4 py-3">
                  <Badge variant={lang.isActive ? 'default' : 'secondary'}>
                    {lang.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {lang.isDefault && <Badge variant="outline">Default</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/languages/${lang.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    {!lang.isDefault && (
                      <form action={deleteLanguage}>
                        <input type="hidden" name="id" value={lang.id} />
                        <Button variant="destructive" size="sm" type="submit">Delete</Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {languages.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No languages yet.</p>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Language codes must match supported locales (en, da, de, fr, es, sv, no, nl, fi, pt, it, pl). Active languages appear on the public site.
      </p>
    </div>
  )
}
