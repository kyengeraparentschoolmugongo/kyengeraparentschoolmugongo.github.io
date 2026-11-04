# Fresh Teacher import
- [x] Repair class resource dropdowns: single-click native buttons, exclusive menus, outside/focus/Escape dismissal, keyboard navigation, phone sizing and accessible chat; 13 regression checks passed and shelf-to-reading-catalog flow verified on phone/desktop plus Baby, P7 and S1 menus.
- [x] Repair missing GitHub Pages logo and images: export all 58 pointer-backed originals into the deployment at their referenced URLs; validated full export, regression tests, and published-page image rendering using the exported files. Live update awaits the next GitHub deployment.
- [x] Remove obsolete workflow conflict and update GitHub Pages runner setup; expose actual static build failures in run summaries and annotations.
- [ ] Deploy the repaired image export to GitHub Pages — awaiting the owner's next workflow run; the root-domain site is live but its current deployment lacks pointer-backed media.
- [x] Keep only flipping and continuous vertical reading, with catalog-matching flips/sound; verified both modes on desktop and phone.
- [x] Ensure spinners never delay content or block interaction, and skip them on instant loads; verified timing tests, PDF opening, and desktop/phone browsing.
- [x] Add matching logo loading indicators for thumbnails and page navigation; verified on desktop and phone.
- [x] Restore listing PDF View buttons to the preserved original overlay flipbook; verified opening, closing and reopening without leaving the catalog.
- [x] Simplify PDF reading controls and hide non-document files; verified page turns, page jumps, zoom, thumbnails, fullscreen and mobile sizing. Alternate Office embeds retained; external Office rendering was blank during this check, with original-file fallback available.
- [x] Open documents directly in compatible viewers and preserve originating catalog order, browsing context and full pagination below them; verified PDF and Word previews and continued browsing across all 17 source pages.
- [x] Improve shared catalog search with synonyms, prefixes, typo tolerance, and multi-word matching.
- [x] Add clean titles, metadata filters, sharing, clear search, compact mobile cards, and jumpable pagination.
- [x] Add dedicated document pages with metadata, original viewer/downloads, and related documents.
- [x] Verify improved discovery and document flows with tests and desktop/phone checks.
- [ ] Add a public-domain document sitemap — deferred; outside the current image-repair request.
- [x] Static export for GitHub Pages: prerendered homepage + all 648 original .html URLs (real 200s for Google/bookmarks), 404.html SPA fallback for /doc/* deep links, deploy workflow in .github/workflows/deploy.yml; verified 649 pages prerender and all tests pass. Pending: user pushes to GitHub and sets Pages source to "GitHub Actions".
- [x] Share a consistent homepage-style top bar and class navigation across all pages.
- [x] Verify navigation, page content, and door behavior on desktop and phone.
- [x] Fix static catalog test errors and verify recovered catalogs.
- [x] Normalize catalogs into Git-managed hierarchical JSON without changing layouts or original URLs.
- [x] Recover verified Oral Literature and Entrepreneurship lists and record the three unavailable source catalogs.
- [ ] Populate Economics, Chinese and FN past-paper catalogs — blocked pending authoritative lists from the owner.
- [x] Test normalized data, preserved addresses, and recovered cards through the preview.
- [x] Capture the homepage and original assets.
- [x] Compare source and preview on desktop and phone.
- [x] Restore observed navigation, door and chat controls; preserve source link paths.
- [x] Verify the page and document unavailable assets and linked pages in the observation report.

# Appearance-preserving refactor
- [x] Audit original resource pages, URLs and AdSense configuration.
- [x] Consolidate 52 matching resource pages and repeated homepage menu/shelf markup.
- [x] Verify representative search, pagination, original PDF viewing and destinations on desktop and phone; check all 52 pages render server-side.
- [x] Document migration limitations; leave the existing live website unchanged.

# Remaining legacy pages
- [x] Audit every remaining source page and group genuinely matching layouts.
- [x] Import source content and assets into shared templates at original URLs, retaining distinct layouts and repairing their controls.
- [x] Test address coverage, representative real document flows, and desktop/phone appearance.
- [x] Record any source-side missing destinations and migration limitations; leave the live site untouched.