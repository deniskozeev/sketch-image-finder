// UI of the Image Finder panel. Plain DOM, no framework.
// Layout: header (tabs, view toggle, settings) → scrolling results → composer.

const STRINGS = {
  ru: {
    tabPhoto: 'Фото',
    tabGen: 'Генерация',
    tabVector: 'Вектор',
    settings: 'Настройки',
    history: 'История',
    favorite: 'В избранное',
    historyEmpty: 'Здесь будет история этой вкладки.',
    searchHistoryEmpty: 'Здесь будут прошлые поисковые запросы.',
    showMore: 'Показать ещё',
    secHistory: 'История',
    store_searches: 'История поиска',
    store_generations: 'Генерации',
    store_favorites: 'Избранное',
    forms_searches: 'запрос|запроса|запросов',
    forms_generations: 'картинка|картинки|картинок',
    forms_favorites: 'фото|фото|фото',
    revealFolder: 'Показать папку в Finder',
    clear: 'Очистить',
    clearConfirm: 'Точно удалить?',
    viewOne: 'Одна колонка',
    viewTwo: 'Две колонки',
    // photo
    searchPh: 'Что ищем? Например: офис, кофе, горы',
    orientAuto: 'Авто',
    orientAny: 'Любая',
    landscape: 'Горизонтальная',
    portrait: 'Вертикальная',
    square: 'Квадратная',
    ratiosLandscape: 'Горизонтальные',
    ratiosSquare: 'Квадрат',
    ratiosPortrait: 'Вертикальные',
    orientAutoDesc: 'По выделенному слою',
    sources: '{n} стока',
    sourcesOne: '1 сток',
    sourcesNone: 'Нет стоков',
    noKey: 'нет ключа',
    random: 'Случайная картинка по запросу',
    search: 'Найти',
    photoEmpty: 'Введите запрос и нажмите Enter.\nКлик по картинке вставит её в выделенный слой.',
    nothingFound: 'Ничего не нашлось',
    noSources: 'Подключите хотя бы один сток.',
    addKey: 'Добавить ключ',
    // generation
    genPh: 'Опишите картинку…',
    genPhRef: 'Пусто — похожая картинка. Или опишите, что изменить',
    create: 'Создать',
    ratioAuto: 'Авто',
    ratioAutoDesc: 'По выделенному слою',
    count: '×{n}',
    genEmpty: 'Опишите картинку и нажмите Enter.\nВыделите слой — картинка встанет в него.',
    reference: 'Референс',
    addRef: 'Референс',
    refUnsupported: 'Эта модель не работает с референсом',
    noModels: 'Подключите хотя бы один сервис.',
    addKeyFor: '{name} — добавить ключ',
    // vector
    modeSearch: 'Поиск',
    modeSearchDesc: 'Векторные иллюстрации на Pixabay',
    modeGen: 'Генерация',
    modeGenDesc: 'SVG по описанию',
    modeVectorize: 'Векторизация',
    modeVectorizeDesc: 'Выделенная картинка → SVG',
    vectorPh: 'Опишите иллюстрацию или иконку…',
    vectorSearchPh: 'Что ищем? Например: кофе, офис',
    vectorize: 'Векторизовать',
    selectImage: 'Выделите на холсте слой с картинкой',
    vectorEmpty: 'Опишите иконку или иллюстрацию — получите SVG.\nИли выделите картинку и выберите «Векторизация».',
    vectorSearchEmpty: 'Векторные иллюстрации с Pixabay.\nС обычным ключом они приходят картинкой (PNG).\nЧтобы получать SVG, запросите у Pixabay «Full API access».',
    vectorizing: 'Векторизация «{name}»',
    needPixabay: 'Для поиска нужен ключ Pixabay.',
    pngTip: 'С обычным ключом Pixabay отдаёт только PNG-копию. Для SVG нужен «Full API access»',
    // tiles
    replace: 'Заменить',
    asFill: 'Заливкой',
    replaceTip: 'Заменить выделенную картинку. То же самое — перетащить на неё с зажатым ⌘',
    fillTip: 'Сделать заливкой фрейма. То же самое — перетащить на фрейм с зажатым ⌘',
    generating: 'Генерация…',
    more: 'Ещё',
    // targets
    targetFrame: '{name} · {size}',
    targetHintFrame: 'Клик — картинка во фрейм, «Заливкой» или перетаскивание с ⌘ — заливка фрейма',
    targetHintShape: 'Картинка станет заливкой фигуры',
    targetHintImage: 'Клик — вариант рядом с картинкой, «Заменить» или перетаскивание с ⌘ — замена',
    // errors
    emptyPrompt: 'Введите запрос',
    noImageSelected: 'Выделите слой с картинкой',
    badKey: 'Ключ не подходит — проверьте в настройках',
    noFunds: 'Не хватает средств или Pollen',
    rateLimit: 'Слишком много запросов, подождите',
    noPollen: 'На аккаунте Pollinations закончился Pollen',
    mixes: 'Микс — каждая картинка своей моделью',
    flagged: 'Фильтр безопасности сервиса отклонил картинку. Попробуйте ещё раз или измените запрос',
    blockedIp: 'Запрос заблокирован защитой от ботов — смените сервер VPN или пустите сервис мимо VPN',
    // settings
    secPhoto: 'Фото',
    secGen: 'Генерация',
    secVector: 'Вектор',
    secDefaults: 'По умолчанию',
    connected: 'Подключено',
    getKey: 'Получить ключ ↗',
    apiKey: 'API-ключ',
    accountId: 'Account ID',
    apiToken: 'API Token',
    adminKey: 'Admin-ключ — для баланса (необязательно)',
    genCount: 'Генерация — картинок за раз',
    vectorCount: 'Вектор — вариантов за раз',
    save: 'Сохранить',
    editKey: 'Изменить ключ',
    keyChecking: 'Проверяем ключ…',
    keyOk: 'Ключ работает',
    secLanguage: 'Язык',
    langAuto: 'Как в системе',
  },
  en: {
    tabPhoto: 'Photos',
    tabGen: 'Generate',
    tabVector: 'Vector',
    settings: 'Settings',
    history: 'History',
    favorite: 'Favorite',
    historyEmpty: 'This tab’s history will show up here.',
    searchHistoryEmpty: 'Past search queries will show up here.',
    showMore: 'Show more',
    secHistory: 'History',
    store_searches: 'Search history',
    store_generations: 'Generations',
    store_favorites: 'Favorites',
    forms_searches: 'query|queries',
    forms_generations: 'image|images',
    forms_favorites: 'photo|photos',
    revealFolder: 'Show the folder in Finder',
    clear: 'Clear',
    clearConfirm: 'Delete for sure?',
    viewOne: 'One column',
    viewTwo: 'Two columns',
    searchPh: 'Search, e.g. office, coffee, mountains',
    orientAuto: 'Auto',
    orientAny: 'Any',
    landscape: 'Landscape',
    portrait: 'Portrait',
    square: 'Square',
    ratiosLandscape: 'Landscape',
    ratiosSquare: 'Square',
    ratiosPortrait: 'Portrait',
    orientAutoDesc: 'From the selected layer',
    sources: '{n} sources',
    sourcesOne: '1 source',
    sourcesNone: 'No sources',
    noKey: 'no key',
    random: 'Random image for the query',
    search: 'Search',
    photoEmpty: 'Type a query and press Enter.\nClick an image to place it into the selected layer.',
    nothingFound: 'Nothing found',
    noSources: 'Connect at least one source.',
    addKey: 'Add key',
    genPh: 'Describe the image…',
    genPhRef: 'Empty — a similar image. Or describe what to change',
    create: 'Create',
    ratioAuto: 'Auto',
    ratioAutoDesc: 'From the selected layer',
    count: '×{n}',
    genEmpty: 'Describe an image and press Enter.\nSelect a layer and the image goes into it.',
    reference: 'Reference',
    addRef: 'Reference',
    refUnsupported: 'This model can’t use a reference',
    noModels: 'Connect at least one service.',
    addKeyFor: '{name} — add a key',
    modeSearch: 'Search',
    modeSearchDesc: 'Vector illustrations on Pixabay',
    modeGen: 'Generate',
    modeGenDesc: 'SVG from a description',
    modeVectorize: 'Vectorize',
    modeVectorizeDesc: 'Selected image → SVG',
    vectorPh: 'Describe an illustration or icon…',
    vectorSearchPh: 'Search, e.g. coffee, office',
    vectorize: 'Vectorize',
    selectImage: 'Select a layer with an image on the canvas',
    vectorEmpty: 'Describe an icon or illustration to get SVG.\nOr select an image and choose “Vectorize”.',
    vectorSearchEmpty: 'Vector illustrations from Pixabay.\nWith a regular key they come as PNG.\nTo get SVG, request “Full API access” from Pixabay.',
    vectorizing: 'Vectorizing “{name}”',
    needPixabay: 'Searching needs a Pixabay key.',
    pngTip: 'A regular key only gets a PNG copy. SVG needs “Full API access”',
    replace: 'Replace',
    asFill: 'As fill',
    replaceTip: 'Replace the selected image. Same as dragging onto it with ⌘ held',
    fillTip: 'Use as the frame’s fill. Same as dragging onto the frame with ⌘ held',
    generating: 'Generating…',
    more: 'More',
    targetFrame: '{name} · {size}',
    targetHintFrame: 'Click — image into the frame, “As fill” or drag with ⌘ — frame fill',
    targetHintShape: 'The image fills the shape',
    targetHintImage: 'Click — variant next to the image, “Replace” or drag with ⌘ — replace it',
    emptyPrompt: 'Enter a prompt',
    noImageSelected: 'Select a layer with an image',
    badKey: 'The key was rejected — check Settings',
    noFunds: 'Not enough balance or Pollen',
    rateLimit: 'Too many requests, wait a moment',
    noPollen: 'The Pollinations account is out of Pollen',
    mixes: 'Mix — one model per image',
    flagged: 'The service’s safety filter rejected this image. Try again or change the prompt',
    blockedIp: 'Blocked by bot protection — switch the VPN server or route the service outside the VPN',
    secPhoto: 'Photos',
    secGen: 'Generate',
    secVector: 'Vector',
    secDefaults: 'Defaults',
    connected: 'Connected',
    getKey: 'Get a key ↗',
    apiKey: 'API key',
    accountId: 'Account ID',
    apiToken: 'API Token',
    adminKey: 'Admin key — for the balance (optional)',
    genCount: 'Generate — images per run',
    vectorCount: 'Vector — variants per run',
    save: 'Save',
    editKey: 'Edit the key',
    keyChecking: 'Checking the key…',
    keyOk: 'The key works',
    secLanguage: 'Language',
    langAuto: 'System language',
  },
  de: {
    tabPhoto: 'Fotos',
    tabGen: 'Generieren',
    tabVector: 'Vektor',
    settings: 'Einstellungen',
    history: 'Verlauf',
    favorite: 'Favorit',
    historyEmpty: 'Hier erscheint der Verlauf dieses Tabs.',
    searchHistoryEmpty: 'Hier erscheinen frühere Suchanfragen.',
    showMore: 'Mehr anzeigen',
    secHistory: 'Verlauf',
    store_searches: 'Suchverlauf',
    store_generations: 'Generierungen',
    store_favorites: 'Favoriten',
    forms_searches: 'Anfrage|Anfragen',
    forms_generations: 'Bild|Bilder',
    forms_favorites: 'Foto|Fotos',
    revealFolder: 'Ordner im Finder zeigen',
    clear: 'Leeren',
    clearConfirm: 'Wirklich löschen?',
    viewOne: 'Eine Spalte',
    viewTwo: 'Zwei Spalten',
    searchPh: 'Wonach suchen? Z. B. Büro, Kaffee, Berge',
    orientAuto: 'Auto',
    orientAny: 'Beliebig',
    landscape: 'Querformat',
    portrait: 'Hochformat',
    square: 'Quadratisch',
    ratiosLandscape: 'Querformat',
    ratiosSquare: 'Quadrat',
    ratiosPortrait: 'Hochformat',
    orientAutoDesc: 'Nach der ausgewählten Ebene',
    sources: '{n} Quellen',
    sourcesOne: '1 Quelle',
    sourcesNone: 'Keine Quellen',
    noKey: 'kein Schlüssel',
    random: 'Zufälliges Bild zur Anfrage',
    search: 'Suchen',
    photoEmpty: 'Suchbegriff eingeben und Enter drücken.\nEin Klick auf ein Bild setzt es in die ausgewählte Ebene ein.',
    nothingFound: 'Nichts gefunden',
    noSources: 'Verbinde mindestens eine Quelle.',
    addKey: 'Schlüssel hinzufügen',
    genPh: 'Beschreibe das Bild…',
    genPhRef: 'Leer — ein ähnliches Bild. Oder beschreibe, was geändert werden soll',
    create: 'Erstellen',
    ratioAuto: 'Auto',
    ratioAutoDesc: 'Nach der ausgewählten Ebene',
    count: '×{n}',
    genEmpty: 'Beschreibe ein Bild und drücke Enter.\nWähle eine Ebene aus – das Bild wird dort eingesetzt.',
    reference: 'Referenz',
    addRef: 'Referenz',
    refUnsupported: 'Dieses Modell kann keine Referenz verwenden',
    noModels: 'Verbinde mindestens einen Dienst.',
    addKeyFor: '{name} — Schlüssel hinzufügen',
    modeSearch: 'Suche',
    modeSearchDesc: 'Vektorillustrationen auf Pixabay',
    modeGen: 'Generieren',
    modeGenDesc: 'SVG aus einer Beschreibung',
    modeVectorize: 'Vektorisieren',
    modeVectorizeDesc: 'Ausgewähltes Bild → SVG',
    vectorPh: 'Beschreibe eine Illustration oder ein Icon…',
    vectorSearchPh: 'Wonach suchen? Z. B. Kaffee, Büro',
    vectorize: 'Vektorisieren',
    selectImage: 'Wähle auf der Arbeitsfläche eine Ebene mit einem Bild',
    vectorEmpty: 'Beschreibe ein Icon oder eine Illustration und erhalte ein SVG.\nOder wähle ein Bild aus und dann „Vektorisieren“.',
    vectorSearchEmpty: 'Vektorillustrationen von Pixabay.\nMit einem normalen Schlüssel kommen sie als Bild (PNG).\nFür SVG beantrage bei Pixabay „Full API access“.',
    vectorizing: '„{name}“ wird vektorisiert',
    needPixabay: 'Für die Suche wird ein Pixabay-Schlüssel benötigt.',
    pngTip: 'Mit einem normalen Schlüssel liefert Pixabay nur eine PNG-Kopie. Für SVG ist „Full API access“ nötig',
    replace: 'Ersetzen',
    asFill: 'Als Füllung',
    replaceTip: 'Ausgewähltes Bild ersetzen. Dasselbe wie Ziehen mit gedrückter ⌘-Taste',
    fillTip: 'Als Füllung des Frames verwenden. Dasselbe wie Ziehen auf den Frame mit gedrückter ⌘-Taste',
    generating: 'Wird generiert…',
    more: 'Mehr',
    targetFrame: '{name} · {size}',
    targetHintFrame: 'Klick – Bild in den Frame, „Als Füllung“ oder Ziehen mit ⌘ – Füllung des Frames',
    targetHintShape: 'Das Bild wird zur Füllung der Form',
    targetHintImage: 'Klick – Variante neben das Bild, „Ersetzen“ oder Ziehen mit ⌘ – ersetzen',
    emptyPrompt: 'Gib eine Beschreibung ein',
    noImageSelected: 'Wähle eine Ebene mit einem Bild',
    badKey: 'Der Schlüssel wurde abgelehnt – prüfe ihn in den Einstellungen',
    noFunds: 'Nicht genug Guthaben oder Pollen',
    rateLimit: 'Zu viele Anfragen, bitte kurz warten',
    noPollen: 'Das Pollinations-Konto hat keine Pollen mehr',
    mixes: 'Mix — jedes Bild von einem anderen Modell',
    flagged: 'Der Sicherheitsfilter des Dienstes hat das Bild abgelehnt. Versuche es erneut oder ändere die Beschreibung',
    blockedIp: 'Vom Bot-Schutz blockiert — wechsle den VPN-Server oder leite den Dienst am VPN vorbei',
    secPhoto: 'Fotos',
    secGen: 'Generieren',
    secVector: 'Vektor',
    secDefaults: 'Standard',
    connected: 'Verbunden',
    getKey: 'Schlüssel holen ↗',
    apiKey: 'API-Schlüssel',
    accountId: 'Account ID',
    apiToken: 'API Token',
    adminKey: 'Admin-Schlüssel — für das Guthaben (optional)',
    genCount: 'Generieren — Bilder pro Durchlauf',
    vectorCount: 'Vektor — Varianten pro Durchlauf',
    save: 'Speichern',
    editKey: 'Schlüssel bearbeiten',
    keyChecking: 'Schlüssel wird geprüft…',
    keyOk: 'Der Schlüssel funktioniert',
    secLanguage: 'Sprache',
    langAuto: 'Systemsprache',
  },
  es: {
    tabPhoto: 'Fotos',
    tabGen: 'Generar',
    tabVector: 'Vector',
    settings: 'Ajustes',
    history: 'Historial',
    favorite: 'Favorito',
    historyEmpty: 'Aquí aparecerá el historial de esta pestaña.',
    searchHistoryEmpty: 'Aquí aparecerán las búsquedas anteriores.',
    showMore: 'Mostrar más',
    secHistory: 'Historial',
    store_searches: 'Historial de búsqueda',
    store_generations: 'Generaciones',
    store_favorites: 'Favoritos',
    forms_searches: 'búsqueda|búsquedas',
    forms_generations: 'imagen|imágenes',
    forms_favorites: 'foto|fotos',
    revealFolder: 'Mostrar la carpeta en Finder',
    clear: 'Borrar',
    clearConfirm: '¿Seguro que quieres borrar?',
    viewOne: 'Una columna',
    viewTwo: 'Dos columnas',
    searchPh: '¿Qué buscas? Por ejemplo: oficina, café, montañas',
    orientAuto: 'Auto',
    orientAny: 'Cualquiera',
    landscape: 'Horizontal',
    portrait: 'Vertical',
    square: 'Cuadrada',
    ratiosLandscape: 'Horizontales',
    ratiosSquare: 'Cuadrado',
    ratiosPortrait: 'Verticales',
    orientAutoDesc: 'Según la capa seleccionada',
    sources: '{n} fuentes',
    sourcesOne: '1 fuente',
    sourcesNone: 'Sin fuentes',
    noKey: 'sin clave',
    random: 'Imagen aleatoria para la búsqueda',
    search: 'Buscar',
    photoEmpty: 'Escribe una búsqueda y pulsa Enter.\nHaz clic en una imagen para colocarla en la capa seleccionada.',
    nothingFound: 'No se encontró nada',
    noSources: 'Conecta al menos una fuente.',
    addKey: 'Añadir clave',
    genPh: 'Describe la imagen…',
    genPhRef: 'Vacío — una imagen parecida. O describe qué cambiar',
    create: 'Crear',
    ratioAuto: 'Auto',
    ratioAutoDesc: 'Según la capa seleccionada',
    count: '×{n}',
    genEmpty: 'Describe una imagen y pulsa Enter.\nSelecciona una capa y la imagen irá en ella.',
    reference: 'Referencia',
    addRef: 'Referencia',
    refUnsupported: 'Este modelo no puede usar una referencia',
    noModels: 'Conecta al menos un servicio.',
    addKeyFor: '{name} — añadir clave',
    modeSearch: 'Buscar',
    modeSearchDesc: 'Ilustraciones vectoriales en Pixabay',
    modeGen: 'Generar',
    modeGenDesc: 'SVG a partir de una descripción',
    modeVectorize: 'Vectorizar',
    modeVectorizeDesc: 'Imagen seleccionada → SVG',
    vectorPh: 'Describe una ilustración o un icono…',
    vectorSearchPh: '¿Qué buscas? Por ejemplo: café, oficina',
    vectorize: 'Vectorizar',
    selectImage: 'Selecciona en el lienzo una capa con una imagen',
    vectorEmpty: 'Describe un icono o una ilustración y obtén un SVG.\nO selecciona una imagen y elige «Vectorizar».',
    vectorSearchEmpty: 'Ilustraciones vectoriales de Pixabay.\nCon una clave normal llegan como imagen (PNG).\nPara recibir SVG, solicita a Pixabay «Full API access».',
    vectorizing: 'Vectorizando «{name}»',
    needPixabay: 'Para buscar se necesita una clave de Pixabay.',
    pngTip: 'Con una clave normal Pixabay solo da una copia PNG. Para SVG se necesita «Full API access»',
    replace: 'Reemplazar',
    asFill: 'Como relleno',
    replaceTip: 'Reemplazar la imagen seleccionada. Igual que arrastrar sobre ella con ⌘ pulsado',
    fillTip: 'Usar como relleno del frame. Igual que arrastrar sobre el frame con ⌘ pulsado',
    generating: 'Generando…',
    more: 'Más',
    targetFrame: '{name} · {size}',
    targetHintFrame: 'Clic — imagen dentro del frame, «Como relleno» o arrastrar con ⌘ — relleno del frame',
    targetHintShape: 'La imagen será el relleno de la forma',
    targetHintImage: 'Clic — variante junto a la imagen, «Reemplazar» o arrastrar con ⌘ — reemplazarla',
    emptyPrompt: 'Escribe una descripción',
    noImageSelected: 'Selecciona una capa con una imagen',
    badKey: 'La clave fue rechazada — revísala en Ajustes',
    noFunds: 'No hay saldo o Pollen suficiente',
    rateLimit: 'Demasiadas solicitudes, espera un momento',
    noPollen: 'La cuenta de Pollinations se quedó sin Pollen',
    mixes: 'Mix — cada imagen con otro modelo',
    flagged: 'El filtro de seguridad del servicio rechazó la imagen. Inténtalo de nuevo o cambia la descripción',
    blockedIp: 'Bloqueado por la protección anti-bots — cambia de servidor VPN o deja el servicio fuera de la VPN',
    secPhoto: 'Fotos',
    secGen: 'Generar',
    secVector: 'Vector',
    secDefaults: 'Predeterminado',
    connected: 'Conectado',
    getKey: 'Obtener clave ↗',
    apiKey: 'Clave de API',
    accountId: 'Account ID',
    apiToken: 'API Token',
    adminKey: 'Clave de admin — para ver el saldo (opcional)',
    genCount: 'Generar — imágenes por vez',
    vectorCount: 'Vector — variantes por vez',
    save: 'Guardar',
    editKey: 'Editar la clave',
    keyChecking: 'Comprobando la clave…',
    keyOk: 'La clave funciona',
    secLanguage: 'Idioma',
    langAuto: 'Idioma del sistema',
  },
}

