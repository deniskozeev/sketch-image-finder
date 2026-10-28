/* globals NSLocale, NSWorkspace, NSURL, NSThread, NSApp, NSAlert, NSImage, NSMakeRect, NSMakePoint, NSEvent, NSProcessInfo, NSTemporaryDirectory, NSData, NSDocumentController, NSMutableDictionary */
import BrowserWindow from 'sketch-module-web-view'
import { isWebviewPresent, sendToWebview } from 'sketch-module-web-view/remote'
import sketch from 'sketch'
import UI from 'sketch/ui'

import { loadSettings, saveSettings, hasAiKey } from './settings'
import { MODELS, PROVIDERS, VECTORIZE_MODELS, findModel, mixMembers } from './catalog'
import { STOCK_PROVIDERS, searchStock, trackDownload } from './providers/stock'
import { generate, vectorize, pollinationsBalance, quiverBalance } from './providers/ai'
import { getBinary, dataToString, base64ToData } from './http'
import { thumbDataURL, svgDataURL, pixelSize, svgSize, isSVGData } from './image-utils'
import { ensureDir, fileExists, uniqueName } from './storage'
import { selectionInfo, selectedLayers, imageDataOf, insertRaster, insertSVG, settleDropped, fillDropped, isDropPlaceholder } from './sketch-bridge'
import { checkKey } from './providers/check'
import { toggleFavorite, favoriteIds, listFavorites, favoriteImageData, favoritesCount, clearFavorites, revealFavorites } from './favorites'
import {
  saveToHistory,
  listHistory,
  loadFromHistory,
  rememberSearch,
  listSearches,
  generationsCount,
  clearGenerations,
  revealGenerations,
  searchesCount,
  clearSearches,
} from './history'

const IDENT = 'image-finder.panel.v3'
const DROP_KEY = 'image-finder.drop' // bumped when the fixed size changes, so an old saved frame is ignored

// Generated images live here until the panel is closed.
const results = {}
const batches = {}
let counter = 0

const LANGUAGES = ['en', 'de', 'es', 'ru']

// The language chosen in Settings, or the first macOS language we have a
// translation for; English otherwise.
function lang() {
  const chosen = loadSettings().language
  if (LANGUAGES.indexOf(chosen) >= 0) return chosen
  const preferred = NSLocale.preferredLanguages()
  for (let i = 0; i < preferred.length; i++) {
    const code = String(preferred[i]).slice(0, 2)
    if (LANGUAGES.indexOf(code) >= 0) return code
  }
  return 'en'
}

// Texts shown by the plugin itself (Sketch messages, About window)
const TEXTS = {
  ru: {
    new: 'Картинка добавлена на холст',
    fill: 'Картинка вставлена в «{name}»',
    replace: 'Картинка в «{name}» заменена',
    variant: 'Вариант добавлен рядом с «{name}»',
    inFrame: 'Картинка добавлена в «{name}»',
    frameFill: 'Картинка стала заливкой «{name}»',
    version: 'Версия',
    about: 'Поиск фото и векторов на Unsplash, Pexels и Pixabay. Генерация фото и SVG нейросетями по описанию или по референсу — прямо в Sketch.',
    author: 'Автор — Денис Козеев',
  },
  en: {
    new: 'Image added to the canvas',
    fill: 'Image placed into “{name}”',
    replace: 'Replaced the image in “{name}”',
    variant: 'Variant placed next to “{name}”',
    inFrame: 'Image added into “{name}”',
    frameFill: 'Image is now the fill of “{name}”',
    version: 'Version',
    about: 'Search photos and vectors on Unsplash, Pexels and Pixabay. Generate photos and SVG with AI from a prompt or a reference image — right inside Sketch.',
    author: 'Created by Denis Kozeev',
  },
  de: {
    new: 'Bild zur Arbeitsfläche hinzugefügt',
    fill: 'Bild in „{name}“ eingesetzt',
    replace: 'Bild in „{name}“ ersetzt',
    variant: 'Variante neben „{name}“ eingefügt',
    inFrame: 'Bild in „{name}“ hinzugefügt',
    frameFill: 'Bild ist jetzt die Füllung von „{name}“',
    version: 'Version',
    about: 'Fotos und Vektoren auf Unsplash, Pexels und Pixabay suchen. Fotos und SVG mit KI aus einer Beschreibung oder einer Referenz erzeugen – direkt in Sketch.',
    author: 'Erstellt von Denis Kozeev',
  },
  es: {
    new: 'Imagen añadida al lienzo',
    fill: 'Imagen colocada en «{name}»',
    replace: 'Imagen de «{name}» reemplazada',
    variant: 'Variante añadida junto a «{name}»',
    inFrame: 'Imagen añadida dentro de «{name}»',
    frameFill: 'La imagen ahora es el relleno de «{name}»',
    version: 'Versión',
    about: 'Busca fotos y vectores en Unsplash, Pexels y Pixabay. Genera fotos y SVG con IA a partir de una descripción o una referencia, directamente en Sketch.',
    author: 'Creado por Denis Kozeev',
  },
}

