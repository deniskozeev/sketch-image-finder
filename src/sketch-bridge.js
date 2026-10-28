import sketch from 'sketch'
/* globals NSData, NSImage */
import { pixelSize, thumbDataURL, svgSize, isSVGData } from './image-utils'
import { dataToString } from './http'

const { Image, Style, Settings } = sketch

const META_KEY = 'image-finder'
const FRAME_TYPES = ['Artboard', 'Group', 'SymbolMaster']
const SHAPE_TYPES = ['Shape', 'ShapePath']
const GAP = 80

// ---------- reading the selection ----------

function imageFill(layer) {
  if (!layer.style || !layer.style.fills) return null
  const fills = layer.style.fills
  for (let i = fills.length - 1; i >= 0; i--) {
    const f = fills[i]
    if (f.enabled && f.fillType === Style.FillType.Pattern && f.pattern && f.pattern.image) return f
  }
  return null
}

function kindOf(layer) {
  if (!layer) return 'none'
  if (layer.type === 'Image') return 'image'
  if (SHAPE_TYPES.indexOf(layer.type) >= 0) return imageFill(layer) ? 'image' : 'shape'
  if (FRAME_TYPES.indexOf(layer.type) >= 0) return 'frame'
  return 'other'
}

export function imageDataOf(layer) {
  if (!layer) return null
  try {
    if (layer.type === 'Image') return layer.image.nsdata
    const fill = imageFill(layer)
    return fill ? fill.pattern.image.nsdata : null
  } catch (e) {
    return null
  }
}

export function selectedLayers(doc) {
  return doc ? doc.selectedLayers.layers : []
}

export function selectionInfo(layers) {
  const layer = layers[0]
  const kind = kindOf(layer)
  if (kind === 'none') return { kind }
  const { width, height } = layer.frame
  const info = {
    kind,
    type: layer.type,
    name: layer.name,
    width: Math.round(width),
    height: Math.round(height),
    ratio: height > 0 ? width / height : 1,
    count: layers.length,
  }
  // A frame with a picture in its fill counts as "has an image" too: it can be
  // a reference and be vectorized, while inserting still targets the frame.
  if (kind === 'image' || (kind === 'frame' && imageFill(layer))) {
    const data = imageDataOf(layer)
    info.hasImage = !!data
    info.refThumb = data ? thumbDataURL(data, 200) : null
  }
  return info
}

// ---------- geometry helpers ----------

function pageOf(layer) {
  let p = layer
  while (p && p.type !== 'Page') p = p.parent
  return p
}

function topAncestor(layer) {
  let l = layer
  while (l.parent && l.parent.type !== 'Page') l = l.parent
  return l
}

function absoluteFrame(layer) {
  const page = pageOf(layer)
  if (layer.parent === page) return layer.frame
  return layer.frame.changeBasis({ from: layer.parent, to: page })
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

// Move `rect` to the right until it doesn't overlap any top-level layer of the page.
function findFreeSpot(page, rect, ignore) {
  const others = page.layers.filter((l) => l !== ignore).map((l) => l.frame)
  const r = Object.assign({}, rect)
  for (let i = 0; i < 100; i++) {
    const hit = others.find((o) => intersects(r, o))
    if (!hit) break
    r.x = hit.x + hit.width + GAP
  }
  return r
}

function emptyCanvasSpot(page, width, height) {
  const layers = page.layers
  if (!layers.length) return { x: 0, y: 0, width, height }
  let maxX = -Infinity
  let minY = Infinity
  layers.forEach((l) => {
    maxX = Math.max(maxX, l.frame.x + l.frame.width)
    minY = Math.min(minY, l.frame.y)
  })
  return { x: Math.round(maxX + GAP * 2), y: Math.round(minY), width, height }
}

// Default size of a newly placed bitmap: half its pixel size (retina), max 1440pt wide.
function naturalSize(px) {
  let w = px.width / 2
  let h = px.height / 2
  const scale = Math.min(1, 1440 / w, 1440 / h)
  return { width: Math.round(w * scale), height: Math.round(h * scale) }
}

function containSize(src, box) {
  const scale = Math.min(box.width / src.width, box.height / src.height)
  return { width: Math.round(src.width * scale), height: Math.round(src.height * scale) }
}

// ---------- files dropped from the panel ----------

function contains(r, p) {
  return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height
}

function isRealFrame(layer) {
  // SymbolMaster and graphics (e.g. an imported SVG) are frames too, but not drop targets
  return (layer.type === 'Artboard' || layer.type === 'Group') && !!layer.isFrame && !layer.isGraphicFrame
}

// The deepest visible frame under `point` (page coordinates), topmost first.
function frameAt(container, point, skipId) {
  const layers = container.layers || []
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i]
    if (l.id === skipId || l.hidden || !isRealFrame(l)) continue
    if (contains(absoluteFrame(l), point)) return frameAt(l, point, skipId) || l
  }
  return null
}

