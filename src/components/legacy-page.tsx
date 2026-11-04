import { useEffect, useRef, useState } from 'react';
import parse, { Element, domToReact, attributesToProps, type HTMLReactParserOptions, type DOMNode } from 'html-react-parser';
import { Button } from '@/components/ui/button';
import { DocumentGallery } from '@/components/document-gallery';
import { type ResourceRecord } from '@/lib/resources';
import { legacyGreeting, legacySearch, type LegacyPageData } from '@/lib/legacy-pages';
import repairs from '@/styles/legacy-repairs.css?raw';
import { DocumentSearchInput } from '@/components/document-search-input';

export function LegacyPage({ data, fragments }: { data: LegacyPageData; fragments: Record<string, string> }) {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState(false);
  const [message, setMessage] = useState('');
  const [greeting, setGreeting] = useState('');
  const [year, setYear] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dropdown, setDropdown] = useState<string | null>(null);
  const dropdownTrigger = useRef<HTMLElement>(null);
  const [sidebar, setSidebar] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [door, setDoor] = useState(false);
  const [viewerError, setViewerError] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const queryResult = legacySearch(data.items, query);

  useEffect(() => {
    setGreeting(legacyGreeting(new Date().getHours()));
    setYear(String(new Date().getFullYear()));
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setChat(false); setExpanded(new Set()); setDropdown(null); dropdownTrigger.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);

  useEffect(() => {
    if (dropdown === null) return;
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      const group = dropdownTrigger.current?.parentElement;
      // Switching is handled atomically by click; do not move the pressed target mid-tap.
      if (target instanceof window.Element && target.closest('.legacy-dropdown-trigger')) return;
      if (!(target instanceof Node) || !group?.contains(target)) setDropdown(null);
    };
    document.addEventListener('pointerdown', dismiss, true);
    return () => document.removeEventListener('pointerdown', dismiss, true);
  }, [dropdown]);

  const source = fragments[data.template] ?? '';
  const nodeText = (node: DOMNode): string => 'data' in node ? node.data : 'children' in node ? (node.children as DOMNode[]).map(nodeText).join(' ') : '';
  const groupKey = (node: Element) => nodeText(node).trim();
  const dropdownKeys = new WeakMap<Element, string>();
  let dropdownIndex = 0;
  const dropdownKey = (node: Element) => {
    const existing = dropdownKeys.get(node);
    if (existing !== undefined) return existing;
    const key = `dropdown-${dropdownIndex++}`;
    dropdownKeys.set(node, key);
    return key;
  };
  const toggle = (key: string) => setExpanded(current => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  const view = async (element: HTMLElement, item: ResourceRecord) => {
    try {
      setViewerError('');
      const { openResourceViewer } = await import('@/lib/resource-viewer');
      await openResourceViewer(element, item, data.mode === 'infinite');
    } catch { setViewerError('The file viewer could not load. You can still download the file.'); }
  };
  const children = (node: Element) => domToReact(node.children as DOMNode[], options);
  const cards = <>
    {data.missingData
      ? <p role="status">This page’s original file list is currently unavailable.</p>
      : <DocumentGallery items={queryResult} sourceItems={data.items} query={query} onQueryChange={setQuery} onClear={() => setQuery('')} onView={(element, item) => void view(element, item)} />}
    {viewerError && <p role="alert">{viewerError}</p>}
  </>;
  const options: HTMLReactParserOptions = { replace(node) {
    if (!(node instanceof Element)) return;
    const props = attributesToProps(node.attribs);
    const id = node.attribs['id'];
    const classes = node.attribs['class'] ?? '';
    if (node.name === 'div' && node.children.some(child => child instanceof Element && child.attribs['id'] === 'jumpToPage')) return <></>;
    if ((node.name === 'nav' && classes.includes('navbar')) || classes.split(' ').includes('sidebar')) return <></>;
    if (node.name === 'fresh-fragment') return <>{parse(fragments[node.attribs['data-key'] ?? ''] ?? '', options)}</>;
    if (id === 'searchInput' || id === 'search') return <DocumentSearchInput id={id} query={query} onChange={setQuery} />;
    if (id === 'cardsContainer') return <div {...props}>{cards}</div>;
    if (data.mode === 'paginated' && classes === 'row') return <div {...props}>{cards}</div>;
    if (id === 'noMoreResults' || id === 'previousPageBtn' || id === 'nextPageBtn' || id === 'pageNumbers' || id === 'jumpToPage' || id === 'jumpButton') return <></>;
    if (id === 'currentYear') return <span {...props}>{year}</span>;
    if (id === 'greeting') return <div {...props}>{greeting}</div>;
    if (id === 'chat-input') return <textarea {...props} aria-label="Message" value={message} onChange={event => setMessage(event.target.value)} />;
    if (id === 'africavotes-chat') return <div {...props} className={`${classes} ${chat ? 'legacy-chat-open' : 'legacy-chat-closed'}`}>{children(node)}</div>;
    if (id === 'send-it') return <a {...props} href={`https://web.whatsapp.com/send?phone=+256750687790&text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label="Send message" onClick={event => { if (!message.trim()) event.preventDefault(); }}>{children(node)}</a>;
    if (classes.includes('close-chat') || classes.includes('africaVotesChat') || classes.includes('contactWhatsapp')) return <Button asChild variant="source" size="source" className={`${classes} legacy-control`}><a {...props} href="#" role="button" aria-label={classes.includes('close-chat') ? 'Close chat' : 'Show Chat'} onClick={event => { event.preventDefault(); setChat(value => classes.includes('close-chat') ? false : !value); }}>{children(node)}</a></Button>;
    if (classes.includes('rope')) return <Button {...props} variant="source" size="source" className={`${classes} legacy-control ${door ? 'legacy-rope-open' : ''}`} aria-label="Open library" onClick={() => setDoor(true)}>{children(node)}</Button>;
    if (classes.includes('leftcurtain') || classes.includes('rightcurtain')) return <div {...props} role="button" aria-label="Open library" tabIndex={door ? -1 : 0} onClick={() => setDoor(true)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setDoor(true); } }} className={`${classes} ${door ? 'legacy-door-open' : ''}`}>{children(node)}</div>;
    if (node.name === 'a' && classes.includes('open-close')) return <Button {...props} variant="source" size="source" className={`${classes} legacy-control`} aria-label="Toggle class menu" onClick={() => { if (window.innerWidth <= 575) { setMobileSidebar(value => !value); setSidebar(true); } else setSidebar(value => !value); }}>{children(node)}</Button>;
    if (classes.split(' ').includes('sidebar')) return <div {...props} className={`${classes} ${sidebar ? '' : 'legacy-sidebar-closed'}`}>{children(node)}</div>;
    if (classes.includes('store-product')) {
      if (!nodeText(node).toLowerCase().includes(query.toLowerCase())) return <></>;
      return <div {...props}>{children(node)}</div>;
    }
    if (node.attribs['data-toggle'] === 'dropdown' && node.parent instanceof Element) {
      const key = dropdownKey(node.parent);
      const activate = (element: HTMLElement) => { dropdownTrigger.current = element; setDropdown(current => current === key ? null : key); };
      if (node.name === 'button') return <Button {...props} type="button" variant="source" size="source" className={`${classes} legacy-control legacy-dropdown-trigger`} aria-expanded={dropdown === key} onClick={event => activate(event.currentTarget)}>{children(node)}</Button>;
      return <Button asChild variant="source" size="source"><a {...props} className={`${classes} legacy-control legacy-dropdown-trigger`} href="#" role="button" aria-expanded={dropdown === key} onClick={event => { event.preventDefault(); activate(event.currentTarget); }} onKeyDown={event => { if (event.key === ' ') { event.preventDefault(); activate(event.currentTarget); } }}>{children(node)}</a></Button>;
    }
    if (classes.split(' ').includes('dropdown-menu') && node.parent instanceof Element) {
      const opened = dropdown === dropdownKey(node.parent);
      return <ul {...props} hidden={!opened} className={`${classes} ${opened ? 'legacy-panel-open' : 'legacy-dropdown-closed'}`} onClick={event => { if (event.target instanceof window.Element && event.target.closest('a[href]')) setDropdown(null); }}>{children(node)}</ul>;
    }
    const isToggle = node.name === 'a' && node.attribs['href'] === '#' && node.parent instanceof Element && node.parent.children.some(child => child instanceof Element && ['ul', 'div'].includes(child.name));
    if (isToggle) {
      const key = node.parent instanceof Element ? groupKey(node.parent) : nodeText(node);
      return <Button asChild variant="source" size="source" className={`${classes} legacy-control`}><a {...props} href="#" role="button" aria-expanded={expanded.has(key)} onClick={event => { event.preventDefault(); toggle(key); }}>{children(node)}</a></Button>;
    }
    if ((classes.includes('dropdown-menu') || classes.includes('collapse') || classes.includes('nav-second-level') || classes.includes('nav-third-level')) && node.parent instanceof Element && expanded.has(groupKey(node.parent))) return <ul {...props} className={`${classes} legacy-panel-open`}>{children(node)}</ul>;
    if (node.name === 'button') return <Button {...props} variant="source" size="source" className={`${classes} legacy-control`}>{children(node)}</Button>;
    if (node.name === 'form') return <form {...props} onSubmit={event => event.preventDefault()}>{children(node)}</form>;
    return undefined;
  } };
  return <div ref={root} className={`legacy-page ${sidebar ? '' : 'legacy-sidebar-hidden'} ${mobileSidebar ? 'legacy-sidebar-mobile-open' : ''}`}><style>{fragments[data.styles]}</style><style>{repairs}</style>{parse(source, options)}</div>;
}