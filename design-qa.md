# Design QA — adaptive hero and mascot stage

## Evidence

- Source visual truth: `C:/Users/7349~1/AppData/Local/Temp/codex-clipboard-c0b6979d-d4c0-4854-b64f-789906e8d23c.png` (`466x742` physical pixels), approved compact mobile composition.
- Browser-rendered implementation: `C:/Users/пк/Desktop/portfolio/site/tmp/design-qa/implementation-375x594.jpg` (`360x594` content pixels at a `375x594` CSS viewport; the 15 px browser scrollbar is excluded).
- Normalized source: `C:/Users/пк/Desktop/portfolio/site/tmp/design-qa/source-375x594.png` (`360x594`). The source's 13 px scrollbar was cropped, then the remaining `453x742` content was normalized to the implementation content size. This corresponds to the Windows 125% capture density visible in the source.
- Combined comparison: `C:/Users/пк/Desktop/portfolio/site/tmp/design-qa/comparison-375x594.png`.
- Additional browser captures:
  - `C:/Users/пк/Desktop/portfolio/site/tmp/design-qa/hero-375x594.jpg`
  - `C:/Users/пк/Desktop/portfolio/site/tmp/design-qa/hero-892x490.jpg`
- Hero viewport matrix: `320x480`, `352x439`, `390x844`, `466x742`, `760x600`, `761x600`, `892x490`, `1024x600`, `1366x601`, `1440x900`, `1870x858` CSS pixels.
- Mascot-stage matrix: the same set plus `375x594`.
- State: initial hero at `scrollY=0`; settled mascot stage after one viewport of scroll.

## Findings

- No actionable P0/P1/P2 findings remain.
- The hero occupies exactly one dynamic viewport in every tested size. Its four-line display title is optically centered and height-limited, while the three bottom labels remain fully inside the hero. The next section never peeks into the initial viewport.
- The service divider aligns with the approved mobile reference after density normalization. The visible PNG bounds finish 15–61 px before the list across the tested matrix, so the former large empty field is removed without letting an excessive part of the service list rise into the mascot stage.
- The visible mascot bounds do not collide with the kicker, heading, subtitle, or first service item. No horizontal content overflow was found.
- Browser console: no warnings or errors.

## Required fidelity surfaces

- Fonts and typography: existing Onest and IBM Plex Mono families, weights, line heights, letter spacing, and copy are unchanged. Only the hero display size receives a viewport-height safety cap.
- Spacing and layout rhythm: the approved left-mascot/right-heading composition is preserved. The desktop inter-row gap is removed; mobile list start and gap use height-aware clamped values.
- Colors and visual tokens: unchanged.
- Image quality and asset fidelity: the original transparent mascot PNG remains unchanged, without crop, replacement, or background treatment.
- Copy and content: unchanged.
- Interaction and accessibility: GSAP scroll movement, cursor behavior, interactive whiteboard/bin hit zones, touch support, and reduced-motion behavior were not modified.

## Comparison history

1. Earlier P2: some heights left an oversized blank area between the mascot and service divider, while other heights could reveal too much of the next content. Fix: replace the generic section row gap with a protected height-aware list start and a small clamped mobile gap.
2. Earlier P2: desktop hero alignment used a top-aligned override, causing the title to drift upward on short or wide-short windows. Fix: make the hero a single dynamic viewport and center the title with a height-aware display-size cap.
3. Post-fix evidence: the normalized `375x594` comparison aligns the service divider with the approved source; all tested hero and mascot-stage rectangles satisfy the visibility and collision invariants.

Focused-region comparison was not needed because the task concerns large section boundaries, title centering, the full mascot silhouette, and the service divider; all are clearly legible in the full-view comparison and were also checked through rendered element geometry.

## Implementation checklist

- [x] Hero is exactly one dynamic viewport.
- [x] Main title stays centered and clear of header/meta.
- [x] Bottom hero labels remain visible.
- [x] Second section does not peek into the hero.
- [x] Mascot/list gap is compact and collision-safe.
- [x] Responsive geometry checked on mobile, tablet, desktop, and wide-short windows.
- [x] Production build passes.
- [x] Browser console is clean.

final result: passed
