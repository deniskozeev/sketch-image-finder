/* globals NSBitmapImageRep, NSImage, NSGraphicsContext, NSColor, NSMakeRect, NSZeroRect, NSRectFill, NSMakeRange, NSString, NSUTF8StringEncoding, NSDictionary, NSNumber, NSCalibratedRGBColorSpace */
import { dataToBase64 } from './http'

const JPEG = 3 // NSBitmapImageFileTypeJPEG
const COPY = 1 // NSCompositingOperationCopy

export function pixelSize(data) {
  const rep = NSBitmapImageRep.imageRepWithData(data)
  if (!rep) return null
  return { width: Number(rep.pixelsWide()), height: Number(rep.pixelsHigh()) }
}

export function isSVGData(data) {
  if (!data) return false
  const len = Math.min(Number(data.length()), 1024)
  const head = NSString.alloc().initWithData_encoding(
    data.subdataWithRange(NSMakeRange(0, len)),
    NSUTF8StringEncoding
  )
  return !!head && /<svg[\s>]/i.test(String(head))
}

// Re-encode an image as JPEG so that its longest side is at most maxSide
// (or exactly maxSide when upscale is true). Transparent areas become white.
export function toJPEG(data, maxSide, quality = 0.85, upscale = false) {
  const size = pixelSize(data)
  const image = NSImage.alloc().initWithData(data)
  if (!size || !image) return null
  const fit = maxSide / Math.max(size.width, size.height)
  const scale = upscale ? fit : Math.min(1, fit)
  const w = Math.max(1, Math.round(size.width * scale))
  const h = Math.max(1, Math.round(size.height * scale))

  const rep = NSBitmapImageRep.alloc().initWithBitmapDataPlanes_pixelsWide_pixelsHigh_bitsPerSample_samplesPerPixel_hasAlpha_isPlanar_colorSpaceName_bytesPerRow_bitsPerPixel(
    null, w, h, 8, 4, true, false, NSCalibratedRGBColorSpace, 0, 0
  )
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.setCurrentContext(NSGraphicsContext.graphicsContextWithBitmapImageRep(rep))
  NSColor.whiteColor().set()
  NSRectFill(NSMakeRect(0, 0, w, h))
  image.drawInRect_fromRect_operation_fraction(NSMakeRect(0, 0, w, h), NSZeroRect, COPY, 1)
  NSGraphicsContext.restoreGraphicsState()

  const props = NSDictionary.dictionaryWithObject_forKey(
    NSNumber.numberWithFloat(quality),
    'NSImageCompressionFactor'
  )
  return rep.representationUsingType_properties(JPEG, props)
}

export function thumbDataURL(data, maxSide = 480) {
  const jpeg = toJPEG(data, maxSide, 0.8)
  return jpeg ? 'data:image/jpeg;base64,' + dataToBase64(jpeg) : null
}

export function svgDataURL(svg) {
  const data = NSString.stringWithString(svg).dataUsingEncoding(NSUTF8StringEncoding)
  return 'data:image/svg+xml;base64,' + dataToBase64(data)
}

// Size of an SVG from its width/height or viewBox attributes.
export function svgSize(svg) {
  const tag = (svg.match(/<svg[^>]*>/i) || [''])[0]
  const num = (name) => {
    const m = tag.match(new RegExp('\\s' + name + '\\s*=\\s*["\']?([\\d.]+)(px)?["\'\\s>]', 'i'))
    return m ? parseFloat(m[1]) : null
  }
  let width = num('width')
  let height = num('height')
  const vb = tag.match(/viewBox\s*=\s*["']([^"']+)["']/i)
  if ((!width || !height) && vb) {
    const parts = vb[1].trim().split(/[\s,]+/).map(parseFloat)
    if (parts.length === 4) {
      width = parts[2]
      height = parts[3]
    }
  }
  return width && height ? { width, height } : { width: 1024, height: 1024 }
}
