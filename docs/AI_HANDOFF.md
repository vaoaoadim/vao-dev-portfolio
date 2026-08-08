# AI handoff

## Start here

1. Read `AGENTS.md` and `site/AGENTS.md`.
2. Inspect only the source and styles relevant to the request.
3. Preserve the established visual composition and owner-supplied images unless the request is explicit.
4. Make the smallest complete change, then run the narrowest useful check.

## Current site

- `site/src/App.jsx` assembles a single portfolio experience: header, hero, scroll scene and services.
- `HeroIntro.jsx` is the opening screen with animated cards inside coloured brackets.
- `MascotScrollScene.jsx` controls the scroll-timed mascot movement between the intro and `WhatIBuild.jsx`.
- `WhatIBuild.jsx` renders the services list and title scrambling; `InteractiveBuildScene.jsx` maps drawing and paper-ball interactions to the flattened mascot illustration with normalized anchors.
- `PixelCursor.jsx` is the desktop-only custom cursor. Interactive controls opt in with `data-cursor="interactive"`.
- `styles.css` owns responsive layout, stacking and motion. Check its related desktop and mobile rules before changing scene geometry.

## Visual and interaction constraints

- Runtime images in `site/public/assets/` are the visual source of truth. Do not crop, regenerate, replace or reposition them without owner approval.
- The mascot illustration is a flattened image. Keep any overlays aligned through its normalized anchors and recalculate geometry when its container resizes.
- Do not add per-frame React state, global event listeners without cleanup, or permanent animation loops.
- Keep the custom cursor hidden on touch/coarse-pointer devices and preserve reduced-motion behavior.
- Do not add placeholder links, analytics, forms or deployment configuration without an explicit request.

## Verification

- Feature or style change: inspect the affected view and run the narrowest relevant command.
- Build, hosting or dependency change: `cd site; npm run build`.
- Hosting package change: `cd site; npm run test:sites`.

## Do not commit

- `node_modules/`, `dist/`, logs, editor folders, temporary previews or local test artefacts.
