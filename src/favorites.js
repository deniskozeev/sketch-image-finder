/* globals NSData */
import Settings from 'sketch/settings'
import { getBinary, dataToBase64 } from './http'
import { pluginDir, ensureDir, fileExists, removePath, readJSON, writeJSON, reveal, uniqueName } from './storage'

// Stock photos the user hearted, filed under the query they were found with.
//   favorites/favorites.json                    the list
//   favorites/<query> — <source> — <author>.jpg preview, one per favorite
//   favorites/.full/<id>.jpg                    large copy (Pixabay only: its URLs are temporary)
// The folder is the source of truth: deleting a preview in Finder removes the
// photo from favorites.

const OLD_KEY = 'image-finder.favorites.v1' // first version kept the list in plugin settings
const LIMIT = 500

function dir() {
  return pluginDir('favorites')
}

function fullDir() {
  return dir() + '/.full'
}

function readList() {
  const list = readJSON(dir() + '/favorites.json', null)
  return Array.isArray(list) ? list : []
}

function writeList(list) {
  ensureDir(dir())
  writeJSON(dir() + '/favorites.json', list)
}

function safeId(id) {
  return String(id).replace(/[^a-z0-9_-]/gi, '_')
}

function removeFiles(fav) {
  if (fav.file) removePath(dir() + '/' + fav.file)
  if (fav.fullFile) removePath(fullDir() + '/' + fav.fullFile)
}

async function download(url, path) {
  const { data } = await getBinary(url)
  data.writeToFile_atomically(path, true)
}

// Saves the preview (and the large copy for Pixabay) next to the list.
async function storeFiles(fav, sourceName) {
  const item = fav.item
  ensureDir(dir())
  const base = [fav.query, sourceName, item.author].filter(Boolean).join(' — ')
  const name = uniqueName(dir(), base, 'jpg')
  await download(item.thumb, dir() + '/' + name)
  fav.file = name
  if (item.provider === 'pixabay') {
    ensureDir(fullDir())
    try {
      fav.fullFile = safeId(item.id) + '.jpg'
      await download(item.full, fullDir() + '/' + fav.fullFile)
    } catch (e) {
      fav.fullFile = null
    }
  }
}

// One-time move of favorites saved by the first version (no files yet)
async function migrate(sourceNames) {
  let old = null
  try {
    const raw = Settings.settingForKey(OLD_KEY)
    old = typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch (e) {
    old = null
  }
  if (!Array.isArray(old) || !old.length) return
  const list = readList()
  for (const f of old) {
    if (list.some((x) => x.item.id === f.item.id)) continue
    const fav = { kind: f.kind, query: f.query, time: f.time, item: f.item }
    try {
      await storeFiles(fav, sourceNames[f.item.provider])
      list.push(fav)
    } catch (e) {
      // the photo is gone from the CDN, drop it
    }
  }
  writeList(list)
  Settings.setSettingForKey(OLD_KEY, JSON.stringify([]))
}

// Favorites whose preview is still on disk; the list is cleaned up as a side effect.
function liveList() {
  const list = readList()
  const live = list.filter((f) => f.file && fileExists(dir() + '/' + f.file))
  if (live.length !== list.length) {
    list.filter((f) => live.indexOf(f) < 0).forEach(removeFiles)
    writeList(live)
  }
  return live
}

// kind: 'photo' | 'vector'. Returns the new state.
export async function toggleFavorite(item, kind, query, sourceName) {
  const list = liveList()
  const existing = list.find((f) => f.item.id === item.id)
  if (existing) {
    removeFiles(existing)
    writeList(list.filter((f) => f !== existing))
    return { favorite: false }
  }
  const fav = { kind, query: query || '', time: Date.now(), item }
  await storeFiles(fav, sourceName)
  list.unshift(fav)
  while (list.length > LIMIT) removeFiles(list.pop())
  writeList(list)
  return { favorite: true }
}

export async function favoriteIds(sourceNames) {
  await migrate(sourceNames)
  return liveList().map((f) => f.item.id)
}

// Items for the panel, previews read from disk (work offline too)
export function listFavorites(kind) {
  return liveList()
    .filter((f) => f.kind === kind)
    .map((f) => {
      const item = Object.assign({}, f.item, { query: f.query, favTime: f.time })
      const data = NSData.dataWithContentsOfFile(dir() + '/' + f.file)
      if (data) item.thumb = 'data:image/jpeg;base64,' + dataToBase64(data)
      return item
    })
}

// Local large copy (Pixabay favorites), or null
export function favoriteImageData(itemId) {
  const fav = readList().find((f) => f.item.id === itemId)
  if (!fav || !fav.fullFile) return null
  return NSData.dataWithContentsOfFile(fullDir() + '/' + fav.fullFile)
}

export function favoritesCount() {
  return liveList().length
}

export function clearFavorites() {
  removePath(dir())
}

export function revealFavorites() {
  reveal(dir())
}
