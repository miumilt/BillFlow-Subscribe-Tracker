import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  Plus,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useDashboardStats } from '@hooks/useDashboard'
import { useSubscriptions } from '@hooks/useSubscriptions'
import { calculateMonthlyCost, formatCurrency, formatRelativeDate, getDaysUntil } from '@lib/utils'
import type { SubscriptionWithCategory } from '@types'

interface DashboardProps {
  onAddClick: () => void
}

function getServiceToken(name: string): string {
  const cleaned = name.trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'SB'

  const words = cleaned.split(' ').filter(Boolean)
  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }

  return cleaned.slice(0, 2).toUpperCase()
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function Sparkline({ values }: { values: number[] }) {
  const hasUsefulValues = values.some((value) => value > 0)
  if (!hasUsefulValues) {
    return (
      <div className="border-lime-200/12 flex h-28 w-full items-center justify-center rounded-xl border bg-lime-100/5">
        <p className="text-xs text-lime-100/55">Add 2+ upcoming renewals for trend line</p>
      </div>
    )
  }

  const normalized =
    values.length === 1
      ? [values[0] * 0.92, values[0], values[0] * 1.06]
      : values.length === 2
        ? [values[0], (values[0] + values[1]) / 2, values[1]]
        : values

  const max = Math.max(...normalized, 1)
  const min = Math.min(...normalized, 0)
  const spread = max - min || 1

  const points = normalized
    .map((value, index) => {
      const x = (index / (normalized.length - 1 || 1)) * 100
      const y = 86 - ((value - min) / spread) * 64
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 100" className="h-28 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d9f99d" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {normalized.map((value, index) => {
        const x = (index / (normalized.length - 1 || 1)) * 100
        const y = 86 - ((value - min) / spread) * 64

        return (
          <circle
            key={`${index}-${value}`}
            cx={x}
            cy={y}
            r="2.1"
            fill="#d9f99d"
            fillOpacity="0.9"
          />
        )
      })}
    </svg>
  )
}

