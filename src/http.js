/* globals NSURL, NSMutableURLRequest, NSURLSession, NSString, NSData, NSMutableData, NSUTF8StringEncoding, NSUUID, coscript, __mocha__ */

// Minimal HTTP client on top of NSURLSession. We don't use the fetch polyfill
// because it has a fixed 60s timeout (too short for some image models) and
// decodes text as ASCII.

export class HttpError extends Error {
  constructor(status, message, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

function toNSData(body) {
  if (body == null) return null
  if (typeof body === 'string') {
    return NSString.stringWithString(body).dataUsingEncoding(NSUTF8StringEncoding)
  }
  return body
}

export function request(url, options = {}) {
  const fiber = coscript.createFiber()
  return new Promise((resolve, reject) => {
    const nsurl = NSURL.URLWithString(url)
    if (!nsurl) {
      fiber.cleanup()
      reject(new Error('Bad URL: ' + url))
      return
    }
    // 1 = NSURLRequestReloadIgnoringLocalCacheData
    const req = NSMutableURLRequest.requestWithURL_cachePolicy_timeoutInterval(
      nsurl,
      1,
      options.timeout || 180
    )
    req.setHTTPMethod(options.method || 'GET')
    const headers = options.headers || {}
    Object.keys(headers).forEach((name) => {
      req.setValue_forHTTPHeaderField(String(headers[name]), name)
    })
    const body = toNSData(options.body)
    if (body) req.setHTTPBody(body)

    let finished = false
    const task = NSURLSession.sharedSession().dataTaskWithRequest_completionHandler(
      req,
      __mocha__.createBlock_function(
        'v32@?0@"NSData"8@"NSURLResponse"16@"NSError"24',
        (data, response, error) => {
          finished = true
          fiber.cleanup()
          try {
            if (error) {
              reject(new Error(String(error.localizedDescription())))
              return
            }
            const status = Number(response.statusCode())
            resolve({
              status,
              ok: status >= 200 && status < 300,
              contentType: String(response.MIMEType() || ''),
              data,
            })
          } catch (err) {
            reject(err)
          }
        }
      )
    )
    fiber.onCleanup(() => {
      if (!finished) task.cancel()
    })
    task.resume()
  })
}

export function dataToString(data) {
  if (!data) return ''
  return String(NSString.alloc().initWithData_encoding(data, NSUTF8StringEncoding) || '')
}

export function dataToBase64(data) {
  return String(data.base64EncodedStringWithOptions(0))
}

export function base64ToData(str) {
  return NSData.alloc().initWithBase64EncodedString_options(str, 1) // ignore unknown chars
}

function parseJSON(text) {
  try {
    return JSON.parse(text)
  } catch (e) {
    return null
  }
}

// Pull a human readable error message out of the many error shapes APIs use.
function extractError(json, text) {
  if (json) {
    if (typeof json.error === 'string') return json.error
    if (json.error && json.error.message) return json.error.message
    if (Array.isArray(json.errors) && json.errors.length) {
      const e = json.errors[0]
      return typeof e === 'string' ? e : e.message || JSON.stringify(e)
    }
    if (json.message) return json.message
    if (json.detail) return typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail)
  }
  return (text || '').slice(0, 200)
}

// Bot protection (Vercel / Cloudflare challenge pages) answers with an HTML
// page instead of the API: usually the IP is a VPN or datacenter address.
export function isBotChallenge(status, text) {
  return (
    (status === 403 || status === 429 || status === 503) &&
    /Vercel Security Checkpoint|cf-chl|challenge-platform|Just a moment\.\.\./i.test(text || '')
  )
}

export function httpError(status, text) {
  if (isBotChallenge(status, text)) return new HttpError(status, 'BLOCKED_IP', text)
  const json = parseJSON(text)
  return new HttpError(status, `HTTP ${status}: ${extractError(json, text)}`, json || text)
}

async function ensureOk(res) {
  if (res.ok) return res
  throw httpError(res.status, dataToString(res.data))
}

export async function getJSON(url, headers) {
  const res = await ensureOk(await request(url, { headers }))
  const text = dataToString(res.data)
  const json = parseJSON(text)
  if (json == null) throw new Error('Invalid JSON response')
  return json
}

export async function postJSON(url, body, headers = {}) {
  const res = await ensureOk(
    await request(url, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
      body: JSON.stringify(body),
    })
  )
  const json = parseJSON(dataToString(res.data))
  if (json == null) throw new Error('Invalid JSON response')
  return json
}

// fields: [{ name, value }] or [{ name, data: NSData, filename, mime }]
export async function postMultipart(url, fields, headers = {}) {
  const boundary = 'ImageFinder' + String(NSUUID.UUID().UUIDString())
  const body = NSMutableData.data()
  const add = (s) =>
    body.appendData(NSString.stringWithString(s).dataUsingEncoding(NSUTF8StringEncoding))
  fields.forEach((f) => {
    add(`--${boundary}\r\n`)
    if (f.data) {
      add(
        `Content-Disposition: form-data; name="${f.name}"; filename="${f.filename || 'image.jpg'}"\r\n` +
          `Content-Type: ${f.mime || 'image/jpeg'}\r\n\r\n`
      )
      body.appendData(f.data)
      add('\r\n')
    } else {
      add(`Content-Disposition: form-data; name="${f.name}"\r\n\r\n${f.value}\r\n`)
    }
  })
  add(`--${boundary}--\r\n`)
  const res = await ensureOk(
    await request(url, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': `multipart/form-data; boundary=${boundary}` }, headers),
      body,
    })
  )
  const json = parseJSON(dataToString(res.data))
  if (json == null) throw new Error('Invalid JSON response')
  return json
}

export async function getBinary(url, headers) {
  const res = await ensureOk(await request(url, { headers }))
  return { data: res.data, contentType: res.contentType }
}
