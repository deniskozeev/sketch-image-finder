import { getBinary, getJSON, postJSON, postMultipart, base64ToData, dataToBase64, dataToString, request, httpError } from '../http'
import { toJPEG, isSVGData } from '../image-utils'
import { GEMINI_RATIOS } from '../catalog'

const VARIATION_PROMPT =
  'Create a new variation of the reference image. Keep the same subject, composition, ' +
  'style, color palette and mood, but make it a distinct new image.'

function buildPrompt(prompt, hasRef) {
  const text = (prompt || '').trim()
  if (!hasRef) return text
  if (!text) return VARIATION_PROMPT
  return text + '. Use the attached image as the reference.'
}

function randomSeed() {
  return Math.floor(Math.random() * 2147483647)
}

// Width/height for models that accept any size: longest side `long`,
// rounded to a multiple of 16 and clamped to [min, max].
export function sizeFor(ratio, long = 1024, min = 256, max = 1920) {
  let w = ratio >= 1 ? long : long * ratio
  let h = ratio >= 1 ? long / ratio : long
  const fit = (v) => Math.max(min, Math.min(max, Math.round(v / 16) * 16))
  return { width: fit(w), height: fit(h) }
}

function nearestRatio(ratio, list) {
  let best = list[0]
  let bestDiff = Infinity
  list.forEach((r) => {
    const [a, b] = r.split(':').map(Number)
    const diff = Math.abs(Math.log(ratio) - Math.log(a / b))
    if (diff < bestDiff) {
      bestDiff = diff
      best = r
    }
  })
  return best
}

function simpleRatio(ratio) {
  return nearestRatio(ratio, ['1:1', '5:4', '4:5', '4:3', '3:4', '3:2', '2:3', '16:9', '9:16', '2:1', '1:2', '21:9', '3:1', '1:3'])
}

function rasterResult(data) {
  if (isSVGData(data)) return { kind: 'svg', svg: dataToString(data) }
  return { kind: 'raster', data }
}

function base64Result(b64) {
  return rasterResult(base64ToData(b64))
}

// ---------- Cloudflare Workers AI ----------

async function cloudflare(model, { prompt, ratio, ref }, settings) {
  const { accountId, token } = settings.ai.cloudflare
  const url =
    'https://api.cloudflare.com/client/v4/accounts/' +
    encodeURIComponent(accountId.trim()) +
    '/ai/run/' +
    model.model
  const headers = { Authorization: 'Bearer ' + token.trim() }
  let json
  if (model.sizes === 'square') {
    // flux-1-schnell's schema only allows prompt and steps (no seed);
    // Cloudflare doesn't cache, so repeated calls still give different images
    json = await postJSON(url, { prompt, steps: 4 }, headers)
  } else {
    const size = sizeFor(ratio)
    const fields = [
      { name: 'prompt', value: prompt },
      { name: 'width', value: String(size.width) },
      { name: 'height', value: String(size.height) },
      { name: 'seed', value: String(randomSeed()) },
    ]
    if (ref) {
      // klein requires reference images smaller than 512x512
      fields.push({ name: 'input_image_0', data: toJPEG(ref, 511), filename: 'reference.jpg', mime: 'image/jpeg' })
    }
    json = await postMultipart(url, fields, headers)
  }
  const image = json.result && json.result.image
  if (!image) throw new Error('Cloudflare: empty response')
  return base64Result(image)
}

// ---------- Pollinations ----------

// Models whose output changes with `seed` (from the Pollinations docs).
const POLLINATIONS_SEEDED = [
  'black-forest-labs/flux.1-schnell',
  'black-forest-labs/flux.1.1-pro',
  'tongyi-mai/z-image-turbo',
  'bytedance/seedream-4.0',
  'black-forest-labs/flux.2-klein-4b',
]

// Pollinations caches identical requests. Models that ignore `seed` (and the
// edits endpoint, which has no seed) would return the same image N times, so
// each image after the first gets its own small variation in the prompt.
const VARIATION_HINTS = [
  'different composition',
  'different camera angle and framing',
  'different lighting and mood',
  'closer, more detailed view',
  'wider view with more surroundings',
  'different color accents',
  'different time of day',
  'more minimal, simpler arrangement',
]

function variedPrompt(prompt, index) {
  if (!index) return prompt
  return prompt + '. Alternative take: ' + VARIATION_HINTS[(index - 1) % VARIATION_HINTS.length] + '.'
}

