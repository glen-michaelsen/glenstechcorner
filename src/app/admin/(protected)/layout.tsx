import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/admin/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <p className="font-bold text-slate-900">Admin</p>
          <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/categories', label: 'Categories' },
            { href: '/admin/videos', label: 'Videos' },
            { href: '/admin/languages', label: 'Languages' },
            { href: '/admin/translations', label: 'Translations' },
            { href: '/admin/users', label: 'Users' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-12 overflow-auto">{children}</main>
    </div>
  )
}
