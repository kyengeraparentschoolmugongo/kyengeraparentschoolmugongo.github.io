# Remaining legacy import

Imported all 596 remaining root HTML source pages, preserving their case-sensitive filenames and spaces through the existing legacy-path route. Together with the original 52 resources and homepage, all 649 audited addresses return successful server-rendered content and metadata. index.html follows a permanent redirect to the existing homepage.

470 infinite-scroll catalogs retain the original 12-item batches and filename-only search. Five additional paginated catalogs preserve 42-item pages. 121 static pages retain original shelves, class menus, legal content, and movie selectors. Exact identical source bodies, headers, footers, chat markup, and styles are content-addressed shared fragments, not hundreds of route components. Added 22,777 source resource records.

## Verification
- All 649 audited source addresses fetched successfully with server-rendered metadata.
- Eight regression/rule tests passed; latest observed build was successful.
- Representative desktop 1280x1800 and phone 390x844 checks cover shelf, catalog, class dropdown, policy, chat and no-results states; no page errors after normalization of invalid source HTML.
- Real Primary Five English PDF opened and rendered in the original flipbook canvas; original print/page-export controls retained for infinite catalogs.
- Original source CSS and local hosted asset pointers preserved. Source preloader dismissed; legacy invalid nesting normalized rather than executing inline scripts.

## Source-side limitations
Five catalogs are missing or invalid in the original repository: PrimaryOneOralLiteratureLessonNotes.json contains HTML rather than records; SeniorFourEconomicsPastPapers.json, SeniorFourEntreprenuershipPastPapers.json, SeniorTwoChinesePastPapers.json and SeniorTwoFNPastPapers.json are missing. Their page addresses work and show an honest unavailable-list state; no replacement records were invented.

85 original CSS/media references are unavailable, mostly unused legacy icon-font formats, plus a few background/avatar images. Detailed URLs and reasons are recorded in src/data/legacy/source-issues.json. Tested pages show no broken images, but exhaustive visual comparison of all 596 pages was not performed.

Original links to files and destinations absent from the repository remain preserved; PDF files are still served from the original host. APK, games and movie destinations outside this HTML inventory are not newly supplied by this import. Advertising and analytics remain disabled in preview. No domain change or publishing was performed; SEO, consent, AdSense authorization and live migration validation remain required before cutover.