// Catalog of AI models the plugin knows about.
//
// provider  - which API client handles the request
// ref       - accepts a reference image
// sizes     - 'free'   : any width/height (we pass the target proportions)
//             'ratios' : fixed list of aspect ratios, we pick the nearest
//             'square' : always 1:1, Sketch crops it with a Fill pattern
//             'prompt' : no size parameter, proportions are described in the prompt
// vector    - returns SVG
// cost      - short human readable hint shown in the UI
// paid      - needs paid credits (no free quota)

export const PROVIDERS = {
  cloudflare: {
    name: 'Cloudflare Workers AI',
    keyUrl: 'https://dash.cloudflare.com/profile/api-tokens',
    docsUrl: 'https://developers.cloudflare.com/workers-ai/get-started/rest-api/',
  },
  pollinations: {
    name: 'Pollinations',
    keyUrl: 'https://enter.pollinations.ai/keys',
  },
  gemini: {
    name: 'Google Gemini',
    keyUrl: 'https://aistudio.google.com/apikey',
  },
  quiver: {
    name: 'QuiverAI',
    keyUrl: 'https://platform.quiver.ai/api-keys',
  },
}

export const MODELS = [
  // Mixes: every image of a batch is made by a different model (like Paper's
  // Variety pack). Members are taken in order, skipping services without keys;
  // `unless` skips a member when the same model is available elsewhere.
  {
    id: 'mix:free',
    provider: 'mix',
    name: 'Free mix',
    names: { ru: 'Микс · бесплатные', en: 'Free mix', de: 'Mix · kostenlos', es: 'Mix · gratis' },
    mix: [
      { id: 'cf:flux-2-klein-4b' },
      { id: 'cf:flux-1-schnell' },
      { id: 'pl:openai/gpt-image-2' },
      { id: 'pl:tongyi-mai/z-image-turbo' },
      { id: 'pl:black-forest-labs/flux.1-kontext-pro' },
      { id: 'pl:black-forest-labs/flux.2-klein-4b', unless: 'cf:flux-2-klein-4b' },
    ],
    ref: true,
    sizes: 'free',
  },
  {
    id: 'mix:paid',
    provider: 'mix',
    name: 'Paid mix',
    names: { ru: 'Микс · платные', en: 'Paid mix', de: 'Mix · kostenpflichtig', es: 'Mix · de pago' },
    mix: [
      { id: 'gm:gemini-nano-banana-2.1' },
      { id: 'pl:google/gemini-nano-banana-2.1', unless: 'gm:gemini-nano-banana-2.1' },
      { id: 'pl:bytedance/seedream-4.5' },
      { id: 'pl:openai/gpt-image-2' },
      { id: 'pl:x-ai/grok-imagine-image' },
      { id: 'pl:black-forest-labs/flux.2-pro' },
      { id: 'pl:ideogram-ai/ideogram-v4-turbo' },
    ],
    ref: true,
    sizes: 'free',
    paid: true,
  },

  // Cloudflare: 10 000 free neurons per day
  {
    id: 'cf:flux-2-klein-4b',
    provider: 'cloudflare',
    model: '@cf/black-forest-labs/flux-2-klein-4b',
    name: 'FLUX.2 klein',
    english: true, // understands only common Russian words ("ёж" became a man): prompts are translated
    ref: true,
    sizes: 'free',
    cost: { ru: '≈95 бесплатно в день', en: '≈95 free per day' },
  },
  {
    id: 'cf:flux-1-schnell',
    english: true, // text encoder only understands English: Russian prompts are translated
    provider: 'cloudflare',
    model: '@cf/black-forest-labs/flux-1-schnell',
    name: 'FLUX.1 schnell',
    ref: false,
    sizes: 'square',
    cost: { ru: '≈170 бесплатно в день, только 1:1', en: '≈170 free per day, 1:1 only' },
  },

  // Pollinations: one key, many models. Prices are in Pollen per image.
  {
    id: 'pl:black-forest-labs/flux.2-klein-4b',
    provider: 'pollinations',
    model: 'black-forest-labs/flux.2-klein-4b',
    name: 'FLUX.2 klein',
    english: true, // understands only common Russian words ("ёж" became a man): prompts are translated
    ref: true,
    sizes: 'free',
    cost: { ru: '0.005 Pollen', en: '0.005 Pollen' },
  },
  {
    id: 'pl:tongyi-mai/z-image-turbo',
    english: true, // text encoder only understands English: Russian prompts are translated
    provider: 'pollinations',
    model: 'tongyi-mai/z-image-turbo',
    name: 'Z-Image Turbo',
    ref: false,
    sizes: 'free',
    cost: { ru: '0.004 Pollen', en: '0.004 Pollen' },
  },
  {
    id: 'pl:black-forest-labs/flux.1-kontext-pro',
    english: true, // text encoder only understands English: Russian prompts are translated
    provider: 'pollinations',
    model: 'black-forest-labs/flux.1-kontext-pro',
    name: 'FLUX Kontext Pro',
    ref: true,
    sizes: 'free',
    cost: { ru: '0.03 Pollen', en: '0.03 Pollen' },
  },
  {
    id: 'pl:openai/gpt-image-2',
    provider: 'pollinations',
    model: 'openai/gpt-image-2',
    name: 'OpenAI GPT Image 2',
    ref: true,
    sizes: 'free',
    cost: { ru: '≈0.02–0.2 Pollen, хорош с текстом', en: '≈0.02–0.2 Pollen, great with text' },
  },
  {
    id: 'pl:google/gemini-nano-banana-2.1',
    provider: 'pollinations',
    model: 'google/gemini-nano-banana-2.1',
    name: 'Nano Banana 2.1',
    ref: true,
    sizes: 'free',
    paid: true,
    cost: { ru: '≈0.04 Pollen, только платный', en: '≈0.04 Pollen, paid only' },
  },
  {
    id: 'pl:bytedance/seedream-4.5',
    provider: 'pollinations',
    model: 'bytedance/seedream-4.5',
    name: 'Seedream 4.5',
    ref: true,
    sizes: 'free',
    paid: true,
    cost: { ru: '0.042 Pollen, только платный', en: '0.042 Pollen, paid only' },
  },
  {
    id: 'pl:x-ai/grok-imagine-image',
    provider: 'pollinations',
    model: 'x-ai/grok-imagine-image',
    name: 'Grok Imagine',
    ref: true,
    sizes: 'free',
    paid: true,
    cost: { ru: '0.02 Pollen, только платный', en: '0.02 Pollen, paid only' },
  },
  {
    id: 'pl:black-forest-labs/flux.2-pro',
    provider: 'pollinations',
    model: 'black-forest-labs/flux.2-pro',
    name: 'FLUX.2 Pro',
    english: true, // understands only common Russian words ("ёж" became a man): prompts are translated
    ref: true,
    sizes: 'free',
    paid: true,
    cost: { ru: '≈0.05 Pollen, только платный', en: '≈0.05 Pollen, paid only' },
  },
  {
    id: 'pl:recraft/recraft-v4.1-flash',
    provider: 'pollinations',
    model: 'recraft/recraft-v4.1-flash',
    name: 'Recraft V4.1',
    ref: false,
    sizes: 'free',
    paid: true,
    cost: { ru: '0.007 Pollen, только платный', en: '0.007 Pollen, paid only' },
  },
  {
    id: 'pl:ideogram-ai/ideogram-v4-turbo',
    provider: 'pollinations',
    model: 'ideogram-ai/ideogram-v4-turbo',
    name: 'Ideogram v4',
    ref: false,
    sizes: 'free',
    paid: true,
    cost: { ru: '0.03 Pollen, только платный', en: '0.03 Pollen, paid only' },
  },
  {
    id: 'pl:recraft/recraft-v4.1-vector',
    provider: 'pollinations',
    model: 'recraft/recraft-v4.1-vector',
    name: 'Recraft Vector',
    ref: true,
    sizes: 'free',
    vector: true,
    paid: true,
    cost: { ru: 'SVG, 0.084 Pollen, только платный', en: 'SVG, 0.084 Pollen, paid only' },
  },

  // Gemini: no free tier for image models (Oct 2026)
  {
    id: 'gm:gemini-3.1-flash-lite-image',
    provider: 'gemini',
    model: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana 2 Lite',
    ref: true,
    sizes: 'ratios',
    paid: true,
    cost: { ru: '$0.034', en: '$0.034' },
  },
  {
    id: 'gm:gemini-nano-banana-2.1',
    provider: 'gemini',
    model: 'gemini-nano-banana-2.1',
    name: 'Nano Banana 2.1',
    ref: true,
    sizes: 'ratios',
    paid: true,
    cost: { ru: '$0.034', en: '$0.034' },
  },
  {
    id: 'gm:gemini-3-pro-image',
    provider: 'gemini',
    model: 'gemini-3-pro-image',
    name: 'Nano Banana Pro',
    ref: true,
    sizes: 'ratios',
    paid: true,
    cost: { ru: '$0.134', en: '$0.134' },
  },

  // QuiverAI: native SVG, token billing
  {
    id: 'qv:arrow-2',
    provider: 'quiver',
    model: 'arrow-2',
    name: 'Arrow 2',
    ref: true,
    sizes: 'prompt',
    vector: true,
    paid: true,
    cost: { ru: 'SVG, ≈$0.05–0.1', en: 'SVG, ≈$0.05–0.1' },
  },
  {
    id: 'qv:arrow-2-telos',
    provider: 'quiver',
    model: 'arrow-2-telos',
    name: 'Arrow 2 Telos',
    ref: true,
    sizes: 'prompt',
    vector: true,
    paid: true,
    cost: { ru: 'SVG, детальнее и дольше', en: 'SVG, more detailed, slower' },
  },
]

