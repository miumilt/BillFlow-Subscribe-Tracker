import { useMemo, useState } from 'react'
import { Edit2, Filter, MoreVertical, Plus, Search, Trash2 } from 'lucide-react'
import { useSubscriptions } from '@hooks/useSubscriptions'
import { calculateMonthlyCost, formatCurrency, formatDate } from '@lib/utils'
import type { Subscription } from '@types'

interface SubscriptionListProps {
  onEdit: (subscription: Subscription) => void
  onAdd: () => void
}

function getServiceToken(name: string): string {
  const cleaned = name.trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'SB'

  const parts = cleaned.split(' ')
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return cleaned.slice(0, 2).toUpperCase()
}

export function SubscriptionList({ onEdit, onAdd }: SubscriptionListProps) {
  const { subscriptions, isLoading, deleteSubscription } = useSubscriptions()
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredSubscriptions = useMemo(
    () =>
      subscriptions?.filter((sub) => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter =
          filter === 'all' ? true : filter === 'active' ? sub.is_active : !sub.is_active
        return matchesSearch && matchesFilter
      }) || [],
    [subscriptions, searchTerm, filter]
  )

  const totalMonthly =
    filteredSubscriptions.reduce(
      (sum, sub) => sum + (sub.is_active ? calculateMonthlyCost(sub.cost, sub.billing_cycle) : 0),
      0
    ) || 0

  if (isLoading) return <SubscriptionListSkeleton />

  return (
    <div className="space-y-5 p-4">
      {/* Header */}
      <section className="flex animate-fadeInUp items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.4rem] font-bold tracking-tight text-white">Subscriptions</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <span className="mono font-semibold text-white">
              {formatCurrency(totalMonthly, 'USD')}
            </span>
            <span className="text-xs">/ month</span>
          </p>
        </div>

        <button
          onClick={onAdd}
          className="btn-primary press-effect flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </section>

      {/* Search & Filter */}
      <section className="animate-fadeInUp space-y-3 delay-100">
        <div className="glass-card-subtle flex items-center gap-3 rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field h-8 w-full rounded-lg px-2 text-sm"
          />
        </div>

        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex shrink-0 items-center gap-1.5 px-2 text-xs font-medium text-slate-500">
            <Filter className="h-3.5 w-3.5" />
          </div>

          <FilterButton active={filter === 'all'} label="All" onClick={() => setFilter('all')} />
          <FilterButton
            active={filter === 'active'}
            label="Active"
            onClick={() => setFilter('active')}
          />
          <FilterButton
            active={filter === 'inactive'}
            label="Paused"
            onClick={() => setFilter('inactive')}
          />
        </div>
      </section>

      {/* Subscription List */}
      <section className="space-y-2">
        {filteredSubscriptions.map((sub, i) => (
          <div
            key={sub.id}
            className="animate-fadeInUp"
            style={{ animationDelay: `${80 + i * 55}ms` }}
          >
            <SubscriptionCard
              subscription={sub}
              onEdit={() => onEdit(sub)}
              onDelete={() => deleteSubscription(sub.id)}
            />
          </div>
        ))}

        {!filteredSubscriptions.length && (
          <div className="glass-card-subtle rounded-2xl px-6 py-12 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(132, 204, 22, 0.16)' }}
            >
              <svg
                className="h-7 w-7 text-lime-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-white">
              {searchTerm ? 'No matches found' : 'No subscriptions yet'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {searchTerm ? 'Try another search query.' : 'Add one to start tracking.'}
            </p>

            {!searchTerm && (
              <button
                onClick={onAdd}
                className="btn-secondary press-effect mx-auto mt-6 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add subscription
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="press-effect shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300"
      style={
        active
          ? {
              background:
                'linear-gradient(135deg, rgba(132, 204, 22, 0.33), rgba(34, 197, 94, 0.28))',
              border: '1px solid rgba(163, 230, 53, 0.42)',
              color: 'rgba(254, 255, 243, 0.95)',
              boxShadow: '0 4px 16px rgba(132, 204, 22, 0.22)',
            }
          : {
              background: 'rgba(30, 35, 55, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              color: 'rgba(226, 232, 240, 0.7)',
            }
      }
    >
      {label}
    </button>
  )
}

interface SubscriptionCardProps {
  subscription: Subscription & { category?: { color: string; name: string } | null }
  onEdit: () => void
  onDelete: () => void
}

function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const [showActions, setShowActions] = useState(false)
  const accent = subscription.category?.color || '#84cc16'

  return (
    <article
      className={`press-effect relative list-item rounded-2xl p-4 ${showActions ? 'z-30' : ''} ${
        !subscription.is_active ? 'opacity-50' : ''
      }`}
      style={{ borderColor: `${accent}25` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="token-badge flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ borderColor: `${accent}40` }}
        >
          {getServiceToken(subscription.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">{subscription.name}</p>
            {!subscription.is_active && (
              <span className="chip shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
                Paused
              </span>
            )}
          </div>

          <p className="mt-1 text-xs capitalize text-slate-400">
            {subscription.billing_cycle} � {formatDate(subscription.next_payment_date)}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="mono text-base font-semibold text-white">
            {formatCurrency(subscription.cost, subscription.currency)}
          </p>
          <p className="mono text-[11px] text-slate-500">
            {formatCurrency(
              calculateMonthlyCost(subscription.cost, subscription.billing_cycle),
              subscription.currency
            )}
            /mo
          </p>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowActions((v) => !v)}
            className="press-effect flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200"
            style={{
              background:
                'linear-gradient(145deg, rgba(31, 45, 35, 0.95) 0%, rgba(26, 36, 30, 0.92) 100%)',
              border: '1px solid rgba(190, 242, 100, 0.26)',
              boxShadow: '0 6px 14px rgba(2, 8, 3, 0.5), inset 0 1px 0 rgba(236, 253, 245, 0.06)',
            }}
          >
            <MoreVertical className="h-4 w-4 text-lime-100/85" />
          </button>

          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              <div
                className="glass-card-elevated absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-2xl p-1.5"
                style={{ border: '1px solid rgba(148, 163, 184, 0.2)' }}
              >
                <button
                  onClick={() => {
                    onEdit()
                    setShowActions(false)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  <Edit2 className="h-4 w-4 text-lime-300" />
                  Edit
                </button>
                <div className="mx-2 my-1 h-px bg-white/10" />
                <button
                  onClick={() => {
                    const confirmed = window.confirm(`Delete subscription "${subscription.name}"?`)
                    if (!confirmed) return
                    onDelete()
                    setShowActions(false)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

function SubscriptionListSkeleton() {
  return (
    <div className="space-y-5 p-4">
      <div className="flex items-start justify-between">
        <div className="shimmer h-10 w-36 rounded-xl" />
        <div className="shimmer h-10 w-20 rounded-xl" />
      </div>
      <div className="shimmer h-14 rounded-2xl" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
