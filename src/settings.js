import Settings from 'sketch/settings'

const KEY = 'image-finder.settings.v1'

export const DEFAULTS = {
  stock: {
    unsplash: { enabled: true, key: '' },
    pexels: { enabled: true, key: '' },
    pixabay: { enabled: true, key: '' },
  },
  ai: {
    cloudflare: { accountId: '', token: '' },
    pollinations: { key: '' },
    gemini: { key: '' },
    quiver: { key: '', adminKey: '' }, // adminKey is optional, only used to show the balance
  },
  genCount: 4,
  vectorCount: 1, // SVG generation is slow and costly, one variant is usually enough
  aiModel: 'pl:black-forest-labs/flux.2-klein-4b',
  vectorModel: 'qv:arrow-2',
  vectorizeModel: 'arrow-2',
  viewCols: 2,
  language: 'auto', // 'auto' follows macOS; otherwise 'en' | 'de' | 'es' | 'ru'
}

function merge(defaults, value) {
  if (value == null || typeof defaults !== 'object' || Array.isArray(defaults)) {
    return value == null ? defaults : value
  }
  const out = {}
  Object.keys(defaults).forEach((k) => {
    out[k] = merge(defaults[k], value[k])
  })
  return out
}

export function loadSettings() {
  let stored = null
  try {
    stored = Settings.settingForKey(KEY)
    if (typeof stored === 'string') stored = JSON.parse(stored)
  } catch (e) {
    stored = null
  }
  return merge(DEFAULTS, stored || {})
}

export function saveSettings(settings) {
  const clean = merge(DEFAULTS, settings || {})
  clean.genCount = Math.max(1, Math.min(9, parseInt(clean.genCount, 10) || 4))
  clean.vectorCount = Math.max(1, Math.min(9, parseInt(clean.vectorCount, 10) || 1))
  clean.viewCols = clean.viewCols === 1 ? 1 : 2
  Settings.setSettingForKey(KEY, JSON.stringify(clean))
  return clean
}

export function hasAiKey(settings, provider) {
  const ai = settings.ai
  switch (provider) {
    case 'cloudflare':
      return !!(ai.cloudflare.accountId && ai.cloudflare.token)
    default:
      return !!(ai[provider] && ai[provider].key)
  }
}
