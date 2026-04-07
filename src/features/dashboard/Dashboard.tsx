import { Plus, TrendingUp, Calendar, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Badge } from '@components/ui/badge'
import { Skeleton } from '@components/ui/skeleton'
import { useDashboardStats } from '@hooks/useDashboard'
import { useSubscriptions } from '@hooks/useSubscriptions'
import { formatCurrency, formatRelativeDate, getDaysUntil } from '@lib/utils'

interface DashboardProps {
  onAddClick: () => void
}

export function Dashboard({ onAddClick }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { subscriptions, isLoading: subsLoading } = useSubscriptions()

  const isLoading = statsLoading || subsLoading

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!subscriptions?.length) {
    return <EmptyState onAddClick={onAddClick} />
  }

  return (
    <div className="space-y-4 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold">
                {formatCurrency(stats?.totalMonthly || 0, 'USD')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yearly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">
                {formatCurrency(stats?.totalYearly || 0, 'USD')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions Count */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active subscriptions</p>
              <p className="text-3xl font-bold">{stats?.activeCount || 0}</p>
            </div>
            <div className="rounded-full bg-primary/20 p-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Renewals */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Upcoming renewals</h2>
        <div className="space-y-2">
          {stats?.upcomingRenewals?.map((sub) => {
            const daysUntil = getDaysUntil(sub.next_payment_date)
            const isUrgent = daysUntil <= 3
            
            return (
              <Card key={sub.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: sub.category?.color || '#ccc' }}
                      >
                        <span className="text-sm font-bold text-white">
                          {sub.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{sub.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRelativeDate(sub.next_payment_date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(sub.cost, sub.currency)}
                      </p>
                      <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
                        {daysUntil} days
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          
          {(!stats?.upcomingRenewals?.length) && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No renewals in the next 30 days</p>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Add Button */}
      <Button onClick={onAddClick} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add subscription
      </Button>
    </div>
  )
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-6">
        <CreditCard className="h-12 w-12 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">No subscriptions yet</h2>
      <p className="mb-6 max-w-xs text-muted-foreground">
        Track your recurring expenses and never miss a payment again
      </p>
      <Button onClick={onAddClick} size="lg">
        <Plus className="mr-2 h-4 w-4" />
        Add your first subscription
      </Button>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-20 rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
