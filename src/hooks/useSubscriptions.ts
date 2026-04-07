import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import type { Subscription, SubscriptionWithCategory, Category } from '@types'

const SUBSCRIPTIONS_KEY = 'subscriptions'

export function useSubscriptions() {
  const queryClient = useQueryClient()

  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: [SUBSCRIPTIONS_KEY],
    queryFn: async (): Promise<SubscriptionWithCategory[]> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          category:categories (*)
        `)
        .order('next_payment_date', { ascending: true })

      if (error) throw error
      return data || []
    },
  })

  const createSubscription = useMutation({
    mutationFn: async (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...subscription,
          user_id: userData.user.id,
        })
        .select('*, category:categories(*)')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] })
    },
  })

  const updateSubscription = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Subscription> }) => {
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
    },
  })

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTIONS_KEY] })
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
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: userData.user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  return {
    categories,
    isLoading,
    createCategory: createCategory.mutate,
  }
}