function text(key, vars) {
  let s = (TEXTS[lang()] || TEXTS.en)[key] || TEXTS.en[key] || ''
  if (vars) Object.keys(vars).forEach((k) => (s = s.split('{' + k + '}').join(vars[k])))
  return s
}

function currentSelectionInfo() {
  return selectionInfo(selectedLayers(sketch.getSelectedDocument()))
}

// After Pollinations says the account is out of Pollen, mixes skip its
// models for a while so the whole batch goes to services that still work.
let pollinationsEmptyUntil = 0

function usableInMix(settings, id) {
  const provider = findModel(id).provider
  if (provider === 'pollinations' && Date.now() < pollinationsEmptyUntil) return false
  return hasAiKey(settings, provider)
}

function stockNames() {
  const names = {}
  Object.keys(STOCK_PROVIDERS).forEach((id) => (names[id] = STOCK_PROVIDERS[id].name))
  return names
}

async function state() {
  const settings = loadSettings()
  return {
    lang: lang(),
    settings,
    providers: PROVIDERS,
    stockProviders: STOCK_PROVIDERS,
    models: MODELS.map((m) => {
      if (!m.mix) return Object.assign({}, m, { available: hasAiKey(settings, m.provider) })
      const members = mixMembers(m, (id) => usableInMix(settings, id))
      return Object.assign({}, m, { members, available: members.length > 0 })
    }),
    vectorizeModels: VECTORIZE_MODELS,
    favoriteIds: await favoriteIds(stockNames()),
    selection: currentSelectionInfo(),
  }
}

// Errors thrown in handlers don't survive the bridge (Error objects stringify
// to {}), so every handler returns either { ok: true, ... } or { error }.
function safe(fn) {
  return (...args) =>
    Promise.resolve()
      .then(() => fn(...args))
      .then((res) => Object.assign({ ok: true }, res))
      .catch((err) => {
        console.error(err)
        return { error: (err && err.message) || String(err), status: err && err.status }
      })
}

function shortText(text, max = 40) {
  const t = (text || '').trim().replace(/\s+/g, ' ')
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}

function reportInsert(res) {
  UI.message(text(res.action, { name: res.name }))
}