// Shown next to the model name in the picker.
// quality: 1–5 stars (rough, subjective)
// price:   'free' — free daily quota or free quest Pollen
//          '$' up to ~3¢, '$$' ~3–10¢, '$$$' more than 10¢ per image
const RATINGS = {
  'mix:free': [4, 'free'],
  'mix:paid': [5, '$$'],
  'cf:flux-2-klein-4b': [3, 'free'],
  'cf:flux-1-schnell': [2, 'free'],
  'pl:black-forest-labs/flux.2-klein-4b': [3, 'free'],
  'pl:tongyi-mai/z-image-turbo': [3, 'free'],
  'pl:black-forest-labs/flux.1-kontext-pro': [4, 'free'],
  'pl:openai/gpt-image-2': [5, 'free'],
  'pl:google/gemini-nano-banana-2.1': [5, '$$'],
  'pl:bytedance/seedream-4.5': [4, '$$'],
  'pl:x-ai/grok-imagine-image': [3, '$'],
  'pl:black-forest-labs/flux.2-pro': [4, '$$'],
  'pl:recraft/recraft-v4.1-flash': [4, '$'],
  'pl:ideogram-ai/ideogram-v4-turbo': [4, '$$'],
  'pl:recraft/recraft-v4.1-vector': [4, '$$'],
  'gm:gemini-3.1-flash-lite-image': [4, '$$'],
  'gm:gemini-nano-banana-2.1': [5, '$$'],
  'gm:gemini-3-pro-image': [5, '$$$'],
  'qv:arrow-2': [5, '$$'],
  'qv:arrow-2-telos': [5, '$$$'],
}
// One-line description for the model picker: [ru, en, de, es]
const DESCRIPTIONS = {
  'cf:flux-2-klein-4b': ['≈95 в день бесплатно', '≈95 free per day', '≈95 pro Tag kostenlos', '≈95 gratis al día'],
  'cf:flux-1-schnell': ['≈170 в день, только 1:1', '≈170 per day, 1:1 only', '≈170 pro Tag, nur 1:1', '≈170 al día, solo 1:1'],
  'pl:black-forest-labs/flux.2-klein-4b': ['Быстрая и дешёвая', 'Fast and cheap', 'Schnell und günstig', 'Rápido y barato'],
  'pl:tongyi-mai/z-image-turbo': ['Быстрая, без референса', 'Fast, no reference', 'Schnell, ohne Referenz', 'Rápido, sin referencia'],
  'pl:black-forest-labs/flux.1-kontext-pro': ['Правки по референсу', 'Edits from a reference', 'Änderungen nach Referenz', 'Ediciones a partir de una referencia'],
  'pl:openai/gpt-image-2': ['Лучше всех с текстом', 'Best with text', 'Am besten mit Text', 'El mejor con texto'],
  'pl:google/gemini-nano-banana-2.1': ['Универсальная, держит референс', 'All-rounder, keeps the reference', 'Allrounder, hält sich an die Referenz', 'Todoterreno, respeta la referencia'],
  'pl:bytedance/seedream-4.5': ['Точная детализация', 'Precise detail', 'Präzise Details', 'Detalle preciso'],
  'pl:x-ai/grok-imagine-image': ['Очень быстрая', 'Very fast', 'Sehr schnell', 'Muy rápido'],
  'pl:black-forest-labs/flux.2-pro': ['Быстрая и разносторонняя', 'Fast and versatile', 'Schnell und vielseitig', 'Rápido y versátil'],
  'pl:recraft/recraft-v4.1-flash': ['Дизайнерский вкус', 'Design taste', 'Gestalterisches Gespür', 'Gusto de diseño'],
  'pl:ideogram-ai/ideogram-v4-turbo': ['Яркая, хороша с текстом', 'Vivid, good with text', 'Lebendig, gut mit Text', 'Vivo, bueno con texto'],
  'pl:recraft/recraft-v4.1-vector': ['SVG-иллюстрации', 'SVG illustrations', 'SVG-Illustrationen', 'Ilustraciones SVG'],
  'gm:gemini-3.1-flash-lite-image': ['Самая дешёвая Nano Banana', 'Cheapest Nano Banana', 'Günstigstes Nano Banana', 'El Nano Banana más barato'],
  'gm:gemini-nano-banana-2.1': ['Универсальная', 'All-rounder', 'Allrounder', 'Todoterreno'],
  'gm:gemini-3-pro-image': ['Максимум качества', 'Top quality', 'Höchste Qualität', 'Máxima calidad'],
  'qv:arrow-2': ['Баланс качества и скорости', 'Balanced quality and speed', 'Ausgewogen: Qualität und Tempo', 'Equilibrio entre calidad y velocidad'],
  'qv:arrow-2-telos': ['Детальнее, но дольше', 'More detail, slower', 'Detaillierter, aber langsamer', 'Más detalle, más lento'],
}

