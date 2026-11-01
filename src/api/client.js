export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const baseUrl = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001'
).replace(/\/$/, '')
const sessionKey = 'donatefortree.session'
let memoryToken
export function getToken() {
  if (memoryToken !== undefined) return memoryToken
  try {
    return localStorage.getItem(sessionKey) || ''
  } catch {
    return ''
  }
}
export function saveToken(token) {
  memoryToken = token
  try {
    if (token) localStorage.setItem(sessionKey, token)
    else localStorage.removeItem(sessionKey)
  } catch {
    /* The current session still works when browser storage is unavailable. */
  }
}

export async function request(
  path,
  { method = 'GET', body, signal, authenticated = false, headers = {} } = {},
) {
  const token = authenticated ? getToken() : ''
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), 12000)
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      signal: signal
        ? AbortSignal.any([signal, timeout.signal])
        : timeout.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    const raw = await response.text()
    let data
    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      throw new ApiError('The API returned invalid JSON.', response.status)
    }
    if (!response.ok) {
      if (response.status === 401 && token && token === getToken()) {
        window.dispatchEvent(new CustomEvent('auth-expired', { detail: token }))
      }
      throw new ApiError(
        data?.message || `API request failed (${response.status}).`,
        response.status,
      )
    }
    if (data === null) throw new ApiError('The API returned an empty response.')
    return data
  } catch (error) {
    if (signal?.aborted || error instanceof ApiError) throw error
    throw new ApiError(
      timeout.signal.aborted
        ? 'The API took too long to respond. Please try again.'
        : 'Cannot reach the API. Check your connection and start the demo API.',
    )
  } finally {
    clearTimeout(timer)
  }
}
