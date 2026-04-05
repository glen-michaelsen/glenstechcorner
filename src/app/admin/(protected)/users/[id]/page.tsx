import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { updateUser } from '../actions'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) notFound()

  const action = updateUser.bind(null, id)

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            name="name"
            defaultValue={user.name ?? ''}
            placeholder="Glen"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            defaultValue={user.email}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span>
          </label>
          <input
            name="password"
            type="password"
            minLength={6}
            placeholder="Min. 6 characters"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Save Changes</Button>
          <a href="/admin/users"><Button variant="outline" type="button">Cancel</Button></a>
        </div>
      </form>
    </div>
  )
}
