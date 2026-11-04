# First appearance-preserving consolidation

## Completed
- Inventoried 649 original HTML pages. Selected 52 pages with identical normalized body structure; two other pagination pages have different structures and were excluded.
- One shared resource renderer now handles those 52 exact, case-sensitive original HTML paths, backed by 7,059 source records in lazy per-page modules. No filename inference or URL renaming.
- Reduced the homepage from 2,733 to 878 lines by mapping 464 repeated leaf links and four shelves. Original labels, destinations, CSS, assets and React interaction repair remain in the homepage route.
- Preserved original resource Bootstrap/CSS, fonts, images, and on-demand flipbook viewer. Download links retain their original source PDF URLs.
- Added concrete regression tests for original addresses, PDF destination/order, 42-item pagination and case-insensitive search; all five tests including routing pass.
- All 52 resource URLs return HTTP 200 with server-rendered cards and metadata. Representative desktop 1280×1800 and phone 390×844 checks passed for pagination, filtering, no-results, real PDF rendering and no horizontal overflow or page errors.
- Original homepage door, four shelves, nested nursery menus, header panels and WhatsApp chat regression checks pass at both sizes.
- Verified original publisher declaration in public/ads.txt; source AdSense, Analytics and Tag Manager identifiers are retained in site-tracking.json and disabled. No publication or live-site changes.

## Still required before any live migration
- 596 other HTML pages remain unimported (649 total minus homepage and 52 resources). These include all class-book destinations and most homepage subject links. They retain their original addresses, but return 404 in this preview. Do not switch traffic to this incomplete preview.
- Differently structured page families need their own audited templates and source data before full migration. The original class/subject navigation must be verified end-to-end after those imports.
- Most current homepage menu destinations belong to those other families; new resource pages were tested directly at their original addresses, not through a fabricated substitute menu URL.
- PDF links still depend on the original GitHub-hosted files. A real PDF loaded in the original flipbook viewer; individual downloads across all records were not exhaustively tested or mirrored.
- The APK download and earlier homepage import limitations remain.
- AdSense domain authorization, consent requirements, actual ad serving, canonical URLs, sitemap/robots, Search Console coverage and production analytics require validation before a domain change. ads.txt alone does not establish authorization.
- SSR and preserved paths reduce migration risk but do not guarantee rankings, traffic, revenue or pixel-identical output on every device.

Evidence: /tmp/browser/refactor/verify.log, desktop/phone screenshots and source comparison; homepage regression log in /tmp/browser/refactor/home-regression.log.