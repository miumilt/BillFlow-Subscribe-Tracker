import { useState } from 'react'
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Badge } from '@components/ui/badge'
import { Skeleton } from '@components/ui/skeleton'
import { useSubscriptions } from '@hooks/useSubscriptions'
import { formatCurrency, formatDate, calculateMonthlyCost } from '@lib/utils'
import type { Subscription } from '@types'

interface SubscriptionListProps {
  onEdit: (subscription: Subscription) => void
  onAdd: () => void
}

export function SubscriptionList({ onEdit, onAdd }: SubscriptionListProps) {
  const { subscriptions, isLoading, deleteSubscription } = useSubscriptions()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredSubscriptions = subscriptions?.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? sub.is_active :
      !sub.is_active
    return matchesSearch && matchesFilter
  })

  const totalMonthly = filteredSubscriptions?.reduce(
    (sum, sub) => sum + (sub.is_active ? calculateMonthlyCost(sub.cost, sub.billing_cycle) : 0),
    0
  ) || 0

  if (isLoading) {
    return <SubscriptionListSkeleton />
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(totalMonthly, 'USD')}/month
          </p>
        </div>
        <Button onClick={onAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={filter !== 'all' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setFilter(filter === 'all' ? 'active' : filter === 'active' ? 'inactive' : 'all')}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter indicator */}
      {filter !== 'all' && (
        <Badge variant="secondary" className="w-fit">
          Showing {filter} only
          <button
            onClick={() => setFilter('all')}
            className="ml-2 text-xs hover:underline"
          >
            Clear
          </button>
        </Badge>
      )}

      {/* List */}
      <div className="space-y-2">
        {filteredSubscriptions?.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onEdit={() => onEdit(sub)}
            onDelete={() => deleteSubscription(sub.id)}
          />
        ))}

        {(!filteredSubscriptions?.length) && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? 'No subscriptions found' : 'No subscriptions yet'}
            </p>
            {!searchTerm && (
              <Button onClick={onAdd} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add your first
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

interface SubscriptionCardProps {
  subscription: Subscription & { category?: { color: string; name: string } | null }
  onEdit: () => void
  onDelete: () => void
}

function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <Card className={`overflow-hidden transition-all ${!subscription.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: subscription.category?.color || '#ccc' }}
            >
              <span className="text-lg font-bold text-white">
                {subscription.name[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{subscription.name}</p>
                {!subscription.is_active && (
                  <Badge variant="secondary" className="text-xs">Paused</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {subscription.billing_cycle} • Next: {formatDate(subscription.next_payment_date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="font-semibold">
                {formatCurrency(subscription.cost, subscription.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(calculateMonthlyCost(subscription.cost, subscription.billing_cycle), subscription.currency)}/mo
              </p>
            </div>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              
              {showActions && (
                <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-md border bg-popover p-1 shadow-md">
                  <button
                    onClick={() => {
                      onEdit()
                      setShowActions(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete()
                      setShowActions(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SubscriptionListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
