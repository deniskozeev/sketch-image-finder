// Draws the plugin icon (assets/icon.png, 256x256): a photo card with a sparkle.
import AppKit

let size = 256.0
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size), pixelsHigh: Int(size),
                           bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                           colorSpaceName: .calibratedRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)

let card = NSBezierPath(roundedRect: NSRect(x: 20, y: 20, width: 216, height: 216), xRadius: 52, yRadius: 52)
NSGradient(starting: NSColor(red: 1.0, green: 0.74, blue: 0.25, alpha: 1),
           ending: NSColor(red: 0.96, green: 0.45, blue: 0.13, alpha: 1))!.draw(in: card, angle: -90)

// mountains
NSColor(white: 1, alpha: 0.95).setFill()
let m = NSBezierPath()
m.move(to: NSPoint(x: 52, y: 68))
m.line(to: NSPoint(x: 106, y: 138))
m.line(to: NSPoint(x: 136, y: 100))
m.line(to: NSPoint(x: 158, y: 124))
m.line(to: NSPoint(x: 204, y: 68))
m.close()
m.fill()

// sparkle (AI)
let c = NSPoint(x: 168, y: 176)
let s = NSBezierPath()
let r1 = 30.0, r2 = 8.0
for i in 0..<8 {
    let a = Double(i) * .pi / 4 + .pi / 2
    let r = i % 2 == 0 ? r1 : r2
    let p = NSPoint(x: c.x + CGFloat(cos(a) * r), y: c.y + CGFloat(sin(a) * r))
    if i == 0 { s.move(to: p) } else { s.line(to: p) }
}
s.close()
s.fill()

NSGraphicsContext.restoreGraphicsState()
let png = rep.representation(using: .png, properties: [:])!
try! png.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
