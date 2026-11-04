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
  const [sidebar, setSidebar] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [door, setDoor] = useState(false);
  const [viewerError, setViewerError] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const chatTrigger = useRef<HTMLElement | null>(null);
  const queryResult = legacySearch(data.items, query);

  useEffect(() => {
    setGreeting(legacyGreeting(new Date().getHours()));
    setYear(String(new Date().getFullYear()));
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const trigger = root.current?.querySelector<HTMLElement>('[data-resource-trigger][aria-expanded="true"]');
      setChat(false); setDropdown(null); setExpanded(new Set());
      if (trigger) trigger.focus();
      else if (root.current?.querySelector('.legacy-chat-open')) chatTrigger.current?.focus();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);

  useEffect(() => {
    if (!dropdown) return;
    const dismiss = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (target instanceof HTMLElement && target.closest('[data-resource-trigger]')) return;
      const panel = root.current?.querySelector('[data-resource-panel].legacy-panel-open');
      if (!panel?.parentElement?.contains(target)) setDropdown(null);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('focusin', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
    };
  }, [dropdown]);

  useEffect(() => {
    if (chat) root.current?.querySelector<HTMLElement>('#chat-input')?.focus();
  }, [chat]);

  const source = fragments[data.template] ?? '';
  const nodeText = (node: DOMNode): string => 'data' in node ? node.data : 'children' in node ? (node.children as DOMNode[]).map(nodeText).join(' ') : '';
  const groupKey = (node: Element): string => {
    const path: number[] = [];
    let current: Element | null = node;
    while (current?.parent) {
      path.unshift(current.parent.children.indexOf(current));
      current = current.parent instanceof Element ? current.parent : null;
    }
    return path.join('-');
  };
  const menuFor = (node: Element) => node.parent?.children.find((child): child is Element => child instanceof Element && (child.attribs['class'] ?? '').split(/\s+/).includes('dropdown-menu'));
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
    if (id === 'africavotes-chat') return <div {...props} role="dialog" aria-label="WhatsApp chat" className={`${classes} ${chat ? 'legacy-chat-open' : 'legacy-chat-closed'}`}>{children(node)}</div>;
    if (id === 'send-it') return <a {...props} href={`https://web.whatsapp.com/send?phone=+256750687790&text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label="Send message" onClick={event => { if (!message.trim()) event.preventDefault(); }}>{children(node)}</a>;
    if (classes.includes('close-chat') || classes.includes('africaVotesChat') || classes.includes('contactWhatsapp')) return <Button asChild variant="source" size="source" className={`${classes} legacy-control`}><a {...props} href="#" role="button" aria-label={classes.includes('close-chat') ? 'Close chat' : 'Show Chat'} aria-controls="africavotes-chat" aria-expanded={classes.includes('close-chat') ? undefined : chat} onKeyDown={event => { if (event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }} onClick={event => { event.preventDefault(); setDropdown(null); if (classes.includes('close-chat')) { setChat(false); chatTrigger.current?.focus(); } else { chatTrigger.current = event.currentTarget; setChat(value => !value); } }}>{children(node)}</a></Button>;
    if (classes.includes('rope')) return <Button {...props} variant="source" size="source" className={`${classes} legacy-control ${door ? 'legacy-rope-open' : ''}`} aria-label="Open library" onClick={() => setDoor(true)}>{children(node)}</Button>;
    if (classes.includes('leftcurtain') || classes.includes('rightcurtain')) return <div {...props} role="button" aria-label="Open library" tabIndex={door ? -1 : 0} onClick={() => setDoor(true)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setDoor(true); } }} className={`${classes} ${door ? 'legacy-door-open' : ''}`}>{children(node)}</div>;
    if (node.name === 'a' && classes.includes('open-close')) return <Button {...props} variant="source" size="source" className={`${classes} legacy-control`} aria-label="Toggle class menu" onClick={() => { if (window.innerWidth <= 575) { setMobileSidebar(value => !value); setSidebar(true); } else setSidebar(value => !value); }}>{children(node)}</Button>;
    if (classes.split(' ').includes('sidebar')) return <div {...props} className={`${classes} ${sidebar ? '' : 'legacy-sidebar-closed'}`}>{children(node)}</div>;
    if (classes.includes('store-product')) {
      if (!nodeText(node).toLowerCase().includes(query.toLowerCase())) return <></>;
      return <div {...props}>{children(node)}</div>;
    }
    const menu = menuFor(node);
    if (menu && node.attribs['data-toggle'] === 'dropdown' && node.parent instanceof Element) {
      const key = groupKey(node.parent);
      const menuId = `resource-menu-${data.template}-${key}`;
      return <Button {...props} variant="source" size="source" type="button" className={`${classes} legacy-control legacy-resource-trigger`} data-resource-trigger="" aria-expanded={dropdown === key} aria-controls={menuId} aria-haspopup="menu" onClick={() => { setChat(false); setDropdown(current => current === key ? null : key); }} onKeyDown={event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault(); setChat(false); setDropdown(key);
        const group = event.currentTarget.parentElement;
        requestAnimationFrame(() => {
          const links = group?.querySelectorAll<HTMLElement>('[data-resource-panel] a[href]');
          if (links?.length) links[event.key === 'ArrowUp' ? links.length - 1 : 0]?.focus();
        });
      }}>{children(node)}</Button>;
    }
    if (classes.split(/\s+/).includes('dropdown-menu') && node.parent instanceof Element) {
      const key = groupKey(node.parent);
      const open = dropdown === key;
      return <ul {...props} id={`resource-menu-${data.template}-${key}`} data-resource-panel="" hidden={!open} className={`${classes} ${open ? 'legacy-panel-open' : 'legacy-panel-closed'}`} onClick={event => { if (event.target instanceof HTMLElement && event.target.closest('a[href]')) setDropdown(null); }} onKeyDown={event => {
        const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href]'));
        const index = links.indexOf(document.activeElement as HTMLElement);
        const next = event.key === 'ArrowDown' ? (index + 1) % links.length : event.key === 'ArrowUp' ? (index - 1 + links.length) % links.length : event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1 : null;
        if (next !== null) { event.preventDefault(); links[next]?.focus(); }
      }}>{children(node)}</ul>;
    }
    const isToggle = node.name === 'a' && node.attribs['href'] === '#' && node.parent instanceof Element && node.parent.children.some(child => child instanceof Element && ['ul', 'div'].includes(child.name) && /collapse|nav-second-level|nav-third-level/.test(child.attribs['class'] ?? ''));
    if (isToggle) {
      const key = node.parent instanceof Element ? groupKey(node.parent) : nodeText(node);
      return <Button asChild variant="source" size="source" className={`${classes} legacy-control`}><a {...props} href="#" role="button" aria-expanded={expanded.has(key)} onClick={event => { event.preventDefault(); toggle(key); }}>{children(node)}</a></Button>;
    }
    if (node.name === 'a' && node.parent?.parent instanceof Element && (node.parent.parent.attribs['class'] ?? '').split(/\s+/).includes('dropdown-menu')) return <a {...props} role="menuitem">{children(node)}</a>;
    if ((classes.includes('dropdown-menu') || classes.includes('collapse') || classes.includes('nav-second-level') || classes.includes('nav-third-level')) && node.parent instanceof Element && expanded.has(groupKey(node.parent))) return <ul {...props} className={`${classes} legacy-panel-open`}>{children(node)}</ul>;
    if (node.name === 'button') return <Button {...props} variant="source" size="source" className={`${classes} legacy-control`}>{children(node)}</Button>;
    if (node.name === 'form') return <form {...props} onSubmit={event => event.preventDefault()}>{children(node)}</form>;
    return undefined;
  } };
  return <div ref={root} className={`legacy-page ${sidebar ? '' : 'legacy-sidebar-hidden'} ${mobileSidebar ? 'legacy-sidebar-mobile-open' : ''}`}><style>{fragments[data.styles]}</style><style>{repairs}</style>{parse(source, options)}</div>;
}