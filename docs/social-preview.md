# Social link preview

## Summary

The shared GitHub Pages URL had no Open Graph or Twitter image metadata, allowing crawlers to select an office-scene image from the page. The new dedicated card adapts the visual direction of `vaoaoadim/vaoaoadim/assets/banner-v1.png`: v.build, the existing character, a white background and green/yellow/red accents. Services and Telegram make the preview useful to prospective development clients.

## Implementation brief

1. Read AGENTS.md and GitHub Pages configuration; start from current main.
2. Use verified identity and services: Vadim Bednov / v.build; websites, web apps, Telegram Mini Apps, bots and automation; Telegram @vaoaoadim. Do not invent results or claims.
3. Adapt the profile banner's visual language to 1200×630, with safe margins and readable text at small sizes. Reuse the existing portfolio character unchanged.
4. Commit a PNG for crawlers and an editable SVG layout with a render helper. Use a new, versioned image URL.
5. Add static Open Graph and Twitter Card metadata, including title, description, absolute image URL, dimensions, MIME type and alt text. Crawlers must not need JavaScript.
6. Target the shared GitHub Pages URL with its `/vao-dev-portfolio/` base path. Both existing builds retain the same explicit public image URL.
7. Review the image and validate the Pages build and its existing deployment checks; keep scope limited to the link preview.
8. Commit the complete change to main, trigger the existing Pages workflow, and confirm deployment and public image availability.

## Maintenance

- Preview: `public/assets/social/portfolio-cover-v1.png` (1200×630).
- Editable layout: `public/assets/social/portfolio-cover-v1.svg`.
- Render: `node scripts/render-social-cover.mjs` (requires project dependencies and the listed fonts).
- The office-scene assets remain available for existing site behavior; they are no longer the designated social preview.
- When changing the cover, increment the filename and update both Open Graph and Twitter image URLs. Social networks may keep cached cards for already shared links.
- These metadata describe the GitHub Pages portfolio, not the GitHub repository's separate social card. Repository social-preview settings are independent.
