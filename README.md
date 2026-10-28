# Image Finder + AI for Sketch

Search Unsplash, Pexels and Pixabay, and generate photos or SVG vectors with AI from a text prompt or a reference image — right inside Sketch.

[Русская версия ниже](#по-русски)

## Features

- **Stock photos.** Search Unsplash, Pexels and Pixabay at once, in English or Russian. Filter by orientation (auto from the selected frame, landscape, portrait, square). A 🎲 button inserts a random result.
- **Vector search.** Vector illustrations from Pixabay. To get them as real SVG files, request **Full API access** from Pixabay ([pixabay.com/api/docs](https://pixabay.com/api/docs/)); with a regular key they come as PNG.
- **AI images.** Pollinations (many models through one key), Cloudflare Workers AI (free daily quota) and Google Gemini. "Free mix" and "Paid mix" spread one batch across several models.
- **AI vectors.** SVG generation and vectorization of a selected image with QuiverAI Arrow 2.
- **References.** Select an image (or a frame with an image fill) and generate variants based on it. Proportions follow the selected frame.
- **Smart insert.** See the table below. Drag a result onto the canvas: it lands in the frame under the cursor.
- **History and favorites.** The last 300 generated images and your search queries are kept between launches; favorite photos are saved locally.
- **Languages:** English, Deutsch, Español, Русский (follows macOS, can be changed in settings).

### What a click does

| Selected on the canvas | Click on a result | "Replace" / "As fill" button |
|---|---|---|
| Nothing | New image layer | — |
| Shape | Image fill of the shape | — |
| Frame | Image layer inside the frame, centered | The frame's own image fill |
| Image | A variant next to it | Replaces the image |

Dragging works the same way as in Sketch: drop onto a frame to put the image inside it, hold ⌘ while dropping to replace an image or set a fill.

## Install

1. Download `image-finder.sketchplugin.zip` from the [latest release](https://github.com/deniskozeev/sketch-image-finder/releases/latest).
2. Unzip it and double-click `image-finder.sketchplugin`.
3. Open the panel: **Plugins → Image Finder + AI**, or press **⌃⇧I**.

Requires Sketch 2025.1 or newer (tested on Sketch 2026.3). Sketch offers updates automatically.

## API keys

The plugin has no keys of its own: every service is used with your own key, entered in the plugin settings (the gear icon). You only need keys for the services you want.

| Service | What for | Price | Where to get a key |
|---|---|---|---|
| Unsplash | Photos | Free (50 requests/hour for a new app) | [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications) → New Application → Access Key |
| Pexels | Photos | Free (new keys were paused in Oct 2026) | [pexels.com/api/new](https://www.pexels.com/api/new/) |
| Pixabay | Photos and vectors | Free. SVG files need "Full API access", otherwise vectors come as PNG | [pixabay.com/api/docs](https://pixabay.com/api/docs/) (log in, the key is on the page) |
| Cloudflare Workers AI | AI images (FLUX) | Free daily quota | Account ID from the dashboard + an API token from the "Workers AI" template at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) |
| Pollinations | AI images, many models | Pay with Pollen; some models are free | [enter.pollinations.ai/keys](https://enter.pollinations.ai/keys). Allow "See balance, usage" to see your balance in the plugin |
| Google Gemini | AI images (Nano Banana) | Paid | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| QuiverAI | SVG generation and vectorization | Paid | [platform.quiver.ai/api-keys](https://platform.quiver.ai/api-keys). An optional admin key with `billing_read` shows your balance |

With Cloudflare keys, Russian prompts are translated to English for models that only understand English (a few units of the free quota per prompt).

## Privacy

Keys are stored only in Sketch's preferences on your Mac. Requests go straight from Sketch to each service; there is no server in between. History and favorites are kept in `~/Library/Application Support/com.deniskozeev.sketch-image-finder/` and can be cleared or opened in Finder from the settings.

## Build from source

```bash
npm install
npm run build
npm run link
```

`npm run link` links the plugin into Sketch. Restart Sketch to load a new build.

## License

[MIT](LICENSE) © Denis Kozeev · [kozeev.ru](https://kozeev.ru)

---

## По-русски

Поиск фото на Unsplash, Pexels и Pixabay и генерация фото или SVG нейросетями по описанию или по референсу — прямо в Sketch.

### Возможности

- **Фото со стоков.** Поиск сразу по Unsplash, Pexels и Pixabay, на русском или английском. Фильтр ориентации: авто (по выделенному фрейму), горизонтальная, вертикальная, квадрат. Кнопка 🎲 вставляет случайный результат.
- **Векторы.** Векторные иллюстрации с Pixabay. Чтобы получать их настоящими SVG-файлами, запросите у Pixabay **Full API access** (полный доступ к API, [pixabay.com/api/docs](https://pixabay.com/api/docs/)); с обычным ключом они приходят в PNG.
- **Генерация картинок.** Pollinations (много моделей по одному ключу), Cloudflare Workers AI (бесплатный дневной лимит) и Google Gemini. «Микс · бесплатные» и «Микс · платные» делают одну серию разными моделями.
- **Генерация векторов.** SVG и векторизация выделенной картинки через QuiverAI Arrow 2.
- **Референсы.** Выделите картинку (или фрейм с картинкой в заливке) — получите варианты на её основе. Пропорции берутся из выделенного фрейма.
- **Умная вставка** — см. таблицу. Картинку можно перетащить на холст: она ляжет во фрейм под курсором.
- **История и избранное.** Последние 300 генераций и запросы поиска сохраняются между запусками, избранные фото хранятся локально.
- **Языки:** русский, английский, немецкий, испанский (как в системе, можно сменить в настройках).

### Что делает клик

| Выделено на холсте | Клик по картинке | Кнопка «Заменить» / «Заливкой» |
|---|---|---|
| Ничего | Новый слой с картинкой | — |
| Фигура | Заливка фигуры картинкой | — |
| Фрейм | Картинка внутри фрейма, по центру | Картинка становится заливкой фрейма |
| Картинка | Вариант рядом с ней | Замена картинки |

Перетаскивание работает как в самом Sketch: бросьте на фрейм — картинка окажется внутри; с зажатым ⌘ — заменит картинку или станет заливкой.

### Установка

1. Скачайте `image-finder.sketchplugin.zip` из [последнего релиза](https://github.com/deniskozeev/sketch-image-finder/releases/latest).
2. Распакуйте и дважды кликните `image-finder.sketchplugin`.
3. Откройте панель: **Plugins → Image Finder + AI** или **⌃⇧I**.

Нужен Sketch 2025.1 или новее (проверено на Sketch 2026.3). Обновления Sketch предложит сам.

### Ключи

У плагина нет своих ключей: каждый сервис работает с вашим ключом, который вводится в настройках плагина (шестерёнка). Нужны ключи только тех сервисов, которыми вы пользуетесь.

| Сервис | Для чего | Цена | Где взять ключ |
|---|---|---|---|
| Unsplash | Фото | Бесплатно (50 запросов в час у нового приложения) | [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications) → New Application → Access Key |
| Pexels | Фото | Бесплатно (выдача новых ключей приостановлена в октябре 2026) | [pexels.com/api/new](https://www.pexels.com/api/new/) |
| Pixabay | Фото и векторы | Бесплатно. Для SVG нужен «Full API access», иначе векторы приходят в PNG | [pixabay.com/api/docs](https://pixabay.com/api/docs/) (войдите, ключ будет на странице) |
| Cloudflare Workers AI | Генерация (FLUX) | Бесплатный дневной лимит | Account ID из панели + API-токен по шаблону «Workers AI» на [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) |
| Pollinations | Генерация, много моделей | Оплата Pollen, часть моделей бесплатна | [enter.pollinations.ai/keys](https://enter.pollinations.ai/keys). Разрешите «See balance, usage», чтобы видеть баланс в плагине |
| Google Gemini | Генерация (Nano Banana) | Платно | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| QuiverAI | SVG и векторизация | Платно | [platform.quiver.ai/api-keys](https://platform.quiver.ai/api-keys). Необязательный admin-ключ с `billing_read` показывает баланс |

Если указаны ключи Cloudflare, русские запросы переводятся на английский для моделей, которые понимают только английский (несколько единиц бесплатного лимита на запрос).

### Приватность

Ключи хранятся только в настройках Sketch на вашем Mac. Запросы идут из Sketch напрямую в сервисы, без промежуточного сервера. История и избранное лежат в `~/Library/Application Support/com.deniskozeev.sketch-image-finder/`, их можно очистить или открыть в Finder из настроек.

### Лицензия

[MIT](LICENSE) © Денис Козеев · [kozeev.ru](https://kozeev.ru)
