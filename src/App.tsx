import { useState, useEffect } from 'react'
import { useTelegramAuth } from '@hooks/useTelegram'
import { Dashboard } from '@features/dashboard/Dashboard'
import { SubscriptionList } from '@features/subscriptions/SubscriptionList'
import { SubscriptionForm } from '@features/subscriptions/SubscriptionForm'
import { Analytics } from '@features/analytics/Analytics'
import { Header } from '@components/layout/Header'
import { BottomNav } from '@components/layout/BottomNav'
import { LoadingScreen } from '@components/loading/LoadingScreen'
import type { Subscription } from '@types'

type Screen = 'dashboard' | 'subscriptions' | 'analytics' | 'add' | 'edit'

export function App() {
  const { user, isLoading, isReady } = useTelegramAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    if (!window.Telegram?.WebApp) return

    const tg = window.Telegram.WebApp
    const handleBack = () => {
      if (currentScreen === 'add' || currentScreen === 'edit') {
        setCurrentScreen('subscriptions')
      } else {
        setCurrentScreen('dashboard')
      }
    }

    if (currentScreen === 'dashboard') {
      tg.BackButton.hide()
    } else {
      tg.BackButton.show()
      tg.BackButton.onClick(handleBack)
    }

    return () => {
      tg.BackButton.offClick(handleBack)
    }
  }, [currentScreen])

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setCurrentScreen('edit')
  }

  const handleAdd = () => {
    setEditingSubscription(null)
    setCurrentScreen('add')
  }

  const handleFormSuccess = () => {
    setEditingSubscription(null)
    setCurrentScreen('subscriptions')
  }

  if (!isReady || isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">BillFlow</h1>
          <p className="text-muted-foreground">Please open this app via Telegram</p>
        </div>
      </div>
    )
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onAddClick={handleAdd} />
      case 'subscriptions':
        return <SubscriptionList onEdit={handleEdit} onAdd={handleAdd} />
      case 'analytics':
        return <Analytics />
      case 'add':
      case 'edit':
        return (
          <SubscriptionForm
            subscription={editingSubscription}
            onSuccess={handleFormSuccess}
            onCancel={() => setCurrentScreen('subscriptions')}
          />
        )
      default:
        return <Dashboard onAddClick={handleAdd} />
    }
  }

  const showBottomNav = currentScreen !== 'add' && currentScreen !== 'edit'

  return (
    <div className="telegram-mini-app app-shell flex min-h-screen flex-col bg-background">
      <Header user={user} />
      <main className="hide-scrollbar relative z-10 flex-1 overflow-y-auto pb-24">
        <div key={currentScreen} className="screen-enter">
          {renderScreen()}
        </div>
      </main>
      {showBottomNav && (
        <BottomNav
          currentScreen={currentScreen === 'subscriptions' ? 'subscriptions' : currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen as Screen)}
        />
      )}
    </div>
  )
}
