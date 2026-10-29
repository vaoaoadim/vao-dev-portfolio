# BeautyBomb portfolio embed

Independent portfolio concept, not an official BeautyBomb commission.

Source: `vaoaoadim/BeautyBomb-delivery-game`, commit
`d44cfd69a5c79ad38b86a382f2e806c016efaee4`. This is the current version of
the project originally supplied in `cases portfolio/cases for portfolio 1`.
Only live source and the 30 referenced runtime assets are included; reference
masters, deployment configuration, credentials and historical exports are excluded.

The portfolio builds this source into `games/beautybomb/index.html` on the same
host. Phaser stays in the iframe's lazy engine chunk and does not enter the
portfolio's initial bundle. Images, the game's existing typography, and optional music
need no external CDN or Vercel domain. The existing frame and 360 × 640 logical
viewport (720 × 1280 backing canvas) are unchanged.

Local adaptations: Phaser's asset base resolves against the game document's
directory, and the embed bridge defaults to its own origin as the only allowed
parent. Messages still validate both origin and parent window.

`npm run build:pages` builds both the portfolio and the game. For a local preview,
run `npm run preview -- --outDir dist/pages` and open `/vao-dev-portfolio/`.
The generic portfolio build also includes the game. No generated builds are committed.
