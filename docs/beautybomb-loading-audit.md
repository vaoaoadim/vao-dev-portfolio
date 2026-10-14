# BeautyBomb loading audit — 2026-10-14

Scope: the GitHub Pages portfolio and its existing BeautyBomb Vercel iframe.
Case navigation, popup dimensions and appearance, artwork, logical viewport,
renderer resolution, game rules and host-origin restrictions are preserved.

## Findings

- The host mounted a transparent iframe with no local loading surface. A delayed
  iframe document therefore left the visitor looking at the portfolio background.
- The game's loader markup existed in HTML, but its frame and layout depended on
  a separate render-blocking CSS response. Holding that response produced no
  first paint and a default unstyled game root only 18 px high.
- The 6,470,388-byte MP3 was a mandatory preload resource. A simulated connection
  reset on that file caused a preload error and prevented the ready state, even
  though music is not required for gameplay.
- Five large environment textures transferred 3,129,366 bytes. Their immutable
  PNG exports can be encoded as lossless WebP without another resize or changes
  to visible pixels, alpha, texture dimensions, filtering or world coordinates.
- The host handled only close messages. Startup failure and prolonged loading
  offered no recovery action.

The reported isolated cream stick cannot identify one cause on its own. The
transparent host and blocked first paint reproduce the missing game window;
the audio failure independently reproduces a game that never becomes ready.
Production CSP already permits `https://vaoaoadim.github.io`.

## Implemented recovery

- Render the existing game loader and frame locally on click; show the actual
  iframe after an origin- and window-validated `ready` message following the
  first game render. Existing `progress` events drive the same progress bar.
- Inline the game's existing shell CSS in its HTML. A small bootstrap handles
  loading and errors before importing Phaser.
- Download the unchanged music only after the first game gesture. Music failure
  no longer blocks the scene. Existing mute, pause, visibility and close behavior
  continue to govern playback.
- Keep Phaser's two file retries, limit concurrent asset downloads to four, and
  give stalled XHR requests a 45-second timeout. An exhausted visual preload
  stops before creating objects with missing textures.
- Show retry after a reported error or 30 seconds without loading progress.
  Slow loading can still complete; this hint does not abort it. The browser's
  `online` event retries an unfinished iframe. Closing still removes the iframe.
- Ship lossless WebP copies of the five environment textures. The offline export
  verifies every alpha value and every visible RGB pixel. The original PNGs and
  approved art masters remain unchanged.

## Measurements

Cold browser cache, Chrome CDP, local production builds served with gzip for
HTML/JavaScript/CSS; 75,000 bytes/s download, 150 ms latency, CPU throttled 4×,
404 × 684 viewport. Timing ends at the game's first-render ready event.

| Measurement | Before | After |
| --- | ---: | ---: |
| Time until game ready | 141.084 s | 45.982 s |
| Bytes transferred before ready | 10,244,506 | 3,189,632 |
| Music bytes required before ready | 6,470,388 | 0 |
| Five environment image files | 3,129,366 | 2,543,388 |
| First paint with stylesheet withheld | none | 452 ms; no CSS request needed |

This is a controlled comparison, not a guarantee of identical public-network
timing. Physical low-end Android/iOS devices were not available for testing.

## Verification

- Game TypeScript check and Vercel production build passed.
- All 46 existing game tests passed.
- Portfolio Pages build and four Pages/mascot-service-worker checks passed.
- In the browser, the game becomes ready with WebGL disabled (Canvas fallback).
- A one-time city-texture connection reset is recovered by the loader retry.
- Blocking the music after the first gesture leaves the game ready, without a
  startup error. Blocking the engine chunk produces a recoverable loading error.
- Music that finishes loading during pause stays silent, starts on resume, and
  still pauses/resumes through the existing mute control (browser verified).
- Desktop (1440 × 900) and mobile (390 × 844) popup checks passed: immediate
  loader, first-render handoff, unchanged dimensions, validated game close,
  iframe removal, restored focus, and ignored messages from a different window.
- Engine-download failure is recovered by retry. An iframe document held beyond
  the idle threshold is recovered on the browser's `online` event.
- Production deployment is checked as part of release verification.
