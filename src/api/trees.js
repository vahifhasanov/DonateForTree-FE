import { request, ApiError } from './client.js'
import { isTree } from '../utils/trees.js'

export async function getTrees(signal, mine = false) {
  const data = await request(mine ? '/my-trees' : '/trees', {
    signal,
    authenticated: mine,
  })
  if (!Array.isArray(data) || !data.every(isTree))
    throw new ApiError('The API returned invalid tree data.')
  return data
}

export async function plantTree(payload, requestKey) {
  const data = await request('/trees', {
    method: 'POST',
    body: payload,
    authenticated: true,
    headers: { 'Idempotency-Key': requestKey },
  })
  if (!isTree(data))
    throw new ApiError(
      'The API returned an invalid planting. Retry with the same parameters to check the result.',
    )
  return data
}
