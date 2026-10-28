/* globals NSHomeDirectory, NSFileManager, NSData, NSString, NSUTF8StringEncoding, NSURL, NSWorkspace */
import { dataToString } from './http'

// Shared helpers for the plugin's folders in Application Support.

export function pluginDir(sub) {
  return String(NSHomeDirectory()) + '/Library/Application Support/com.deniskozeev.sketch-image-finder/' + sub
}

export function ensureDir(path) {
  NSFileManager.defaultManager().createDirectoryAtPath_withIntermediateDirectories_attributes_error(path, true, null, null)
}

export function fileExists(path) {
  return !!NSFileManager.defaultManager().fileExistsAtPath(path)
}

export function removePath(path) {
  NSFileManager.defaultManager().removeItemAtPath_error(path, null)
}

export function readJSON(path, fallback) {
  const data = NSData.dataWithContentsOfFile(path)
  if (!data) return fallback
  try {
    return JSON.parse(dataToString(data))
  } catch (e) {
    return fallback
  }
}

export function writeJSON(path, value) {
  NSString.stringWithString(JSON.stringify(value)).writeToFile_atomically_encoding_error(path, true, NSUTF8StringEncoding, null)
}

export function reveal(path) {
  ensureDir(path)
  NSWorkspace.sharedWorkspace().openURL(NSURL.fileURLWithPath(path))
}

// Readable, filesystem-safe file name that doesn't exist yet in `dir`.
export function uniqueName(dir, base, ext) {
  const clean = String(base)
    .replace(/[\/\\:*?"<>|\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80) || 'image'
  let name = clean + '.' + ext
  for (let i = 2; fileExists(dir + '/' + name); i++) name = clean + ' ' + i + '.' + ext
  return name
}

export function stamp(ms) {
  const d = new Date(ms)
  const p = (n) => (n < 10 ? '0' : '') + n
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}.${p(d.getMinutes())}`
}
