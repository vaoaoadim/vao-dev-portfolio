# v.build — developer portfolio

Interactive portfolio website built with React, Vite, GSAP and Three.js. The runnable application is in [`site/`](site/).

## Local development

Requires Node.js 24+ (tested with 24.12.0).

```powershell
cd site
npm ci
npm run dev
```

Open the local address printed by Vite (normally `http://localhost:5173`).

## Commands

| Task | Command |
| --- | --- |
| Run locally | `cd site; npm run dev` |
| Production build | `cd site; npm run build` |
| Check the hosting package | `cd site; npm run test:sites` |
| Responsive smoke check | `cd site; npm run verify:responsive` |

## Project map

| Area | Location |
| --- | --- |
| App composition | `site/src/App.jsx` |
| Intro and animated project cards | `site/src/HeroIntro.jsx` |
| Scroll-driven mascot scene | `site/src/MascotScrollScene.jsx` |
| Services section and its mini interactions | `site/src/WhatIBuild.jsx`, `site/src/InteractiveBuildScene.jsx` |
| Pixel cursor | `site/src/PixelCursor.jsx` |
| Header | `site/src/PortfolioHeader.jsx` |
| Responsive styles and visual tokens | `site/src/styles.css` |
| Runtime images and fonts | `site/public/assets/`, `site/public/fonts/` |

## Working with AI agents

Before changing code, read these files in order:

1. [`AGENTS.md`](AGENTS.md)
2. [`site/AGENTS.md`](site/AGENTS.md)
3. [`docs/AI_HANDOFF.md`](docs/AI_HANDOFF.md)

Keep work inside `site/`, preserve owner-supplied images and the established composition unless the task explicitly changes them, and make the smallest complete change. The repository intentionally excludes dependencies, build output, local editor state and temporary visual experiments.
