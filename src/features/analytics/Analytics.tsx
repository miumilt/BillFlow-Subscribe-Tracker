import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useDashboardStats } from '@hooks/useDashboard'
import { useSubscriptions } from '@hooks/useSubscriptions'
import { calculateMonthlyCost, formatCurrency } from '@lib/utils'
import type { SubscriptionWithCategory } from '@types'

type ChartDatum = {
  name: string
  value: number
  color: string
}

const cyclePalette: ChartDatum[] = [
  { name: 'Weekly', value: 0, color: '#4ade80' },
  { name: 'Monthly', value: 0, color: '#84cc16' },
  { name: 'Quarterly', value: 0, color: '#22c55e' },
  { name: 'Yearly', value: 0, color: '#facc15' },
]

export function Analytics() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { subscriptions, isLoading: subsLoading } = useSubscriptions()
  const isLoading = statsLoading || subsLoading

  if (isLoading) return <AnalyticsSkeleton />

  const categoryData: ChartDatum[] =
    stats?.byCategory.map(
      (cat: { categoryName: string; total: number; categoryColor: string }) => ({
        name: cat.categoryName,
        value: cat.total,
        color: cat.categoryColor,
      })
    ) || []

  const billingCycleData = cyclePalette.map((item) => ({ ...item }))

  subscriptions?.forEach((sub: SubscriptionWithCategory) => {
    if (!sub.is_active) return

    const monthly = calculateMonthlyCost(sub.cost, sub.billing_cycle)
    const cycle = billingCycleData.find((c) => c.name.toLowerCase() === sub.billing_cycle)
    if (cycle) cycle.value += monthly
  })

  const filteredBillingData = billingCycleData.filter((d) => d.value > 0)
  const hasData = categoryData.length > 0 || filteredBillingData.length > 0

  return (
    <div className="space-y-5 p-4 pb-2">
      <h1 className="animate-fadeInUp text-[1.4rem] font-bold tracking-tight text-white">
        Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid animate-fadeInUp grid-cols-2 gap-3 delay-100">
        <SummaryCard
          label="Monthly"
          value={formatCurrency(stats?.totalMonthly || 0, 'USD')}
          gradient="linear-gradient(145deg, rgba(132, 204, 22, 0.34) 0%, rgba(74, 222, 128, 0.22) 100%)"
          border="rgba(163, 230, 53, 0.3)"
          icon="M"
        />
        <SummaryCard
          label="Yearly"
          value={formatCurrency(stats?.totalYearly || 0, 'USD')}
          gradient="linear-gradient(145deg, rgba(34, 197, 94, 0.34) 0%, rgba(22, 163, 74, 0.22) 100%)"
          border="rgba(74, 222, 128, 0.3)"
          icon="Y"
        />
      </div>

      {categoryData.length > 0 && (
        <MetricCard title="By category" data={categoryData} delay="delay-150" />
      )}

      {filteredBillingData.length > 0 && (
        <MetricCard
          title="By billing cycle"
          data={filteredBillingData}
          delay="delay-200"
          postfix="/mo"
        />
      )}

      {!hasData && (
        <div className="glass-card-subtle animate-fadeInUp rounded-2xl px-6 py-12 text-center delay-200">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(132, 204, 22, 0.14)' }}
          >
            <svg
              className="h-8 w-8 text-lime-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-base font-semibold text-white">No analytics yet</p>
          <p className="mt-2 text-sm text-slate-400">Add subscriptions to unlock trend visuals.</p>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  gradient,
  border,
  icon,
}: {
  label: string
  value: string
  gradient: string
  border: string
  icon: string
}) {
  return (
    <article
      className="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]"
      style={{ background: gradient, border: `1px solid ${border}` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">{label}</p>
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold text-white"
          style={{ background: 'rgba(255, 255, 255, 0.15)' }}
        >
          {icon}
        </div>
      </div>
      <p className="mono mt-3 text-xl font-bold text-white">{value}</p>
    </article>
  )
}

function MetricCard({
  title,
  data,
  delay,
  postfix = '',
}: {
  title: string
  data: ChartDatum[]
  delay: string
  postfix?: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const tooltipStyle = {
    contentStyle: {
      background: 'rgba(20, 25, 45, 0.95)',
      border: '1px solid rgba(132, 204, 22, 0.26)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '12px',
      backdropFilter: 'blur(16px)',
    },
    labelStyle: { color: 'rgba(226, 232, 240, 0.72)' },
  }

  return (
    <section className={`glass-card animate-fadeInUp rounded-2xl p-5 ${delay}`}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              {...tooltipStyle}
              formatter={(value: number) => [formatCurrency(value, 'USD') + postfix, '']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 space-y-3">
        {data.map((item) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0

          return (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      background: item.color,
                      boxShadow: `0 0 8px ${item.color}40`,
                    }}
                  />
                  <span className="text-sm font-medium text-white/90">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{pct}%</span>
                  <span className="mono text-sm font-semibold text-white">
                    {formatCurrency(item.value, 'USD')}
                    {postfix}
                  </span>
                </div>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: item.color,
                    boxShadow: `0 0 12px ${item.color}60`,
                    transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-5 p-4">
      <div className="shimmer h-8 w-32 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="shimmer h-24 rounded-2xl" />
        <div className="shimmer h-24 rounded-2xl" />
      </div>
      <div className="shimmer h-96 rounded-2xl" />
    </div>
  )
}
