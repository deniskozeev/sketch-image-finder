import { request, dataToString, httpError } from '../http'

// One cheap, free request per service to tell the user right away whether
// the key they just saved works. Throws the same errors as real requests.

function enc(v) {
  return encodeURIComponent(String(v || '').trim())
}

const CHECKS = {
  unsplash: (s) => ({
    url: 'https://api.unsplash.com/photos?per_page=1',
    headers: { Authorization: 'Client-ID ' + s.stock.unsplash.key.trim(), 'Accept-Version': 'v1' },
  }),
  pexels: (s) => ({
    url: 'https://api.pexels.com/v1/curated?per_page=1',
    headers: { Authorization: s.stock.pexels.key.trim() },
  }),
  pixabay: (s) => ({
    url: 'https://pixabay.com/api/?per_page=3&key=' + enc(s.stock.pixabay.key),
  }),
  pollinations: (s) => ({
    url: 'https://gen.pollinations.ai/account/key',
    headers: { Authorization: 'Bearer ' + s.ai.pollinations.key.trim() },
  }),
  cloudflare: (s) => ({
    url: 'https://api.cloudflare.com/client/v4/accounts/' + enc(s.ai.cloudflare.accountId) + '/ai/models/search?per_page=1',
    headers: { Authorization: 'Bearer ' + s.ai.cloudflare.token.trim() },
  }),
  gemini: (s) => ({
    url: 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
    headers: { 'x-goog-api-key': s.ai.gemini.key.trim() },
  }),
  quiver: (s) => ({
    url: 'https://api.quiver.ai/v1/models',
    headers: { Authorization: 'Bearer ' + s.ai.quiver.key.trim() },
  }),
}

export async function checkKey(settings, id) {
  const make = CHECKS[id]
  if (!make) return
  const { url, headers } = make(settings)
  const res = await request(url, { headers, timeout: 30 })
  if (!res.ok) throw httpError(res.status, dataToString(res.data))
  // Pollinations answers 200 for unknown keys too, with { valid: false }
  if (id === 'pollinations') {
    let json = null
    try {
      json = JSON.parse(dataToString(res.data))
    } catch (e) {
      json = null
    }
    if (json && json.valid === false) throw httpError(401, 'invalid key')
  }
}