async function pollinations(model, { prompt: basePrompt, ratio, ref, index }, settings) {
  const key = settings.ai.pollinations.key.trim()
  const headers = { Authorization: 'Bearer ' + key }
  const modelId = model.model
  const size = sizeFor(ratio)
  const seeded = !ref && POLLINATIONS_SEEDED.indexOf(modelId) >= 0
  const prompt = seeded ? basePrompt : variedPrompt(basePrompt, index)

  if (ref) {
    const json = await postMultipart(
      'https://gen.pollinations.ai/v1/images/edits',
      [
        { name: 'prompt', value: prompt },
        { name: 'model', value: modelId },
        { name: 'size', value: size.width + 'x' + size.height },
        { name: 'response_format', value: 'b64_json' },
        // edit models keep the input resolution, so a small reference is upscaled
        { name: 'image', data: toJPEG(ref, Math.max(size.width, size.height), 0.9, true), filename: 'reference.jpg', mime: 'image/jpeg' },
      ],
      headers
    )
    const item = json.data && json.data[0]
    if (!item) throw new Error('Pollinations: empty response')
    const result = item.b64_json ? base64Result(item.b64_json) : rasterResult((await getBinary(item.url)).data)
    result.modelName = model.name
    return result
  }

  const url =
    'https://gen.pollinations.ai/image/' +
    encodeURIComponent(prompt) +
    '?model=' + encodeURIComponent(modelId) +
    '&width=' + size.width +
    '&height=' + size.height +
    '&seed=' + randomSeed()
  const { data } = await getBinary(url, headers)
  const result = rasterResult(data)
  result.modelName = model.name
  return result
}

// ---------- Gemini ----------

function findInlineImage(node) {
  if (!node || typeof node !== 'object') return null
  if (node.type === 'image' && typeof node.data === 'string') return node.data
  const inline = node.inlineData || node.inline_data
  if (inline && typeof inline.data === 'string' && /^image\//.test(inline.mimeType || inline.mime_type || 'image/')) {
    return inline.data
  }
  const values = Array.isArray(node) ? node : Object.keys(node).map((k) => node[k])
  // Look at later items first: the final image comes after "thought" images
  for (let i = values.length - 1; i >= 0; i--) {
    const found = findInlineImage(values[i])
    if (found) return found
  }
  return null
}

async function gemini(model, { prompt, ratio, ref }, settings) {
  const headers = { 'x-goog-api-key': settings.ai.gemini.key.trim() }
  const aspect = nearestRatio(ratio, GEMINI_RATIOS)
  const refB64 = ref ? dataToBase64(toJPEG(ref, 1024, 0.9, true)) : null

  let json
  try {
    const input = [{ type: 'text', text: prompt }]
    if (refB64) input.push({ type: 'image', mime_type: 'image/jpeg', data: refB64 })
    json = await postJSON(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        model: model.model,
        input,
        response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: aspect, image_size: '1K' },
      },
      headers
    )
  } catch (err) {
    // Fall back to the classic generateContent endpoint
    if (err.status !== 400 && err.status !== 404) throw err
    const parts = [{ text: prompt }]
    if (refB64) parts.push({ inline_data: { mime_type: 'image/jpeg', data: refB64 } })
    json = await postJSON(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model.model + ':generateContent',
      {
        contents: [{ parts }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect } },
      },
      headers
    )
  }
  const b64 = findInlineImage(json)
  if (!b64) throw new Error('Gemini: no image in response')
  return base64Result(b64)
}

// ---------- QuiverAI ----------

const QUIVER = 'https://api.quiver.ai/v1/svgs/'

async function quiverCall(path, body, key) {
  const res = await request(QUIVER + path, {
    method: 'POST',
    timeout: 300,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key.trim() },
    body: JSON.stringify(body),
  })
  const text = dataToString(res.data)
  if (!res.ok) throw httpError(res.status, text)
  let json = null
  try {
    json = JSON.parse(text)
  } catch (e) {
    json = null
  }
  const svg = json && json.data && json.data[0] && json.data[0].svg
  if (!svg) throw new Error('QuiverAI: no SVG in response')
  return { kind: 'svg', svg }
}

async function quiver(model, { prompt, ratio, ref }, settings) {
  const body = {
    model: model.model,
    prompt,
    n: 1,
    stream: false,
    instructions: 'Use a ' + simpleRatio(ratio) + ' (width:height) canvas.',
  }
  if (ref) body.references = [{ base64: dataToBase64(toJPEG(ref, 1024, 0.9, true)) }]
  return quiverCall('generations', body, settings.ai.quiver.key)
}

export async function vectorize(settings, ref, modelId) {
  return quiverCall(
    'vectorizations',
    { model: modelId || 'arrow-2', image: { base64: dataToBase64(toJPEG(ref, 1536, 0.92, true)) }, stream: false },
    settings.ai.quiver.key
  )
}

