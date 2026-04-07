import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { LOCAL_DATA_MODE } from '@lib/dataMode'
import {
  createLocalCategory,
  createLocalSubscription,
  deleteLocalSubscription,
  readLocalCategories,
  readLocalSubscriptions,
  updateLocalSubscription,
} from '@lib/localData'
import type {
  Category,
  CreateSubscriptionInput,
  Subscription,
  SubscriptionWithCategory,
} from '@types'

const SUBSCRIPTIONS_KEY = 'subscriptions'

export function useSubscriptions() {
  const queryClient = useQueryClient()

  const {
    data: subscriptions,
    isLoading,
    error,
  } = useQuery({
    queryKey: [SUBSCRIPTIONS_KEY],
    queryFn: async (): Promise<SubscriptionWithCategory[]> => {
      if (LOCAL_DATA_MODE) {
        return readLocalSubscriptions()
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select(
          `
          *,
          category:categories (*)
        `
        )
        .order('next_payment_date', { ascending: true })

      if (error) throw error
      return (data as SubscriptionWithCategory[]) || []
    },
  })

  const createSubscription = useMutation({
    mutationFn: async (subscription: CreateSubscriptionInput) => {
      if (LOCAL_DATA_MODE) {
        return createLocalSubscription(subscription)
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...subscription,
          user_id: userData.user.id,
        } as never)
        .select('*, category:categories(*)')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  const updateSubscription = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Subscription> }) => {
      if (LOCAL_DATA_MODE) {
        const updated = updateLocalSubscription({ id, updates })
        if (!updated) throw new Error('Subscription not found')
        return updated
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, category:categories(*)')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      if (LOCAL_DATA_MODE) {
        deleteLocalSubscription(id)
        return
      }

      const { error } = await supabase.from('subscriptions').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  return {
    subscriptions,
    isLoading,
    error,
    createSubscription: createSubscription.mutate,
    updateSubscription: updateSubscription.mutate,
    deleteSubscription: deleteSubscription.mutate,
    isCreating: createSubscription.isPending,
    isUpdating: updateSubscription.isPending,
    isDeleting: deleteSubscription.isPending,
  }
}

export function useCategories() {
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      if (LOCAL_DATA_MODE) {
        return readLocalCategories()
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data || []
    },
  })

  const createCategory = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'user_id'>) => {
      if (LOCAL_DATA_MODE) {
        return createLocalCategory(category)
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: userData.user.id,
        } as never)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  return {
    categories,
    isLoading,
    createCategory: createCategory.mutate,
  }
}
