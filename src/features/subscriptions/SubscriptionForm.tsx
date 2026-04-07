import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ChevronDown, X } from 'lucide-react'
import { useSubscriptions, useCategories } from '@hooks/useSubscriptions'
import { useTelegramAuth } from '@hooks/useTelegram'
import { BILLING_CYCLES, CURRENCIES, getNextPaymentDate } from '@lib/utils'
import type { Subscription } from '@types'

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  cost: z.coerce.number().positive('Cost must be positive'),
  currency: z.enum(['USD', 'EUR', 'RUB', 'GBP']),
  billing_cycle: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  start_date: z.string().min(1, 'Start date is required'),
  category_id: z.string().optional(),
  is_active: z.boolean().default(true),
  provider_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
})

type SubscriptionFormData = z.infer<typeof subscriptionSchema>

interface SubscriptionFormProps {
  subscription?: Subscription | null
  onSuccess: () => void
  onCancel: () => void
}

const fieldCls = 'input-field w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none'

export function SubscriptionForm({ subscription, onSuccess, onCancel }: SubscriptionFormProps) {
  const { createSubscription, updateSubscription } = useSubscriptions()
  const { categories } = useCategories()
  const { webApp } = useTelegramAuth()
  const isEditing = !!subscription

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: subscription
      ? {
          name: subscription.name,
          description: subscription.description || '',
          cost: subscription.cost,
          currency: subscription.currency,
          billing_cycle: subscription.billing_cycle,
          start_date: subscription.start_date.slice(0, 10),
          category_id: subscription.category_id || '',
          is_active: subscription.is_active,
          provider_url: subscription.provider_url || '',
          notes: subscription.notes || '',
        }
      : {
          currency: 'USD',
          billing_cycle: 'monthly',
          start_date: format(new Date(), 'yyyy-MM-dd'),
          is_active: true,
        },
  })

  const watchedStartDate = watch('start_date')
  const watchedBillingCycle = watch('billing_cycle')
  const watchedActive = watch('is_active')

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      const nextPaymentDate = getNextPaymentDate(data.start_date, data.billing_cycle).toISOString()
      const normalizedData = {
        ...data,
        description: data.description || null,
        category_id: data.category_id || null,
        provider_url: data.provider_url || null,
        notes: data.notes || null,
      }

      if (isEditing && subscription) {
        await updateSubscription({
          id: subscription.id,
          updates: { ...normalizedData, next_payment_date: nextPaymentDate },
        })
      } else {
        await createSubscription({ ...normalizedData, next_payment_date: nextPaymentDate })
      }

      onSuccess()
      if (webApp?.MainButton) webApp.MainButton.hide()
    } catch (error) {
      console.error('Failed to save subscription:', error)
    }
  }

  return (
    <div className="animate-fadeInUp p-4 pb-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[1.3rem] font-bold tracking-tight text-white">
            {isEditing ? 'Edit subscription' : 'New subscription'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">Fill in the details below.</p>
        </div>

        <button
          onClick={onCancel}
          className="press-effect flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
          style={{ background: 'rgba(148, 163, 184, 0.1)' }}
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Section title="Core details">
          <Field label="Name" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="Netflix, Spotify, Figma..."
              className={fieldCls}
            />
          </Field>

          <Field label="Description (optional)">
            <input
              {...register('description')}
              placeholder="Family, team, or premium tier"
              className={fieldCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Cost" error={errors.cost?.message}>
              <input
                {...register('cost')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`${fieldCls} mono`}
              />
            </Field>

            <Field label="Currency">
              <div className="relative">
                <select {...register('currency')} className={`${fieldCls} appearance-none pr-10`}>
                  {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
                    <option key={code} value={code}>
                      {symbol} {code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Billing cycle">
              <div className="relative">
                <select
                  {...register('billing_cycle')}
                  className={`${fieldCls} appearance-none pr-10 capitalize`}
                >
                  {Object.entries(BILLING_CYCLES).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>

            <Field label="Start date">
              <input
                {...register('start_date')}
                type="date"
                className={`${fieldCls} [color-scheme:dark]`}
              />
            </Field>
          </div>

          {watchedStartDate && watchedBillingCycle && (
            <div className="glass-card-subtle rounded-xl px-4 py-3 text-sm">
              <span className="text-slate-400">Next payment </span>
              <span className="font-semibold text-white">
                {format(getNextPaymentDate(watchedStartDate, watchedBillingCycle), 'PPP')}
              </span>
            </div>
          )}
        </Section>

        <Section title="Extra settings">
          <Field label="Category">
            <div className="relative">
              <select {...register('category_id')} className={`${fieldCls} appearance-none pr-10`}>
                <option value="">No category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </Field>

          <Field label="Provider URL (optional)" error={errors.provider_url?.message}>
            <input
              {...register('provider_url')}
              type="url"
              placeholder="https://..."
              className={fieldCls}
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Any context for future you"
              className={`${fieldCls} min-h-[90px] resize-none`}
            />
          </Field>

          {isEditing && (
            <label className="glass-card-subtle flex cursor-pointer items-center justify-between rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-white">Subscription active</span>
              <div
                className="relative h-7 w-12 rounded-full transition-all duration-300"
                style={{
                  background: watchedActive
                    ? 'rgba(132, 204, 22, 0.52)'
                    : 'rgba(148, 163, 184, 0.3)',
                }}
              >
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <span
                  className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300"
                  style={{ left: watchedActive ? '1.6rem' : '0.15rem' }}
                />
              </div>
            </label>
          )}
        </Section>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary press-effect rounded-2xl py-3.5 text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary press-effect rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass-card rounded-2xl p-5">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}
