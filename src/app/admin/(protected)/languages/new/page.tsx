import { createLanguage } from '../actions'
import { Button } from '@/components/ui/button'

export default function NewLanguagePage() {
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">New Language</h1>
      <form action={createLanguage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Language Code <span className="text-slate-400 font-normal">(e.g. de, fr, es)</span>
          </label>
          <input
            name="code"
            required
            maxLength={5}
            placeholder="de"
            className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Language Name</label>
          <input
            name="name"
            required
            placeholder="Deutsch"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isDefault" id="isDefault" className="rounded" />
          <label htmlFor="isDefault" className="text-sm text-slate-700">Set as default language</label>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Create Language</Button>
          <a href="/admin/languages">
            <Button variant="outline" type="button">Cancel</Button>
          </a>
        </div>
      </form>
    </div>
  )
}
