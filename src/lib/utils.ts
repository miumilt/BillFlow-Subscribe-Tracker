import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 7) return `In ${diffDays} days`
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`
  return formatDate(date)
}

export function getDaysUntil(date: string | Date): number {
  const now = new Date()
  const target = new Date(date)
  const diffTime = target.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function calculateMonthlyCost(
  cost: number,
  billingCycle: string
): number {
  switch (billingCycle) {
    case 'weekly':
      return cost * 52 / 12
    case 'monthly':
      return cost
    case 'quarterly':
      return cost / 3
    case 'yearly':
      return cost / 12
    default:
      return cost
  }
}

export function calculateYearlyCost(
  cost: number,
  billingCycle: string
): number {
  switch (billingCycle) {
    case 'weekly':
      return cost * 52
    case 'monthly':
      return cost * 12
    case 'quarterly':
      return cost * 4
    case 'yearly':
      return cost
    default:
      return cost * 12
  }
}

export function getNextPaymentDate(
  startDate: string,
  billingCycle: string
): Date {
  const start = new Date(startDate)
  const now = new Date()
  const next = new Date(start)

  while (next <= now) {
    switch (billingCycle) {
      case 'weekly':
        next.setDate(next.getDate() + 7)
        break
      case 'monthly':
        next.setMonth(next.getMonth() + 1)
        break
      case 'quarterly':
        next.setMonth(next.getMonth() + 3)
        break
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1)
        break
    }
  }

  return next
}

export const CURRENCIES: Record<string, { code: string; symbol: string; name: string }> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
}

export const BILLING_CYCLES: Record<string, { value: string; label: string; multiplier: number }> = {
  weekly: { value: 'weekly', label: 'Weekly', multiplier: 52 / 12 },
  monthly: { value: 'monthly', label: 'Monthly', multiplier: 1 },
  quarterly: { value: 'quarterly', label: 'Quarterly', multiplier: 1 / 3 },
  yearly: { value: 'yearly', label: 'Yearly', multiplier: 1 / 12 },
}

export const DEFAULT_CATEGORIES = [
  { name: 'Entertainment', icon: 'Film', color: '#FF6B6B' },
  { name: 'Software', icon: 'Code', color: '#4ECDC4' },
  { name: 'Services', icon: 'Briefcase', color: '#45B7D1' },
  { name: 'Health', icon: 'Heart', color: '#96CEB4' },
  { name: 'Education', icon: 'BookOpen', color: '#FFEAA7' },
  { name: 'Finance', icon: 'Landmark', color: '#DDA0DD' },
  { name: 'Utilities', icon: 'Zap', color: '#98D8C8' },
  { name: 'Other', icon: 'MoreHorizontal', color: '#A0A0A0' },
]