// Drag and drop from the panel drags an invisible 1×1 placeholder file, so
// Sketch still highlights frames and accepts the drop but has nothing to
// draw. The placeholder is then swapped for the real file: centered on the
// cursor (`point`, page coordinates) inside the deepest frame under it.
export function isDropPlaceholder(layer) {
  try {
    return layer.type === 'Image' && layer.image && layer.image.size.width <= 1 && layer.image.size.height <= 1
  } catch (e) {
    return false
  }
}

function fileBase(file) {
  return String(file).split('/').pop().replace(/\.[^.]+$/, '')
}

function layerFromFile(file) {
  const data = NSData.dataWithContentsOfFile(file)
  if (!data) return null
  if (isSVGData(data)) return svgLayer(dataToString(data), null).layer
  const layer = new Image({ image: data })
  // same size as a click inserts (a new Image is 100×100 by default)
  const size = naturalSize(pixelSize(data) || layer.image.size)
  layer.frame = { x: 0, y: 0, width: size.width, height: size.height }
  return layer
}

// Frame (in the target's coordinates) that centers a width×height layer on `point`
function centeredIn(target, point, width, height) {
  const origin = target.type === 'Page' ? { x: 0, y: 0 } : absoluteFrame(target)
  return {
    x: Math.round(point.x - width / 2 - origin.x),
    y: Math.round(point.y - height / 2 - origin.y),
    width,
    height,
  }
}

// Returns the layer that ends up on the canvas. Sketch redraws between
// edits, so a layer is only added to the document once its final frame is
// set — otherwise it flashes at the parent's origin first.
// `keep`: leave the placeholder in the document (it's removed later)
export function settleDropped(layer, file, point, keep) {
  const page = pageOf(layer)
  if (!page) return null
  const abs = absoluteFrame(layer)
  const center = point || { x: abs.x + abs.width / 2, y: abs.y + abs.height / 2 }
  if (!isDropPlaceholder(layer)) {
    const target = frameAt(page, center, layer.id) || page
    const frame = centeredIn(target, center, abs.width, abs.height)
    if (layer.parent && layer.parent.id === target.id) layer.frame = frame
    else {
      layer.parent = target
      layer.frame = frame
    }
    return layer
  }
  const real = layerFromFile(file)
  if (!real) return layer
  real.name = fileBase(file)
  const target = frameAt(page, center, layer.id) || page
  real.frame = centeredIn(target, center, real.frame.width, real.frame.height)
  real.parent = target
  if (!keep) layer.remove()
  return real
}

// ⌘-drop makes Sketch replace an image layer's picture or a fill's image
// with the placeholder instead: put the real picture there. An image layer
// keeps its width and takes the picture's proportions, like "Replace".
// Only layers under the cursor (`point`) are considered. Returns true when one was found.
export function fillDropped(page, file, point) {
  const data = NSData.dataWithContentsOfFile(file)
  if (!data) return false
  const svg = isSVGData(data)
  const bitmap = svg ? NSImage.alloc().initWithData(data) : data
  const tiny = (img) => img && img.size.width <= 1 && img.size.height <= 1
  let found = false
  sketch.find('*', page).forEach((layer) => {
    if (point && !contains(absoluteFrame(layer), point)) return
    if (layer.type === 'Image' && tiny(layer.image)) {
      setLayerImage(layer, bitmap, svg ? null : pixelSize(data), false)
      found = true
      return
    }
    const fills = (layer.style && layer.style.fills) || []
    fills.forEach((f) => {
      if (f.fillType === Style.FillType.Pattern && f.pattern && tiny(f.pattern.image)) {
        f.pattern.image = bitmap
        found = true
      }
    })
  })
  return found
}

// ---------- metadata ----------

function tag(layer, meta) {
  layer.name = meta.name || layer.name
  try {
    Settings.setLayerSettingForKey(layer, META_KEY, meta)
  } catch (e) {
    // ignore
  }
}

// Same metadata as tag(), but keeps the layer's own name (frames)
function remember(layer, meta) {
  try {
    Settings.setLayerSettingForKey(layer, META_KEY, meta)
  } catch (e) {
    // ignore
  }
}

function patternFill(data) {
  return {
    fillType: Style.FillType.Pattern,
    pattern: { patternType: Style.PatternFillType.Fill, image: data },
  }
}

// ---------- raster insertion ----------

function setLayerImage(layer, data, px, keepFrame) {
  if (layer.type === 'Image') {
    layer.image = data
    if (!keepFrame && px) layer.frame.height = Math.round((layer.frame.width * px.height) / px.width)
    return
  }
  const fill = imageFill(layer)
  if (fill) {
    fill.pattern.image = data
  } else {
    layer.style.fills = layer.style.fills.concat([patternFill(data)])
  }
}

function placeVariant(target, data, px, meta) {
  const page = pageOf(target)
  const anchor = absoluteFrame(topAncestor(target))
  const abs = absoluteFrame(target)
  const copy = target.duplicate()
  copy.parent = page
  setLayerImage(copy, data, px, true)
  let height = abs.height
  if (copy.type === 'Image' && px) height = Math.round((abs.width * px.height) / px.width)
  copy.frame = findFreeSpot(
    page,
    { x: anchor.x + anchor.width + GAP, y: abs.y, width: abs.width, height },
    copy
  )
  tag(copy, meta)
  return copy
}

