import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentDownload, DocumentShare } from './document-actions';
import { DocumentGallery } from './document-gallery';
import { documentMetadata } from '@/lib/document-metadata';
import { filterResources, resourceTitle, type ResourceRecord } from '@/lib/resources';
import type { DocumentData } from '@/lib/document-catalog';
import { fileSize, formatSize } from '@/lib/file-sizes';
import { DocumentViewer } from './document-viewer';
import { DocumentSearchInput } from './document-search-input';
import type { BrowsingContext } from '@/lib/document-browsing';

export function DocumentDetail({ data, context }: { data: DocumentData; context: BrowsingContext }) {
  const [query, setQuery] = useState(context.query ?? '');
  const [bytes, setBytes] = useState<number | null>(null);
  const [viewerError, setViewerError] = useState('');
  const meta = documentMetadata(data.item);
  useEffect(() => { let cancelled = false; void fileSize(data.item.pdfUrl).then(value => { if (!cancelled) setBytes(value); }); return () => { cancelled = true; }; }, [data.item.pdfUrl]);
  const view = async (element: HTMLElement, item: ResourceRecord) => {
    try {
      setViewerError('');
      const { openResourceViewer } = await import('@/lib/resource-viewer');
      await openResourceViewer(element, item, false);
    } catch { setViewerError('The file viewer could not load. You can still download the file.'); }
  };
  return <main className="document-detail"><Button asChild variant="source" size="source" className="document-back"><Link to="/$" params={{ _splat: data.path }}><ArrowLeft size={18} />{data.category}</Link></Button>
    <section className="document-overview"><p className="document-eyebrow">Fresh Teacher · {data.item.description}</p><h1>{resourceTitle(data.item)}</h1><dl>{Object.entries({ Subject: meta.subject, Class: meta.level, Year: meta.year, Term: meta.term, Assessment: meta.kind, Size: bytes != null ? formatSize(bytes) : undefined }).filter(([, value]) => Boolean(value)).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="dg-card-actions"><DocumentDownload item={data.item} /><DocumentShare item={data.item} /><a className="document-original" href={data.item.pdfUrl} target="_blank" rel="noopener noreferrer">Open original file</a></div>
    </section>
    <DocumentViewer key={data.item.pdfUrl} item={data.item} />
    {data.related.length > 0 && <section className="document-related"><h2>Related documents</h2><DocumentSearchInput query={query} onChange={setQuery} /><DocumentGallery items={filterResources(data.related, query)} sourceItems={data.related} sourcePath={data.path} query={query} onQueryChange={setQuery} onClear={() => setQuery('')} initialContext={context} afterUrl={data.item.pdfUrl} onView={(element, item) => void view(element, item)} />{viewerError && <p role="alert">{viewerError}</p>}</section>}
  </main>;
}