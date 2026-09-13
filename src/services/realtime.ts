import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import api from '@/services/api'
import type { AppNotification } from '@/services/notification.api'

type NotificationHandler = (notification: AppNotification) => void

let echo: any = null
let currentUserId: number | null = null
let currentHandler: NotificationHandler | null = null

const createEcho = () => {
  if (echo) {
    return echo
  }

  ;(window as any).Pusher = Pusher

  const key = import.meta.env.VITE_REVERB_APP_KEY
  const host = import.meta.env.VITE_REVERB_HOST || 'localhost'
  const port = Number(import.meta.env.VITE_REVERB_PORT || 8080)
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http'

  if (!key) {
    throw new Error(
      '[Realtime] Thiếu VITE_REVERB_APP_KEY trong booking-web/.env',
    )
  }

  console.log('[Realtime] Creating Echo', {
    key,
    host,
    port,
    scheme,
  })

  echo = new Echo({
    broadcaster: 'reverb',

    key,

    wsHost: host,
    wsPort: port,
    wssPort: port,

    forceTLS: scheme === 'https',

    enabledTransports: ['ws', 'wss'],

    authorizer: (channel: any) => ({
      authorize: async (
        socketId: string,
        callback: (error: boolean, data: any) => void,
      ) => {
        console.log('[Realtime] Authorizing channel', {
          socketId,
          channel: channel.name,
        })

        try {
          const response = await api.post('/api/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })

          console.log('[Realtime] Channel authorized', {
            channel: channel.name,
            data: response.data,
          })

          callback(false, response.data)
        } catch (error: any) {
          console.error('[Realtime] Channel authorization failed', {
            channel: channel.name,
            status: error?.response?.status,
            data: error?.response?.data,
            error,
          })

          callback(true, error)
        }
      },
    }),
  } as any)

  const pusher = echo.connector?.pusher

  if (pusher?.connection) {
    pusher.connection.bind('connecting', () => {
      console.log('[Realtime] WebSocket connecting...')
    })

    pusher.connection.bind('connected', () => {
      console.log('[Realtime] WebSocket connected', {
        socketId: pusher.connection.socket_id,
      })
    })

    pusher.connection.bind('disconnected', () => {
      console.warn('[Realtime] WebSocket disconnected')
    })

    pusher.connection.bind('error', (error: any) => {
      console.error('[Realtime] WebSocket error', error)
    })

    pusher.connection.bind('state_change', (states: any) => {
      console.log('[Realtime] State changed', states)
    })
  }

  return echo
}

export const realtimeNotifications = {
  connect(
    userId: number,
    onNotification: NotificationHandler,
  ) {
    console.log('[Realtime] connect() called', {
      userId,
    })

    if (!userId) {
      console.warn(
        '[Realtime] userId không hợp lệ, không subscribe',
      )
      return
    }

    const client = createEcho()

    currentHandler = onNotification

    if (
      currentUserId &&
      currentUserId !== userId
    ) {
      console.log(
        `[Realtime] Leaving users.${currentUserId}`,
      )

      client.leave(`users.${currentUserId}`)
    }

    currentUserId = userId

    const channelName = `users.${userId}`

    console.log(
      `[Realtime] Subscribing private channel: ${channelName}`,
    )

    const channel = client.private(channelName)

    channel.subscribed(() => {
      console.log(
        `[Realtime] SUBSCRIBED SUCCESS: private-${channelName}`,
      )
    })

    channel.error((error: any) => {
      console.error(
        `[Realtime] SUBSCRIBE FAILED: private-${channelName}`,
        error,
      )
    })

    channel.stopListening('.notification.created')

    channel.listen(
      '.notification.created',
      (payload: {
        notification?: AppNotification
      }) => {
        console.log(
          '[Realtime] notification.created RECEIVED',
          payload,
        )

        if (!payload?.notification) {
          console.warn(
            '[Realtime] Event không có notification',
            payload,
          )

          return
        }

        currentHandler?.(
          payload.notification,
        )
      },
    )
  },

  disconnect() {
    if (!echo) {
      return
    }

    if (currentUserId) {
      console.log(
        `[Realtime] Leaving users.${currentUserId}`,
      )

      echo.leave(
        `users.${currentUserId}`,
      )
    }

    console.log(
      '[Realtime] Disconnecting Echo',
    )

    echo.disconnect()

    echo = null
    currentUserId = null
    currentHandler = null
  },
}