const CLIENTS = { cloudflare, pollinations, gemini, quiver }

// opts: { prompt, ratio, ref (NSData|null), index }
// ---------- prompt translation ----------

const CYRILLIC = /[а-яё]/i
const translations = {}

// Some models (FLUX.1, Z-Image) only understand English and draw something
// random for a Russian prompt. We translate with Llama 3.3 70B on Cloudflare
// (a few neurons from the free daily quota). m2m100 turned short prompts into
// nonsense ("еж на велосипеде" → "Eat on a bicycle") and Mistral Small 3.1
// swapped nouns ("ёж …, акварель" → "a person…", "сова" → "squirrel").
// Without Cloudflare keys the prompt is sent as is.
const TRANSLATE_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
const TRANSLATE_SYSTEM =
  'You translate Russian image-generation prompts into English. Translate literally: every object, ' +
  'adjective, color, count and style word must appear in the English text; nothing may be replaced, ' +
  'added or dropped. Reply with the English prompt only, no quotes or comments.'

async function toEnglish(text, settings) {
  if (!CYRILLIC.test(text)) return text
  const cf = settings.ai.cloudflare
  if (!cf.accountId || !cf.token) return text
  if (translations[text]) return translations[text]
  try {
    const json = await postJSON(
      'https://api.cloudflare.com/client/v4/accounts/' +
        encodeURIComponent(cf.accountId.trim()) +
        '/ai/run/' +
        TRANSLATE_MODEL,
      {
        messages: [
          { role: 'system', content: TRANSLATE_SYSTEM },
          { role: 'user', content: text },
        ],
        max_tokens: 300,
        temperature: 0,
      },
      { Authorization: 'Bearer ' + cf.token.trim() }
    )
    const out = String((json.result && json.result.response) || '')
      .trim()
      .replace(/^["'«“]+|["'»”]+$/g, '')
    // still Russian or empty: the translation failed, keep the original
    if (!out || CYRILLIC.test(out)) return text
    translations[text] = out
    return out
  } catch (e) {
    return text
  }
}

// Safety filters sometimes flag a perfectly normal picture; one more try with
// a new seed usually passes.
function isFlagged(err) {
  return /flagged|content.?policy|safety/i.test((err && err.message) || '')
}

export async function generate(settings, model, opts) {
  const hasRef = !!(opts.ref && model.ref)
  let prompt = buildPrompt(opts.prompt, hasRef)
  if (!prompt) throw new Error('EMPTY_PROMPT')
  if (model.english) prompt = await toEnglish(prompt, settings)
  const args = Object.assign({}, opts, { prompt, ref: hasRef ? opts.ref : null })
  let result
  try {
    result = await CLIENTS[model.provider](model, args, settings)
  } catch (err) {
    if (!isFlagged(err)) throw err
    try {
      result = await CLIENTS[model.provider](model, args, settings)
    } catch (err2) {
      throw isFlagged(err2) ? new Error('FLAGGED') : err2
    }
  }
  if (!result.modelName) result.modelName = model.name
  return result
}

// ---------- balances ----------

// Remaining Pollen. Budgeted keys see their remaining budget without extra
// permissions; unbudgeted keys need `account:usage`, otherwise we get 403.
export async function pollinationsBalance(settings) {
  const key = settings.ai.pollinations.key.trim()
  if (!key) return null
  try {
    const json = await getJSON('https://gen.pollinations.ai/account/balance', { Authorization: 'Bearer ' + key })
    const fmt = (v) => String(parseFloat(v.toFixed(v >= 10 ? 1 : 2)))
    // The account balance needs the key's `account:usage` permission ("See
    // balance, usage…"). Without it the API only reports what is left of the
    // key's own budget — a spending cap, not money — so we show nothing.
    const account = json.accountBalance
    if (!account || typeof account.total !== 'number') return null
    return { value: account.total, paid: account.paid, text: fmt(account.total) + ' Pollen' }
  } catch (e) {
    return null
  }
}

// QuiverAI balance needs an organization admin key with billing_read
// (project keys can't read it). 1 credit = $0.01.
export async function quiverBalance(settings) {
  const key = (settings.ai.quiver.adminKey || '').trim()
  if (!key) return null
  try {
    const json = await getJSON('https://api.quiver.ai/v1/organization/balance', { Authorization: 'Bearer ' + key })
    if (typeof json.available_credits !== 'number') return null
    const dollars = json.available_credits / 100
    return { value: dollars, text: '$' + dollars.toFixed(2) }
  } catch (e) {
    return null
  }
}
