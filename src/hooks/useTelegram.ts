import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { LOCAL_DATA_MODE } from '@lib/dataMode'
import type { User } from '@types'

// Mock user for standalone/local mode
const MOCK_USER: User = {
  id: 'dev-user-123',
  telegram_id: 123456789,
  username: 'devuser',
  first_name: 'Developer',
  last_name: 'User',
  photo_url: null,
  currency: 'USD',
  timezone: 'UTC',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
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
  ready: () => void
  expand: () => void
  close: () => void
  setHeaderColor: (color: string) => void
  setBackgroundColor: (color: string) => void
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  MainButton: {
    show: () => void
    hide: () => void
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  themeParams: {
    bg_color: string
    text_color: string
    hint_color: string
    link_color: string
    button_color: string
    button_text_color: string
  }
  colorScheme: 'light' | 'dark'
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN

async function validateTelegramData(initData: string): Promise<boolean> {
  if (!BOT_TOKEN) return true

  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return false

    params.delete('hash')

    const dataCheckString = Array.from(params.keys())
      .sort()
      .map((key) => `${key}=${params.get(key)}`)
      .join('\n')

    const encoder = new TextEncoder()
    const secretKey = await crypto.subtle.digest('SHA-256', encoder.encode(BOT_TOKEN))

    const key = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataCheckString))

    const computedHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return computedHash === hash
  } catch (error) {
    console.error('Validation error:', error)
    return false
  }
}

export function useTelegramAuth() {
  const queryClient = useQueryClient()
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      setWebApp(tg)
      tg.ready()
      tg.expand()
      setIsReady(true)

      document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color)
      document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color)
      document.documentElement.style.setProperty(
        '--tg-theme-button-color',
        tg.themeParams.button_color
      )
      document.documentElement.style.setProperty(
        '--tg-theme-button-text-color',
        tg.themeParams.button_text_color
      )
    }
  }, [])

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      if (!webApp?.initData) return null

      const isValid = await validateTelegramData(webApp.initData)
      if (!isValid) throw new Error('Invalid Telegram data')

      const tgUser = webApp.initDataUnsafe.user
      if (!tgUser) throw new Error('No Telegram user data')

      const { data, error: signInError } = await supabase.functions.invoke('telegram-auth', {
        body: {
          telegram_id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name || null,
          username: tgUser.username || null,
          photo_url: tgUser.photo_url || null,
          auth_date: webApp.initDataUnsafe.auth_date,
          hash: webApp.initDataUnsafe.hash,
        },
      })

      if (signInError) throw signInError
      return data?.user || null
    },
    enabled: !LOCAL_DATA_MODE && !!webApp?.initData,
    staleTime: 5 * 60 * 1000,
  })

  const logout = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut()
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })

  const updateUser = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)
    },
  })

  return {
    webApp,
    user: LOCAL_DATA_MODE ? MOCK_USER : user,
    isLoading: LOCAL_DATA_MODE ? false : isLoading,
    error: LOCAL_DATA_MODE ? null : error,
    isReady: LOCAL_DATA_MODE ? true : isReady,
    logout: logout.mutate,
    updateUser: updateUser.mutate,
  }
}