// "Replace" on a frame: the picture becomes the frame's own fill (Fill mode).
// An existing image fill is swapped, so fills don't pile up.
function setFrameFill(frame, data, meta) {
  const fill = imageFill(frame)
  if (fill) fill.pattern.image = data
  else frame.style.fills = frame.style.fills.concat([patternFill(data)])
  remember(frame, meta)
}

// Plain click on a frame: an Image layer inside it, centered and fitted
// (never upscaled past its natural size).
function placeInFrame(frame, data, px, meta) {
  const natural = naturalSize(px || { width: 1600, height: 1200 })
  const box = frame.frame
  const scale = Math.min(1, box.width / natural.width, box.height / natural.height)
  const width = Math.round(natural.width * scale)
  const height = Math.round(natural.height * scale)
  const layer = new Image({
    image: data,
    parent: frame,
    frame: { x: Math.round((box.width - width) / 2), y: Math.round((box.height - height) / 2), width, height },
  })
  tag(layer, meta)
  return layer
}

function placeNew(doc, data, px, meta) {
  const page = doc.selectedPage
  const size = naturalSize(px || { width: 1600, height: 1200 })
  const layer = new Image({
    image: data,
    parent: page,
    frame: emptyCanvasSpot(page, size.width, size.height),
  })
  tag(layer, meta)
  doc.selectedLayers = [layer]
  doc.centerOnLayer(layer)
  return layer
}

// mode: 'auto' | 'replace'
// Returns a short description of what happened for the UI.
export function insertRaster(doc, data, meta, mode) {
  const px = pixelSize(data)
  const targets = selectedLayers(doc).filter((l) => kindOf(l) !== 'other')
  if (!targets.length) {
    placeNew(doc, data, px, meta)
    return { action: 'new' }
  }
  let action = 'fill'
  targets.forEach((t) => {
    const kind = kindOf(t)
    if (kind === 'image') {
      if (mode === 'replace') {
        setLayerImage(t, data, px, false)
        tag(t, meta)
        action = 'replace'
      } else {
        placeVariant(t, data, px, meta)
        action = 'variant'
      }
    } else if (kind === 'shape') {
      setLayerImage(t, data, px, true)
      tag(t, meta)
    } else if (kind === 'frame') {
      if (mode === 'replace') {
        setFrameFill(t, data, meta)
        action = 'frameFill'
      } else {
        placeInFrame(t, data, px, meta)
        action = 'inFrame'
      }
    }
  })
  return { action, name: targets[0].name }
}

// ---------- SVG insertion ----------

function sizedSVG(svg, width, height) {
  return svg.replace(/<svg([^>]*)>/i, (all, attrs) => {
    const clean = attrs.replace(/\s(width|height)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    return '<svg' + clean + ' width="' + width + '" height="' + height + '">'
  })
}

function svgLayer(svg, box) {
  const src = svgSize(svg)
  const size = box ? containSize(src, box) : src
  const layer = sketch.createLayerFromData(sizedSVG(svg, size.width, size.height), 'svg')
  return { layer, size }
}

export function insertSVG(doc, svg, meta, mode) {
  const target = selectedLayers(doc).find((l) => kindOf(l) !== 'other')
  const kind = kindOf(target)
  let result

  if (!target) {
    const page = doc.selectedPage
    const src = svgSize(svg)
    const box = containSize(src, { width: Math.min(800, src.width * 2), height: Math.min(800, src.height * 2) })
    const { layer } = svgLayer(svg, box)
    layer.parent = page
    const spot = emptyCanvasSpot(page, layer.frame.width, layer.frame.height)
    layer.frame.x = spot.x
    layer.frame.y = spot.y
    tag(layer, meta)
    doc.selectedLayers = [layer]
    doc.centerOnLayer(layer)
    return { action: 'new' }
  }

  const tf = target.frame
  const { layer, size } = svgLayer(svg, { width: tf.width, height: tf.height })

  if (kind === 'frame') {
    layer.parent = target
    layer.frame.x = Math.round((tf.width - size.width) / 2)
    layer.frame.y = Math.round((tf.height - size.height) / 2)
    result = { action: 'fill' }
  } else if (kind === 'image' && mode !== 'replace') {
    const page = pageOf(target)
    const anchor = absoluteFrame(topAncestor(target))
    const abs = absoluteFrame(target)
    layer.parent = page
    const spot = findFreeSpot(
      page,
      { x: anchor.x + anchor.width + GAP, y: abs.y, width: size.width, height: size.height },
      layer
    )
    layer.frame.x = spot.x
    layer.frame.y = spot.y
    result = { action: 'variant' }
  } else {
    // shape, or "replace" on an image: put the vector in place of the target
    layer.parent = target.parent
    layer.index = target.index + 1
    layer.frame.x = Math.round(tf.x + (tf.width - size.width) / 2)
    layer.frame.y = Math.round(tf.y + (tf.height - size.height) / 2)
    if (kind === 'image' && mode === 'replace') {
      target.hidden = true
      result = { action: 'replace' }
    } else {
      result = { action: 'fill' }
    }
  }
  tag(layer, meta)
  result.name = target.name
  return result
}
