import type {
  Category,
  CreateSubscriptionInput,
  Subscription,
  SubscriptionWithCategory,
} from '@types'
import { DEFAULT_CATEGORIES } from '@lib/utils'

const LOCAL_USER_ID = 'local-user'
const SUBSCRIPTIONS_STORAGE_KEY = 'billflow.subscriptions.v1'
const CATEGORIES_STORAGE_KEY = 'billflow.categories.v1'

function hasWindow() {
  return typeof window !== 'undefined'
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function uuid(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeCategory(raw: Category): Category {
  return {
    ...raw,
    user_id: raw.user_id ?? null,
  }
}

function normalizeSubscription(raw: Subscription): Subscription {
  return {
    ...raw,
    description: raw.description ?? null,
    category_id: raw.category_id ?? null,
    trial_end_date: raw.trial_end_date ?? null,
    cancel_reminder_days: raw.cancel_reminder_days ?? null,
    custom_days: raw.custom_days ?? null,
    provider_url: raw.provider_url ?? null,
    notes: raw.notes ?? null,
  }
}

export function readLocalCategories(): Category[] {
  if (!hasWindow()) return []

  const stored = safeParse<Category[]>(window.localStorage.getItem(CATEGORIES_STORAGE_KEY), [])

  if (stored.length > 0) {
    return stored.map(normalizeCategory)
  }

  const now = new Date().toISOString()
  const seeded = DEFAULT_CATEGORIES.map((category, index) => ({
    id: uuid('cat'),
    user_id: null,
    name: category.name,
    icon: category.icon,
    color: category.color,
    is_default: true,
    sort_order: index,
    created_at: now,
  }))

  writeLocalCategories(seeded)
  return seeded
}

export function writeLocalCategories(categories: Category[]) {
  if (!hasWindow()) return
  window.localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
}

function readLocalSubscriptionRows(): Subscription[] {
  if (!hasWindow()) return []

  const stored = safeParse<Subscription[]>(
    window.localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY),
    []
  )

  return stored.map(normalizeSubscription)
}

function writeLocalSubscriptionRows(subscriptions: Subscription[]) {
  if (!hasWindow()) return
  window.localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subscriptions))
}

export function withCategory(
  subscriptions: Subscription[],
  categories: Category[]
): SubscriptionWithCategory[] {
  const categoryMap = new Map(categories.map((category) => [category.id, category]))

  return subscriptions.map((subscription) => ({
    ...subscription,
    category: subscription.category_id ? categoryMap.get(subscription.category_id) || null : null,
  }))
}

export function readLocalSubscriptions(): SubscriptionWithCategory[] {
  const categories = readLocalCategories()
  const subscriptions = readLocalSubscriptionRows()

  return withCategory(subscriptions, categories).sort(
    (a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime()
  )
}

export function createLocalSubscription(
  subscription: CreateSubscriptionInput
): SubscriptionWithCategory {
  const rows = readLocalSubscriptionRows()
  const categories = readLocalCategories()
  const now = new Date().toISOString()

  const row: Subscription = {
    id: uuid('sub'),
    user_id: LOCAL_USER_ID,
    name: subscription.name,
    description: subscription.description || null,
    cost: Number(subscription.cost),
    currency: subscription.currency,
    billing_cycle: subscription.billing_cycle,
    start_date: subscription.start_date,
    next_payment_date: subscription.next_payment_date,
    category_id: subscription.category_id || null,
    is_active: subscription.is_active ?? true,
    trial_end_date: subscription.trial_end_date || null,
    cancel_reminder_days: subscription.cancel_reminder_days ?? null,
    custom_days: subscription.custom_days ?? null,
    provider_url: subscription.provider_url || null,
    notes: subscription.notes || null,
    created_at: now,
    updated_at: now,
  }

  const updatedRows = [...rows, row]
  writeLocalSubscriptionRows(updatedRows)

  return withCategory([row], categories)[0]
}

export function updateLocalSubscription({
  id,
  updates,
}: {
  id: string
  updates: Partial<Subscription>
}): SubscriptionWithCategory | null {
  const rows = readLocalSubscriptionRows()
  const categories = readLocalCategories()
  const targetIndex = rows.findIndex((row) => row.id === id)

  if (targetIndex === -1) return null

  const previous = rows[targetIndex]
  const updated: Subscription = normalizeSubscription({
    ...previous,
    ...updates,
    updated_at: new Date().toISOString(),
  } as Subscription)

  rows[targetIndex] = updated
  writeLocalSubscriptionRows(rows)

  return withCategory([updated], categories)[0]
}

export function deleteLocalSubscription(id: string) {
  const rows = readLocalSubscriptionRows().filter((row) => row.id !== id)
  writeLocalSubscriptionRows(rows)
}

export function createLocalCategory(
  category: Omit<Category, 'id' | 'created_at' | 'user_id'>
): Category {
  const categories = readLocalCategories()
  const row: Category = {
    id: uuid('cat'),
    user_id: null,
    name: category.name,
    icon: category.icon,
    color: category.color,
    is_default: category.is_default,
    sort_order: category.sort_order,
    created_at: new Date().toISOString(),
  }

  const updated = [...categories, row].sort((a, b) => a.sort_order - b.sort_order)
  writeLocalCategories(updated)

  return row
}
