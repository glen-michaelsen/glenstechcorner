import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteUser } from './actions'

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Users</h1>
        <Link href="/admin/users/new">
          <Button>New User</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-700">Created</th>
              <th className="text-right px-4 py-3 font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">{user.name ?? <span className="text-slate-400">—</span>}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    {users.length > 1 && (
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={user.id} />
                        <Button variant="destructive" size="sm" type="submit">Delete</Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
