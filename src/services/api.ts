import axios, { type InternalAxiosRequestConfig } from 'axios'
import { beginMutationLock, endMutationLock } from './requestLock'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

type LockableConfig = InternalAxiosRequestConfig & {
  __bookoraMutationLock?: boolean
}

const IDEMPOTENCY_WINDOW_MS = 8000
const recentMutationKeys = new Map<string, { key: string; expiresAt: number }>()

const isMutation = (method?: string) => {
  const normalized = (method || 'get').toLowerCase()
  return !['get', 'head', 'options'].includes(normalized)
}

const shouldSkipMutationLock = (url?: string) => {
  return Boolean(url?.includes('/broadcasting/auth'))
}

const stableValue = (value: unknown): unknown => {
  if (value instanceof FormData) {
    return Array.from(value.entries()).map(([key, item]) => {
      if (item instanceof File) {
        return [key, `file:${item.name}:${item.size}:${item.type}:${item.lastModified}`]
      }
      return [key, String(item)]
    })
  }

  if (Array.isArray(value)) {
    return value.map(stableValue)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = stableValue((value as Record<string, unknown>)[key])
        return result
      }, {})
  }

  return value
}

const requestFingerprint = (config: InternalAxiosRequestConfig) => {
  const method = (config.method || 'get').toUpperCase()
  const url = config.url || ''
  const data = JSON.stringify(stableValue(config.data ?? null))
  const params = JSON.stringify(stableValue(config.params ?? null))
  return `${method}|${url}|${params}|${data}`
}

const idempotencyKeyFor = (config: InternalAxiosRequestConfig) => {
  const fingerprint = requestFingerprint(config)
  const now = Date.now()
  const existing = recentMutationKeys.get(fingerprint)

  if (existing && existing.expiresAt > now) {
    return existing.key
  }

  const key = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${now}-${Math.random().toString(36).slice(2)}`

  recentMutationKeys.set(fingerprint, {
    key,
    expiresAt: now + IDEMPOTENCY_WINDOW_MS,
  })

  for (const [storedFingerprint, item] of recentMutationKeys.entries()) {
    if (item.expiresAt <= now) {
      recentMutationKeys.delete(storedFingerprint)
    }
  }

  return key
}

api.interceptors.request.use((config) => {
  const lockable = config as LockableConfig

  if (isMutation(config.method) && !shouldSkipMutationLock(config.url)) {
    config.headers.set('X-Idempotency-Key', idempotencyKeyFor(config))
    lockable.__bookoraMutationLock = true
    beginMutationLock()
  }

  return config
})

const releaseMutationLock = (config?: InternalAxiosRequestConfig) => {
  const lockable = config as LockableConfig | undefined
  if (lockable?.__bookoraMutationLock) {
    lockable.__bookoraMutationLock = false
    endMutationLock()
  }
}

api.interceptors.response.use(
  (response) => {
    releaseMutationLock(response.config)
    return response
  },
  (error) => {
    releaseMutationLock(error?.config)
    return Promise.reject(error)
  },
)

export default api