// Short hints for each service, shown when its row is expanded in Settings.
const HINTS = {
  ru: {
    unsplash: ['50 запросов в час в демо-режиме', 'Ключ — Access Key приложения'],
    pexels: ['≈200 запросов в час', 'Новые ключи сейчас не выдают'],
    pixabay: ['Ключ — на странице документации API', 'Есть векторные иллюстрации, но с обычным ключом — картинкой (PNG)', 'Для SVG запросите «Full API access» там же, на странице API'],
    pollinations: ['Один ключ — много моделей', 'Pollen: бесплатно за квесты или покупка', 'Модели «$» — только на платном Pollen', 'Чтобы видеть баланс — право «See balance, usage…»'],
    cloudflare: ['Бесплатно ≈95 картинок в день', 'Токен — шаблон «Workers AI»', 'Account ID — в адресе dash.cloudflare.com/<ID>/…'],
    gemini: ['Только платно, от $0.034 за картинку', 'Из России нужен VPN'],
    quiver: ['SVG-генерация и векторизация', 'Предоплата от $10', 'Admin-ключ — для получения баланса'],
  },
  en: {
    unsplash: ['50 requests/hour in demo mode', 'The key is the app Access Key'],
    pexels: ['≈200 requests/hour', 'New keys are not issued right now'],
    pixabay: ['The key is on the API docs page', 'Has vector illustrations, but a regular key gets them as PNG', 'For SVG request “Full API access” on the same API page'],
    pollinations: ['One key, many models', 'Pollen: free from quests, or buy it', '“$” models need paid Pollen', 'For the balance: the “See balance, usage…” permission'],
    cloudflare: ['≈95 free images per day', 'Token — “Workers AI” template', 'Account ID is in the URL dash.cloudflare.com/<ID>/…'],
    gemini: ['Paid only, from $0.034 per image'],
    quiver: ['SVG generation and vectorization', '$10 minimum prepaid', 'Admin key — to show the balance'],
  },
  de: {
    unsplash: ['50 Anfragen pro Stunde im Demo-Modus', 'Der Schlüssel ist der Access Key der App'],
    pexels: ['≈200 Anfragen pro Stunde', 'Neue Schlüssel werden derzeit nicht vergeben'],
    pixabay: ['Der Schlüssel steht auf der Seite der API-Dokumentation', 'Hat Vektorillustrationen, mit normalem Schlüssel aber als Bild (PNG)', 'Für SVG „Full API access“ auf derselben API-Seite beantragen'],
    pollinations: ['Ein Schlüssel – viele Modelle', 'Pollen: kostenlos für Quests oder kaufen', '„$“-Modelle brauchen bezahlte Pollen', 'Für das Guthaben: Berechtigung „See balance, usage…“'],
    cloudflare: ['≈95 kostenlose Bilder pro Tag', 'Token — Vorlage „Workers AI“', 'Account ID steht in der URL dash.cloudflare.com/<ID>/…'],
    gemini: ['Nur kostenpflichtig, ab $0.034 pro Bild'],
    quiver: ['SVG-Generierung und Vektorisierung', 'Vorauszahlung ab $10', 'Admin-Schlüssel — um das Guthaben anzuzeigen'],
  },
  es: {
    unsplash: ['50 solicitudes por hora en modo demo', 'La clave es la Access Key de la app'],
    pexels: ['≈200 solicitudes por hora', 'Ahora no se emiten claves nuevas'],
    pixabay: ['La clave está en la página de documentación de la API', 'Tiene ilustraciones vectoriales, pero con clave normal llegan como imagen (PNG)', 'Para SVG solicita «Full API access» en la misma página de la API'],
    pollinations: ['Una clave, muchos modelos', 'Pollen: gratis por misiones o de pago', 'Los modelos «$» necesitan Pollen de pago', 'Para ver el saldo: permiso «See balance, usage…»'],
    cloudflare: ['≈95 imágenes gratis al día', 'Token — plantilla «Workers AI»', 'El Account ID está en la URL dash.cloudflare.com/<ID>/…'],
    gemini: ['Solo de pago, desde $0.034 por imagen'],
    quiver: ['Generación de SVG y vectorización', 'Prepago desde $10', 'Clave de admin — para ver el saldo'],
  },
}

