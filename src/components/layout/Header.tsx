import { User } from '@types'
import { Wallet } from 'lucide-react'

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">BillFlow</span>
        </div>
        <div className="flex items-center gap-2">
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt={user.first_name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-medium">
                {user.first_name[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
