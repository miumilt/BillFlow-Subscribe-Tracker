import { Sparkles, Wallet } from 'lucide-react'
import type { User } from '@types'

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className="glass-card-elevated animate-fadeInUp rounded-3xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #a3e635 0%, #4ade80 100%)',
                boxShadow: '0 8px 22px rgba(132,204,22,0.38)',
              }}
            >
              <Wallet className="h-5 w-5 text-emerald-950" strokeWidth={2.4} />
            </div>

            <div>
              <p className="gradient-text text-[18px] font-bold tracking-tight">BillFlow</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-lime-100/65">
                <Sparkles className="h-2.5 w-2.5 text-lime-300" />
                Widgets mode
              </p>
            </div>
          </div>

          {user.photo_url ? (
            <div className="relative">
              <img
                src={user.photo_url}
                alt={user.first_name}
                className="h-10 w-10 rounded-2xl object-cover ring-2 ring-lime-200/25"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-lime-300 ring-2 ring-green-950" />
            </div>
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-lime-100"
              style={{
                background: 'linear-gradient(135deg, rgba(132,204,22,0.45), rgba(34,197,94,0.45))',
                border: '1px solid rgba(190,242,100,0.38)',
              }}
            >
              {user.first_name[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
