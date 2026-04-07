import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Skeleton } from '@components/ui/skeleton'
import { useDashboardStats } from '@hooks/useDashboard'
import { useSubscriptions } from '@hooks/useSubscriptions'
import { formatCurrency, calculateMonthlyCost } from '@lib/utils'

export function Analytics() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { subscriptions, isLoading: subsLoading } = useSubscriptions()

  const isLoading = statsLoading || subsLoading

  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  const categoryData = stats?.byCategory.map((cat) => ({
    name: cat.categoryName,
    value: cat.total,
    color: cat.categoryColor,
  })) || []

  const billingCycleData = [
    { name: 'Weekly', value: 0, color: '#FF6B6B' },
    { name: 'Monthly', value: 0, color: '#4ECDC4' },
    { name: 'Quarterly', value: 0, color: '#45B7D1' },
    { name: 'Yearly', value: 0, color: '#96CEB4' },
  ]

  subscriptions?.forEach((sub) => {
    if (!sub.is_active) return
    const monthly = calculateMonthlyCost(sub.cost, sub.billing_cycle)
    const cycle = billingCycleData.find((c) => c.name.toLowerCase() === sub.billing_cycle)
    if (cycle) cycle.value += monthly
  })

  const filteredBillingData = billingCycleData.filter((d) => d.value > 0)

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Analytics</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              Total Monthly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatCurrency(stats?.totalMonthly || 0, 'USD')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              Total Yearly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {formatCurrency(stats?.totalYearly || 0, 'USD')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* By Category */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, 'USD')}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(cat.value, 'USD')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Billing Cycle */}
      {filteredBillingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By billing cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredBillingData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                  >
                    {filteredBillingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, 'USD')}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {!categoryData.length && !filteredBillingData.length && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Add subscriptions to see analytics</p>
        </Card>
      )}
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-20 rounded-lg" />
      </div>
      <Skeleton className="h-80 rounded-lg" />
    </div>
  )
}