const ICONS = {
  gear: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  cols1: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/></svg>',
  cols2: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2.5" width="5" height="11" rx="1.5"/><rect x="9" y="2.5" width="5" height="11" rx="1.5"/></svg>',
  back: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3L5 8l5 5"/></svg>',
  chevRight: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2.5L6.5 5 4 7.5"/></svg>',
  chev: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4l2.5 2.5L7.5 4"/></svg>',
  spark: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M8 1.5l1.4 4.1 4.1 1.4-4.1 1.4L8 12.5 6.6 8.4 2.5 7l4.1-1.4z"/><path d="M13 11.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z"/></svg>',
  ratio: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2 7h12M7 7v5.5"/></svg>',
  orient: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="4" width="13" height="8" rx="1.5"/></svg>',
  stack: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M8 2l6 3-6 3-6-3z"/><path d="M2 8l6 3 6-3M2 11l6 3 6-3"/></svg>',
  dice: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="2" width="12" height="12" rx="3"/><circle cx="5.5" cy="5.5" r=".9" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="10.5" cy="10.5" r=".9" fill="currentColor" stroke="none"/></svg>',
  search: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14" stroke-linecap="round"/></svg>',
  image: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><rect x="2" y="2.5" width="12" height="11" rx="2"/><circle cx="6" cy="6.5" r="1.2"/><path d="M2.5 12l3.5-3.5 3 3 2-2 2.5 2.5"/></svg>',
  pen: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 13C5 6 8 3.5 13 3" stroke-linecap="round"/><rect x="1.5" y="11.5" width="3" height="3" rx=".5"/><rect x="11.5" y="1.5" width="3" height="3" rx=".5"/></svg>',
  svg: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="3" width="10" height="10" rx="1"/><rect x="1.5" y="1.5" width="3" height="3" fill="var(--chip)"/><rect x="11.5" y="1.5" width="3" height="3" fill="var(--chip)"/><rect x="1.5" y="11.5" width="3" height="3" fill="var(--chip)"/><rect x="11.5" y="11.5" width="3" height="3" fill="var(--chip)"/></svg>',
  frame: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4.5 1.5v13M11.5 1.5v13M1.5 4.5h13M1.5 11.5h13"/></svg>',
  shape: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/></svg>',
  history: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9"/><path d="M2.3 2.5v2.2h2.2"/><path d="M8 5v3.2l2 1.3"/></svg>',
  heart: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 13.5S2 10 2 5.8A3.2 3.2 0 0 1 8 4.2a3.2 3.2 0 0 1 6 1.6C14 10 8 13.5 8 13.5z"/></svg>',
  heartSmall: '<svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 13.5S2 10 2 5.8A3.2 3.2 0 0 1 8 4.2a3.2 3.2 0 0 1 6 1.6C14 10 8 13.5 8 13.5z"/></svg>',
  folder: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M1.5 4.5a1 1 0 0 1 1-1h3.6l1.5 1.6h5.9a1 1 0 0 1 1 1v6.4a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z"/></svg>',
  pencil: '<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2.5l2.5 2.5L5.5 13H3v-2.5z"/><path d="M9.5 4l2.5 2.5"/></svg>',
  check: '<svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.3l2.4 2.4 4.6-5.2"/></svg>',
  x: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 2l6 6M8 2l-6 6"/></svg>',
  plus: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M5 1.5v7M1.5 5h7"/></svg>',
}

const PRICE_LABEL = { free: 'Free', $: '$', $$: '$$', $$$: '$$$' }
const RATIO_GROUPS = [
  ['ratiosLandscape', ['16:9', '3:2', '4:3']],
  ['ratiosSquare', ['1:1']],
  ['ratiosPortrait', ['3:4', '2:3', '9:16']],
]

