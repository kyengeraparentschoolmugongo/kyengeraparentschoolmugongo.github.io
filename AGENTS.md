<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep imported homepage markup and React-driven interaction repair in its route file, preserving captured CSS and local source assets to maintain source fidelity.
- Preserve original same-site paths on the app origin, including links to pages not yet imported, so later imports can use the original URLs.
- Audited resource pages use one legacy-path route with an explicit source-derived manifest and lazy per-page data; accept matching source structures only to prevent silent layout changes.
- Preserve original resource CSS and use source variants of the shared Button for repaired controls; load the original flipbook viewer on demand to retain familiar file viewing.
- Catalog PDF View buttons invoke the existing overlay callback; titles and non-PDF View links retain contextual dedicated routes so immediate reading and shareable pages coexist.
- Keep advertising and analytics disabled in previews; preserve verified publisher configuration separately until the published domain and consent requirements are validated.
- Additional legacy pages use the same explicit-path route with lazy page data and content-addressed source fragments; share only identical fragments so unusual source layouts remain intact.
- Rebuild legacy catalogs with scripts/import-legacy-pages.py from audited source files; never execute embedded source scripts, and record unavailable source catalogs/assets rather than inventing replacements.
- Catalogs use editable static JSON: exact-path manifests select layout-only pages, ordered document IDs resolve lazy shared shards, and the hierarchy indexes only source-address categories; this preserves URLs/order without a database. Audited inline snapshots are kept outside src under .site-import/catalog-source; normalize-catalogs.py is an explicit re-import conversion, never a page-load or automatic edit-time overwrite.
- The root LibraryShell owns the uniform app bar and source-derived class menu; route renderers omit captured navigation and scoped layout overrides remove legacy offsets so every page shares navigation without modifying source content or URL mappings.
- Shared navigation dimensions use font-independent CSS tokens; imported typography must not change the sidebar/content alignment.
- Use one shared logo loader for thumbnail preparation and router pending states; keep thumbnail failures and unsupported formats as static file fallbacks so loading never masks an error.
- Delay shared loading feedback only, never content readiness; remove indicators immediately on completion and keep overlays pointer-transparent so loading cannot block interaction.
- Use the shared MiniSearch tokenizer for all document catalogs; conservative aliases and AND matching keep abbreviations discoverable without loosening short class/year tokens.
- Document routes use URL-derived stable identities and lazy source-backed index shards; rebuild with scripts/build-document-index.py after adding or moving catalog records, so edited titles do not break existing links.
- Shared document cards own presentation filters and explicit pagination; source catalog values, layouts, record order, and original PDF destinations remain authoritative.
- Document links carry URL-based originating catalog and browsing context; detail pages reuse the complete catalog and begin after the opened record so pagination remains continuous.
- Dedicated viewers auto-open PDFs using the captured flipbook in an isolated iframe; public source office files use format-aware external embeds with original-file fallbacks, keeping third-party legacy listeners scoped to the viewer lifetime.
- Document-format eligibility is shared by static catalog hydration, search and detail lookup; hide non-document records without mutating audited source shards. PDF reader options expose only supported reading tools, with shared React controls for mode, reload and fullscreen.
- Dedicated PDF readers use the source flipbook engine for flips and lazy PDF.js canvases in the isolated iframe for continuous vertical reading, because the source engine has no vertical mode.
- Static export for GitHub Pages: vite.config.ts prerenders "/" plus every path in the resource and legacy manifests (649 real .html files); the router uses trailingSlash: 'preserve' because the prerender pass requests "<path>/" and redirect normalization loops it. The deploy workflow copies index.html to 404.html so /doc/* deep links render client-side.
- GitHub Pages uses a single deploy workflow with pinned build runtimes and failure output in summaries/annotations, so deployment errors are diagnosable without private log access; verify repository-prefix compatibility before declaring a project Pages URL live.
- Static Pages deployments export every source asset pointer into the artifact at its exact URL using scripts/export-static-assets.py; validate MIME type and byte size and fail on unavailable originals, because GitHub cannot serve Lovable's asset proxy.
- Legacy resource dropdowns use one structural active identity, separate from hierarchical expansion; native triggers, outside/focus/Escape dismissal and in-flow phone panels prevent overlapping menus and blocked chat without changing source destinations.
