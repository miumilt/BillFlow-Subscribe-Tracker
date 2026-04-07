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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background px-4 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as 'dashboard' | 'subscriptions' | 'analytics')}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
