import { caseIdFromPath } from "./caseStudyRoutes";

export const caseStudyCopy = {
  ru: {
    back: "← Все работы", caseLabel: "// разбор проекта", year: "Год", type: "Формат", stack: "Стек и инструменты",
    overview: "Продукт и задача", challenge: "Что нужно было решить", problems: "Ключевые задачи",
    decisions: "Инженерные решения", role: "Моя роль", outcome: "Результат", constraint: "Ограничение",
    decision: "Решение", effect: "Что это даёт", read: "К устройству проекта ↓", open: "Открыть проект",
    play: "Запустить игру", external: "Откроется в новой вкладке", embedded: "Игра откроется внутри портфолио",
    closeGame: "Закрыть игру", notFound: "Этот кейс пока не опубликован.", notFoundTitle: "Кейс не найден",
    concept: "Самостоятельный концепт", live: "Рабочий продукт", toolsNote: "Технологии этого проекта",
  },
  en: {
    back: "← All work", caseLabel: "// case study", year: "Year", type: "Format", stack: "Stack & tools",
    overview: "Product & purpose", challenge: "The challenge", problems: "Key problems",
    decisions: "Engineering decisions", role: "My role", outcome: "The result", constraint: "Constraint",
    decision: "Decision", effect: "Practical effect", read: "Explore the engineering ↓", open: "Open project",
    play: "Play the game", external: "Opens in a new tab", embedded: "The game opens inside this portfolio",
    closeGame: "Close game", notFound: "This case has not been published yet.", notFoundTitle: "Case not found",
    concept: "Independent concept", live: "Working product", toolsNote: "Technologies used in this project",
  },
};

