import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { LOCAL_DATA_MODE } from '@lib/dataMode'
import { readLocalSubscriptions } from '@lib/localData'
import { calculateMonthlyCost, calculateYearlyCost } from '@lib/utils'
import type { DashboardStats, SubscriptionWithCategory } from '@types'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const subscriptions = LOCAL_DATA_MODE
        ? readLocalSubscriptions().filter((item) => item.is_active)
        : await fetchRemoteActiveSubscriptions()

      const subs = subscriptions || []

      let totalMonthly = 0
      let totalYearly = 0
      const byCategory = new Map()

      subs.forEach((sub: SubscriptionWithCategory) => {
        const monthly = calculateMonthlyCost(sub.cost, sub.billing_cycle)
        const yearly = calculateYearlyCost(sub.cost, sub.billing_cycle)

        totalMonthly += monthly
        totalYearly += yearly

        const catId = sub.category?.id || 'uncategorized'
        const existing = byCategory.get(catId) || {
          categoryId: catId,
          categoryName: sub.category?.name || 'Uncategorized',
          categoryColor: sub.category?.color || '#A0A0A0',
          total: 0,
          count: 0,
        }
        existing.total += monthly
        existing.count += 1
        byCategory.set(catId, existing)
      })

      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const upcomingRenewals = subs
        .filter((sub: SubscriptionWithCategory) => {
          const nextDate = new Date(sub.next_payment_date)
          return nextDate <= thirtyDaysFromNow && sub.is_active
        })
        .sort(
          (a: SubscriptionWithCategory, b: SubscriptionWithCategory) =>
            new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime()
        )
        .slice(0, 5)

      return {
        totalMonthly,
        totalYearly,
        activeCount: subs.length,
        upcomingCount: upcomingRenewals.length,
        byCategory: Array.from(byCategory.values()).sort((a, b) => b.total - a.total),
        upcomingRenewals,
      }
    },
  })
}

async function fetchRemoteActiveSubscriptions() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      `
          *,
          category:categories (*)
        `
    )
    .eq('is_active', true)

  if (error) throw error
  return (data || []) as SubscriptionWithCategory[]
}