function registerHandlers(win) {
  const on = (name, fn) => win.webContents.on(name, safe(fn))

  on('getState', () => state())

  on('saveSettings', (settings) => {
    saveSettings(settings)
    return state()
  })

  let balanceCache = null
  on('balances', async () => {
    if (balanceCache && Date.now() - balanceCache.time < 60000) return { balances: balanceCache.value }
    const settings = loadSettings()
    const [pollinations, quiver] = await Promise.all([pollinationsBalance(settings), quiverBalance(settings)])
    const value = {}
    if (pollinations) value.pollinations = pollinations
    if (quiver) value.quiver = quiver
    balanceCache = { time: Date.now(), value }
    return { balances: value }
  })

  // Drag of a generated image out of the panel. WebKit can only drag the
  // rendered thumbnail (low-res, and nothing at all for SVG), so the panel
  // cancels its own drag and the plugin starts a native file drag instead,
  // exactly like dragging the file from Finder: Sketch imports SVG as vectors,
  // bitmaps at full size, and names the layer after the file.
  on('startDrag', ({ path }) => {
    const webView = panelWebView()
    const panel = existingPanel()
    if (!webView || !panel) throw new Error('Drag is not available')
    // The panel's message arrives asynchronously: by now the button may be up
    if ((Number(NSEvent.pressedMouseButtons()) & 1) === 0) return { started: false }
    // ...and the app's "current event" may be anything, which made the drag
    // start only every few tries. Build a fresh left-mouse-dragged event at
    // the cursor instead (6 = NSEventTypeLeftMouseDragged).
    const location = panel.mouseLocationOutsideOfEventStream()
    const event = NSEvent.mouseEventWithType_location_modifierFlags_timestamp_windowNumber_context_eventNumber_clickCount_pressure(
      6,
      location,
      0,
      NSProcessInfo.processInfo().systemUptime(),
      panel.windowNumber(),
      null,
      0,
      1,
      1
    )
    const p = webView.convertPoint_fromView(location, null)
    const before = pageLayerIds()
    // Shared with onSelectionChanged, which runs in its own script context
    // while Sketch is still handling the drop
    const shared = NSMutableDictionary.dictionary()
    shared.setObject_forKey(path, 'file')
    NSThread.mainThread().threadDictionary().setObject_forKey(shared, DROP_KEY)
    // An invisible stand-in is dragged (see isDropPlaceholder): Sketch drew a
    // dropped picture where *it* wanted before the plugin could move it.
    const ok = webView.dragFile_fromRect_slideBack_event(dropPlaceholder(path), NSMakeRect(p.x - 16, p.y - 16, 32, 32), true, event)
    // dragFile runs the whole drag session, so the cursor is now where the
    // file was released and Sketch has usually imported it already. Otherwise
    // the panel keeps calling settleDrop until the new layer shows up.
    const at = NSEvent.mouseLocation()
    pendingDrop = before ? { before, file: path, x: Number(at.x), y: Number(at.y), time: Date.now(), shared } : null
    settleDrop()
    // ⌘-drop onto an image or a shape: no new layer, Sketch put the
    // placeholder into it ("Hold ⌘ to replace image / add as image fill")
    const doc = sketch.getSelectedDocument()
    if (pendingDrop && doc && fillDropped(doc.selectedPage, path, canvasPoint(at))) pendingDrop = null
    NSThread.mainThread().threadDictionary().removeObjectForKey(DROP_KEY)
    return { started: !!ok }
  })

  on('settleDrop', () => ({ done: settleDrop() }))

  on('openUrl', (url) => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url))
  })

  on('search', (params) => {
    if (params.page === 1) rememberSearch(params.vector ? 'vector' : 'photo', params.query, params.orientation)
    return searchStock(loadSettings(), params)
  })

  on('toggleFavorite', ({ item, kind, query }) => toggleFavorite(item, kind, query, stockNames()[item.provider]))
  on('favorites', ({ kind }) => ({ items: listFavorites(kind) }))

  on('checkKey', async ({ id }) => {
    await checkKey(loadSettings(), id)
    return {}
  })

  on('history', ({ tab, offset }) => listHistory(tab, offset || 0))
  on('searchHistory', ({ kind }) => ({ items: listSearches(kind) }))
  // Settings → History: what is stored, clearing and opening each part separately
  on('storageInfo', () => ({ searches: searchesCount(), generations: generationsCount(), favorites: favoritesCount() }))
  on('clearStorage', ({ what }) => {
    if (what === 'searches') clearSearches()
    else if (what === 'generations') clearGenerations()
    else if (what === 'favorites') clearFavorites()
  })
  on('revealStorage', ({ what }) => {
    if (what === 'generations') revealGenerations()
    else if (what === 'favorites') revealFavorites()
  })

  function stockName(item, query, fallback) {
    return shortText(item.title || query || fallback) + ' — ' + (item.author || '') + ' / ' + STOCK_PROVIDERS[item.provider].name
  }

  // Full-size stock files downloaded for drag and drop, by item id. A click
  // on a photo that was just pressed for a drag reuses the same file.
  const stockFiles = {}

  function stockDragDir() {
    return String(NSTemporaryDirectory()) + 'image-finder-drag'
  }

  // Downloads the full-size image (or SVG) into a temp file named like the
  // layer should be: Sketch names a dropped file's layer after the file.
  async function prepareStockFile(item, query) {
    const cached = stockFiles[item.id]
    if (cached && fileExists(cached)) return cached
    const dir = stockDragDir()
    ensureDir(dir)
    let data
    let ext = 'jpg'
    if (item.vectorUrl && /\.svg(\?|$)/i.test(item.vectorUrl)) {
      data = (await getBinary(item.vectorUrl)).data
      ext = 'svg'
    } else {
      // Pixabay favorites have a local copy (their URLs are only temporary)
      data = favoriteImageData(item.id) || (await getBinary(item.full)).data
      if (isSVGData(data)) ext = 'svg'
    }
    const path = dir + '/' + uniqueName(dir, stockName(item, query, ext === 'svg' ? 'Vector' : 'Photo'), ext)
    data.writeToFile_atomically(path, true)
    stockFiles[item.id] = path
    return path
  }

  on('prepareStockDrag', async ({ item, query }) => ({ path: await prepareStockFile(item, query) }))
  // counted only when a drag really starts (Unsplash API guidelines)
  on('stockDragged', ({ item }) => trackDownload(loadSettings(), item))

  async function insertStockItem(item, mode, query) {
    const settings = loadSettings()
    const cached = stockFiles[item.id] && fileExists(stockFiles[item.id]) ? NSData.dataWithContentsOfFile(stockFiles[item.id]) : null
    if (item.vectorUrl && /\.svg(\?|$)/i.test(item.vectorUrl)) {
      const svg = cached || (await getBinary(item.vectorUrl)).data
      const res = insertSVG(sketch.getSelectedDocument(), dataToString(svg), {
        name: stockName(item, query, 'Vector'),
        source: item.provider,
        author: item.author,
        url: item.pageUrl,
      }, mode)
      reportInsert(res)
      return res
    }
    // Pixabay favorites have a local copy (their URLs are only temporary)
    const data = cached || favoriteImageData(item.id) || (await getBinary(item.full)).data
    const meta = {
      name: stockName(item, query, 'Photo'),
      source: item.provider,
      author: item.author,
      authorUrl: item.authorUrl,
      url: item.pageUrl,
    }
    const res = insertRaster(sketch.getSelectedDocument(), data, meta, mode)
    trackDownload(settings, item)
    reportInsert(res)
    return res
  }

  on('insertStock', (item, mode, query) => insertStockItem(item, mode, query))

  on('random', async (params) => {
    const found = await searchStock(loadSettings(), Object.assign({ page: 1 }, params))
    if (!found.items.length) return { empty: true, errors: found.errors }
    const item = found.items[Math.floor(Math.random() * found.items.length)]
    const res = await insertStockItem(item, 'auto', params.query)
    return Object.assign({ item }, res)
  })

  // Captures the selection (proportions + reference image) once per batch,
  // so that every image of the batch uses the same input.
  on('prepareGeneration', ({ useRef, ratio }) => {
    const layers = selectedLayers(sketch.getSelectedDocument())
    const info = selectionInfo(layers)
    const ref = useRef && info.hasImage ? imageDataOf(layers[0]) : null
    // Unique across Sketch sessions: history groups images by this key
    const batchId = 'b' + Date.now().toString(36) + ++counter
    batches[batchId] = {
      ref,
      refName: ref ? String(layers[0].name) : null,
      ratio: ratio || (info.kind !== 'none' && info.kind !== 'other' ? info.ratio : 1),
    }
    return { batchId, hasRef: !!ref, ratio: batches[batchId].ratio }
  })

  // history: { tab, batch, title } — where the image is filed on disk
  function storeResult(result, extra, history) {
    const id = 'h' + Date.now().toString(36) + ++counter
    results[id] = Object.assign({}, result, extra)
    let thumb
    let size
    if (result.kind === 'svg') {
      thumb = svgDataURL(result.svg)
      size = svgSize(result.svg)
    } else {
      thumb = thumbDataURL(result.data, 480)
      size = pixelSize(result.data)
    }
    const out = { id, kind: result.kind, thumb, width: size && size.width, height: size && size.height, modelName: result.modelName }
    if (history) {
      out.filePath = saveToHistory(
        result,
        Object.assign({ id, prompt: extra.prompt, label: extra.label, modelName: result.modelName, width: out.width, height: out.height }, history)
      )
    }
    return out
  }

  on('generateOne', async ({ batchId, modelId, prompt, index, tab, title }) => {
    const batch = batches[batchId]
    let model = findModel(modelId)
    if (!batch || !model) throw new Error('Unknown batch or model')
    const settings = loadSettings()
    if (model.mix) {
      // Each image of the batch goes to the next model of the mix
      let members = mixMembers(model, (id) => usableInMix(settings, id))
      // with a reference, only models that can use it (others would just draw from text)
      if (batch.ref) {
        const withRef = members.filter((id) => findModel(id).ref)
        if (withRef.length) members = withRef
      }
      if (!members.length) throw new Error('No models available for this mix')
      model = findModel(members[index % members.length])
    }
    let result
    try {
      result = await generate(settings, model, {
        prompt,
        ratio: batch.ratio,
        ref: batch.ref,
        index,
      })
    } catch (err) {
      if (model.provider === 'pollinations' && /insufficient balance/i.test(err.message)) {
        pollinationsEmptyUntil = Date.now() + 10 * 60 * 1000
      }
      throw err
    }
    balanceCache = null
    // label for names: the prompt, or the reference layer when there's no prompt
    const label = (prompt || '').trim() || batch.refName || ''
    return storeResult(result, { prompt, label, modelName: result.modelName }, { tab: tab || 'gen', batch: batchId, title })
  })

  on('vectorize', async ({ modelId, title }) => {
    const layers = selectedLayers(sketch.getSelectedDocument())
    const data = imageDataOf(layers[0])
    if (!data) throw new Error('NO_IMAGE_SELECTED')
    const result = await vectorize(loadSettings(), data, modelId)
    balanceCache = null
    const modelName = 'QuiverAI ' + (modelId || 'arrow-2')
    result.modelName = modelName
    return storeResult(result, { prompt: 'vectorized ' + layers[0].name, label: String(layers[0].name), modelName }, {
      tab: 'vector',
      batch: 'v' + Date.now().toString(36) + ++counter,
      title,
    })
  })

  on('insertGenerated', ({ id, mode }) => {
    // Images from earlier sessions are read back from the history folder
    const r = results[id] || loadFromHistory(id)
    if (!r) throw new Error('Result expired, generate again')
    const doc = sketch.getSelectedDocument()
    const meta = {
      // "Model — prompt"; just the model when there was no prompt (a variation)
      name: r.label ? r.modelName + ' — ' + shortText(r.label, 60) : r.modelName,
      source: 'ai',
      model: r.modelName,
      prompt: r.prompt,
    }
    const res = r.kind === 'svg' ? insertSVG(doc, r.svg, meta, mode) : insertRaster(doc, r.data, meta, mode)
    reportInsert(res)
    return res
  })
}

