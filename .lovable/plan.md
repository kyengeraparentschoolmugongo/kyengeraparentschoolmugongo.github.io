# Appearance-preserving refactor

Consolidate genuinely matching resource pages into one reusable renderer with explicit original URL mappings and source-derived data. Preserve the homepage appearance, source styles, original resource ordering and download destinations. Keep differently structured pages out of the shared renderer until their behavior has been audited.

Reduce the homepage’s repeated class-menu and shelf markup without changing its visible structure or interaction behavior.

Preserve the verified AdSense publisher declaration and ads.txt. Do not activate advertising or analytics in preview, publish the app, or change the existing live site.

Verify representative resource navigation, searching, pagination, file viewing and downloads; check homepage regressions and server-rendered content. Document remaining page families and migration checks rather than guaranteeing rankings, traffic or revenue.

## Technical approach
Use explicit source-derived page data, lazy-loaded per-page modules and a single legacy-path route for audited pages. Retain original CSS and DOM classes rather than applying a new design. Keep homepage markup generation and interaction repair within its existing route, as required by project conventions.