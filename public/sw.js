self.addEventListener('push', function (event) {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    return
  }

  const title = data.title || 'KRiB Beverly Place'
  const options = {
    body: data.body || 'You have a new notification.',
    tag: data.tag || 'krib-notification',
    renotify: true,
    data: {
      url: data.url || '/admin',
      notification_id: data.notification_id || null,
      reservation_id: data.reservation_id || null,
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const url = event.notification.data?.url || '/admin'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.focus()
          if (url !== '/admin') {
            client.navigate(url)
          }
          return
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})