// The open panel lives in the main thread dictionary. We talk to the NSPanel
// directly: BrowserWindow.fromId() re-attaches the JS bridge and throws
// "script message handler already exists" when the panel is already open.
function existingPanel() {
  return NSThread.mainThread().threadDictionary()[IDENT]
}

// ---------- dropped files ----------

// A dropped file lands on the page or inside a frame, so only frames are
// walked (Sketch 2026 dropped MSLayer.children(), and a full walk is slower).
function walkDropTargets(group, visit) {
  const layers = group.layers()
  const count = Number(layers.count())
  for (let i = 0; i < count; i++) {
    const layer = layers.objectAtIndex(i)
    if (visit(layer) && layer.hasFrameTrait && layer.hasFrameTrait()) walkDropTargets(layer, visit)
  }
}

function pageLayerIds() {
  try {
    const doc = sketch.getSelectedDocument()
    if (!doc) return null
    const ids = {}
    walkDropTargets(doc.selectedPage.sketchObject, (layer) => {
      ids[String(layer.objectID())] = true
      return true
    })
    return ids
  } catch (e) {
    console.error(e)
    return null
  }
}

// Layers that appeared on the current page since `before` (not their children)
function newLayers(before) {
  const doc = sketch.getSelectedDocument()
  if (!doc) return []
  const list = []
  walkDropTargets(doc.selectedPage.sketchObject, (layer) => {
    if (before[String(layer.objectID())]) return true
    list.push(sketch.fromNative(layer))
    return false
  })
  return list
}