// A small rectangle with the given proportions, fitted into a 16×16 icon.
function shapeIcon(w, h) {
  const box = 12
  const scale = box / Math.max(w, h)
  const rw = Math.max(4, w * scale)
  const rh = Math.max(4, h * scale)
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="${(16 - rw) / 2}" y="${(16 - rh) / 2}" width="${rw}" height="${rh}" rx="1.5"/></svg>`
}

function ratioIcon(r) {
  const [a, b] = r.split(':').map(Number)
  return shapeIcon(a, b)
}

const ORIENT_ICONS = {
  any: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1.5" y="5" width="9" height="6.5" rx="1.2"/><rect x="7.5" y="2" width="6.5" height="9" rx="1.2"/></svg>',
  landscape: shapeIcon(16, 10),
  portrait: shapeIcon(10, 16),
  square: shapeIcon(1, 1),
  auto: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4.5 1.5v13M11.5 1.5v13M1.5 4.5h13M1.5 11.5h13"/></svg>',
}
const GEN_PROVIDERS = ['pollinations', 'cloudflare', 'gemini']
const VECTOR_PROVIDERS = ['quiver', 'pollinations']

const S = {
  lang: 'en',
  settings: null,
  models: [],
  vectorizeModels: [],
  providers: {},
  stockProviders: {},
  selection: { kind: 'none' },
  tab: 'photo',
  inSettings: false,
  historyOpen: false,
  favIds: new Set(),
  history: null, // loaded history for the current tab
  expanded: null,
  photo: newSearchState(),
  gen: { prompt: '', modelId: null, ratio: 'auto', count: 4, useRef: true, batches: [] },
  vector: { mode: 'generate', prompt: '', query: '', modelId: null, vectorizeModel: 'arrow-2', count: 4, useRef: true, batches: [], search: newSearchState() },
}

function newSearchState() {
  return { query: '', orientation: 'auto', items: [], page: 1, hasMore: false, loading: false, searched: false, errors: [], lastQuery: '' }
}

const $ = (sel, root = document) => root.querySelector(sel)
const app = $('#app')

function t(key, vars) {
  let s = (STRINGS[S.lang] && STRINGS[S.lang][key]) || STRINGS.en[key] || key
  if (vars) Object.keys(vars).forEach((k) => (s = s.split('{' + k + '}').join(vars[k])))
  return s
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function nl2br(s) {
  return esc(s).replace(/\n/g, '<br>')
}

// Calls a handler in the plugin. Handlers return { ok } or { error }.
function call(name, ...args) {
  return window.postMessage(name, ...args).then((r) => {
    const res = Array.isArray(r) ? r[0] : r
    if (res && res.error) {
      const err = new Error(res.error)
      err.status = res.status
      throw err
    }
    return res
  })
}

function humanError(err) {
  const m = (err && err.message) || String(err)
  if (m === 'EMPTY_PROMPT') return t('emptyPrompt')
  if (m === 'NO_IMAGE_SELECTED') return t('noImageSelected')
  if (m === 'BLOCKED_IP') return t('blockedIp')
  if (m === 'FLAGGED') return t('flagged')
  if (err.status === 401 || err.status === 403) return t('badKey')
  if (/insufficient balance/i.test(m)) return t('noPollen')
  if (err.status === 402) return t('noFunds')
  if (err.status === 429) return t('rateLimit')
  return m
}

// ---------- overlay scrollbar ----------

// macOS-style scrollbar: appears while scrolling, fades out, can be dragged.
function overlayScrollbar(view, thumb, onScroll) {
  let hideTimer
  let dragging = null
  const pad = 2

  function geometry() {
    const max = view.scrollHeight - view.clientHeight
    const track = view.clientHeight - pad * 2
    const height = Math.max(28, (track * view.clientHeight) / view.scrollHeight)
    return { max, track, height }
  }
  function update() {
    const g = geometry()
    if (g.max <= 1) {
      thumb.style.display = 'none'
      return
    }
    thumb.style.display = ''
    thumb.style.height = g.height + 'px'
    thumb.style.transform = 'translateY(' + (pad + (view.scrollTop / g.max) * (g.track - g.height)) + 'px)'
  }
  function show() {
    update()
    thumb.classList.add('visible')
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      if (!dragging && !thumb.matches(':hover')) thumb.classList.remove('visible')
    }, 1000)
  }
  view.addEventListener(
    'scroll',
    () => {
      show()
      if (onScroll) onScroll()
    },
    { passive: true }
  )
  thumb.addEventListener('mouseleave', show)
  thumb.addEventListener('mousedown', (e) => {
    e.preventDefault()
    dragging = { y: e.clientY, top: view.scrollTop }
    thumb.classList.add('dragging')
  })
  window.addEventListener('mousemove', (e) => {
    if (!dragging) return
    const g = geometry()
    view.scrollTop = dragging.top + ((e.clientY - dragging.y) * g.max) / (g.track - g.height)
  })
  window.addEventListener('mouseup', () => {
    if (!dragging) return
    dragging = null
    thumb.classList.remove('dragging')
    show()
  })
  new ResizeObserver(update).observe(view)
  new MutationObserver(update).observe(view, { childList: true, subtree: true })
}

// Textarea grows with its content up to its max-height.
function autoGrow(textarea) {
  const fit = () => {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }
  textarea.addEventListener('input', fit)
  fit()
}

// ---------- menus ----------

let openMenuEl = null
let openMenuAnchor = null

function closeMenu() {
  if (openMenuEl) openMenuEl.remove()
  openMenuEl = null
  openMenuAnchor = null
}

// items: { group } | { id, name, desc, meta, checked, disabled } | { muted, action } | { sep: true }
// Opens above the anchor (the composer sits at the bottom of the window).
function openMenu(anchor, items, onSelect, opts = {}) {
  closeMenu()
  const menu = document.createElement('div')
  menu.className = 'menu'
  menu.innerHTML = items
    .map((it, i) => {
      if (it.group) return `<div class="group" ${it.groupId ? `data-group="${esc(it.groupId)}"` : ''}>${esc(it.group)}</div>`
      if (it.sep) return '<div class="sep"></div>'
      if (it.muted) return `<div class="muted" data-i="${i}">${esc(it.muted)}</div>`
      return `<div class="item ${it.disabled ? 'disabled' : ''}" data-i="${i}">
        <span class="check">${it.checked ? ICONS.check : ''}</span>
        ${it.icon ? `<span class="item-icon">${it.icon}</span>` : ''}
        <span class="texts"><div class="name">${esc(it.name)}</div>${it.desc ? `<div class="desc">${esc(it.desc)}</div>` : ''}</span>
        ${it.meta ? `<span class="item-meta">${esc(it.meta)}</span>` : ''}
        ${it.hint ? `<span class="hint-q" title="${esc(it.hint)}">?</span>` : ''}
      </div>`
    })
    .join('')
  if (opts.compact) menu.style.minWidth = '0'
  document.body.appendChild(menu)
  openMenuEl = menu
  openMenuAnchor = anchor

  const r = anchor.getBoundingClientRect()
  const maxH = r.top - 12
  menu.style.maxHeight = maxH + 'px'
  const left = Math.max(8, Math.min(r.left, window.innerWidth - menu.offsetWidth - 8))
  menu.style.left = left + 'px'
  menu.style.top = Math.max(8, r.top - 6 - menu.offsetHeight) + 'px'

  menu.addEventListener('click', (e) => {
    e.stopPropagation()
    const el = e.target.closest('[data-i]')
    if (!el) return
    const it = items[Number(el.dataset.i)]
    if (it.disabled) return
    if (it.action) {
      closeMenu()
      it.action()
      return
    }
    if (!opts.keepOpen) closeMenu()
    onSelect(it)
  })
}

// Any click outside the menu closes it; a click on the button that opened it
// only closes it (toggle). We listen to `click` in the capture phase: the
// first click into an inactive Sketch panel arrives as a synthetic click
// without a preceding mousedown.
document.addEventListener(
  'click',
  (e) => {
    if (!openMenuEl || openMenuEl.contains(e.target)) return
    const onAnchor = openMenuAnchor && openMenuAnchor.contains(e.target)
    closeMenu()
    if (onAnchor) {
      e.stopPropagation()
      e.preventDefault()
    }
  },
  true
)
// Esc closes an open menu only: unhandled, it reaches the panel, which closes
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !openMenuEl) return
  e.preventDefault()
  closeMenu()
})

// ---------- shell ----------

function renderShell() {
  app.innerHTML = `
    <div class="header" id="header"></div>
    <div class="scroll-wrap">
      <div class="scroll" id="scroll"></div>
      <div class="vthumb" id="vthumb"></div>
    </div>
    <div class="composer-wrap" id="composer-wrap"></div>
  `
  overlayScrollbar($('#scroll'), $('#vthumb'), onResultsScroll)
  // Dragging a generated result: WebKit could only drag the rendered
  // thumbnail, so its drag is cancelled and, once the mouse has moved a few
  // pixels, the plugin starts a native drag of the saved file (see startDrag).
  let pressed = null
  // The whole tile is the handle (its caption overlay used to swallow the
  // press), except its own buttons. Generated results already have a file;
  // stock photos get their full-size file downloaded as soon as they're pressed.
  const dragTarget = (target) => {
    if (!target.closest || target.closest('button')) return null
    const tile = target.closest('.tile')
    if (!tile) return null
    const img = tile.querySelector('img[data-file]')
    if (img) return { tile, path: img.dataset.file }
    if (tile.dataset.id) return { tile, stockId: tile.dataset.id }
    return null
  }
  // Sketch adds the dropped layer a moment after the drag ends; the plugin
  // then moves it into the frame under the cursor (see settleDrop in main.js).
  const settleDrop = (tries) => {
    setTimeout(() => {
      call('settleDrop')
        .then((res) => {
          if (!res.done && tries < 40) settleDrop(tries + 1)
        })
        .catch((e) => console.error('settleDrop', e))
    }, tries ? 150 : 50)
  }
  const startNativeDrag = (press) => {
    if (press.busy || press.tries >= 3) return
    if (!press.path) {
      // still downloading: start as soon as the file is ready, if the button is still down
      if (press.prep && !press.waiting) {
        press.waiting = true
        press.tile.classList.add('busy')
        press.prep
          .then((path) => {
            press.path = path
            press.waiting = false
            press.tile.classList.remove('busy')
            if (pressed === press) startNativeDrag(press)
          })
          .catch(() => press.tile.classList.remove('busy'))
      }
      return
    }
    press.busy = true
    press.tries++
    call('startDrag', { path: press.path })
      .then((res) => {
        // macOS didn't take the drag but the button is still down: try again on the next move
        if (!res.started) {
          press.busy = false
          return
        }
        if (press.item) call('stockDragged', { item: press.item }).catch(() => {})
        // the drag session is over (the panel never sees its mouseup)
        if (pressed === press) pressed = null
        settleDrop(0)
      })
      .catch(() => {})
  }
  $('#scroll').addEventListener('dragstart', (e) => {
    if (dragTarget(e.target)) e.preventDefault()
  })
  const press = (target, e) => {
    const p = { x: e.clientX, y: e.clientY, tile: target.tile, path: target.path || null, busy: false, tries: 0, moved: false }
    if (target.stockId) {
      const item = stockItem(target.stockId)
      const state = S.tab === 'photo' ? S.photo : S.vector.search
      if (item) {
        p.item = item
        p.prep = call('prepareStockDrag', { item, query: item.query || state.lastQuery }).then((res) => res.path)
      }
    }
    return p
  }
  $('#scroll').addEventListener('mousedown', (e) => {
    // after a native drag the panel may never see that mouseup: reset here
    suppressClick = false
    const target = e.button === 0 && dragTarget(e.target)
    pressed = target ? press(target, e) : null
  })
  window.addEventListener('mousemove', (e) => {
    if (!(e.buttons & 1)) return
    // When the panel isn't focused the press itself may never reach it (and a
    // stale press from an earlier click may linger): the tile under the
    // cursor when the drag begins is the one being dragged.
    if (!pressed || (!pressed.moved && !pressed.tile.contains(e.target))) {
      const target = dragTarget(e.target)
      pressed = target ? press(target, e) : null
      return
    }
    if (!pressed.moved) {
      if (Math.abs(e.clientX - pressed.x) + Math.abs(e.clientY - pressed.y) < 3) return
      pressed.moved = true
      suppressClick = true
    }
    startNativeDrag(pressed)
  })
  window.addEventListener('mouseup', () => {
    pressed = null
    setTimeout(() => (suppressClick = false), 0)
  })
  $('#scroll').addEventListener('click', onResultsClick)
  // Stock CDNs answer 429 when a grid loads dozens of thumbnails at once:
  // retry a failed image a few times with growing pauses.
  $('#scroll').addEventListener(
    'error',
    (e) => {
      const img = e.target
      if (img.tagName !== 'IMG' || img.src.indexOf('http') !== 0) return
      const tries = Number(img.dataset.tries || 0)
      if (tries >= 3) return
      img.dataset.tries = String(tries + 1)
      const src = img.src.replace(/([?&])_retry=\d+/, '')
      setTimeout(() => {
        img.src = src + (src.indexOf('?') >= 0 ? '&' : '?') + '_retry=' + (tries + 1)
      }, 1200 * (tries + 1))
    },
    true
  )
}

function render() {
  closeMenu()
  renderHeader()
  renderResults()
  renderComposer()
}

function renderHeader() {
  const h = $('#header')
  if (S.inSettings) {
    h.innerHTML = `<button class="back" id="back">${ICONS.back}${esc(t('settings'))}</button>`
    $('#back').addEventListener('click', () => {
      S.inSettings = false
      render()
    })
    return
  }
  const tabs = [
    ['photo', t('tabPhoto')],
    ['gen', t('tabGen')],
    ['vector', t('tabVector')],
  ]
  const cols = S.settings.viewCols
  h.innerHTML = `
    ${tabs.map(([id, label]) => `<button class="tab ${S.tab === id ? 'active' : ''}" data-tab="${id}">${esc(label)}</button>`).join('')}
    <span class="spacer"></span>
    <button class="icon-btn" id="view-toggle" title="${esc(cols === 1 ? t('viewTwo') : t('viewOne'))}">${cols === 1 ? ICONS.cols1 : ICONS.cols2}</button>
    <button class="icon-btn ${S.historyOpen ? 'active' : ''}" id="history" title="${esc(t('history'))}">${ICONS.history}</button>
    <button class="icon-btn" id="gear" title="${esc(t('settings'))}">${ICONS.gear}</button>
  `
  h.querySelectorAll('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      const tab = b.dataset.tab
      // With history open: another tab opens that tab's history, the current
      // tab closes history. This makes hopping between histories quick.
      if (S.historyOpen) {
        if (tab === S.tab) {
          closeHistory()
          return
        }
        S.historyOpen = false // so render() doesn't flash the previous tab's history
        S.tab = tab
        render()
        openHistory()
        return
      }
      S.tab = tab
      render()
    })
  )
  $('#view-toggle').addEventListener('click', () => {
    S.settings.viewCols = S.settings.viewCols === 1 ? 2 : 1
    saveSettings()
    renderHeader()
    keepScrollPosition(renderResults)
  })
  $('#gear').addEventListener('click', () => openSettings(null))
  $('#history').addEventListener('click', () => (S.historyOpen ? closeHistory() : openHistory()))
}

// Re-layout without losing the place: the tile at the top of the view stays
// at the same spot (or the view stays at the bottom if it was there).
function keepScrollPosition(rerender) {
  const el = $('#scroll')
  const box = el.getBoundingClientRect()
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4
  let anchor = null
  let offset = 0
  for (const tile of el.querySelectorAll('.tile[data-id], .tile[data-rid]')) {
    const r = tile.getBoundingClientRect()
    if (r.bottom > box.top + 1) {
      anchor = tile.dataset.id ? `[data-id="${tile.dataset.id}"]` : `[data-rid="${tile.dataset.rid}"]`
      offset = r.top - box.top
      break
    }
  }
  rerender()
  if (atBottom) {
    el.scrollTop = el.scrollHeight
    return
  }
  const again = anchor && el.querySelector(anchor)
  if (again) el.scrollTop += again.getBoundingClientRect().top - box.top - offset
}

function openSettings(expand) {
  storageInfo = null
  S.inSettings = true
  S.expanded = expand
  render()
}

// Masonry: each item goes to the currently shortest column (leftmost on a
// tie), so N equal images split evenly. The chosen column is remembered on
// the item, so a placeholder that turns into a slightly different image
// doesn't jump to another column.
function masonry(items, tileFn, ratioOf, extraClass) {
  const n = S.settings.viewCols === 1 ? 1 : 2
  const cols = []
  for (let i = 0; i < n; i++) cols.push({ h: 0, html: [] })
  items.forEach((it) => {
    let idx = it._col && it._col[n] != null ? it._col[n] : -1
    if (idx < 0) {
      idx = 0
      for (let i = 1; i < n; i++) if (cols[i].h < cols[idx].h - 0.01) idx = i
      it._col = it._col || {}
      it._col[n] = idx
    }
    cols[idx].h += 1 / (ratioOf(it) || 1) + 0.03
    cols[idx].html.push(tileFn(it))
  })
  return `<div class="masonry ${extraClass || ''}">${cols.map((c) => `<div class="mcol">${c.html.join('')}</div>`).join('')}</div>`
}

function stockRatio(it) {
  return it.width && it.height ? it.width / it.height : 1
}

function genRatio(it) {
  return it.state === 'done' && it.width && it.height ? it.width / it.height : it.ratio || 1
}

// ---------- selection chips ----------

// "Replace" makes sense for a selected image (swap it) and a frame (fill it)
function canReplace() {
  return S.selection.kind === 'image' || S.selection.kind === 'frame'
}

// For a frame the button sets its fill, so it says so (like Sketch's own
// "Hold ⌘ to add as image fill" hint)
function replaceButton() {
  const fill = S.selection.kind === 'frame'
  return `<button class="replace ${canReplace() ? 'on' : ''}" data-replace title="${esc(t(fill ? 'fillTip' : 'replaceTip'))}">${esc(t(fill ? 'asFill' : 'replace'))}</button>`
}

function sizeText(s) {
  return s.width ? `${s.width}×${s.height}` : ''
}

// Chip that shows where the image will go (frame / shape / next to an image).
function targetChip() {
  const s = S.selection
  if (s.kind === 'frame' || s.kind === 'shape' || s.kind === 'image') {
    const icon = s.refThumb ? `<img src="${s.refThumb}">` : s.kind === 'frame' ? ICONS.frame : ICONS.shape
    const hint = { frame: t('targetHintFrame'), shape: t('targetHintShape'), image: t('targetHintImage') }[s.kind]
    return `<span class="chip target" title="${esc(hint)}">${icon}<span class="label">${esc(t('targetFrame', { name: s.name, size: sizeText(s) }))}</span></span>`
  }
  return ''
}

// Reference chip for generation: the selected image, removable.
function referenceChip(state, model) {
  const s = S.selection
  if (!s.hasImage) return targetChip()
  if (model && !model.ref) {
    return `<span class="chip target" title="${esc(t('refUnsupported'))}">${s.refThumb ? `<img src="${s.refThumb}">` : ICONS.shape}<span class="label">${esc(t('targetFrame', { name: s.name, size: sizeText(s) }))}</span></span>`
  }
  if (!state.useRef) {
    return `${targetChip()}<button class="chip add" data-ref="on">${ICONS.plus}${esc(t('addRef'))}</button>`
  }
  return `<span class="chip target" title="${esc(t('reference'))}">${s.refThumb ? `<img src="${s.refThumb}">` : ICONS.shape}<span class="label">${esc(s.name)}</span><span class="x" data-ref="off">${ICONS.x}</span></span>`
}

function bindRefChips(root, state) {
  root.querySelectorAll('[data-ref]').forEach((el) =>
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      state.useRef = el.dataset.ref === 'on'
      renderComposer()
    })
  )
}

window.onSelectionChanged = (selection) => {
  S.selection = selection || { kind: 'none' }
  if (S.inSettings) return
  renderComposerChrome()
  document.querySelectorAll('.tile .replace').forEach((b) => (b.outerHTML = replaceButton()))
}

// ---------- composer ----------

// Full render: also recreates the text field (used on tab switches).
function renderComposer() {
  const wrap = $('#composer-wrap')
  if (S.inSettings) {
    wrap.classList.add('hidden')
    return
  }
  wrap.classList.remove('hidden')
  const field = composerField()
  wrap.innerHTML = `
    <div class="composer">
      <div class="chips" id="chips"></div>
      ${field}
      <div class="toolbar" id="toolbar"></div>
    </div>`
  const input = $('#input')
  if (input) {
    const st = inputState()
    input.value = st.obj[st.key]
    input.addEventListener('input', () => (st.obj[st.key] = input.value))
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
    })
    if (input.tagName === 'TEXTAREA') autoGrow(input)
  }
  renderComposerChrome()
}

// Which state field the text input edits on the current tab.
function inputState() {
  if (S.tab === 'photo') return { obj: S.photo, key: 'query' }
  if (S.tab === 'gen') return { obj: S.gen, key: 'prompt' }
  if (S.vector.mode === 'search') return { obj: S.vector.search, key: 'query' }
  return { obj: S.vector, key: 'prompt' }
}

function composerField() {
  if (S.tab === 'photo') return `<textarea class="input" id="input" rows="2" placeholder="${esc(t('searchPh'))}" spellcheck="false"></textarea>`
  if (S.tab === 'gen') return `<textarea class="input" id="input" rows="2" spellcheck="false"></textarea>`
  if (S.vector.mode === 'search') return `<textarea class="input" id="input" rows="2" placeholder="${esc(t('vectorSearchPh'))}" spellcheck="false"></textarea>`
  if (S.vector.mode === 'generate') return `<textarea class="input" id="input" rows="2" spellcheck="false" placeholder="${esc(t('vectorPh'))}"></textarea>`
  return '<div class="composer-hint" id="hint"></div>'
}

// Chips + toolbar: re-rendered on selection change without touching the text field.
function renderComposerChrome() {
  const chips = $('#chips')
  const bar = $('#toolbar')
  if (!chips || !bar) return
  if (S.tab === 'photo') photoChrome(chips, bar)
  else if (S.tab === 'gen') genChrome(chips, bar)
  else vectorChrome(chips, bar)
}

function chipBtn(id, icon, label, opts = {}) {
  return `<button class="chip ${opts.cls || ''}" id="${id}" ${opts.menu ? 'data-menu' : ''} ${opts.disabled ? 'disabled' : ''} title="${esc(opts.title || '')}">${icon || ''}${label ? `<span class="label">${esc(label)}</span>` : ''}${opts.menu ? ICONS.chev : ''}</button>`
}

// ---------- photo tab ----------

function effectiveOrientation(state) {
  if (state.orientation !== 'auto') return state.orientation
  const s = S.selection
  if (s.kind !== 'frame' && s.kind !== 'shape' && s.kind !== 'image') return 'any'
  if (s.ratio > 1.15) return 'landscape'
  if (s.ratio < 0.87) return 'portrait'
  return 'square'
}

function orientationLabel(state) {
  const o = effectiveOrientation(state)
  const name = { any: t('orientAny'), landscape: t('landscape'), portrait: t('portrait'), square: t('square') }[o]
  // "Auto · vertical"; German nouns keep their capital letter
  const shown = S.lang === 'de' ? name : name.toLowerCase()
  return state.orientation === 'auto' && o !== 'any' ? `${t('orientAuto')} · ${shown}` : state.orientation === 'auto' ? t('orientAuto') : name
}

function enabledSources() {
  return Object.keys(S.stockProviders).filter((id) => S.settings.stock[id].enabled && S.settings.stock[id].key)
}

function photoChrome(chips, bar) {
  chips.innerHTML = targetChip()
  const n = enabledSources().length
  const srcLabel = n === 0 ? t('sourcesNone') : n === 1 ? S.stockProviders[enabledSources()[0]].name : t('sources', { n })
  bar.innerHTML = `
    ${chipBtn('orient', ORIENT_ICONS[effectiveOrientation(S.photo)], orientationLabel(S.photo), { menu: true })}
    ${chipBtn('sources', ICONS.stack, srcLabel, { menu: true })}
    <span class="spacer"></span>
    ${chipBtn('random', ICONS.dice, '', { cls: 'icon', title: t('random') })}
    ${chipBtn('go', ICONS.search, '', { cls: 'icon strong', title: t('search') })}
  `
  $('#orient').addEventListener('click', (e) => orientationMenu(e.currentTarget, S.photo, () => runSearch(S.photo, false, true)))
  $('#sources').addEventListener('click', (e) => sourcesMenu(e.currentTarget))
  $('#random').addEventListener('click', runRandom)
  $('#go').addEventListener('click', submit)
}

function orientationMenu(anchor, state, after) {
  const items = [
    { id: 'auto', name: t('orientAuto'), hint: t('orientAutoDesc') },
    { id: 'any', name: t('orientAny') },
    { id: 'landscape', name: t('landscape') },
    { id: 'portrait', name: t('portrait') },
    { id: 'square', name: t('square') },
  ].map((it) => Object.assign(it, { icon: ORIENT_ICONS[it.id], checked: state.orientation === it.id }))
  openMenu(anchor, items, (it) => {
    state.orientation = it.id
    renderComposerChrome()
    if (state.searched && after) after()
  })
}

function sourcesMenu(anchor) {
  const build = () => {
    const ids = Object.keys(S.stockProviders)
    const ready = ids.filter((id) => S.settings.stock[id].key)
    const missing = ids.filter((id) => !S.settings.stock[id].key)
    const items = ready.map((id) => ({ id, name: S.stockProviders[id].name, checked: S.settings.stock[id].enabled }))
    if (missing.length && ready.length) items.push({ sep: true })
    missing.forEach((id) =>
      items.push({ muted: t('addKeyFor', { name: S.stockProviders[id].name }), action: () => openSettings(id) })
    )
    return items
  }
  openMenu(
    anchor,
    build(),
    (it) => {
      S.settings.stock[it.id].enabled = !S.settings.stock[it.id].enabled
      saveSettings()
      renderComposerChrome()
      sourcesMenu($('#sources'))
    },
    { keepOpen: true }
  )
}

// ---------- generation tab ----------

function modelsFor(kind) {
  return S.models.filter((m) => m.kind === kind)
}

function currentModel(kind) {
  const state = kind === 'vector' ? S.vector : S.gen
  const list = modelsFor(kind).filter((m) => m.available)
  return list.find((m) => m.id === state.modelId) || list[0] || null
}

// Remaining balance per provider, filled in by the plugin (Pollinations only for now)
const balances = {}

function groupLabel(pid) {
  const name = S.providers[pid].name
  const b = balances[pid]
  return b && b.text ? name + ' · ' + b.text : name
}

function displayName(m) {
  return (m.names && (m.names[S.lang] || m.names.en)) || m.name
}

// For a mix: the models it will use, as names
function mixDesc(m) {
  return (m.members || [])
    .map((id) => S.models.find((x) => x.id === id))
    .filter(Boolean)
    .map((x) => x.name)
    .join(', ')
}

function refreshBalances() {
  call('balances')
    .then((res) => {
      Object.keys(res.balances || {}).forEach((pid) => {
        balances[pid] = res.balances[pid]
        const header = openMenuEl && openMenuEl.querySelector(`[data-group="${pid}"]`)
        if (header) header.textContent = groupLabel(pid)
      })
    })
    .catch(() => {})
}

function modelMenu(anchor, kind) {
  refreshBalances()
  const state = kind === 'vector' ? S.vector : S.gen
  const current = currentModel(kind)
  const items = []
  const missing = []
  const mixes = modelsFor(kind).filter((m) => m.mix && m.available)
  if (mixes.length) {
    items.push({ group: t('mixes') })
    mixes.forEach((m) =>
      items.push({ id: m.id, name: displayName(m), desc: mixDesc(m), meta: PRICE_LABEL[m.price], checked: current && current.id === m.id })
    )
  }
  ;(kind === 'vector' ? VECTOR_PROVIDERS : GEN_PROVIDERS).forEach((pid) => {
    const models = modelsFor(kind).filter((m) => m.provider === pid)
    if (!models.length) return
    if (!models[0].available) {
      missing.push(pid)
      return
    }
    items.push({ group: groupLabel(pid), groupId: pid })
    models.forEach((m) =>
      items.push({ id: m.id, name: m.name, desc: m.desc[S.lang] || m.desc.en, meta: PRICE_LABEL[m.price], checked: current && current.id === m.id })
    )
  })
  if (missing.length) {
    if (items.length) items.push({ sep: true })
    missing.forEach((pid) => items.push({ muted: t('addKeyFor', { name: S.providers[pid].name }), action: () => openSettings(pid) }))
  }
  openMenu(anchor, items, (it) => {
    state.modelId = it.id
    if (kind === 'vector') S.settings.vectorModel = it.id
    else S.settings.aiModel = it.id
    saveSettings()
    renderComposer()
  })
}

function ratioMenu(anchor, state) {
  const items = [{ id: 'auto', name: t('ratioAuto'), hint: t('ratioAutoDesc'), icon: ORIENT_ICONS.auto, checked: state.ratio === 'auto' }]
  RATIO_GROUPS.forEach(([label, ratios]) => {
    items.push({ group: t(label) })
    ratios.forEach((r) => items.push({ id: r, name: r, icon: ratioIcon(r), checked: state.ratio === r }))
  })
  openMenu(anchor, items, (it) => {
    state.ratio = it.id
    renderComposerChrome()
  })
}

function countMenu(anchor, state) {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ id: n, name: t('count', { n }), checked: state.count === n }))
  openMenu(
    anchor,
    items,
    (it) => {
      state.count = it.id
      renderComposerChrome()
    },
    { compact: true }
  )
}

function ratioLabel(state) {
  if (state.ratio !== 'auto') return state.ratio
  return t('ratioAuto')
}

function genChrome(chips, bar) {
  const model = currentModel('raster')
  chips.innerHTML = referenceChip(S.gen, model)
  bindRefChips(chips, S.gen)
  const input = $('#input')
  if (input) input.placeholder = S.selection.hasImage && S.gen.useRef && model && model.ref ? t('genPhRef') : t('genPh')
  bar.innerHTML = `
    ${chipBtn('model', '', model ? displayName(model) : t('noModels'), { menu: true })}
    ${chipBtn('ratio', S.gen.ratio === 'auto' ? ORIENT_ICONS.auto : ratioIcon(S.gen.ratio), ratioLabel(S.gen), { menu: true })}
    ${chipBtn('count', '', t('count', { n: S.gen.count }), { menu: true })}
    <span class="spacer"></span>
    ${chipBtn('go', ICONS.image, t('create'), { cls: 'strong', disabled: !model })}
  `
  $('#model').addEventListener('click', (e) => modelMenu(e.currentTarget, 'raster'))
  $('#ratio').addEventListener('click', (e) => ratioMenu(e.currentTarget, S.gen))
  $('#count').addEventListener('click', (e) => countMenu(e.currentTarget, S.gen))
  $('#go').addEventListener('click', submit)
}

// ---------- vector tab ----------

function modeMenu(anchor) {
  const items = [
    { id: 'search', name: t('modeSearch'), desc: t('modeSearchDesc') },
    { id: 'generate', name: t('modeGen'), desc: t('modeGenDesc') },
    { id: 'vectorize', name: t('modeVectorize'), desc: t('modeVectorizeDesc') },
  ].map((it) => Object.assign(it, { checked: S.vector.mode === it.id }))
  openMenu(anchor, items, (it) => {
    S.vector.mode = it.id
    S.historyOpen = false
    renderHeader()
    renderResults()
    renderComposer()
  })
}

function vectorizeMenu(anchor) {
  refreshBalances()
  const items = [{ group: groupLabel('quiver'), groupId: 'quiver' }].concat(S.vectorizeModels.map((m) => ({
    id: m.id,
    name: m.name,
    desc: m.desc[S.lang] || m.desc.en,
    meta: PRICE_LABEL[m.price],
    checked: S.vector.vectorizeModel === m.id,
  })))
  openMenu(anchor, items, (it) => {
    S.vector.vectorizeModel = it.id
    S.settings.vectorizeModel = it.id
    saveSettings()
    renderComposerChrome()
  })
}

function vectorChrome(chips, bar) {
  const v = S.vector
  const modeLabel = { search: t('modeSearch'), generate: t('modeGen'), vectorize: t('modeVectorize') }[v.mode]
  const mode = chipBtn('mode', ICONS.pen, modeLabel, { menu: true })

  if (v.mode === 'search') {
    chips.innerHTML = targetChip()
    bar.innerHTML = `${mode}<span class="spacer"></span>${chipBtn('go', ICONS.search, '', { cls: 'icon strong', title: t('search') })}`
  } else if (v.mode === 'generate') {
    const model = currentModel('vector')
    chips.innerHTML = referenceChip(v, model)
    bindRefChips(chips, v)
    bar.innerHTML = `
      ${mode}
      ${chipBtn('model', '', model ? displayName(model) : t('noModels'), { menu: true })}
      ${chipBtn('count', '', t('count', { n: v.count }), { menu: true })}
      <span class="spacer"></span>
      ${chipBtn('go', ICONS.svg, t('create'), { cls: 'strong', disabled: !model })}`
  } else {
    const hasImage = !!S.selection.hasImage
    const quiver = S.models.some((m) => m.provider === 'quiver' && m.available)
    chips.innerHTML = hasImage ? targetChip() : ''
    const hint = $('#hint')
    if (hint) {
      hint.innerHTML = !quiver
        ? `<span class="link" id="add-quiver">${esc(t('addKeyFor', { name: 'QuiverAI' }))}</span>`
        : hasImage
        ? ''
        : esc(t('selectImage'))
      hint.classList.toggle('hidden', quiver && hasImage)
      const add = $('#add-quiver')
      if (add) add.addEventListener('click', () => openSettings('quiver'))
    }
    const vm = S.vectorizeModels.find((m) => m.id === v.vectorizeModel) || S.vectorizeModels[0]
    bar.innerHTML = `
      ${mode}
      ${chipBtn('vmodel', '', vm.name, { menu: true })}
      <span class="spacer"></span>
      ${chipBtn('go', ICONS.svg, t('vectorize'), { cls: 'strong', disabled: !hasImage || !quiver })}`
  }

  $('#mode').addEventListener('click', (e) => modeMenu(e.currentTarget))
  const model = $('#model')
  if (model) model.addEventListener('click', (e) => modelMenu(e.currentTarget, 'vector'))
  const count = $('#count')
  if (count) count.addEventListener('click', (e) => countMenu(e.currentTarget, v))
  const vmodel = $('#vmodel')
  if (vmodel) vmodel.addEventListener('click', (e) => vectorizeMenu(e.currentTarget))
  $('#go').addEventListener('click', submit)
}

// ---------- history ----------

// Which kind of history the current tab shows
// One history per tab. The Vector tab mixes its searches, generations and
// vectorizations in a single timeline.
function historyKind() {
  return S.tab // 'photo' | 'gen' | 'vector'
}

async function openHistory() {
  closeMenu()
  S.historyOpen = true
  S.history = { kind: historyKind(), loading: true, batches: [], items: [], offset: 0, hasMore: false }
  renderHeader()
  renderResults()
  $('#scroll').scrollTop = 0
  await loadHistory()
}

function closeHistory() {
  S.historyOpen = false
  S.history = null
  renderHeader()
  renderResults()
}

async function loadHistory() {
  const h = S.history
  try {
    const firstLoad = h.offset === 0 && !h.batches.length
    // searches + favorites: Photo and Vector tabs, loaded once
    if ((h.kind === 'photo' || h.kind === 'vector') && firstLoad) {
      const [res, favs] = await Promise.all([call('searchHistory', { kind: h.kind }), call('favorites', { kind: h.kind })])
      h.items = res.items || []
      h.favs = favs.items || []
    }
    // generated batches: Generate and Vector tabs, paged
    if (h.kind === 'gen' || h.kind === 'vector') {
      const res = await call('history', { tab: h.kind, offset: h.offset })
      h.batches = h.batches.concat(res.batches || [])
      h.offset += (res.batches || []).length
      h.hasMore = res.hasMore
    }
  } catch (err) {
    h.error = humanError(err)
  }
  h.loading = false
  if (S.history === h) renderResults()
}

function formatDate(ms) {
  try {
    const locale = { ru: 'ru-RU', de: 'de-DE', es: 'es-ES' }[S.lang] || 'en-US'
    return new Date(ms).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return ''
  }
}

// Past queries, each with the photos hearted for it. Queries that only live
// in favorites (older than the 30 remembered searches) are added at the end.
function searchGroups(h) {
  const byQuery = {}
  const groups = []
  const add = (query, time) => {
    const key = query.trim().toLowerCase()
    if (!byQuery[key]) {
      byQuery[key] = { query, time, favs: [] }
      groups.push(byQuery[key])
    }
    return byQuery[key]
  }
  h.items.forEach((q) => add(q.query, q.time))
  ;(h.favs || []).forEach((f) => add(f.query || '—', f.favTime).favs.push(f))
  return groups
}

function searchGroupHtml(g, i) {
  return `
    <div class="h-group">
      <div class="h-row" data-q="${i}"><span class="h-query">${esc(g.query)}</span><span class="h-date">${g.favs.length ? `<span class="h-fav">${ICONS.heartSmall} ${g.favs.length}</span>` : ''}${esc(formatDate(g.time))}</span></div>
      ${g.favs.length ? masonry(g.favs, photoTile, stockRatio, 'h-favs') : ''}
    </div>`
}

function batchHtml(b) {
  return `
    <div class="batch">
      <div class="batch-title" title="${esc(b.title)}">${esc((b.title || '') + ' · ' + formatDate(b.created))}</div>
      ${masonry(b.items, genTile, genRatio)}
    </div>`
}

function renderHistory(el) {
  const h = S.history
  const head = `<div class="h-head">${esc(t('history'))}</div>`
  if (h.loading && !h.batches.length && !h.items.length) {
    el.innerHTML = head + '<div class="center"><div class="spinner"></div></div>'
    return
  }
  if (h.error) {
    el.innerHTML = head + `<div class="notice error">${esc(h.error)}</div>`
    return
  }

  // One timeline, newest first. While older batches aren't loaded yet, older
  // searches wait too, so the order stays right after "Show more".
  const groups = h.kind === 'gen' ? [] : searchGroups(h)
  const oldestBatch = h.batches.length ? h.batches[h.batches.length - 1].created : 0
  const entries = []
  groups.forEach((g, i) => {
    if (!h.hasMore || g.time >= oldestBatch) entries.push({ time: g.time, html: searchGroupHtml(g, i) })
  })
  h.batches.forEach((b) => entries.push({ time: b.created, html: batchHtml(b) }))
  entries.sort((a, b) => b.time - a.time)

  if (!entries.length) {
    const empty = h.kind === 'photo' ? t('searchHistoryEmpty') : t('historyEmpty')
    el.innerHTML = head + `<div class="empty">${esc(empty)}</div>`
    return
  }
  el.innerHTML =
    head +
    entries.map((e) => e.html).join('') +
    (h.hasMore ? `<div class="center"><button class="chip" id="history-more">${esc(t('showMore'))}</button></div>` : '')

  el.querySelectorAll('[data-q]').forEach((row) =>
    row.addEventListener('click', () => {
      const q = groups[Number(row.dataset.q)]
      if (h.kind === 'vector') S.vector.mode = 'search'
      const state = h.kind === 'photo' ? S.photo : S.vector.search
      state.query = q.query
      closeHistory()
      renderComposer()
      runSearch(state, false, true)
    })
  )
  const more = $('#history-more')
  if (more) more.addEventListener('click', () => {
    h.loading = true
    more.disabled = true
    loadHistory()
  })
}

// ---------- results ----------

function renderResults() {
  const el = $('#scroll')
  el.classList.toggle('flush', S.inSettings)
  if (S.inSettings) {
    renderSettings(el)
    return
  }
  if (S.historyOpen) {
    renderHistory(el)
    return
  }
  if (S.tab === 'photo') renderSearchResults(el, S.photo, t('photoEmpty'))
  else if (S.tab === 'gen') renderBatches(el, S.gen.batches, t('genEmpty'))
  else if (S.vector.mode === 'search') renderSearchResults(el, S.vector.search, t('vectorSearchEmpty'))
  else renderBatches(el, S.vector.batches, t('vectorEmpty'))
}

function noticeHtml(state) {
  const parts = []
  state.errors.forEach((e) => {
    const name = S.stockProviders[e.provider] ? S.stockProviders[e.provider].name + ': ' : ''
    if (e.code === 'NO_KEY') return
    parts.push(`<div class="notice error">${esc(name + humanError(e))}</div>`)
  })
  return parts.join('')
}

function photoTile(item) {
  const provider = S.stockProviders[item.provider] ? S.stockProviders[item.provider].name : item.provider
  const ratio = item.width && item.height ? `aspect-ratio:${item.width}/${item.height};` : ''
  const badge = item.vector ? `<span class="badge" title="${esc(item.vectorUrl ? '' : t('pngTip'))}">${item.vectorUrl ? 'SVG' : 'PNG'}</span>` : ''
  return `
    <div class="tile" data-id="${esc(item.id)}" style="${ratio}${item.color ? 'background:' + esc(item.color) : ''}">
      <img src="${esc(item.thumb)}" loading="lazy">
      <button class="fav ${S.favIds.has(item.id) ? 'on' : ''}" data-fav title="${esc(t('favorite'))}">${ICONS.heart}</button>
      ${badge}
      ${replaceButton()}
      <div class="meta">${item.author ? `<a data-url="${esc(item.authorUrl || item.pageUrl)}">${esc(item.author)}</a> · ` : ''}${esc(provider)}</div>
    </div>`
}

function renderSearchResults(el, state, emptyText) {
  const isVector = state === S.vector.search
  let notice = noticeHtml(state)
  if (isVector && !S.settings.stock.pixabay.key) {
    notice = `<div class="notice">${esc(t('needPixabay'))} <span class="link" data-settings="pixabay">${esc(t('addKey'))}</span></div>` + notice
  } else if (!isVector && !enabledSources().length) {
    notice = `<div class="notice">${esc(t('noSources'))} <span class="link" data-settings="">${esc(t('addKey'))}</span></div>` + notice
  }
  let body
  if (!state.searched && !state.loading) body = `<div class="empty">${nl2br(emptyText)}</div>`
  else if (state.loading && !state.items.length) body = '<div class="center"><div class="spinner"></div></div>'
  else if (!state.items.length) body = state.errors.length ? '' : `<div class="empty">${esc(t('nothingFound'))}</div>`
  else body = `${masonry(state.items, photoTile, stockRatio)}${state.loading ? '<div class="center"><div class="spinner"></div></div>' : ''}`
  el.innerHTML = notice + body
}

function genTile(item) {
  if (item.state === 'loading') {
    return `<div class="placeholder" style="aspect-ratio:${item.ratio || 1}"><div class="spinner"></div>${esc(item.modelName || t('generating'))}</div>`
  }
  if (item.state === 'error') {
    return `<div class="placeholder error" style="aspect-ratio:${item.ratio || 1}">${esc(item.error)}</div>`
  }
  return `
    <div class="tile ${item.kind === 'svg' ? 'svg' : ''}" data-rid="${esc(item.id)}">
      <img src="${item.thumb}" ${item.filePath ? `data-file="${esc(item.filePath)}"` : ''}>
      ${replaceButton()}
      <div class="meta">${esc(item.modelName || '')}${item.width ? ' · ' + item.width + '×' + item.height : ''}</div>
    </div>`
}

function renderBatches(el, batches, emptyText) {
  if (!batches.length) {
    el.innerHTML = `<div class="empty">${nl2br(emptyText)}</div>`
    return
  }
  // Oldest first: the newest batch sits right above the composer, like a chat
  el.innerHTML = batches
    .map(
      (b) => `
      <div class="batch">
        <div class="batch-title" title="${esc(b.title)}">${esc(b.title)}</div>
        ${masonry(b.items, genTile, genRatio)}
      </div>`
    )
    .join('')
}

function scrollToBottom() {
  const el = $('#scroll')
  el.scrollTop = el.scrollHeight
}

function findGenItem(rid) {
  for (const list of [S.gen.batches, S.vector.batches]) {
    for (const b of list) {
      const it = b.items.find((i) => i.id === rid)
      if (it) return it
    }
  }
  return null
}

// A stock item shown on screen: in search results or among history favorites
function stockItem(id) {
  if (S.historyOpen && S.history && S.history.favs) {
    const fav = S.history.favs.find((i) => i.id === id)
    if (fav) return fav
  }
  const state = S.tab === 'photo' ? S.photo : S.vector.search
  return state.items.find((i) => i.id === id)
}

async function toggleFav(tile, btn) {
  const item = stockItem(tile.dataset.id)
  if (!item) return
  const kind = S.tab === 'photo' ? 'photo' : 'vector'
  const state = S.tab === 'photo' ? S.photo : S.vector.search
  btn.disabled = true
  try {
    const res = await call('toggleFavorite', { item, kind, query: item.query || state.lastQuery })
    if (res.favorite) S.favIds.add(item.id)
    else S.favIds.delete(item.id)
    btn.classList.toggle('on', res.favorite)
    // in history an un-hearted photo disappears from its query group
    if (!res.favorite && S.historyOpen && S.history && S.history.favs) {
      S.history.favs = S.history.favs.filter((i) => i.id !== item.id)
      renderResults()
    }
  } catch (err) {
    console.error(err)
  } finally {
    btn.disabled = false
  }
}

// set while a native drag runs, so releasing the mouse doesn't count as a click
let suppressClick = false

async function onResultsClick(e) {
  if (suppressClick) return
  const settingsLink = e.target.closest('[data-settings]')
  if (settingsLink) {
    openSettings(settingsLink.dataset.settings || null)
    return
  }
  const link = e.target.closest('[data-url]')
  if (link) {
    e.stopPropagation()
    if (link.dataset.url) call('openUrl', link.dataset.url)
    return
  }
  const tile = e.target.closest('.tile')
  if (!tile || tile.classList.contains('busy')) return
  if (e.target.closest('[data-fav]')) {
    toggleFav(tile, e.target.closest('[data-fav]'))
    return
  }
  const mode = e.target.closest('[data-replace]') ? 'replace' : 'auto'
  tile.classList.add('busy')
  try {
    if (tile.dataset.rid) {
      await call('insertGenerated', { id: tile.dataset.rid, mode })
    } else {
      const item = stockItem(tile.dataset.id)
      const state = S.tab === 'photo' ? S.photo : S.vector.search
      await call('insertStock', item, mode, item.query || state.lastQuery)
    }
  } catch (err) {
    const state = S.tab === 'photo' ? S.photo : S.tab === 'vector' && S.vector.mode === 'search' ? S.vector.search : null
    if (state) {
      state.errors = [{ provider: '', message: err.message, status: err.status }]
      renderResults()
    } else {
      const item = findGenItem(tile.dataset.rid)
      if (item) {
        item.state = 'error'
        item.error = humanError(err)
        renderResults()
      }
    }
  } finally {
    tile.classList.remove('busy')
  }
}

// Infinite scroll for search results
function onResultsScroll() {
  if (S.inSettings) return
  const state = S.tab === 'photo' ? S.photo : S.tab === 'vector' && S.vector.mode === 'search' ? S.vector.search : null
  if (!state || !state.hasMore || state.loading) return
  const el = $('#scroll')
  if (el.scrollTop + el.clientHeight > el.scrollHeight - 300) runSearch(state, true, false)
}

// ---------- actions ----------

function submit() {
  closeMenu()
  if (S.historyOpen) closeHistory()
  if (S.tab === 'photo') runSearch(S.photo, false, true)
  else if (S.tab === 'gen') runGeneration(S.gen, currentModel('raster'))
  else if (S.vector.mode === 'search') runSearch(S.vector.search, false, true, true)
  else if (S.vector.mode === 'generate') runGeneration(S.vector, currentModel('vector'))
  else runVectorize()
}

async function runSearch(state, more, fresh, vector = state === S.vector.search) {
  const query = (fresh ? state.query : state.lastQuery).trim()
  if (!query) {
    const input = $('#input')
    if (input) input.focus()
    return
  }
  if (more) state.page += 1
  else {
    state.page = 1
    state.items = []
    state.lastQuery = query
    $('#scroll').scrollTop = 0
  }
  state.loading = true
  state.searched = true
  state.errors = []
  renderResults()
  try {
    const res = await call('search', { query, orientation: effectiveOrientation(state), page: state.page, vector })
    const seen = {}
    state.items.forEach((i) => (seen[i.id] = true))
    state.items = state.items.concat(res.items.filter((i) => !seen[i.id]))
    state.hasMore = res.hasMore
    state.errors = res.errors || []
  } catch (err) {
    state.errors = [{ provider: '', message: err.message, status: err.status }]
  }
  state.loading = false
  renderResults()
}

async function runRandom() {
  const state = S.photo
  const query = state.query.trim()
  if (!query) {
    $('#input').focus()
    return
  }
  const btn = $('#random')
  btn.disabled = true
  try {
    const res = await call('random', { query, orientation: effectiveOrientation(state), vector: false })
    state.errors = (res.errors || []).filter((e) => e.code !== 'NO_KEY')
    if (res.empty && !state.errors.length) state.errors = [{ provider: '', message: t('nothingFound') }]
  } catch (err) {
    state.errors = [{ provider: '', message: err.message, status: err.status }]
  }
  btn.disabled = false
  renderResults()
}

function ratioValue(r) {
  if (r === 'auto') return null
  const [a, b] = r.split(':').map(Number)
  return a / b
}

// Same pick as the plugin: with a reference only models that can use it
function mixMemberFor(model, index, hasRef) {
  if (!model.mix || !model.members || !model.members.length) return null
  let ids = model.members
  if (hasRef) {
    const withRef = ids.filter((id) => {
      const m = S.models.find((x) => x.id === id)
      return m && m.ref
    })
    if (withRef.length) ids = withRef
  }
  return S.models.find((x) => x.id === ids[index % ids.length]) || null
}

async function runGeneration(state, model) {
  if (!model) return
  const s = S.selection
  const useRef = s.hasImage && state.useRef && model.ref
  if (!state.prompt.trim() && !useRef) {
    const input = $('#input')
    input.focus()
    input.placeholder = t('emptyPrompt')
    return
  }
  let prep
  try {
    prep = await call('prepareGeneration', { useRef, ratio: ratioValue(state.ratio || 'auto') })
  } catch (err) {
    return
  }
  const ratio = model.sizes === 'square' ? 1 : prep.ratio
  const batch = {
    title: displayName(model) + ' · ' + (state.prompt.trim() || (prep.hasRef ? '↺ ' + s.name : '')),
    items: [],
  }
  for (let i = 0; i < state.count; i++) {
    const member = mixMemberFor(model, i, prep.hasRef)
    const modelName = member ? member.name : displayName(model)
    batch.items.push({ state: 'loading', ratio, modelName })
  }
  state.batches.push(batch)
  renderResults()
  scrollToBottom()

  batch.items.forEach((item, index) => {
    call('generateOne', { batchId: prep.batchId, modelId: model.id, prompt: state.prompt, index, tab: state === S.vector ? 'vector' : 'gen', title: batch.title })
      .then((res) => Object.assign(item, res, { state: 'done', ratio: res.width / res.height }))
      .catch((err) => Object.assign(item, { state: 'error', error: humanError(err) }))
      .then(() => {
        const el = $('#scroll')
        const atBottom = el.scrollTop + el.clientHeight > el.scrollHeight - 40
        renderResults()
        if (atBottom) scrollToBottom()
      })
  })
}

async function runVectorize() {
  const s = S.selection
  if (!s.hasImage) return
  const batch = {
    title: t('vectorizing', { name: s.name }),
    items: [{ state: 'loading', ratio: s.ratio, modelName: 'QuiverAI ' + S.vector.vectorizeModel }],
  }
  S.vector.batches.push(batch)
  renderResults()
  scrollToBottom()
  const item = batch.items[0]
  try {
    const res = await call('vectorize', { modelId: S.vector.vectorizeModel, title: batch.title })
    Object.assign(item, res, { state: 'done' })
  } catch (err) {
    Object.assign(item, { state: 'error', error: humanError(err) })
  }
  renderResults()
  scrollToBottom()
}

// ---------- settings ----------

const SETTINGS_ROWS = [
  { section: 'secPhoto' },
  { id: 'unsplash', stock: true, fields: [['key', 'apiKey']] },
  { id: 'pexels', stock: true, fields: [['key', 'apiKey']] },
  { id: 'pixabay', stock: true, fields: [['key', 'apiKey']] },
  { section: 'secGen' },
  { id: 'pollinations', fields: [['key', 'apiKey']] },
  { id: 'cloudflare', fields: [['token', 'apiToken'], ['accountId', 'accountId']] },
  { id: 'gemini', fields: [['key', 'apiKey']] },
  { section: 'secVector' },
  { id: 'quiver', fields: [['key', 'apiKey'], ['adminKey', 'adminKey', true]] },
  { section: 'secDefaults' },
  { id: 'genCount', count: 'genCount' },
  { id: 'vectorCount', count: 'vectorCount' },
  { section: 'secLanguage' },
  { language: true },
  { section: 'secHistory' },
  { store: 'searches' },
  { store: 'generations', folder: true },
  { store: 'favorites', folder: true },
]

// Which storage row waits for the second "clear" click
let clearArmed = null
let storageInfo = null

function plural(n, forms) {
  if (S.lang !== 'ru') return n + ' ' + (n === 1 ? forms[0] : forms[1])
  const m10 = n % 10
  const m100 = n % 100
  const f = m10 === 1 && m100 !== 11 ? forms[0] : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? forms[1] : forms[2]
  return n + ' ' + f
}

function storageCount(what) {
  if (!storageInfo) return '…'
  const n = storageInfo[what] || 0
  return plural(n, t('forms_' + what).split('|'))
}

function storageRowHtml(row) {
  const armed = clearArmed === row.store
  return `<div class="s-item"><div class="s-row s-store">
    <span class="name">${esc(t('store_' + row.store))}</span>
    <span class="s-right">
      <span class="status" data-store-count="${row.store}">${esc(storageCount(row.store))}</span>
      ${row.folder ? `<button class="s-icon" data-reveal="${row.store}" title="${esc(t('revealFolder'))}">${ICONS.folder}</button>` : ''}
      <button class="s-clear ${armed ? 'armed' : ''}" data-clear="${row.store}">${esc(armed ? t('clearConfirm') : t('clear'))}</button>
    </span>
  </div></div>`
}

function loadStorageInfo() {
  call('storageInfo')
    .then((res) => {
      storageInfo = res
      document.querySelectorAll('[data-store-count]').forEach((el) => (el.textContent = storageCount(el.dataset.storeCount)))
    })
    .catch(() => {})
}
// Per service: { draft: { field: value }, status: 'checking' | 'ok' | 'error', message }
const keyEdits = {}

function rowStore(row) {
  return row.stock ? S.settings.stock[row.id] : S.settings.ai[row.id]
}

function isConnected(row) {
  const store = rowStore(row)
  return row.fields.every(([key, , optional]) => optional || store[key])
}

function rowName(row) {
  return row.stock ? S.stockProviders[row.id].name : S.providers[row.id].name
}

function keyUrl(row) {
  return row.stock ? S.stockProviders[row.id].keyUrl : S.providers[row.id].keyUrl
}

function editState(row) {
  if (!keyEdits[row.id]) {
    const store = rowStore(row)
    const draft = {}
    row.fields.forEach(([key]) => (draft[key] = store[key] || ''))
    keyEdits[row.id] = { draft }
  }
  return keyEdits[row.id]
}

function isDirty(row) {
  const e = keyEdits[row.id]
  if (!e) return false
  const store = rowStore(row)
  return row.fields.some(([key]) => (e.draft[key] || '') !== (store[key] || ''))
}

function hasSavedKey(row) {
  const store = rowStore(row)
  return row.fields.some(([key]) => store[key])
}

function maskKey(v) {
  if (!v) return ''
  return v.length > 10 ? v.slice(0, 4) + '••••••' + v.slice(-4) : '••••••'
}

function serviceRowHtml(row) {
  const open = S.expanded === row.id
  const connected = isConnected(row)
  const status = `<span class="status ${connected ? '' : 'add'}">${esc(connected ? t('connected') : t('addKey'))}</span>`
  const head = `<div class="s-row" data-row="${row.id}"><span class="name">${esc(rowName(row))}</span><span class="s-right">${status}<span class="s-chev">${ICONS.chevRight}</span></span></div>`

  // Every row keeps its fields in the DOM, collapsed: opening is a CSS
  // height transition instead of a re-render, so the rows below slide.
  const e = editState(row)
  // A saved key is shown masked and read-only until the pencil is clicked,
  // so it can't be erased by accident. Rows without keys are editable at once.
  const locked = hasSavedKey(row) && !e.editing
  const fields = row.fields
    .map(([key, label], i) => {
      if (locked) {
        const saved = rowStore(row)[key] || ''
        return `<div class="s-field"><input class="s-input" readonly tabindex="-1" placeholder="${esc(t(label))}" value="${esc(maskKey(saved))}">${
          i === 0 ? `<button class="s-edit" data-edit="${row.id}" title="${esc(t('editKey'))}">${ICONS.pencil}</button>` : ''
        }</div>`
      }
      return `<div class="s-field"><input class="s-input" data-field="${row.id}.${key}" placeholder="${esc(t(label))}" value="${esc(e.draft[key])}" spellcheck="false" autocomplete="off"></div>`
    })
    .join('')
  let result = ''
  if (e.status === 'checking') result = `<span class="s-result">${esc(t('keyChecking'))}</span>`
  else if (e.status === 'ok') result = `<span class="s-result ok">${ICONS.check} ${esc(t('keyOk'))}</span>`
  else if (e.status === 'error') result = `<span class="s-result error">${esc(e.message)}</span>`
  return `
    <div class="s-item ${open ? 'open' : ''}" data-item="${row.id}">
      ${head}
      <div class="s-collapse"><div class="s-collapse-inner" ${open ? '' : 'inert'}><div class="s-details">
        ${fields}
        <div class="s-actions">
          ${locked ? '' : `<button class="chip strong" data-save="${row.id}" ${isDirty(row) ? '' : 'disabled'}>${esc(t('save'))}</button>`}
          ${result}
          <span class="spacer"></span>
          <span class="link" data-url="${esc(keyUrl(row))}">${esc(t('getKey'))}</span>
        </div>
        <ul class="s-hints">${(HINTS[S.lang][row.id] || HINTS.en[row.id] || []).map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      </div></div></div>
    </div>`
}

function renderSettings(el) {
  el.innerHTML = SETTINGS_ROWS.map((row) => {
    if (row.section) return `<div class="s-section">${esc(t(row.section))}</div>`
    if (row.count) {
      return `<div class="s-item"><div class="s-row" data-count="${row.count}"><span class="name">${esc(t(row.count))}</span><span class="s-right"><span class="status">${S.settings[row.count]}</span><span class="s-chev">${ICONS.chev}</span></span></div></div>`
    }
    if (row.store) return storageRowHtml(row)
    if (row.language) {
      return `<div class="s-item"><div class="s-row" data-language><span class="name">${esc(languageLabel(S.settings.language))}</span><span class="s-right"><span class="s-chev">${ICONS.chev}</span></span></div></div>`
    }
    return serviceRowHtml(row)
  }).join('')

  el.querySelectorAll('[data-row]').forEach((r) =>
    r.addEventListener('click', () => {
      const id = r.dataset.row
      // collapsing keeps what was typed, it is only saved with the button / Enter;
      // an unchanged key that was opened for editing gets locked again
      const closing = S.expanded
      S.expanded = S.expanded === id ? null : id
      if (closing && closing !== S.expanded) {
        const closedRow = SETTINGS_ROWS.find((x) => x.id === closing)
        const ce = keyEdits[closing]
        if (closedRow && ce && ce.editing && !isDirty(closedRow)) {
          ce.editing = false
          setTimeout(() => {
            if (S.inSettings && S.expanded !== closing) renderSettings($('#scroll'))
          }, 240)
        }
      }
      el.querySelectorAll('[data-item]').forEach((item) => {
        const open = item.dataset.item === S.expanded
        item.classList.toggle('open', open)
        item.querySelector('.s-collapse-inner').inert = !open
      })
      const row = SETTINGS_ROWS.find((x) => x.id === id)
      if (S.expanded === id && !hasSavedKey(row)) {
        const first = el.querySelector(`[data-item="${id}"] .s-input`)
        // focus after the opening transition, otherwise the view jumps to it
        setTimeout(() => first && first.focus({ preventScroll: true }), 230)
      }
    })
  )
  el.querySelectorAll('[data-count]').forEach((r) => r.addEventListener('click', () => countMenuSettings(r, r.dataset.count)))
  el.querySelectorAll('[data-language]').forEach((r) => r.addEventListener('click', () => languageMenu(r)))
  el.querySelectorAll('[data-reveal]').forEach((b) => b.addEventListener('click', () => call('revealStorage', { what: b.dataset.reveal })))
  el.querySelectorAll('[data-clear]').forEach((b) =>
    b.addEventListener('click', async () => {
      const what = b.dataset.clear
      // two clicks: the first one asks for confirmation
      if (clearArmed !== what) {
        clearArmed = what
        renderSettings(el)
        setTimeout(() => {
          if (clearArmed !== what) return
          clearArmed = null
          if (S.inSettings) renderSettings($('#scroll'))
        }, 4000)
        return
      }
      clearArmed = null
      await call('clearStorage', { what })
      if (what === 'favorites') S.favIds = new Set()
      if (storageInfo) storageInfo[what] = 0
      renderSettings($('#scroll'))
    })
  )
  if (!storageInfo) loadStorageInfo()
  el.querySelectorAll('[data-url]').forEach((a) => a.addEventListener('click', () => call('openUrl', a.dataset.url)))
  el.querySelectorAll('[data-field]').forEach((input) => {
    const [id, key] = input.dataset.field.split('.')
    const row = SETTINGS_ROWS.find((r) => r.id === id)
    input.addEventListener('input', () => {
      const e = editState(row)
      e.draft[key] = input.value.trim()
      e.status = null
      const btn = el.querySelector(`[data-save="${id}"]`)
      if (btn) btn.disabled = !isDirty(row)
      const res = el.querySelector('.s-item.open .s-result')
      if (res) res.remove()
    })
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') saveKey(row)
    })
  })
  el.querySelectorAll('[data-edit]').forEach((b) =>
    b.addEventListener('click', () => {
      const row = SETTINGS_ROWS.find((r) => r.id === b.dataset.edit)
      const e = editState(row)
      e.editing = true
      e.status = null
      renderSettings(el)
      const first = el.querySelector(`[data-item="${row.id}"] .s-input`)
      if (first) {
        first.focus({ preventScroll: true })
        first.setSelectionRange(first.value.length, first.value.length)
      }
    })
  )
  el.querySelectorAll('[data-save]').forEach((b) =>
    b.addEventListener('click', () => saveKey(SETTINGS_ROWS.find((r) => r.id === b.dataset.save)))
  )
}

// Save the typed key, then check it with one free request to the service.
async function saveKey(row) {
  const e = editState(row)
  const store = rowStore(row)
  row.fields.forEach(([key]) => (store[key] = e.draft[key] || ''))
  e.editing = false
  await saveSettings()
  const el = $('#scroll')
  if (!isConnected(row)) {
    e.status = null
    renderSettings(el)
    return
  }
  e.status = 'checking'
  renderSettings(el)
  try {
    await call('checkKey', { id: row.id })
    e.status = 'ok'
  } catch (err) {
    e.status = 'error'
    e.message = humanError(err)
  }
  if (S.inSettings) renderSettings($('#scroll'))
}

// Language names are shown in their own language, like in macOS
const LANGUAGES = [
  ['en', 'English'],
  ['de', 'Deutsch'],
  ['es', 'Español'],
  ['ru', 'Русский'],
]

function languageLabel(id) {
  const found = LANGUAGES.find((l) => l[0] === id)
  return found ? found[1] : t('langAuto')
}

function languageMenu(row) {
  const current = S.settings.language || 'auto'
  const items = [{ id: 'auto', name: t('langAuto'), checked: current === 'auto' }, { sep: true }].concat(
    LANGUAGES.map(([id, name]) => ({ id, name, checked: current === id }))
  )
  openMenu(row.querySelector('.name'), items, async (it) => {
    S.settings.language = it.id
    await saveSettings()
    // the plugin resolved the new language: redraw everything in it
    document.documentElement.lang = S.lang
    render()
  })
  const menu = openMenuEl
  const r = row.getBoundingClientRect()
  menu.style.top = r.bottom + 4 + 'px'
  menu.style.left = r.left + 'px'
  menu.style.maxHeight = window.innerHeight - r.bottom - 16 + 'px'
}

// Settings menu opens below the row (it is not at the bottom of the window).
function countMenuSettings(row, key) {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ id: n, name: String(n), checked: S.settings[key] === n }))
  openMenu(
    row.querySelector('.status'),
    items,
    (it) => {
      S.settings[key] = it.id
      if (key === 'genCount') S.gen.count = it.id
      else S.vector.count = it.id
      saveSettings()
      renderSettings($('#scroll'))
    },
    { compact: true }
  )
  const menu = openMenuEl
  const r = row.getBoundingClientRect()
  menu.style.top = r.bottom + 4 + 'px'
  menu.style.left = r.right - menu.offsetWidth - 12 + 'px'
  menu.style.maxHeight = window.innerHeight - r.bottom - 16 + 'px'
}

let saveTimer
function saveSettingsSoon() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(saveSettings, 400)
}

async function saveSettings() {
  clearTimeout(saveTimer)
  try {
    const res = await call('saveSettings', S.settings)
    applyState(res, true)
  } catch (err) {
    console.error(err)
  }
}

// ---------- boot ----------

function applyState(state, keepSettings) {
  S.lang = state.lang
  if (!keepSettings) S.settings = state.settings
  S.models = state.models
  S.vectorizeModels = state.vectorizeModels || []
  S.providers = state.providers
  S.stockProviders = state.stockProviders
  S.selection = state.selection || { kind: 'none' }
  if (state.favoriteIds) S.favIds = new Set(state.favoriteIds)
}

// Disable the default context menu (Reload, etc.) outside text fields
document.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('input, textarea')) e.preventDefault()
})

call('getState')
  .then((state) => {
    applyState(state)
    document.documentElement.lang = S.lang
    S.gen.count = S.settings.genCount
    S.vector.count = S.settings.vectorCount
    S.gen.modelId = S.settings.aiModel
    S.vector.modelId = S.settings.vectorModel
    S.vector.vectorizeModel = S.settings.vectorizeModel
    renderShell()
    const hasStock = Object.keys(S.settings.stock).some((id) => S.settings.stock[id].key)
    const hasAi = S.models.some((m) => m.available)
    S.inSettings = !hasStock && !hasAi
    render()
    const input = $('#input')
    if (input) input.focus()
  })
  .catch((err) => {
    app.innerHTML = `<div class="empty">${esc(String(err && err.message))}</div>`
  })
