import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Telegram WebApp
global.window.Telegram = {
  WebApp: {
    initData: 'mock_init_data',
    initDataUnsafe: {
      query_id: 'mock_query',
      user: {
        id: 123456,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
      },
      auth_date: Math.floor(Date.now() / 1000),
      hash: 'mock_hash',
    },
    ready: vi.fn(),
    expand: vi.fn(),
    close: vi.fn(),
    setHeaderColor: vi.fn(),
    setBackgroundColor: vi.fn(),
    enableClosingConfirmation: vi.fn(),
    disableClosingConfirmation: vi.fn(),
    BackButton: {
      show: vi.fn(),
      hide: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    },
    MainButton: {
      show: vi.fn(),
      hide: vi.fn(),
      setText: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    },
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#007AFF',
      button_color: '#007AFF',
      button_text_color: '#ffffff',
    },
    colorScheme: 'light' as const,
  },
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverMock
