import { createUser } from '../actions'
import { Button } from '@/components/ui/button'

export default function NewUserPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">New Admin User</h1>
      <form action={createUser} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            name="name"
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
            placeholder="admin@example.com"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Min. 6 characters"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Create User</Button>
          <a href="/admin/users"><Button variant="outline" type="button">Cancel</Button></a>
        </div>
      </form>
    </div>
  )
}