// Screen point -> page coordinates of the canvas, or null when the point is
// not over the canvas. Same math as Sketch: (view point - scroll origin) / zoom.
function canvasPoint(screenPoint) {
  try {
    const doc = NSDocumentController.sharedDocumentController().currentDocument()
    const view = doc.currentContentViewController().canvasView()
    const win = view.window()
    if (!win) return null
    const p = view.convertPoint_fromView(win.convertPointFromScreen(screenPoint), null)
    const b = view.bounds()
    if (p.x < 0 || p.y < 0 || p.x > b.size.width || p.y > b.size.height) return null
    const port = view.viewPort()
    const origin = port.scrollOrigin()
    const zoom = Number(port.zoomValue())
    return { x: (Number(p.x) - Number(origin.x)) / zoom, y: (Number(p.y) - Number(origin.y)) / zoom }
  } catch (e) {
    return null
  }
}

let pendingDrop = null

// Sketch picks the frame for a dropped file by the whole (often huge) image,
// not by the cursor. Move what it created to the frame under the cursor.
// Transparent 1×1 PNG named like the real file
const PLACEHOLDER_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII='

function dropPlaceholder(file) {
  const dir = String(NSTemporaryDirectory()) + 'image-finder-drop'
  ensureDir(dir)
  const path = dir + '/' + String(file).split('/').pop().replace(/\.[^.]+$/, '') + '.png'
  base64ToData(PLACEHOLDER_PNG).writeToFile_atomically(path, true)
  return path
}

