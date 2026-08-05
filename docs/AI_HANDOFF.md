# AI handoff

## Start here

1. Read `AGENTS.md` and `site/AGENTS.md`.
2. Inspect only the components and styles affected by the request.
3. Preserve owner-supplied images, current composition, copy, and interactions unless the request explicitly changes them.
4. Make the smallest complete change. Do not deploy, publish, or create external links without explicit approval.

## Project map

| Area | Source |
| --- | --- |
| App state, themes, scene layers, bottom controls | `site/src/App.jsx` |
| Glass header and mobile menu | `site/src/PortfolioHeader.jsx` |
| `V.BUILD` and reusable Three.js wordmarks | `site/src/BuildMark3D.jsx` |
| Layout, responsive rules, themes, visual tokens | `site/src/styles.css` |
| Source images | `site/assets-source/` |
| Runtime assets | `site/public/assets/` |

## Current visual contract

- The portfolio is a single full-viewport scene with light and dark image sources.
- The theme switcher is fixed in the top-right corner and persists the selected theme locally.
- `V.BUILD` is a transparent Three.js overlay in the lower-left corner.
- The social icons sit on the same baseline as `V.BUILD` and remain placeholders until the owner supplies links.
- The header is a compact glass layer with a `PORTFOLIO` Three.js mark, placeholder navigation, and a mobile drawer.
- The header, `V.BUILD`, and social group share the left layout variable `--frame-left`.
- The header currently has no animated border or gradient.

## Engineering rules

- Keep Three.js isolated in `BuildMark3D.jsx`; do not add per-frame React state.
- Keep scene imagery as `object-fit: contain`; do not alter source images for responsive layouts.
- Use CSS for ordinary layout and motion. Add dependencies only when explicitly needed.
- Respect `prefers-reduced-motion`, keyboard focus, touch input, and safe-area insets when changing interactive UI.
- Do not commit `node_modules`, local editor settings, temporary audits, logs, or environment files.

## Handoff format

Report changed files, the smallest verification actually performed, and the local URL when the dev server is already running. Ask the owner before a visual redesign, dependency addition, deployment, or real contact/social URL.
