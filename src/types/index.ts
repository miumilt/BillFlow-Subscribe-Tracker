export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type Currency = 'USD' | 'EUR' | 'RUB' | 'GBP'

export interface User {
  id: string
  telegram_id: number
  username: string | null
  first_name: string
  last_name: string | null
  photo_url: string | null
  currency: Currency
  timezone: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  icon: string
  color: string
  is_default: boolean
  sort_order: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  name: string
  description: string | null
  cost: number
  currency: Currency
  billing_cycle: BillingCycle
  start_date: string
  next_payment_date: string
  category_id: string | null
  is_active: boolean
  trial_end_date: string | null
  cancel_reminder_days: number | null
  custom_days: number | null
  provider_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PaymentRecord {
  id: string
  subscription_id: string
  user_id: string
  amount: number
  currency: Currency
  payment_date: string
  notes: string | null
  created_at: string
}

export interface NotificationPreference {
  id: string
  user_id: string
  notify_days_before: number
  notify_time: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionWithCategory extends Subscription {
  category: Category | null
}

export type CreateSubscriptionInput = Omit<
  Subscription,
  'id' | 'user_id' | 'created_at' | 'updated_at' | 'trial_end_date' | 'cancel_reminder_days' | 'custom_days'
> & {
  trial_end_date?: string | null
  cancel_reminder_days?: number | null
  custom_days?: number | null
}

export interface DashboardStats {
  totalMonthly: number
  totalYearly: number
  activeCount: number
  upcomingCount: number
  byCategory: Array<{
    categoryId: string
    categoryName: string
    categoryColor: string
    total: number
    count: number
  }>
  upcomingRenewals: SubscriptionWithCategory[]
}

export interface TelegramInitData {
  query_id?: string
  user?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
    photo_url?: string
  }
  auth_date: number
  hash: string
}