// Destinations, titles and existing summaries stay in copy.works.cases.
// Optional story fields are omitted when there is no verified project information.
export const caseStories = {
  hochetsa: {
    stack: ["React", "TypeScript", "Vite", "Telegram Mini Apps API", "Cloudflare Workers", "Cloudflare D1", "dnd kit", "Vitest"],
    ru: {
      overview: ["Вишлист внутри Telegram: сохранить желание, поделиться списком с близкими и забронировать подарок. Вместо переписки со ссылками — одна доска, которую можно обновлять с разных устройств."],
      challenge: ["Соединить личный список и совместный выбор подарков: владелец управляет желаниями и доступом к доске, а близкие должны понимать, какой подарок ещё свободен."],
      keyProblems: [
        { title: "Доступ к доскам", text: "Публичный, скрытый по ссылке и приватный режимы поддерживают разные сценарии: от открытого списка до личных желаний." },
        { title: "Бронирование подарков", text: "Желание можно забронировать. Защита от двойной брони помогает избежать ситуации, когда один подарок одновременно выбирают несколько человек." },
        { title: "Мобильный сценарий", text: "Добавление желания разделено на три шага. Скриншоты товаров и аватары сжимаются при загрузке, порядок карточек меняется перетаскиванием." },
      ],
      decisions: [
        { constraint: "Приложение работает внутри Telegram webview и используется с разных устройств.", decision: "Telegram-авторизация и сессии связаны с аккаунтом; данные обслуживает API на Cloudflare Workers с базой D1.", effect: "Список принадлежит пользователю, а не одному экземпляру браузера. Желания доступны при смене устройства." },
      ],
      outcome: ["Рабочий сценарий от сохранения желания до бронирования подарка. Проект показывает связку мобильного интерфейса, серверного хранения, авторизации и совместного доступа к данным."],
    },
    en: {
      overview: ["A wishlist inside Telegram: save a wish, share the list with people close to you, and reserve a gift. One board replaces scattered links in chats and can be updated across devices."],
      challenge: ["Connect a personal list with shared gift planning: the owner manages wishes and board access, while friends need to know which gifts are still available."],
      keyProblems: [
        { title: "Board access", text: "Public, unlisted and private boards support different situations, from a shared gift list to personal wishes." },
        { title: "Gift reservations", text: "A wish can be reserved. Double-booking protection helps prevent several people from choosing the same gift at the same time." },
        { title: "Mobile interaction", text: "Adding a wish takes three steps. Product screenshots and avatars are compressed on upload; cards can be reordered by dragging." },
      ],
      decisions: [
        { constraint: "The app runs in a Telegram webview and is used across devices.", decision: "Telegram authentication and sessions identify the account; a Cloudflare Workers API serves data stored in D1.", effect: "The list belongs to the user rather than a single browser instance. Wishes remain available when switching devices." },
      ],
      outcome: ["A working flow from saving a wish to reserving a gift. The project connects a mobile interface, server-side storage, authentication and shared access to data."],
    },
  },
  rec: {
    stack: ["React", "TypeScript", "WXT", "MediaRecorder", "Canvas 2D", "IndexedDB", "OPFS", "Mediabunny", "Vitest"],
    ru: {
      overview: ["Расширение Chrome для записи экрана, вебкамеры, голоса и звука вкладки. Встроенный редактор позволяет подготовить запись к использованию, а материалы хранятся локально в браузере."],
      challenge: ["Запись — это несколько асинхронных источников, разрешения браузера и большой объём медиа. Нужно согласовать захват, хранение, предпросмотр и экспорт в одном рабочем сценарии."],
      keyProblems: [
        { title: "Источники и разрешения", text: "Захват экрана и вкладки использует браузерные media API и chrome.tabCapture. Запись камеры и работа со звуком требуют управления отдельными потоками и их состояниями." },
        { title: "Локальные черновики", text: "Запись сохраняется частями. Хранилище учитывает этапы финализации, прерванные черновики и восстановление доступных материалов." },
        { title: "Предпросмотр и экспорт", text: "Экран, камера и визуальные правки должны собираться в одну композицию и одинаково интерпретироваться редактором и экспортом." },
      ],
      decisions: [
        { constraint: "Медиафайлы объёмнее состояния редактора и должны оставаться локальными.", decision: "IndexedDB хранит записи и документы проекта; OPFS используется для файлов и частей записи. Блокировки операций координируют работу с черновиками.", effect: "Состояние проекта и медиаданные имеют отдельные механизмы хранения; предусмотрена обработка незавершённых операций." },
        { constraint: "Отдельные реализации композиции могли бы дать разный результат в редакторе и готовом файле.", decision: "Предпросмотр и WebM-экспорт используют общий renderCompositionFrame и одну модель состояния кадра.", effect: "Положение камеры и визуальные правки рассчитываются по общим правилам на обоих этапах." },
      ],
      outcome: ["Запись, редактор и экспорт объединены в расширении. Проект демонстрирует работу с ограничениями браузера, локальным хранением медиа и согласованным рендерингом видеокомпозиции."],
    },
    en: {
      overview: ["A Chrome extension for recording the screen, webcam, voice and tab audio. A built-in editor prepares the recording for use, while the media stays in local browser storage."],
      challenge: ["Recording involves asynchronous sources, browser permissions and large media files. Capture, storage, preview and export need to work together as one flow."],
      keyProblems: [
        { title: "Sources & permissions", text: "Screen and tab capture use browser media APIs and chrome.tabCapture. Camera recording and audio require managing separate streams and their states." },
        { title: "Local drafts", text: "Recordings are saved in chunks. Storage accounts for finalization, interrupted drafts and recovery of available media." },
        { title: "Preview & export", text: "Screen, camera and visual edits must form one composition, interpreted consistently by both the editor and the exporter." },
      ],
      decisions: [
        { constraint: "Media files are larger than editor state and need to remain local.", decision: "IndexedDB stores draft records and project documents; OPFS holds recording files and chunks. Operation locks coordinate draft access.", effect: "Project state and media have separate storage mechanisms, with handling for unfinished operations." },
        { constraint: "Separate composition implementations could make the preview differ from the final file.", decision: "Preview and WebM export share renderCompositionFrame and the same frame-state model.", effect: "Camera placement and visual edits follow the same rules in both stages." },
      ],
      outcome: ["Recording, editing and export are connected inside an extension. The project demonstrates browser API integration, local media storage and consistent video composition rendering."],
    },
  },
  cache: {
    concept: true,
    stack: ["TypeScript", "Phaser 3.90", "Vite", "Vitest", "HTML", "CSS", "Vercel"],
    ru: {
      overview: ["Пиксельная браузерная мини-игра: курьер доставляет крем по городской дороге, перестраиваясь между тремя полосами и избегая автомобилей.", "Самостоятельный концепт для портфолио. Проект не является официальной рекламной кампанией или заказом BeautyBomb."],
      challenge: ["Собрать короткий завершённый игровой сценарий — инструкция, доставка, победа или повторная попытка — с управлением, понятным на телефоне и компьютере."],
      keyProblems: [
        { title: "Два способа управления", text: "Клавиатура на desktop и экранные кнопки на мобильных управляют одним сценарием движения между полосами." },
        { title: "Цельный игровой цикл", text: "Препятствия, жизни и прогресс доставки связаны с паузой, повторной попыткой и финальной сценой с демонстрационным купоном." },
        { title: "Встраивание в портфолио", text: "Игра открывается в iframe. Встраивание передаёт состояние активности и позволяет игре запросить закрытие окна." },
      ],
      decisions: [
        { constraint: "Игровая сцена должна помещаться на экранах разных пропорций.", decision: "Phaser Scale.FIT и центрирование масштабируют игровую сцену под доступную область.", effect: "Внутренние координаты игры сохраняются при изменении размера окна." },
        { constraint: "Внешний iframe и портфолио имеют независимые жизненные циклы.", decision: "Мост postMessage связывает активность игры и закрытие окна; портфолио проверяет origin и источник сообщений.", effect: "Встроенная игра согласованно открывается и закрывается, а взаимодействие ограничено ожидаемым источником." },
      ],
      outcome: ["Завершённая интерактивная демонстрация с адаптивным управлением и финальной сценой. Кейс показывает разработку игрового сценария и его интеграцию в обычный веб-интерфейс."],
    },
    en: {
      overview: ["A pixel-art browser mini-game: a courier delivers a cream through city traffic, switching between three lanes and avoiding cars.", "An independent portfolio concept. This is not an official BeautyBomb campaign or a commissioned project."],
      challenge: ["Build a complete short game flow—instructions, delivery, victory or retry—with controls that work on both a phone and a computer."],
      keyProblems: [
        { title: "Two input methods", text: "Desktop keyboard input and mobile on-screen buttons control the same lane-switching mechanic." },
        { title: "A complete game loop", text: "Obstacles, lives and delivery progress connect to pause, retry and a final delivery scene with a demo coupon." },
        { title: "Portfolio integration", text: "The game opens in an iframe. An embed bridge communicates activity and lets the game request closing the window." },
      ],
      decisions: [
        { constraint: "The scene needs to fit screens with different aspect ratios.", decision: "Phaser Scale.FIT and centering scale the game to the available area.", effect: "Internal game coordinates remain consistent as the window changes size." },
        { constraint: "The external iframe and portfolio have separate lifecycles.", decision: "A postMessage bridge connects game activity and closing; the portfolio validates the origin and message source.", effect: "The embedded game opens and closes coherently, with communication restricted to the expected source." },
      ],
      outcome: ["A complete interactive demonstration with responsive controls and a final scene. The case shows game-flow implementation and its integration into a regular web interface."],
    },
  },
  planer: {
    stack: ["React", "TypeScript", "CSS", "Vercel"],
    ru: {
      overview: ["Недельный планер для задач, сна, настроения, энергии, привычек, календаря и личной статистики. Он собирает повседневное планирование в одном интерфейсе."],
      outcome: ["Рабочий планер с созданием задач и отметкой выполненных дел. Проект демонстрирует организацию повседневных сценариев в адаптивном веб-интерфейсе."],
    },
    en: {
      overview: ["A weekly planner for tasks, sleep, mood, energy, habits, calendar and personal statistics. It brings everyday planning into one interface."],
      outcome: ["A working planner with task creation and completion tracking. The project demonstrates the organization of everyday routines in a responsive web interface."],
    },
  },
};

export function getCaseStudy(path, copy, language) {
  const id = caseIdFromPath(path);
  const story = caseStories[id];
  const project = copy.works.cases.find((item) => item.id === id);
  if (!story || !project) return null;
  return {
    ...project, ...story[language], stack: story.stack, concept: story.concept,
    index: copy.works.cases.indexOf(project) + 1,
    year: project.type.match(/\b\d{4}\b/)?.[0],
    category: project.type.replace(/\s*\/\s*\d{4}$/, ""),
  };
}
