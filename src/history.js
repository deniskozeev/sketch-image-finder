/* globals NSData, NSString, NSUTF8StringEncoding, NSMakeRange */
import Settings from 'sketch/settings'
import { dataToString, dataToBase64 } from './http'
import { toJPEG, svgDataURL } from './image-utils'
import { pluginDir, ensureDir, fileExists, removePath, readJSON, writeJSON, reveal, uniqueName } from './storage'

// Generated images are kept on disk so they survive a Sketch restart:
//   history/index.json        list of items, newest last
//   history/<readable>.<ext>  original image or SVG, named after date, prompt and model
//   history/.thumbs/<id>.jpg  panel thumbnails (hidden, so Finder shows only images)
// The folder is the source of truth: an image deleted in Finder disappears
// from the panel. Search queries are small and live in plugin settings.

const LIMIT = 300
const SEARCH_LIMIT = 30
const SEARCH_KEY = 'image-finder.searches.v1'

function dir() {
  return pluginDir('history')
}

function thumbsDir() {
  return dir() + '/.thumbs'
}

function readIndex() {
  const list = readJSON(dir() + '/index.json', [])
  return Array.isArray(list) ? list : []
}

function writeIndex(list) {
  ensureDir(dir())
  writeJSON(dir() + '/index.json', list)
}

function thumbPath(item) {
  // older items kept their thumbnail next to the image
  return item.thumb && item.thumb.indexOf('/') < 0 && !item.thumbHidden ? dir() + '/' + item.thumb : thumbsDir() + '/' + item.thumb
}

function removeItemFiles(item) {
  if (item.file) removePath(dir() + '/' + item.file)
  if (item.thumb) removePath(thumbPath(item))
}

// Items whose image is still on disk; the index is cleaned up as a side effect.
function liveItems() {
  const list = readIndex()
  const live = list.filter((i) => i.file && fileExists(dir() + '/' + i.file))
  if (live.length !== list.length) {
    list.filter((i) => live.indexOf(i) < 0).forEach((i) => i.thumb && removePath(thumbPath(i)))
    writeIndex(live)
  }
  return live
}

// PNG starts with 0x89 'P', WebP with 'RIFF', otherwise JPEG
function rasterExt(data) {
  const head = String(dataToBase64(data.subdataWithRange(NSMakeRange(0, Math.min(12, Number(data.length()))))))
  if (head.indexOf('iVBOR') === 0) return 'png'
  if (head.indexOf('UklGR') === 0) return 'webp'
  return 'jpg'
}

// meta: { id, tab, batch, title, prompt, modelName, width, height }
// Returns the saved file's path (the panel uses it for drag and drop).
export function saveToHistory(result, meta) {
  try {
    ensureDir(dir())
    const created = Date.now()
    const item = Object.assign({ created, kind: result.kind }, meta)
    // "Model — prompt": Sketch names a dropped file's layer after the file
    const base = [meta.modelName, meta.label || meta.prompt].filter(Boolean).join(' — ')
    if (result.kind === 'svg') {
      item.file = uniqueName(dir(), base, 'svg')
      NSString.stringWithString(result.svg).writeToFile_atomically_encoding_error(dir() + '/' + item.file, true, NSUTF8StringEncoding, null)
    } else {
      item.file = uniqueName(dir(), base, rasterExt(result.data))
      result.data.writeToFile_atomically(dir() + '/' + item.file, true)
      const thumb = toJPEG(result.data, 480, 0.8)
      if (thumb) {
        ensureDir(thumbsDir())
        item.thumb = meta.id + '.jpg'
        item.thumbHidden = true
        thumb.writeToFile_atomically(thumbsDir() + '/' + item.thumb, true)
      }
    }
    const list = liveItems()
    list.push(item)
    while (list.length > LIMIT) removeItemFiles(list.shift())
    writeIndex(list)
    return dir() + '/' + item.file
  } catch (e) {
    console.error(e)
    return null
  }
}

function thumbURL(item) {
  if (item.kind === 'svg') {
    const data = NSData.dataWithContentsOfFile(dir() + '/' + item.file)
    return data ? svgDataURL(dataToString(data)) : null
  }
  const data = (item.thumb && NSData.dataWithContentsOfFile(thumbPath(item))) || NSData.dataWithContentsOfFile(dir() + '/' + item.file)
  return data ? 'data:image/jpeg;base64,' + dataToBase64(data) : null
}

// Batches of one tab, newest first. `limit` counts batches.
export function listHistory(tab, offset = 0, limit = 12) {
  const items = liveItems().filter((i) => i.tab === tab)
  const batches = []
  const byKey = {}
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i]
    let b = byKey[it.batch]
    if (!b) {
      b = byKey[it.batch] = { key: it.batch, title: it.title, created: it.created, items: [] }
      batches.push(b)
    }
    b.items.unshift(it)
  }
  const page = batches.slice(offset, offset + limit).map((b) =>
    Object.assign({}, b, {
      items: b.items.map((it) => ({
        id: it.id,
        kind: it.kind,
        width: it.width,
        height: it.height,
        modelName: it.modelName,
        thumb: thumbURL(it),
        filePath: dir() + '/' + it.file,
        state: 'done',
      })),
    })
  )
  return { batches: page, hasMore: offset + limit < batches.length }
}

// The stored result in the same shape the generators return
export function loadFromHistory(id) {
  const item = readIndex().find((i) => i.id === id)
  if (!item) return null
  const data = NSData.dataWithContentsOfFile(dir() + '/' + item.file)
  if (!data) return null
  const base = { prompt: item.prompt, label: item.label || (item.prompt || '').trim(), modelName: item.modelName }
  return item.kind === 'svg' ? Object.assign(base, { kind: 'svg', svg: dataToString(data) }) : Object.assign(base, { kind: 'raster', data })
}

export function generationsCount() {
  return liveItems().length
}

export function clearGenerations() {
  removePath(dir())
}

export function revealGenerations() {
  reveal(dir())
}

// ---------- search queries ----------

function readSearches() {
  try {
    const raw = Settings.settingForKey(SEARCH_KEY)
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw
    return v && typeof v === 'object' ? v : {}
  } catch (e) {
    return {}
  }
}

// kind: 'photo' | 'vector'
export function rememberSearch(kind, query, orientation) {
  const all = readSearches()
  const list = (all[kind] || []).filter((s) => s.query.toLowerCase() !== query.toLowerCase())
  list.unshift({ query, orientation, time: Date.now() })
  all[kind] = list.slice(0, SEARCH_LIMIT)
  Settings.setSettingForKey(SEARCH_KEY, JSON.stringify(all))
}

export function listSearches(kind) {
  return readSearches()[kind] || []
}

export function searchesCount() {
  const all = readSearches()
  return (all.photo || []).length + (all.vector || []).length
}

export function clearSearches() {
  Settings.setSettingForKey(SEARCH_KEY, JSON.stringify({}))
}
