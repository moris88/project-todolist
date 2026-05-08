import '@testing-library/jest-dom'

import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import useNotificationRequest from '../src/hooks/useNotificationRequest'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal Notification mock class and install it as a global,
 * returning the spy on the constructor so individual tests can assert calls.
 */
function stubNotification({
  permission = 'default',
  requestPermission = vi.fn().mockResolvedValue('default'),
}: {
  permission?: NotificationPermission
  requestPermission?: ReturnType<typeof vi.fn>
} = {}) {
  const NotificationMock = vi.fn()
  Object.defineProperty(NotificationMock, 'permission', {
    get: () => permission,
    configurable: true,
  })
  NotificationMock.requestPermission = requestPermission

  vi.stubGlobal('Notification', NotificationMock)

  return NotificationMock
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useNotificationRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('calls requestPermission on mount', async () => {
    const requestPermission = vi.fn().mockResolvedValue('granted')
    stubNotification({ permission: 'granted', requestPermission })

    renderHook(() => useNotificationRequest())

    await vi.waitFor(() => {
      expect(requestPermission).toHaveBeenCalledOnce()
    })
  })

  it('notifyUser creates a Notification when permission is granted', () => {
    const NotificationMock = stubNotification({
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    })

    const { result } = renderHook(() => useNotificationRequest())

    result.current.notifyUser('T', 'B')

    expect(NotificationMock).toHaveBeenCalledWith('T', {
      body: 'B',
      icon: '/bell.webp',
    })
  })

  it('notifyUser does nothing when permission is denied', () => {
    const NotificationMock = stubNotification({
      permission: 'denied',
      requestPermission: vi.fn().mockResolvedValue('denied'),
    })

    const { result } = renderHook(() => useNotificationRequest())

    result.current.notifyUser('T', 'B')

    expect(NotificationMock).not.toHaveBeenCalled()
  })

  it('does nothing when Notification API is absent', () => {
    // Delete the property so 'Notification' in window === false
    const descriptor = Object.getOwnPropertyDescriptor(window, 'Notification')
    Reflect.deleteProperty(window, 'Notification')

    expect(() => renderHook(() => useNotificationRequest())).not.toThrow()

    // Restore
    if (descriptor) {
      Object.defineProperty(window, 'Notification', descriptor)
    }
  })
})