function settleDrop() {
  const drop = pendingDrop
  if (!drop) return true
  try {
    const doc = sketch.getSelectedDocument()
    const layers = newLayers(drop.before)
    if (!layers.length) {
      if (Date.now() - drop.time < 5000) return false
      pendingDrop = null
      return true
    }
    pendingDrop = null
    const early = drop.shared && drop.shared.objectForKey('placed')
    if (early) {
      // already swapped while Sketch handled the drop: only the invisible
      // placeholder is left to remove
      layers.filter(isDropPlaceholder).forEach((layer) => layer.remove())
      const real = doc && doc.getLayerWithID(String(early))
      if (real) doc.selectedLayers = [real]
      return true
    }
    const point = canvasPoint(NSMakePoint(drop.x, drop.y))
    const placed = layers.map((layer) => settleDropped(layer, drop.file, point)).filter(Boolean)
    if (doc && placed.length) doc.selectedLayers = placed
  } catch (e) {
    console.error(e)
    pendingDrop = null
  }
  return true
}

function panelWebView() {
  const panel = existingPanel()
  if (!panel) return null
  const views = panel.contentView().subviews()
  for (let i = 0; i < views.length; i++) {
    if (String(views[i].className()) === 'WKWebView') return views[i]
  }
  return null
}

export function onOpen() {
  const panel = existingPanel()
  if (panel) {
    // The shortcut toggles the panel: close it when it's in front, otherwise bring it up
    if (panel.isVisible() && panel.isKeyWindow()) panel.close()
    else panel.makeKeyAndOrderFront(null)
    return
  }

  const win = new BrowserWindow({
    identifier: IDENT,
    title: 'Image Finder + AI',
    width: 420,
    height: 720,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    alwaysOnTop: true,
    remembersWindowFrame: true,
  })
  // Not win.show(): it reads panel.delegate(), which we remove below, and an
  // exception thrown inside a WebKit callback takes the whole of Sketch down.
  win.once('ready-to-show', () => {
    try {
      NSApp.activateIgnoringOtherApps(true)
      const panel = existingPanel()
      if (panel) panel.makeKeyAndOrderFront(null)
    } catch (e) {
      console.error(e)
    }
  })
  registerHandlers(win)
  win.loadURL(require('../resources/webview.html'))

  // The JS window delegate answers "don't close" to the red close button in
  // current Sketch builds, so the panel could only be closed by the shortcut.
  // Without a delegate macOS closes it natively. NSPanel isn't released on
  // close, so onOpen() simply shows the same panel again (results are kept).
  const created = existingPanel()
  if (created) {
    created.setDelegate(null)
    // Plugin panels don't need minimize / zoom buttons
    ;[1, 2].forEach((kind) => {
      // 1 = NSWindowMiniaturizeButton, 2 = NSWindowZoomButton
      const button = created.standardWindowButton(kind)
      if (button) button.setHidden(true)
    })
  }
}

