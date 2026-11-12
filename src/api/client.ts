export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}
const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')
let memoryToken = ''
try {
  memoryToken = localStorage.getItem('token') || ''
} catch {
  /* Storage may be disabled. */
}
export const tokenStorage = {
  get: () => memoryToken,
  set(value: string) {
    memoryToken = value
    try {
      if (value) localStorage.setItem('token', value)
      else localStorage.removeItem('token')
    } catch {
      /* Keep the session in memory. */
    }
  },
}
let unauthorized: (protectedRoute: boolean) => void = () => {}
export function onUnauthorized(handler: typeof unauthorized) {
  unauthorized = handler
}
type Options = {
  method?: string
  body?: unknown
  signal?: AbortSignal
  auth?: 'optional' | 'required' | 'none'
}
export async function http<T>(path: string, options: Options = {}, retry = true): Promise<T> {
  const token = options.auth === 'none' ? '' : tokenStorage.get()
  let response: Response
  try {
    response = await fetch(base + path, {
      method: options.method || 'GET',
      signal: options.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.')
  }
  if (response.status === 401 && options.auth !== 'none') {
    tokenStorage.set('')
    unauthorized(options.auth === 'required')
    if (options.auth === 'optional' && retry) return http<T>(path, options, false)
  }
  const data = await response.json().catch(() => null)
  if (!response.ok)
    throw new ApiError(
      response.status,
      Array.isArray(data?.message)
        ? data.message.join('. ')
        : data?.message || 'The request could not be completed. Please try again.',
    )
  return data as T
}
export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.'
