import { request, ApiError } from './client.js'

function isUser(user) {
  return Boolean(
    user &&
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string',
  )
}
export async function authenticate(credentials, signup) {
  const data = await request(signup ? '/auth/register' : '/auth/login', {
    method: 'POST',
    body: credentials,
  })
  if (!isUser(data?.user) || typeof data.token !== 'string' || !data.token)
    throw new ApiError('The API returned an invalid session.')
  return data
}
export async function getCurrentUser(signal) {
  const user = await request('/auth/me', { signal, authenticated: true })
  if (!isUser(user)) throw new ApiError('The API returned invalid user data.')
  return user
}
export const endSession = () =>
  request('/auth/logout', { method: 'POST', authenticated: true })
