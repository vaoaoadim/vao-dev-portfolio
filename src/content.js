export const sectionOrder = ["work", "about", "services", "contact"];

export const copy = {
  en: {
    meta: {
      title: "v.build | Developer portfolio",
      description:
        "Developer portfolio by Vadim Bednov: websites, web applications, bots, integrations, and automation.",
    },
    header: {
      brandLabel: "v.build — back to the top",
      contact: "text me",
      openMenu: "Open menu",
      close: "Close",
      more: "more",
      closeLabel: "close",
      languageGroup: "Choose site language",
      chooseRussian: "Switch site language to Russian",
      chooseEnglish: "Switch site language to English",
    },
    hero: {
      firstLine: "HELLO, THIS IS",
      thirdLine: "MY DEVELOPMENT",
      fourthLine: "PORTFOLIO",
      statusLabel: "Portfolio status",
      status: "// portfolio",
      scroll: "scroll down ↓",
      mediaTitles: [
        "CRT monitor",
        "Palette and brushes",
        "Retro controller",
        "Push pins",
        "Iridescent compact disc",
      ],
    },
    menu: {
      label: "Main navigation",
      goTo: "Go to the {label} section",
      open: "Open the {label} section",
      items: {
        work: "WORK",
        services: "SERVICES",
        about: "ABOUT",
        stack: "STACK",
      },
      auxiliary: {
        privacy: "PRIVACY POLICY",
        offer: "PUBLIC OFFER",
        contacts: "CONTACTS",
      },
    },
    build: {
      sectionLabel: "Section 01",
      kicker: "// services",
      titleFirst: "WHAT I",
      titleSecond: "BUILD",
      subtitle: "From idea to a working product.",
      items: [
        {
          title: "MINI APPS & GAMES",
          description:
            "Business gamification and marketing games that increase sales.",
        },
        {
          title: "TELEGRAM BOTS",
          description:
            "Bots for services, communication, and workflows — with clear scenarios and no unnecessary complexity.",
        },
        {
          title: "PLUGINS & SCRIPTS",
          description:
            "Lightweight software and automations that remove repetitive work from the team.",
        },
        {
          title: "WEBSITES",
          description:
            "Websites and promotional pages with expressive presentation, clear structure, and careful implementation.",
        },
        {
          title: "EMAIL AUTOMATION",
          description:
            "Automated email sequences, notifications, and integrations for recurring workflows.",
        },
        {
          title: "BROWSER EXTENSIONS",
          description:
            "Browser extensions and desktop tools that add the right workflow directly to the working environment.",
        },
        {
          title: "AI INTEGRATIONS",
          description:
            "AI integrations and process automation to keep up with the times and save your energy for something great! )",
        },
      ],
      interaction: {
        closeBoard: "Close enlarged whiteboard",
        drawingArea: "Whiteboard drawing area",
        takeMarker: "Pick up the marker and draw on the whiteboard",
        createBall: "Create a paper ball",
        unavailableBall: "Paper ball unavailable: WebGL is not supported",
        grabBall: "Grab the paper ball",
        draw: "draw",
        throw: "throw",
        clear: "clear",
      },
    },
    works: {
      kicker: "// my work",
      titleFirst: "SELECTED",
      titleSecond: { before: "W", focus: "O", after: "RK" },
      galleryLabel: "Selected work",
      casePrefix: "CASE",
      swipe: "swipe →",
      previewTitle: "PROJECT SCREENSHOT",
      previewNote: "COMING SOON",
      openCase: "[ open case ↗ ]",
      openProject: "[ open project ↗ ]",
      openProjectAria: "Open {title} in a new tab",
      previewSoon: "{title}: case preview coming soon",
      playGame: "Open and play {title}",
      cases: [
        {
          id: "hochetsa",
          title: "ХОЧЕЦА",
          cover: "hochetsa",
          coverAlt:
            "Хочеца Telegram bot cover with a blue gift-box mascot and a flowing gift ribbon",
          href: "https://t.me/hochesa_bot",
          type: "TELEGRAM APP / 2026",
          description:
            "A Telegram mini app with wishlists for you and your loved ones.",
          color: "green",
        },
        {
          id: "reserved-02",
          color: "yellow",
          empty: true,
        },
        {
          id: "cache",
          title: "BEAUTYBOMB DELIVERY",
          cover: "beautybomb",
          interaction: "embedded-game",
          coverAlt:
            "BeautyBomb Delivery game cover with a courier van carrying a cosmetic product through a colorful city",
          type: "INTERACTIVE PROMO MINI-GAME / 2026",
          description:
            "An independent portfolio concept for a BeautyBomb browser game, built with Phaser 3.90.",
          color: "red",
        },
        {
          id: "planer",
          title: "PLÄNER",
          cover: "planer",
          coverAlt:
            "Pläner weekly planner interface with tasks, calendar, habit tracking, and statistics",
          href: "https://planer-eight.vercel.app",
          type: "WEEKLY PLANNER / 2026",
          description:
            "A cozy weekly planner for tasks, sleep, mood, energy, habits, calendar, and personal statistics with automatic data saving.",
          color: "orange",
        },
        {
          id: "trace",
          title: "TRACE",
          type: "AI WORKFLOW TOOL / 2026",
          description: "A tool for building and controlling multi-step AI workflows.",
          color: "green",
        },
        {
          id: "patch",
          title: "PATCH",
          type: "DESKTOP UTILITY / 2026",
          description:
            "A minimalist desktop utility for automating repetitive actions.",
          color: "yellow",
        },
        {
          id: "ping",
          title: "PING",
          type: "NOTIFICATION SYSTEM / 2026",
          description:
            "An event and notification system for small digital products.",
          color: "red",
        },
        {
          id: "frame",
          title: "FRAME",
          type: "INTERACTIVE WEBSITE / 2026",
          description:
            "An experimental promotional website with responsive motion and interactive graphics.",
          color: "orange",
        },
      ],
    },
    footer: {
      title: "Contacts and business details",
      kicker: "// contacts",
      socialLabel: "Social media",
      unavailable: "{label} — link coming soon",
      unavailableTitle: "Link coming soon",
      status: "self-employed",
      owner: "Vadim Dmitrievich Bednov",
      taxId: "Tax ID 524711417910",
      legalLabel: "Legal information",
      privacy: "privacy policy",
      offer: "public offer",
    },
    overlays: {
      titles: {
        about: "about",
        stack: "stack",
        privacy: "privacy policy",
        offer: "public offer",
      },
      about: {
        eyebrow: "// brief information",
        paragraphs: [
          "I create digital products — from expressive interfaces to working systems. I develop websites, web applications, Telegram bots, extensions, and automations, considering both the visual layer and the logic behind them.",
          "I build projects end to end: frontend, server-side logic, databases, APIs, and third-party integrations.",
          "With every project, you’ll receive support and a detailed FAQ that answers most potential questions. Message me — and we’ll bring any idea you have to life!",
        ],
      },
      stack: {
        eyebrow: "// technologies and disciplines",
        intro:
          "The working stack is selected for the task, scale, and timeline. Below are the technologies and disciplines I use most often or bring in when needed.",
        items: [
          [
            "FRONTEND",
            "React, TypeScript, JavaScript, Vite, HTML, CSS, responsive layout, GSAP, and scroll-driven interfaces.",
          ],
          [
            "BACKEND & DATA",
            "Node.js, REST APIs, webhooks, PostgreSQL, Supabase, Firebase, authentication, server-side logic, and databases.",
          ],
          [
            "INTEGRATIONS",
            "Telegram Bot API, CRM and external APIs, payment APIs, email automation, notifications, analytics, and internal services.",
          ],
          [
            "INFRASTRUCTURE",
            "Git, GitHub, CI/CD, deployment, domains, hosting, Cloudflare/Vercel, and production environment setup.",
          ],
          [
            "AI",
            "OpenAI API and other model APIs, AI automation, prompt design, product AI features, RAG, and data workflows.",
          ],
        ],
      },
      revision: "version dated August 12, 2026",
      privacy: {
        intro: "Personal data processing policy for the v.build website.",
        sections: [
          [
            "1. General provisions",
            "This Personal Data Processing Policy applies to the v.build website and defines how users’ personal data is processed. Operator: self-employed Vadim Dmitrievich Bednov, Tax ID 524711417910, email: vbednov921@gmail.com.",
          ],
          [
            "2. Data that may be processed",
            "When contacting the Operator by email, the user’s name, email address, message content, and any other information voluntarily included in the message may be processed. The website infrastructure may also process technical data required to operate the website and protect it from failures.",
          ],
          [
            "3. Purposes and legal grounds",
            "Data is used to respond to enquiries, discuss and fulfil orders, conduct business correspondence, comply with legal requirements, and protect the rights of the parties. The legal ground depends on the situation: user consent, entering into and performing a contract, or obligations established by law.",
          ],
          [
            "4. Principles and retention period",
            "Only data required for the stated purpose is processed. It is retained no longer than necessary for correspondence, performance of agreements, accounting and tax records, or other legal obligations.",
          ],
          [
            "5. Disclosure to third parties",
            "Data is not sold or disclosed to third parties without a lawful basis. It may be transferred to technical providers that support email, hosting, or other connected services, and to public authorities where required by law.",
          ],
          [
            "6. User rights",
            "Users may request information about the processing of their data, correct it, withdraw consent where applicable, and request that processing stop where there are lawful grounds. Send requests to vbednov921@gmail.com.",
          ],
          [
            "7. Security and updates",
            "The Operator applies reasonable organizational and technical safeguards. This Policy may be updated when processing practices or legislation change; the current version is published on this page.",
          ],
        ],
      },
      offer: {
        intro: "Public offer for the performance of work and provision of services.",
        sections: [
          [
            "1. Status of this document",
            "This document sets out the general terms for work and services related to digital product development. The specific scope, price, schedule, payment procedure, and deliverables are agreed individually in correspondence, a specification, commercial proposal, invoice, or another agreed document.",
          ],
          [
            "2. Contractor",
            "Contractor: self-employed Vadim Dmitrievich Bednov, Tax ID 524711417910, email: vbednov921@gmail.com.",
          ],
          [
            "3. Scope",
            "The Contractor may develop websites, web applications, Telegram bots, automations, integrations, interfaces, and other digital solutions. The services listed on the website are for information only and do not replace individual project approval.",
          ],
          [
            "4. Order approval",
            "Before work begins, the parties agree on the task, scope, stages, price, schedule, required materials and access, and the acceptance procedure. Essential terms are recorded in correspondence or a separate document.",
          ],
          [
            "5. Acceptance and payment",
            "Acceptance of the offer occurs only after individual terms have been agreed and an invoice has been paid, or another explicitly agreed action has been taken. Viewing the website or sending an initial email does not constitute acceptance. Upon payment, the Contractor issues and provides a professional income tax receipt through the My Tax service.",
          ],
          [
            "6. Schedule and changes",
            "The schedule depends on the agreed scope and the timely provision of materials and feedback. Changes to the task, additional scope, or new integrations are agreed separately before implementation.",
          ],
          [
            "7. Acceptance of deliverables",
            "The delivery and review procedure is defined in the terms of each order. Comments are submitted within a reasonable period through the agreed communication channel; the parties clarify the list of revisions where necessary.",
          ],
          [
            "8. Rights and materials",
            "Rights to the deliverables, source files, access credentials, and client materials are transferred or provided to the extent and at the time explicitly agreed for the order. No exclusive rights are transferred automatically without a separate agreement.",
          ],
          [
            "9. Confidentiality and data",
            "The parties use information received during the work only to perform their agreements and comply with applicable personal data protection requirements.",
          ],
          [
            "10. Cancellation, refunds, and liability",
            "The consequences of cancellation, refunds, and the parties’ liability are determined with regard to the work actually completed, the individual terms of the order, and mandatory legal provisions. This document does not limit mandatory consumer rights.",
          ],
          [
            "11. Claims and governing law",
            "Questions and claims should be sent to vbednov921@gmail.com. Relations between the parties are governed by the laws of the Russian Federation.",
          ],
          [
            "12. Amendments",
            "The current version is published on the website. An order already agreed remains governed by the version and terms recorded by the parties at the time it was placed, unless otherwise agreed in writing.",
          ],
        ],
      },
    },
  },
  ru: {
    meta: {
      title: "v.build | Портфолио разработчика",
      description:
        "Портфолио разработчика Вадима Беднова: сайты, веб-приложения, боты, интеграции и автоматизация.",
    },
    header: {
      brandLabel: "v.build — к началу страницы",
      contact: "Связаться",
      openMenu: "Открыть меню",
      close: "Закрыть",
      more: "ещё",
      closeLabel: "закрыть",
      languageGroup: "Выберите язык сайта",
      chooseRussian: "Переключить сайт на русский язык",
      chooseEnglish: "Переключить сайт на английский язык",
    },
    hero: {
      firstLine: "ПРИВЕТ, ЭТО",
      thirdLine: "МОЁ ПОРТФОЛИО",
      fourthLine: "РАЗРАБОТЧИКА",
      statusLabel: "Статус портфолио",
      status: "// портфолио",
      scroll: "листайте вниз ↓",
      mediaTitles: [
        "ЭЛТ-монитор",
        "Палитра и кисти",
        "Ретро-контроллер",
        "Канцелярские кнопки",
        "Переливающийся компакт-диск",
      ],
    },
    menu: {
      label: "Основная навигация",
      goTo: "Перейти к разделу {label}",
      open: "Открыть раздел {label}",
      items: {
        work: "РАБОТЫ",
        services: "УСЛУГИ",
        about: "ОБО МНЕ",
        stack: "СТЕК",
      },
      auxiliary: {
        privacy: "ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ",
        offer: "ПУБЛИЧНАЯ ОФЕРТА",
        contacts: "КОНТАКТЫ",
      },
    },
    build: {
      sectionLabel: "Раздел 01",
      kicker: "// спектр услуг",
      titleFirst: "ЧТО Я",
      titleSecond: "СОЗДАЮ",
      subtitle: "Из идеи — в работающий продукт.",
      items: [
        {
          title: "МИНИ-ПРИЛОЖЕНИЯ И ИГРЫ",
          description:
            "Геймификация для бизнеса, маркетинговые игры, которые увеличивают продажи.",
        },
        {
          title: "TELEGRAM-БОТЫ",
          description:
            "Боты для сервисов, коммуникации и процессов — с понятными сценариями и без лишней сложности.",
        },
        {
          title: "ПЛАГИНЫ И СКРИПТЫ",
          description:
            "Небольшой софт и автоматизации, которые снимают повторяющиеся задачи с команды.",
        },
        {
          title: "САЙТЫ",
          description:
            "Сайты и промостраницы с выразительной подачей, ясной структурой и аккуратной реализацией.",
        },
        {
          title: "EMAIL-АВТОМАТИЗАЦИЯ",
          description:
            "Автоматические цепочки писем, уведомления и интеграции для регулярных процессов.",
        },
        {
          title: "РАСШИРЕНИЯ БРАУЗЕРА",
          description:
            "Расширения и desktop-инструменты, которые добавляют нужный сценарий прямо в рабочую среду.",
        },
        {
          title: "ИИ-ИНТЕГРАЦИИ",
          description:
            "ИИ-интеграции и автоматизация процессов, чтобы идти в ногу со временем и экономить свои силы для чего-нибудь великого!.",
        },
      ],
      interaction: {
        closeBoard: "Закрыть увеличенную доску",
        drawingArea: "Область рисования на доске",
        takeMarker: "Взять маркер и рисовать на доске",
        createBall: "Создать бумажный мяч",
        unavailableBall: "Бумажный мяч недоступен: WebGL не поддерживается",
        grabBall: "Схватить бумажный мяч",
        draw: "рисуй",
        throw: "кидай",
        clear: "стереть",
      },
    },
    works: {
      kicker: "// мои работы",
      titleFirst: "ИЗБРАННЫЕ",
      titleSecond: { before: "РАБ", focus: "О", after: "ТЫ" },
      galleryLabel: "Избранные работы",
      casePrefix: "КЕЙС",
      swipe: "листай →",
      previewTitle: "СКРИНШОТ ПРОЕКТА",
      previewNote: "СКОРО",
      openCase: "[ открыть кейс ↗ ]",
      openProject: "[ открыть проект ↗ ]",
      openProjectAria: "Открыть {title} в новой вкладке",
      previewSoon: "{title}: превью кейса появится позже",
      playGame: "Открыть и сыграть в {title}",
      cases: [
        {
          id: "hochetsa",
          title: "ХОЧЕЦА",
          cover: "hochetsa",
          coverAlt:
            "Обложка Telegram-бота «Хочеца» с голубым маскотом-подарком и подарочной лентой",
          href: "https://t.me/hochesa_bot",
          type: "TELEGRAM-APP / 2026",
          description:
            "Мини-приложение в Телеграме с вишлистами для себя и своих близких.",
          color: "green",
        },
        {
          id: "reserved-02",
          color: "yellow",
          empty: true,
        },
        {
          id: "cache",
          title: "BEAUTYBOMB DELIVERY",
          cover: "beautybomb",
          interaction: "embedded-game",
          coverAlt:
            "Обложка игры BeautyBomb Delivery: курьерский автомобиль везёт косметический продукт по яркому городу",
          type: "ИНТЕРАКТИВНАЯ ПРОМО-МИНИ-ИГРА / 2026",
          description:
            "Независимый концепт браузерной игры для BeautyBomb, созданный на Phaser 3.90.",
          color: "red",
        },
        {
          id: "planer",
          title: "PLÄNER",
          cover: "planer",
          coverAlt:
            "Интерфейс недельного планера Pläner с задачами, календарём, привычками и статистикой",
          href: "https://planer-eight.vercel.app",
          type: "НЕДЕЛЬНЫЙ ПЛАНЕР / 2026",
          description:
            "Уютный недельный планер для задач, сна, настроения, энергии, привычек, календаря и личной статистики.",
          color: "orange",
        },
        {
          id: "trace",
          title: "TRACE",
          type: "ИНСТРУМЕНТ ДЛЯ ИИ-ПРОЦЕССОВ / 2026",
          description:
            "Инструмент для сборки и контроля многошаговых ИИ-процессов.",
          color: "green",
        },
        {
          id: "patch",
          title: "PATCH",
          type: "DESKTOP-УТИЛИТА / 2026",
          description:
            "Минималистичная desktop-утилита для автоматизации повторяющихся действий.",
          color: "yellow",
        },
        {
          id: "ping",
          title: "PING",
          type: "СИСТЕМА УВЕДОМЛЕНИЙ / 2026",
          description:
            "Система уведомлений и событий для небольших digital-продуктов.",
          color: "red",
        },
        {
          id: "frame",
          title: "FRAME",
          type: "ИНТЕРАКТИВНЫЙ САЙТ / 2026",
          description:
            "Экспериментальный промосайт с responsive motion и интерактивной графикой.",
          color: "orange",
        },
      ],
    },
    footer: {
      title: "Контакты и реквизиты",
      kicker: "// контакты",
      socialLabel: "Социальные сети",
      unavailable: "{label} — ссылка появится позже",
      unavailableTitle: "Ссылка появится позже",
      status: "самозанятый",
      owner: "Беднов Вадим Дмитриевич",
      taxId: "ИНН 524711417910",
      legalLabel: "Юридическая информация",
      privacy: "политика конфиденциальности",
      offer: "публичная оферта",
    },
    overlays: {
      titles: {
        about: "обо мне",
        stack: "стек",
        privacy: "политика конфиденциальности",
        offer: "публичная оферта",
      },
      about: {
        eyebrow: "// краткая информация",
        paragraphs: [
          "Создаю цифровые продукты — от выразительного интерфейса до работающей системы. Разрабатываю сайты, веб‑приложения, Telegram‑боты, расширения и автоматизации, продумываю не только внешний вид, но и логику.",
          "Собираю проекты целиком: frontend, серверную часть, базы данных, API и интеграции со сторонними сервисами.",
          "Вместе с проектом вы получите поддержку, а также подробный FAQ, который закроет большинство потенциальных вопросов. Напиши мне — и мы воплотим любую твою идею!",
        ],
      },
      stack: {
        eyebrow: "// технологии и направления",
        intro:
          "Рабочий стек подбирается под задачу, масштаб и срок проекта. Ниже — наиболее частые технологии и направления, которые использую или подключаю.",
        items: [
          [
            "FRONTEND",
            "React, TypeScript, JavaScript, Vite, HTML, CSS, адаптивная вёрстка, GSAP и scroll-driven interfaces.",
          ],
          [
            "BACKEND & DATA",
            "Node.js, REST API, вебхуки, PostgreSQL, Supabase, Firebase, авторизация, серверная логика и базы данных.",
          ],
          [
            "INTEGRATIONS",
            "Telegram Bot API, CRM и внешние API, платёжные API, email-автоматизация, уведомления, аналитика и внутренние сервисы.",
          ],
          [
            "INFRASTRUCTURE",
            "Git, GitHub, CI/CD, deployment, домены, hosting, Cloudflare/Vercel и настройка production-среды.",
          ],
          [
            "AI",
            "OpenAI API и другие model APIs, AI-автоматизация, prompt design, AI-функции в продуктах, RAG и работа с данными.",
          ],
        ],
      },
      revision: "редакция от 12.08.2026",
      privacy: {
        intro: "Политика обработки персональных данных для сайта v.build.",
        sections: [
          [
            "1. Общие положения",
            "Настоящая Политика обработки персональных данных действует в отношении сайта v.build и определяет порядок обработки персональных данных пользователей. Оператор: самозанятый Беднов Вадим Дмитриевич, ИНН 524711417910, email: vbednov921@gmail.com.",
          ],
          [
            "2. Какие данные могут обрабатываться",
            "При обращении по электронной почте могут обрабатываться имя, адрес email, содержание обращения и иные сведения, которые пользователь добровольно указывает в письме. Техническая инфраструктура сайта может также обрабатывать технические сведения, необходимые для работы сайта и защиты от сбоев.",
          ],
          [
            "3. Цели и правовые основания",
            "Данные используются для ответа на обращение, обсуждения и исполнения заказа, ведения деловой переписки, соблюдения требований законодательства и защиты прав сторон. Основание обработки зависит от ситуации: согласие пользователя, заключение и исполнение договора, а также обязанности, установленные законодательством.",
          ],
          [
            "4. Принципы и срок хранения",
            "Обрабатываются только данные, необходимые для заявленной цели. Они хранятся не дольше, чем это требуется для переписки, исполнения договорённостей, бухгалтерского и налогового учёта либо иных обязанностей по закону.",
          ],
          [
            "5. Передача третьим лицам",
            "Данные не продаются и не передаются третьим лицам без законного основания. Передача возможна техническим подрядчикам, обеспечивающим работу почты, хостинга или иных подключённых сервисов, а также государственным органам — в случаях, предусмотренных законом.",
          ],
          [
            "6. Права пользователя",
            "Пользователь вправе запросить сведения об обработке своих данных, уточнить их, отозвать согласие в применимых случаях и потребовать прекращения обработки при наличии законных оснований. Для этого направьте обращение на vbednov921@gmail.com.",
          ],
          [
            "7. Защита и актуализация",
            "Оператор применяет разумные организационные и технические меры защиты данных. Политика может обновляться при изменении процессов обработки или законодательства; актуальная редакция публикуется на этой странице.",
          ],
        ],
      },
      offer: {
        intro: "Публичная оферта о выполнении работ и оказании услуг.",
        sections: [
          [
            "1. Статус документа",
            "Настоящий текст устанавливает общие условия выполнения работ и оказания услуг по разработке цифровых продуктов. Конкретный состав работ, стоимость, сроки, порядок оплаты и результат определяются индивидуально в переписке, техническом задании, коммерческом предложении, счёте или ином согласованном документе.",
          ],
          [
            "2. Исполнитель",
            "Исполнитель: самозанятый Беднов Вадим Дмитриевич, ИНН 524711417910, email: vbednov921@gmail.com.",
          ],
          [
            "3. Предмет",
            "Исполнитель может выполнять работы по разработке сайтов, веб-приложений, Telegram-ботов, автоматизаций, интеграций, интерфейсов и иных цифровых решений. Перечень услуг на сайте носит информационный характер и не заменяет индивидуальное согласование проекта.",
          ],
          [
            "4. Согласование заказа",
            "До начала работ стороны согласовывают задачу, объём, этапы, стоимость, сроки, требования к материалам и доступам, а также порядок сдачи результата. Существенные условия фиксируются в переписке или отдельном документе.",
          ],
          [
            "5. Акцепт и оплата",
            "Акцепт происходит только после согласования индивидуальных условий и оплаты счёта либо иного явно согласованного действия. Просмотр сайта или первое обращение по email сами по себе не являются акцептом. При получении оплаты Исполнитель формирует и передаёт заказчику чек НПД через сервис «Мой налог».",
          ],
          [
            "6. Сроки и изменения",
            "Сроки зависят от согласованного объёма, своевременности предоставления материалов и обратной связи. Изменение задачи, дополнительный объём или новые интеграции согласуются сторонами отдельно до их выполнения.",
          ],
          [
            "7. Приёмка",
            "Порядок передачи и проверки результата определяется в условиях конкретного заказа. Замечания направляются в разумный срок по согласованному каналу связи; при необходимости стороны уточняют перечень доработок.",
          ],
          [
            "8. Права и материалы",
            "Права на результат, исходные файлы, доступы и материалы заказчика передаются или предоставляются в том объёме и в тот момент, которые прямо согласованы для конкретного заказа. Никакая передача исключительных прав не предполагается автоматически без отдельного соглашения.",
          ],
          [
            "9. Конфиденциальность и данные",
            "Стороны используют полученную при работе информацию только для исполнения договорённостей и соблюдают применимые требования к защите персональных данных.",
          ],
          [
            "10. Отказ, возврат и ответственность",
            "Последствия прекращения работ, возврат средств и ответственность сторон определяются с учётом фактически выполненного объёма, индивидуальных условий заказа и обязательных норм законодательства. Настоящий текст не ограничивает обязательные права потребителя.",
          ],
          [
            "11. Претензии и применимое право",
            "Вопросы и претензии направляются на vbednov921@gmail.com. К отношениям сторон применяется законодательство Российской Федерации.",
          ],
          [
            "12. Изменение редакции",
            "Актуальная редакция публикуется на сайте. Для уже согласованного заказа действует редакция и условия, зафиксированные сторонами на момент его оформления, если иное не согласовано письменно.",
          ],
        ],
      },
    },
  },
};