export function Dashboard({ onAddClick }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { subscriptions, isLoading: subsLoading } = useSubscriptions()
  const isLoading = statsLoading || subsLoading

  if (isLoading) return <DashboardSkeleton />
  if (!subscriptions?.length) return <EmptyState onAddClick={onAddClick} />

  const nextRenewal = stats?.upcomingRenewals?.[0] || null
  const pausedCount = subscriptions.filter(
    (subscription: SubscriptionWithCategory) => !subscription.is_active
  ).length
  const urgentCount = (stats?.upcomingRenewals || []).filter(
    (subscription: SubscriptionWithCategory) => getDaysUntil(subscription.next_payment_date) <= 3
  ).length

  const averageMonthly = stats?.activeCount ? (stats.totalMonthly || 0) / stats.activeCount : 0

  const mostExpensive = subscriptions.reduce((prev, current) => {
    const prevValue = calculateMonthlyCost(prev.cost, prev.billing_cycle)
    const currentValue = calculateMonthlyCost(current.cost, current.billing_cycle)
    return currentValue > prevValue ? current : prev
  }, subscriptions[0])

  const momentumValues = (stats?.upcomingRenewals || [])
    .slice(0, 6)
    .map((subscription: SubscriptionWithCategory) =>
      calculateMonthlyCost(subscription.cost, subscription.billing_cycle)
    )

  const healthScore = clamp(100 - urgentCount * 10 - pausedCount * 6, 32, 98)

  return (
    <div className="space-y-4 p-4 pb-2">
      <section className="grid animate-scaleIn grid-cols-2 gap-2.5">
        <article className="widget-card-highlight rounded-3xl p-4">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime-100/75">
              Monthly spend
            </p>
            <CircleDollarSign className="h-4 w-4 text-lime-200" />
          </div>
          <p className="mono mt-2 text-xl font-bold text-lime-50">
            {formatCurrency(stats?.totalMonthly || 0, 'USD')}
          </p>
          <p className="mt-2 text-[11px] text-lime-100/70">
            Yearly {formatCurrency(stats?.totalYearly || 0, 'USD')}
          </p>
        </article>

        <article className="widget-card rounded-3xl p-4">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lime-100/65">
              Next charge
            </p>
            <Clock3 className="h-4 w-4 text-lime-300/85" />
          </div>

          {nextRenewal ? (
            <>
              <p className="mt-2 text-sm font-semibold text-lime-50">{nextRenewal.name}</p>
              <p className="text-lime-100/68 mt-0.5 text-xs">
                {formatRelativeDate(nextRenewal.next_payment_date)}
              </p>
              <p className="mono mt-2 text-sm font-bold text-lime-200">
                {formatCurrency(nextRenewal.cost, nextRenewal.currency)}
              </p>
            </>
          ) : (
            <p className="mt-4 text-xs text-lime-100/60">No upcoming payments</p>
          )}
        </article>
      </section>

      <section className="grid animate-fadeInUp grid-cols-3 gap-2 delay-75">
        <SmallWidget label="Active" value={String(stats?.activeCount || 0)} icon={WalletCards} />
        <SmallWidget label="Paused" value={String(pausedCount)} icon={Activity} />
        <SmallWidget
          label="Avg / mo"
          value={formatCurrency(averageMonthly, 'USD')}
          icon={CalendarClock}
          mono
        />
      </section>

      <section className="glass-card animate-fadeInUp rounded-3xl p-4 delay-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lime-100/70">
              Spend momentum
            </p>
            <p className="mt-1 text-sm font-semibold text-lime-50">Next renewals trend</p>
          </div>
          <ShieldCheck className="h-5 w-5 text-lime-300/90" />
        </div>

        <div className="mt-3 rounded-2xl border border-lime-200/15 bg-lime-100/5 px-3 py-2">
          <Sparkline values={momentumValues} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="widget-progress-track rounded-xl p-2.5">
            <p className="text-[11px] text-lime-100/70">Health score</p>
            <p className="mono mt-1 text-sm font-semibold text-lime-100">{healthScore}%</p>
            <div className="widget-progress-track mt-2 h-1.5 rounded-full">
              <div
                className="widget-progress-value h-1.5 rounded-full"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          <div className="widget-progress-track rounded-xl p-2.5">
            <p className="text-[11px] text-lime-100/70">Largest plan</p>
            <p className="mt-1 truncate text-sm font-semibold text-lime-100">
              {mostExpensive.name}
            </p>
            <p className="mono mt-1 text-[11px] text-lime-200/90">
              {formatCurrency(
                calculateMonthlyCost(mostExpensive.cost, mostExpensive.billing_cycle),
                mostExpensive.currency
              )}
              /mo
            </p>
          </div>
        </div>
      </section>

      <section className="animate-fadeInUp space-y-2 delay-150">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-lime-50">
            <CalendarClock className="h-4 w-4 text-lime-300" />
            Upcoming renewals
          </h2>
          <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/75">
            30 days
          </span>
        </div>

        <div className="space-y-2">
          {stats?.upcomingRenewals?.map((subscription: SubscriptionWithCategory, index) => {
            const daysUntil = getDaysUntil(subscription.next_payment_date)
            const dotColor = daysUntil <= 3 ? '#fb7185' : daysUntil <= 7 ? '#facc15' : '#4ade80'
            const accentColor = subscription.category?.color || '#84cc16'

            return (
              <article
                key={subscription.id}
                className="press-effect flex list-item animate-fadeInUp items-center gap-3 rounded-2xl p-3"
                style={{ animationDelay: `${180 + index * 70}ms`, borderColor: `${accentColor}3d` }}
              >
                <div
                  className="token-badge flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-lime-100"
                  style={{ borderColor: `${accentColor}66` }}
                >
                  {getServiceToken(subscription.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-lime-50">{subscription.name}</p>
                  <p className="mt-0.5 text-xs text-lime-100/65">
                    {formatRelativeDate(subscription.next_payment_date)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="mono text-sm font-semibold text-lime-50">
                    {formatCurrency(subscription.cost, subscription.currency)}
                  </p>
                  <div
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold"
                    style={{ color: dotColor }}
                  >
                    <span
                      className="animate-dot-pulse h-1.5 w-1.5 rounded-full"
                      style={{ background: dotColor }}
                    />
                    {daysUntil}d
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="animate-fadeInUp pb-4 delay-200">
        <button
          onClick={onAddClick}
          className="btn-primary press-effect flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add subscription
          <ArrowUpRight className="h-4 w-4 opacity-70" />
        </button>
      </section>
    </div>
  )
}

function SmallWidget({
  label,
  value,
  icon: Icon,
  mono = false,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  mono?: boolean
}) {
  return (
    <article className="widget-card rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <p className="text-lime-100/64 text-[10px] font-semibold uppercase tracking-[0.14em]">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 text-lime-300/85" />
      </div>
      <p className={`mt-2 text-sm font-semibold text-lime-50 ${mono ? 'mono' : ''}`}>{value}</p>
    </article>
  )
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex min-h-[72vh] flex-col items-center justify-center px-6 pb-24 text-center">
      <div className="relative mb-10 animate-scaleIn">
        <div
          className="flex h-32 w-32 items-center justify-center rounded-[2.5rem]"
          style={{
            background:
              'linear-gradient(145deg, rgba(32, 54, 35, 0.95) 0%, rgba(28, 60, 40, 0.85) 100%)',
            boxShadow: '0 20px 46px rgba(34,197,94,0.24), inset 0 1px 0 rgba(236,253,245,0.08)',
          }}
        >
          <span className="gradient-text text-4xl font-bold">BF</span>
        </div>
        <div
          className="absolute -inset-3 rounded-[3rem]"
          style={{ border: '1px solid rgba(132,204,22,0.26)' }}
        />
        <div
          className="absolute -inset-6 rounded-[3.5rem]"
          style={{ border: '1px solid rgba(34,197,94,0.2)' }}
        />
      </div>

      <h2 className="animate-fadeInUp text-3xl font-bold tracking-tight text-lime-50">
        No subscriptions yet
      </h2>
      <p className="mt-4 max-w-xs animate-fadeInUp text-sm leading-relaxed text-lime-100/65 delay-100">
        Add your first plan and instantly unlock widgets, trend cards, and renewal tracking.
      </p>

      <button
        onClick={onAddClick}
        className="btn-primary press-effect mt-10 flex animate-fadeInUp items-center gap-2 rounded-2xl px-8 py-4 text-sm font-semibold delay-300"
      >
        <Plus className="h-4 w-4" />
        Add your first subscription
      </button>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="shimmer h-28 rounded-3xl" />
        <div className="shimmer h-28 rounded-3xl" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="shimmer h-20 rounded-2xl" />
        <div className="shimmer h-20 rounded-2xl" />
        <div className="shimmer h-20 rounded-2xl" />
      </div>
      <div className="shimmer h-52 rounded-3xl" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
