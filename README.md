# v.build

Портфолио Вадима Беднова: сайты, веб-приложения, боты, интеграции и автоматизация.

## Ссылка

https://vaoaoadim.github.io/vao-dev-portfolio/

## О проекте

**v.build** — личный сайт с избранными работами и отдельными страницами проектов. Интерактивные сцены, анимация и навигация адаптированы для мобильных и десктопных экранов.

## Возможности

- Галерея работ и страницы кейсов с прямыми ссылками.
- Русская и английская версии с сохранением выбранного языка.
- Анимация при прокрутке и интерактивные 3D-элементы.
- Запуск BeautyBomb Delivery внутри сайта.

## Технологии

- React 19
- JavaScript
- Vite
- GSAP
- Three.js
- HTML5 / CSS3
- GitHub Actions / GitHub Pages

## Локальный запуск

Node.js 24.

```bash
npm ci
npm run dev
```

Сборка для текущего Sites-хостинга:

```bash
npm run build
```

Сборка для GitHub Pages:

```bash
npm run build:pages
npm run preview -- --mode github-pages
```

GitHub Actions публикует `main` на Pages. Base path задаётся настройками Pages через `VITE_BASE_PATH`; локально используется `/vao-dev-portfolio/`.
