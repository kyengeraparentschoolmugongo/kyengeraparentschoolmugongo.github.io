# Fresh Teacher — Git-managed static library

## Editing document catalogs

Catalog content stays in static JSON committed to Git. No Cloud account, database, or admin service is required.

- `src/data/catalog/index.json`: school level → class → material → subject → exact original page address. Categories come from original page names; uncertain pages remain unclassified.
- `src/data/catalog/pages/resources/` and `pages/legacy/`: original page titles, descriptions and layout settings, plus an ordered `documentIds` list. Original address mappings remain in `src/data/resource-manifest.json` and `src/data/legacy/manifest.json`; never rename their keys to match a new hierarchy.
- `src/data/catalog/documents/`: shared records keyed by document ID. Each ID belongs in the shard named by its first two characters (for example, `ab123` in `ab.json`). Records keep `title`, `description`, `price`, and `pdfUrl`.

To edit a document, find its ID in the page's `documentIds`, then edit that record in its shard. A shared record edit appears on every referencing page. To add a document, choose an unused ID, add its record to the matching shard, then append the ID to the page list in the desired display order. For page-specific variations, create a new ID rather than changing a shared record. Update the hierarchy's count when adding/removing IDs. Search, batches and PDF viewing continue to use the original layouts.

Run `bun run test` to validate document references, original addresses, layouts and ordering. Preservation tests compare unchanged pages to audited snapshots; update intentional catalog changes and their concrete expectations together.

## Re-importing audited originals

`.site-import/catalog-source/` retains the original inline lists as migration evidence, not app-loaded data. `python3 scripts/normalize-catalogs.py` explicitly rebuilds normalized JSON from these snapshots and verified `recoveries.json`. **Do not run this after manually editing normalized catalogs:** it overwrites those edits. The legacy importer runs this conversion after a fresh audited import.

## Five catalog corrections

- Primary One Oral Literature: restored the one-record valid historical JSON; its original PDF was checked successfully.
- Senior Four Entreprenuership: preserved the misspelled original address and reused all 62 records from the correctly spelled Entrepreneurship catalog, without changing its layout. This supersedes the earlier estimate of 200 records.
- Senior Four Economics, Senior Two Chinese and Senior Two FN past papers: original lists remain absent. Their pages are preserved but require authoritative JSON lists or confirmed PDF memberships before cards can be populated. Neighboring lesson notes are not substituted.

`src/data/catalog/recoveries.json` records exact source evidence; `summary.json` records the conversion outcome. Older source-issue reports describe upstream failures, which may remain upstream even after a local recovery. This work does not push to the original GitHub repository, publish, change the existing live site, or guarantee search traffic/revenue.

## Project editor

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
