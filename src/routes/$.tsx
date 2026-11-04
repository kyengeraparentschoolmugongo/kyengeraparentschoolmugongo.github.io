import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { ResourcePage } from '@/components/resource-page';
import manifest from '@/data/resource-manifest.json';
import type { ResourcePageData } from '@/lib/resources';
import { LegacyPage } from '@/components/legacy-page';
import legacyManifest from '@/data/legacy/manifest.json';
import type { LegacyPageData } from '@/lib/legacy-pages';
import { resolveDocuments, type DocumentShard, type StaticPage } from '@/lib/static-catalog';

const pages = import.meta.glob<{ default: StaticPage<ResourcePageData> }>('../data/catalog/pages/resources/*.json');
const legacyPages = import.meta.glob<{ default: StaticPage<LegacyPageData> }>('../data/catalog/pages/legacy/*.json');
const documentFiles = import.meta.glob<{ default: DocumentShard }>('../data/catalog/documents/*.json');
const fragmentFiles = import.meta.glob<{ default: string }>('../data/legacy/fragments/*.json');

async function hydratePage<T extends { items: import('@/lib/resources').ResourceRecord[] }>(page: StaticPage<T>) {
  const items = await resolveDocuments(page.documentIds, async key => {
    const load = documentFiles[`../data/catalog/documents/${key}.json`];
    if (!load) throw new Error(`Missing static document shard: ${key}`);
    return (await load()).default;
  });
  return { ...page, items };
}

export const Route = createFileRoute('/$')({
  loader: async ({ params }) => {
    const path = (params._splat ?? '').replace(/\/+$/, '');
    if (path === 'index.html') throw redirect({ to: '/', statusCode: 301 });
    const entry = manifest[path as keyof typeof manifest];
    if (!entry) {
      const legacy = legacyManifest[path as keyof typeof legacyManifest];
      if (!legacy) throw notFound();
      const load = legacyPages[`../data/catalog/pages/legacy/${legacy.data}`];
      if (!load) throw notFound();
      const data = await hydratePage<LegacyPageData>((await load()).default);
      const fragments: Record<string, string> = {};
      const read = async (key: string): Promise<void> => {
        if (key in fragments) return;
        const get = fragmentFiles[`../data/legacy/fragments/${key}.json`];
        if (!get) throw notFound();
        const text = (await get()).default;
        fragments[key] = text;
        await Promise.all(Array.from(text.matchAll(/data-key="([^"]+)"/g), match => read(match[1] ?? '')));
      };
      await Promise.all([read(data.template), read(data.styles)]);
      return { path, kind: 'legacy' as const, data, fragments };
    }
    const load = pages[`../data/catalog/pages/resources/${entry.data}`];
    if (!load) throw notFound();
    return { path, kind: 'resource' as const, data: await hydratePage<ResourcePageData>((await load()).default) };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.data.title ?? 'Resource unavailable | Fresh Teacher';
    const description = loaderData?.data.description ?? 'The requested Fresh Teacher resource page is unavailable.';
    return { meta: [
      { title }, { name: 'description', content: description },
      { property: 'og:title', content: title }, { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
      ...(!loaderData ? [{ name: 'robots', content: 'noindex' }] : []),
    ], links: loaderData ? (loaderData.kind === 'legacy' ? loaderData.data.links : ['bootstrap.min.css', 'font-awesome.css', 'flipbook.style.css', 'footer.css'].map(file => `/resource-source/css/${file}`)).map(href => ({ rel: 'stylesheet', href })) : [] };
  },
  component: LegacyResource,
});

function LegacyResource() {
  const result = Route.useLoaderData();
  if (result.kind === 'legacy') return <LegacyPage key={result.path} data={result.data} fragments={result.fragments} />;
  return <ResourcePage key={result.path} data={result.data} />;
}