'use client'
import { Button } from '@/components/ui/button'
import { signOutAction } from '@/app/admin/(protected)/actions'

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button variant="outline" size="sm" type="submit" className="w-full">
        Sign out
      </Button>
    </form>
  )
}
