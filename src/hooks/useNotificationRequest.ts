import { useEffect } from 'react'

const { log } = console

const useNotificationRequest = () => {
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          log('Notification permission granted.')
        } else {
          log('Notification permission denied.')
        }
      })
    }
  }, [])

  const notifyUser = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/bell.png',
      })
    }
  }

  return {
    notifyUser,
  }
}

export default useNotificationRequest
