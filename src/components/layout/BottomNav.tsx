import { LayoutDashboard, List, PieChart } from 'lucide-react'
import { cn } from '@lib/utils'

interface BottomNavProps {
  currentScreen: string
  onNavigate: (screen: 'dashboard' | 'subscriptions' | 'analytics') => void
}

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'subscriptions', label: 'Subs', icon: List },
  { id: 'analytics', label: 'Stats', icon: PieChart },
]

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-6 pt-2"
      style={{
        background: 'linear-gradient(to top, rgba(6, 10, 8, 0.98) 30%, rgba(6, 10, 8, 0) 100%)',
        pointerEvents: 'none',
      }}
    >
      <nav
        className="nav-pill flex w-full max-w-sm items-center gap-1 rounded-[1.75rem] p-1.5"
        style={{ pointerEvents: 'auto' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as 'dashboard' | 'subscriptions' | 'analytics')}
              className={cn(
                'nav-pill-item relative flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-3 text-sm',
                isActive ? 'active text-lime-50' : 'text-lime-100/50'
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  className="h-[20px] w-[20px] transition-all duration-300"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'text-[11px] font-semibold transition-all duration-300',
                    isActive ? 'text-lime-50' : 'text-lime-100/45'
                  )}
                >
                  {item.label}
                </span>
              </div>

              {isActive && (
                <div
                  className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full"
                  style={{
                    background: 'rgba(217,249,157,0.94)',
                    boxShadow: '0 0 10px rgba(190,242,100,0.65)',
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
