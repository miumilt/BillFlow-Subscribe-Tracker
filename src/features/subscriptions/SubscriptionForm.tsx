import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Select, SelectOption } from '@components/ui/select'
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

  const onSubmit = async (data: SubscriptionFormData) => {
    try {
      const nextPaymentDate = getNextPaymentDate(
        data.start_date,
        data.billing_cycle
      ).toISOString()

      if (isEditing && subscription) {
        await updateSubscription({
          id: subscription.id,
          updates: {
            ...data,
            next_payment_date: nextPaymentDate,
          },
        })
      } else {
        await createSubscription({
          ...data,
          next_payment_date: nextPaymentDate,
        })
      }

      onSuccess()
      
      if (webApp?.MainButton) {
        webApp.MainButton.hide()
      }
    } catch (error) {
      console.error('Failed to save subscription:', error)
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {isEditing ? 'Edit subscription' : 'New subscription'}
        </h1>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input
                {...register('name')}
                placeholder="Netflix, Spotify, etc."
                variant={errors.name ? 'error' : 'default'}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description (optional)</label>
              <Input
                {...register('description')}
                placeholder="Family plan, premium tier, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Cost</label>
                <Input
                  {...register('cost')}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  variant={errors.cost ? 'error' : 'default'}
                />
                {errors.cost && (
                  <p className="mt-1 text-xs text-destructive">{errors.cost.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Currency</label>
                <Select {...register('currency')}>
                  {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
                    <SelectOption key={code} value={code}>
                      {symbol} {code}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Billing cycle</label>
                <Select {...register('billing_cycle')}>
                  {Object.entries(BILLING_CYCLES).map(([value, { label }]) => (
                    <SelectOption key={value} value={value}>
                      {label}
                    </SelectOption>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Start date</label>
                <Input {...register('start_date')} type="date" />
              </div>
            </div>

            {watchedStartDate && watchedBillingCycle && (
              <p className="text-sm text-muted-foreground">
                Next payment:{' '}
                {format(
                  getNextPaymentDate(watchedStartDate, watchedBillingCycle),
                  'PPP'
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category & details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <Select {...register('category_id')}>
                <SelectOption value="">No category</SelectOption>
                {categories?.map((cat) => (
                  <SelectOption key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectOption>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Provider URL (optional)
              </label>
              <Input
                {...register('provider_url')}
                type="url"
                placeholder="https://..."
                variant={errors.provider_url ? 'error' : 'default'}
              />
              {errors.provider_url && (
                <p className="mt-1 text-xs text-destructive">{errors.provider_url.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any additional information..."
              />
            </div>

            {isEditing && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm">
                  Active subscription
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  )
}
