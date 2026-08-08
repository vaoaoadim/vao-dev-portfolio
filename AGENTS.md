# Agent Instructions

## Scope

- The application is `site/` (React 19 + Vite).
- Read `site/AGENTS.md` and `docs/AI_HANDOFF.md` before changing the website.
- Preserve owner-supplied assets, current layout, copy and interactions unless explicitly asked to change them.
- Keep changes local to the requested feature; do not perform broad cleanups, redesigns or dependency swaps.

## Commands

Run commands from `site/`.

| Need | Command |
| --- | --- |
| Local development | `npm run dev` |
| Production build | `npm run build` |
| Hosting package check | `npm run test:sites` |
| Responsive smoke check | `npm run verify:responsive` |

## Implementation rules

- Inspect affected files before editing.
- Prefer existing React, GSAP and Three.js utilities; add dependencies only when necessary.
- Keep per-frame animation state out of React renders.
- Use CSS for ordinary layout and responsive behavior.
- Preserve keyboard access, touch interaction and `prefers-reduced-motion` when editing interactive UI.
- Do not commit `node_modules`, build output, logs, editor state or temporary image experiments.
- Run the smallest relevant verification; use `npm run build` for build, packaging or dependency changes.

## Handoff

- Report the files changed and verification actually run.
- Ask before publishing, deployment, external links or replacing visual assets.
