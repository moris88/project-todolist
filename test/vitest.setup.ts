import '@testing-library/jest-dom'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

window.HTMLElement.prototype.scrollIntoView = vi.fn()

// Notification API mock (configurable so individual tests can override)
Object.defineProperty(global, 'Notification', {
  writable: true,
  configurable: true,
  value: class MockNotification {
    static permission = 'denied'
    static requestPermission = () => Promise.resolve('denied')
    constructor(_title: string, _options?: NotificationOptions) {}
  },
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

afterEach(() => {
  cleanup()
})
