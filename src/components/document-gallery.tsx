import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, FileText, LayoutGrid, List, RotateCcw, ChevronLeft, ChevronRight, ArrowRight, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resourceTitle, type ResourceRecord } from '@/lib/resources';
import { pdfThumbnail, pdfPageCount } from '@/lib/pdf-thumbs';
import { fileSize, formatSize } from '@/lib/file-sizes';
import { Link, useLocation } from '@tanstack/react-router';
import { catalogWindow, type BrowsingContext } from '@/lib/document-browsing';
import { documentMetadata, documentSlug } from '@/lib/document-metadata';
import { searchTokens, suggestedSearch } from '@/lib/document-search';
import { DocumentDownload, DocumentShare } from '@/components/document-actions';
import { documentViewer } from '@/lib/document-viewer';
import { LogoLoader, useLoadingIndicator } from '@/components/logo-loader';
import styles from '@/styles/document-gallery.css?raw';

type Layout = 'grid' | 'list';
type SizeBand = 'all' | 'small' | 'medium' | 'large';
type Sort = 'source' | 'title-asc' | 'title-desc' | 'size-asc' | 'size-desc';

function extension(url: string) {
  const name = url.substring(url.lastIndexOf('/') + 1).split('?')[0] ?? '';
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.substring(dot + 1).toUpperCase() : 'FILE';
}

function sizeBand(bytes: number | null | undefined): SizeBand | null {
  if (bytes == null) return null;
  if (bytes < 1024 * 1024) return 'small';
  if (bytes < 5 * 1024 * 1024) return 'medium';
  return 'large';
}

function Thumb({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const viewer = documentViewer(url);
  const isPdf = viewer.kind === 'pdf';
  const pdfSrc = viewer.kind === 'pdf' ? viewer.src : url;
  const [pages, setPages] = useState<number>();
  const showLoading = useLoadingIndicator(!loaded && !failed && isPdf);
  useEffect(() => {
    setSrc(null); setFailed(false); setLoaded(false); setPages(undefined);
    if (!isPdf) return;
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        void pdfThumbnail(pdfSrc).then(result => {
          if (cancelled) return;
          setPages(pdfPageCount(pdfSrc));
          if (result) setSrc(result); else setFailed(true);
        }).catch(() => { if (!cancelled) setFailed(true); });
      }
    }, { rootMargin: '300px' });
    observer.observe(node);
    return () => { cancelled = true; observer.disconnect(); };
  }, [url, isPdf]);
  return <div ref={ref} className="dg-thumb">
    {src && !failed && <img src={src} alt="" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
    {showLoading && <div className="dg-thumb-loading"><LogoLoader label="Loading document thumbnail…" /></div>}
    {(failed || !isPdf) && <div className="dg-thumb-placeholder dg-thumb-failed"><FileText aria-hidden="true" size={40} strokeWidth={1.2} /></div>}
    <span className="dg-badge">{extension(url)}</span>
    {pages && <span className="dg-page-count">{pages} pages</span>}
  </div>;
}