const SITE = 'https://kozeev.ru'

// Plugins → Image Finder + AI → About: icon, version and a link to the site
export function onAbout(context) {
  const version = String(context.plugin.version())
  const alert = NSAlert.alloc().init()
  alert.setMessageText('Image Finder + AI')
  alert.setInformativeText(text('version') + ' ' + version + '\n\n' + text('about') + '\n\n' + text('author'))
  const iconURL = context.plugin.urlForResourceNamed('icon.png')
  if (iconURL) {
    const icon = NSImage.alloc().initWithContentsOfURL(iconURL)
    if (icon) alert.setIcon(icon)
  }
  alert.addButtonWithTitle('OK')
  alert.addButtonWithTitle('kozeev.ru')
  // 1000 = first button, 1001 = second
  if (Number(alert.runModal()) === 1001) {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(SITE))
  }
}

// Sketch selects a dropped file's layer while it's still handling the drop,
// before the canvas is redrawn: put the real picture in place right here so
// the placeholder is never seen. It stays (invisible) in the document until
// the drag is over and startDrag removes it, since Sketch may still use it.
function placeDropEarly(context) {
  const shared = NSThread.mainThread().threadDictionary().objectForKey(DROP_KEY)
  if (!shared || shared.objectForKey('placed')) return
  const selection = context.actionContext.newSelection
  for (let i = 0; i < selection.count(); i++) {
    const layer = sketch.fromNative(selection.objectAtIndex(i))
    if (!isDropPlaceholder(layer)) continue
    const real = settleDropped(layer, String(shared.objectForKey('file')), canvasPoint(NSEvent.mouseLocation()), true)
    if (!real) return
    shared.setObject_forKey(real.id, 'placed')
    const doc = sketch.getSelectedDocument()
    if (doc) doc.selectedLayers = [real]
    return
  }
}

export function onSelectionChanged(context) {
  try {
    placeDropEarly(context)
  } catch (e) {
    console.error(e)
  }
  if (!isWebviewPresent(IDENT)) return
  try {
    const native = context.actionContext.newSelection
    const layers = []
    for (let i = 0; i < native.count(); i++) layers.push(sketch.fromNative(native.objectAtIndex(i)))
    const info = selectionInfo(layers)
    sendToWebview(IDENT, 'window.onSelectionChanged && window.onSelectionChanged(' + JSON.stringify(info) + ')')
  } catch (e) {
    console.error(e)
  }
}

export function onShutdown() {
  const panel = existingPanel()
  if (panel) panel.close()
}