MODELS.forEach((m) => {
  const r = RATINGS[m.id] || [3, '$']
  m.quality = r[0]
  m.price = r[1]
  m.kind = m.vector ? 'vector' : 'raster'
  const d = DESCRIPTIONS[m.id] || ['', '', '', '']
  m.desc = { ru: d[0], en: d[1], de: d[2], es: d[3] }
})

// Models that can turn a bitmap into SVG (QuiverAI vectorizations endpoint)
export const VECTORIZE_MODELS = [
  {
    id: 'arrow-2',
    name: 'Arrow 2',
    desc: { ru: 'Баланс качества и скорости', en: 'Balanced quality and speed', de: 'Ausgewogen: Qualität und Tempo', es: 'Equilibrio entre calidad y velocidad' },
    price: '$$',
  },
  {
    id: 'arrow-2-telos',
    name: 'Arrow 2 Telos',
    desc: { ru: 'Детальнее, но дольше', en: 'More detail, slower', de: 'Detaillierter, aber langsamer', es: 'Más detalle, más lento' },
    price: '$$$',
  },
]

export const GEMINI_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9']

export function findModel(id) {
  return MODELS.find((m) => m.id === id)
}

// Models a mix will actually use with the current keys.
export function mixMembers(mix, isAvailable) {
  return mix.mix
    .filter((m) => isAvailable(m.id) && !(m.unless && isAvailable(m.unless)))
    .map((m) => m.id)
}
