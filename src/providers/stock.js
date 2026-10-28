import { getJSON, request } from '../http'

const PER_PAGE = 24
const CYRILLIC = /[а-яё]/i

export const STOCK_PROVIDERS = {
  unsplash: { name: 'Unsplash', keyUrl: 'https://unsplash.com/oauth/applications', vector: false },
  pexels: { name: 'Pexels', keyUrl: 'https://www.pexels.com/api/new/', vector: false },
  pixabay: { name: 'Pixabay', keyUrl: 'https://pixabay.com/api/docs/', vector: true },
}

function qs(params) {
  return Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&')
}

// orientation: 'any' | 'landscape' | 'portrait' | 'square'

async function searchUnsplash({ query, orientation, page }, key) {
  const json = await getJSON(
    'https://api.unsplash.com/search/photos?' +
      qs({
        query,
        page,
        per_page: PER_PAGE,
        orientation: { landscape: 'landscape', portrait: 'portrait', square: 'squarish' }[orientation],
        lang: CYRILLIC.test(query) ? 'ru' : undefined,
      }),
    { Authorization: 'Client-ID ' + key, 'Accept-Version': 'v1' }
  )
  return {
    hasMore: page < (json.total_pages || 0),
    items: (json.results || []).map((p) => ({
      id: 'unsplash:' + p.id,
      provider: 'unsplash',
      thumb: p.urls.small,
      full: p.urls.raw + (p.urls.raw.indexOf('?') >= 0 ? '&' : '?') + 'w=2400&fm=jpg&q=85&fit=max',
      width: p.width,
      height: p.height,
      color: p.color,
      title: p.alt_description || p.description || '',
      author: p.user && p.user.name,
      authorUrl: p.user && p.user.links && p.user.links.html + '?utm_source=image_finder&utm_medium=referral',
      pageUrl: p.links && p.links.html,
      downloadLocation: p.links && p.links.download_location,
    })),
  }
}

async function searchPexels({ query, orientation, page }, key) {
  const json = await getJSON(
    'https://api.pexels.com/v1/search?' +
      qs({
        query,
        page,
        per_page: PER_PAGE,
        orientation: orientation === 'any' ? undefined : orientation,
        locale: CYRILLIC.test(query) ? 'ru-RU' : undefined,
      }),
    { Authorization: key }
  )
  return {
    hasMore: !!json.next_page,
    items: (json.photos || []).map((p) => ({
      id: 'pexels:' + p.id,
      provider: 'pexels',
      thumb: p.src.medium,
      full: p.src.original + '?auto=compress&cs=tinysrgb&w=2400',
      width: p.width,
      height: p.height,
      color: p.avg_color,
      title: p.alt || '',
      author: p.photographer,
      authorUrl: p.photographer_url,
      pageUrl: p.url,
    })),
  }
}

async function searchPixabay({ query, orientation, page, vector }, key) {
  const json = await getJSON(
    'https://pixabay.com/api/?' +
      qs({
        key,
        q: query.slice(0, 100),
        page,
        per_page: PER_PAGE,
        image_type: vector ? 'vector' : 'photo',
        orientation: { landscape: 'horizontal', portrait: 'vertical' }[orientation],
        lang: CYRILLIC.test(query) ? 'ru' : undefined,
        safesearch: 'true',
      })
  )
  let hits = json.hits || []
  // Pixabay has no "square" filter
  if (orientation === 'square') {
    hits = hits.filter((h) => {
      const r = h.imageWidth / h.imageHeight
      return r > 0.85 && r < 1.18
    })
  }
  return {
    hasMore: page * PER_PAGE < (json.totalHits || 0),
    items: hits.map((h) => ({
      id: 'pixabay:' + h.id,
      provider: 'pixabay',
      thumb: h.webformatURL,
      full: h.largeImageURL,
      width: h.imageWidth,
      height: h.imageHeight,
      title: h.tags || '',
      author: h.user,
      authorUrl: 'https://pixabay.com/users/' + h.user + '-' + h.user_id + '/',
      pageUrl: h.pageURL,
      vector: !!vector,
      // only present for keys with Pixabay "full API access"
      vectorUrl: h.vectorURL,
    })),
  }
}

const SEARCHERS = { unsplash: searchUnsplash, pexels: searchPexels, pixabay: searchPixabay }

// Search all enabled providers in parallel and interleave the results.
export async function searchStock(settings, { query, orientation = 'any', page = 1, vector = false }) {
  const enabled = Object.keys(SEARCHERS).filter((id) => {
    const s = settings.stock[id]
    if (!s.enabled) return false
    if (vector && !STOCK_PROVIDERS[id].vector) return false
    return true
  })

  const errors = []
  const active = enabled.filter((id) => {
    if (!settings.stock[id].key) {
      errors.push({ provider: id, code: 'NO_KEY' })
      return false
    }
    return true
  })

  const results = await Promise.all(
    active.map((id) =>
      SEARCHERS[id]({ query, orientation, page, vector }, settings.stock[id].key).catch((err) => {
        errors.push({ provider: id, message: err.message, status: err.status })
        return { items: [], hasMore: false }
      })
    )
  )

  const items = []
  const max = Math.max(0, ...results.map((r) => r.items.length))
  for (let i = 0; i < max; i++) {
    results.forEach((r) => {
      if (r.items[i]) items.push(r.items[i])
    })
  }
  return {
    items,
    hasMore: results.some((r) => r.hasMore),
    errors,
    providers: enabled,
  }
}

// Unsplash API guidelines require pinging download_location when a photo is used.
export function trackDownload(settings, item) {
  if (item.provider !== 'unsplash' || !item.downloadLocation) return
  const key = settings.stock.unsplash.key
  request(item.downloadLocation, { headers: { Authorization: 'Client-ID ' + key } }).catch(() => {})
}