export function DocumentGallery({ items, sourceItems = items, onView, query = '', onClear, onQueryChange, sourcePath, initialContext = {}, afterUrl }: { items: ResourceRecord[]; sourceItems?: ResourceRecord[]; onView?: (element: HTMLElement, item: ResourceRecord) => void; query?: string; onClear?: () => void; onQueryChange?: (value: string) => void; sourcePath?: string; initialContext?: BrowsingContext; afterUrl?: string }) {
  const location = useLocation();
  const source = sourcePath ?? location.pathname.replace(/^\//, '');
  const [layout, setLayout] = useState<Layout>(initialContext.layout === 'list' ? 'list' : 'grid');
  const [type, setType] = useState(initialContext.type ?? 'all');
  const [subject, setSubject] = useState(initialContext.subject ?? 'all');
  const [year, setYear] = useState(initialContext.year ?? 'all');
  const [term, setTerm] = useState(initialContext.term ?? 'all');
  const [kind, setKind] = useState(initialContext.kind ?? 'all');
  const [size, setSize] = useState<SizeBand>(['small', 'medium', 'large'].includes(initialContext.size ?? '') ? initialContext.size as SizeBand : 'all');
  const [sort, setSort] = useState<Sort>(['title-asc', 'title-desc', 'size-asc', 'size-desc'].includes(initialContext.sort ?? '') ? initialContext.sort as Sort : 'source');
  const initialPage = initialContext.page ?? (afterUrl ? Math.floor(Math.max(0, items.findIndex(item => item.pdfUrl === afterUrl)) / 12) + 1 : 1);
  const [page, setPage] = useState(initialPage);
  const [jump, setJump] = useState(String(initialPage));
  const [continueAfter, setContinueAfter] = useState(afterUrl);
  const previousFilters = useRef({ items, type, subject, year, term, kind, size, sort });
  const [sizes, setSizes] = useState<Record<string, number | null>>({});
  const [backToTop, setBackToTop] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const metadata = useMemo(() => new Map(items.map(item => [item, documentMetadata(item)])), [items]);
  const options = (field: 'subject' | 'year' | 'term' | 'kind') => Array.from(new Set(items.map(item => metadata.get(item)?.[field]).filter((value): value is string => Boolean(value)))).sort();
  const subjects = options('subject');
  const types = useMemo(() => Array.from(new Set(items.map(item => extension(item.pdfUrl)))).sort(), [items]);
  const filtered = useMemo(() => {
    let list = items.filter(item => {
      const meta = metadata.get(item);
      return (type === 'all' || extension(item.pdfUrl) === type) && (subject === 'all' || meta?.subject === subject) &&
        (year === 'all' || meta?.year === year) && (term === 'all' || meta?.term === term) &&
        (kind === 'all' || meta?.kind === kind) && (size === 'all' || sizeBand(sizes[item.pdfUrl]) === size);
    });
    if (sort !== 'source') list = [...list].sort((a, b) => {
      if (sort === 'title-asc') return resourceTitle(a).localeCompare(resourceTitle(b));
      if (sort === 'title-desc') return resourceTitle(b).localeCompare(resourceTitle(a));
      const av = sizes[a.pdfUrl], bv = sizes[b.pdfUrl];
      if (av == null) return bv == null ? 0 : 1;
      if (bv == null) return -1;
      return sort === 'size-asc' ? av - bv : bv - av;
    });
    return list;
  }, [items, metadata, type, subject, year, term, kind, size, sizes, sort]);
  const { totalPages, currentPage, items: pageItems } = catalogWindow(filtered, page, continueAfter);
  const search: BrowsingContext = { source, query, page: currentPage, type, subject, year, term, kind, size, sort, layout };
  useEffect(() => {
    const previous = previousFilters.current;
    previousFilters.current = { items, type, subject, year, term, kind, size, sort };
    if (previous.items === items && previous.type === type && previous.subject === subject && previous.year === year && previous.term === term && previous.kind === kind && previous.size === size && previous.sort === sort) return;
    setPage(1); setJump('1'); setContinueAfter(undefined);
  }, [items, type, subject, year, term, kind, size, sort]);
  useEffect(() => {
    const scroll = () => setBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', scroll, { passive: true }); scroll();
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const targets = size !== 'all' || sort.startsWith('size') ? items : pageItems;
    void (async () => {
      for (let i = 0; i < targets.length; i += 4) {
        if (cancelled) return;
        const batch = targets.slice(i, i + 4);
        const values = await Promise.all(batch.map(item => fileSize(item.pdfUrl)));
        if (!cancelled) setSizes(previous => { const next = { ...previous }; batch.forEach((item, index) => { next[item.pdfUrl] = values[index] ?? null; }); return next; });
      }
    })();
    return () => { cancelled = true; };
  }, [items, currentPage, size, sort, subject, year, term, kind, type]);
  const reset = () => { setType('all'); setSubject('all'); setYear('all'); setTerm('all'); setKind('all'); setSize('all'); onClear?.(); };
  const go = (value: number) => { const next = Math.max(1, Math.min(totalPages, value || 1)); setContinueAfter(undefined); setPage(next); setJump(String(next)); top.current?.scrollIntoView({ block: 'start' }); };
  const suggestions = filtered.length === 0 && query ? suggestedSearch(sourceItems, query) : [];
  const select = (label: string, value: string, change: (value: string) => void, values: string[]) => <label className="dg-field">{label}<select value={value} onChange={event => change(event.target.value)}><option value="all">All {label.toLowerCase()}s</option>{values.map(option => <option key={option}>{option}</option>)}</select></label>;
  return <div className="dg" ref={top}>
    <style>{styles}</style>
    <div className="dg-toolbar">
      <div className="dg-toolbar-row"><p className="dg-count" aria-live="polite">{filtered.length} documents{query ? ` for “${query}”` : ''}</p>
        <div className="dg-layout-toggle" role="group" aria-label="Choose layout">{(['list', 'grid'] as const).map(mode => <Button variant="source" size="source" key={mode} className={layout === mode ? 'dg-active' : ''} aria-pressed={layout === mode} aria-label={`${mode === 'list' ? 'List' : 'Grid'} view`} title={`${mode} view`} onClick={() => setLayout(mode)}>{mode === 'list' ? <List size={20} /> : <LayoutGrid size={20} />}</Button>)}</div>
      </div>
      <div className="dg-chips" role="group" aria-label="Quick subject filters"><Button variant="source" size="source" className={subject === 'all' ? 'dg-chip dg-selected' : 'dg-chip'} aria-pressed={subject === 'all'} onClick={() => setSubject('all')}>All subjects</Button>{subjects.map(value => <Button variant="source" size="source" key={value} className={subject === value ? 'dg-chip dg-selected' : 'dg-chip'} aria-pressed={subject === value} onClick={() => setSubject(value)}>{value}</Button>)}</div>
      <div className="dg-filters">
        {select('Type', type, setType, types)}
        <label className="dg-field">Size<select value={size} onChange={event => setSize(event.target.value as SizeBand)}><option value="all">All sizes</option><option value="small">Under 1 MB</option><option value="medium">1–5 MB</option><option value="large">5 MB and over</option></select></label>
        <label className="dg-field">Sort<select value={sort} onChange={event => setSort(event.target.value as Sort)}><option value="source">{query ? 'Best match' : 'Original order'}</option><option value="title-asc">Title A–Z</option><option value="title-desc">Title Z–A</option><option value="size-asc">Smallest first</option><option value="size-desc">Largest first</option></select></label>
        <Button variant="source" size="source" className="dg-chip" onClick={reset}><RotateCcw size={15} /> Reset</Button>
      </div>
    </div>
    {pageItems.length === 0 ? <div className="dg-empty" role="status">{filtered.length > 0 ? <p>{currentPage < totalPages ? 'Continue to the next page for more documents.' : 'You have reached the end of this catalog.'}</p> : <><p>No matching documents.</p>{suggestions.length > 0 && <div>Did you mean? {suggestions.map(value => <Button key={value} variant="source" size="source" className="dg-chip" onClick={() => onQueryChange?.(value)}>{value}</Button>)}</div>}<Button variant="source" size="source" className="dg-chip" onClick={reset}>Clear filters</Button></>}</div> :
      <div className={`dg-cards dg-${layout}`}>{pageItems.map((item, index) => {
        const meta = metadata.get(item);
        return <article className="dg-card" key={`${item.pdfUrl}-${index}`}><Link to="/doc/$slug" params={{ slug: documentSlug(item) }} search={search} className="dg-thumb-link" aria-label={`Open ${resourceTitle(item)}`}><Thumb url={item.pdfUrl} /></Link><div className="dg-card-body">
          <h3 className="dg-card-title"><Link to="/doc/$slug" params={{ slug: documentSlug(item) }} search={search}><HighlightedTitle item={item} query={query} /></Link></h3>
          {item.description && <p className="dg-card-subject">{item.description}</p>}
          <div className="dg-tags">{[meta?.subject, meta?.kind, meta?.year, meta?.term].filter(Boolean).map(tag => <span key={tag}>{tag}</span>)}</div>
          <p className="dg-card-meta">{sizes[item.pdfUrl] != null && <span className="dg-card-size">{formatSize(sizes[item.pdfUrl] ?? 0)}</span>}<span className="dg-card-price"><del>{item.price}</del><strong className="dg-free">FREE</strong></span></p>
          <div className="dg-card-actions">{onView && documentViewer(item.pdfUrl).kind === 'pdf' ? <Button variant="source" size="source" className="dg-action dg-view" onClick={event => onView(event.currentTarget, item)}><BookOpen size={16} /> View</Button> : <Button asChild variant="source" size="source" className="dg-action dg-view"><Link to="/doc/$slug" params={{ slug: documentSlug(item) }} search={search}><BookOpen size={16} /> View</Link></Button>}<DocumentDownload item={item} /><DocumentShare item={item} /></div>
        </div></article>;
      })}</div>}
    {filtered.length > 0 && <nav className="dg-pagination" aria-label="Document pages"><Button variant="source" size="source" className="dg-icon" title="Previous page" aria-label="Previous page" disabled={currentPage === 1} onClick={() => go(currentPage - 1)}><ChevronLeft /></Button>
      {Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])).filter(value => value > 0 && value <= totalPages).sort((a, b) => a - b).map((value, index, pages) => <Fragment key={value}>{index > 0 && value - (pages[index - 1] ?? 0) > 1 && <span>…</span>}<Button variant="source" size="source" className={`dg-icon ${value === currentPage ? 'dg-selected' : ''}`} aria-label={`Page ${value}`} aria-current={value === currentPage ? 'page' : undefined} onClick={() => go(value)}>{value}</Button></Fragment>)}
      <Button variant="source" size="source" className="dg-icon" title="Next page" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => go(currentPage + 1)}><ChevronRight /></Button>
      <form onSubmit={event => { event.preventDefault(); go(Number(jump)); }}><label>Go to page <input type="number" min="1" max={totalPages} value={jump} onChange={event => setJump(event.target.value)} aria-label="Go to page" /></label><Button variant="source" size="source" className="dg-icon" type="submit" aria-label="Jump to page" title="Jump to page"><ArrowRight /></Button></form><span>Page {currentPage} of {totalPages}</span>
    </nav>}
    {backToTop && <Button variant="source" size="source" className="dg-back-top dg-icon" aria-label="Back to top" title="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><ArrowUp /></Button>}
  </div>;
}

function HighlightedTitle({ item, query }: { item: ResourceRecord; query: string }) {
  const tokens = searchTokens(query);
  return <>{resourceTitle(item).split(/(\s+)/).map((word, index) => tokens.length > 0 && searchTokens(word).some(token => tokens.some(term => token === term || (term.length >= 3 && token.startsWith(term)))) ? <mark key={index}>{word}</mark> : word)}</>;
}
