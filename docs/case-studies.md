# Case studies

Finished gallery cards open `/work/:slug`. The existing Sites worker falls back to the SPA shell for HTML requests, so these routes support direct access and refresh without hosting changes.

## Editing content

- `src/content.js` remains the source of project titles, gallery summaries and destinations in RU/EN.
- `src/caseStudyRoutes.js` maps finished project IDs to slugs. Placeholders have no mapping.
- `src/caseStudies.js` contains localized stories and project-specific technology lists.
- `src/CaseStudyPage.jsx` renders all projects. Empty optional sections are omitted.
- `src/caseStudy.css` owns the case-page layout and CTA interaction.

Supported story fields: `overview`, `challenge`, `keyProblems`, `decisions`, `role`, `outcome`, and optional `media`. Paragraph fields are arrays of strings. A problem has `title` and `text`; a decision has `constraint`, `decision`, and `effect`.

An image in `media` has `src`, `alt`, intrinsic `width` and `height`, optional `avif`, `webp` and `caption`. Images are lazy-loaded and reserve their aspect ratio. Heavy future media should remain scoped to its case.

## Evidence

Initial stories use the existing portfolio copy and the following project sources:

- **REC:** local recording/storage/editor/export source; IndexedDB and OPFS in `src/storage/draft-store.ts`, operation locks, shared `renderCompositionFrame` in preview and WebM export, project package dependencies.
- **хочеца:** project README, package dependencies, Telegram authentication source, and wish-reservation migration. Product features include public/unlisted/private boards, cross-device access, compressed uploads and reservations.
- **BeautyBomb Delivery:** project README, `src/app/createGame.ts`, and the portfolio embed bridge. It is explicitly an independent portfolio concept, not a commissioned brand campaign.
- **Pläner:** existing portfolio description and `vaoaoadim/Planer-app/README.md`. Detailed engineering sections are omitted until implementation evidence is available.

Do not add adoption, performance or business metrics without supporting evidence. Do not infer a project's stack from the global portfolio stack.

## Navigation and lifecycle

`PortfolioRouteContext` handles semantic links and browser history without a routing dependency. Modified clicks keep native link behaviour. A gallery-origin route records scroll position, horizontal gallery offset and the originating card for focus restoration.

The home page stays mounted after its first visit to retain the drawing and gallery state. It is hidden and inert during a case; its ScrollTriggers are suspended and restored on return. A direct case visit does not mount the home page or its heavy interactive media. Case and home code are separate lazy chunks.

Header/menu section actions return to the corresponding home section after releasing the overlay scroll lock. Overlay history retains route metadata. BeautyBomb launches through the existing iframe interaction from the case CTA; background content becomes inert while the dialog is open.

## Verification during implementation

- Production build completed.
- 48 combinations of case, language and viewport passed layout checks at widths 320, 390, 768, 1024, 1440 and 1920; no page exceptions were recorded.
- 25 worker, build-asset and mascot playback tests passed.
- Mobile browser Back restored the recorded page and gallery scroll offsets and card focus.
- The old `verify:responsive` script targets a removed theme-switching implementation and cannot validate the current portfolio.
- Further browser verification was stopped at the owner's request before publication. Full desktop/menu/embedded-game regression verification remains a follow-up.
