import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { BookOpen, ChevronDown, ChevronRight, Download, Home, Menu, X } from 'lucide-react';
import adminPhoto from '@/assets/admin-photo.jpg.asset.json';
import { Button } from '@/components/ui/button';
import menu from '@/data/navigation/menu.json';

interface MenuItem { label: string; href: string; children?: MenuItem[] }

function MenuBranch({ items, pathname, depth = 0 }: { items: MenuItem[]; pathname: string; depth?: number }) {
  return <ul className={`library-menu-list library-menu-depth-${Math.min(depth, 3)}`}>
    {items.map((item, index) => <MenuEntry key={`${item.href}-${index}`} item={item} pathname={pathname} depth={depth} />)}
  </ul>;
}

function containsPath(item: MenuItem, pathname: string): boolean {
  return item.href === pathname || (item.children?.some(child => containsPath(child, pathname)) ?? false);
}

function MenuEntry({ item, pathname, depth }: { item: MenuItem; pathname: string; depth: number }) {
  const active = containsPath(item, pathname);
  const [expanded, setExpanded] = useState(active);
  useEffect(() => { if (active) setExpanded(true); }, [active]);
  return <li>
    {item.children ? <>
      <Button variant="source" size="source" className="library-menu-control" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>
        {depth === 0 && <BookOpen aria-hidden="true" />}<span>{item.label}</span>{expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
      </Button>
      {expanded && <MenuBranch items={item.children} pathname={pathname} depth={depth + 1} />}
    </> : <Button asChild variant="source" size="source" className={`library-menu-control ${item.href === pathname ? 'library-menu-active' : ''}`}>
      <a href={item.href} aria-current={item.href === pathname ? 'page' : undefined} {...(item.href.endsWith('.apk') ? { download: true } : {})}>
        {depth === 0 && <Download aria-hidden="true" />}<span>{item.label}</span>
      </a>
    </Button>}
  </li>;
}

export function LibraryShell({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: location => location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopClosed, setDesktopClosed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => { setIsMobile(media.matches); setMobileOpen(false); };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);
  useEffect(() => {
    if (!profileOpen) return;
    const close = (e: MouseEvent) => { if (!(e.target as Element).closest('.library-appbar-actions')) setProfileOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [profileOpen]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileOpen) { setMobileOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [mobileOpen]);
  const toggle = () => {
    if (window.matchMedia('(max-width: 767px)').matches) setMobileOpen(value => !value);
    else setDesktopClosed(value => !value);
  };
  return <div className={`library-shell ${mobileOpen ? 'library-mobile-open' : ''} ${desktopClosed ? 'library-desktop-closed' : ''}`}>
    <header className="library-appbar">
      <Button ref={trigger} variant="source" size="source" className="library-icon-control" aria-label="Toggle class menu" aria-controls="library-navigation" aria-expanded={isMobile ? mobileOpen : !desktopClosed} onClick={toggle} title="Class menu"><Menu /></Button>
      <Button asChild variant="source" size="source" className="library-brand"><a href="/"><span>Fresh Teacher's Platform</span><span className="library-brand-caption">Since COVID-19</span></a></Button>
      <div className="library-appbar-actions">
        <Button variant="source" size="source" className="library-avatar" aria-label="Admin's contact" aria-expanded={profileOpen} onClick={() => setProfileOpen(v => !v)}>
          <img src={adminPhoto.url} alt="Mutumba Jesse Paul" />
        </Button>
        {profileOpen && <div className="library-profile" role="dialog" aria-label="Admin's contact">
          <Button variant="source" size="source" className="library-profile-close" aria-label="Close contact card" onClick={() => setProfileOpen(false)}><X /></Button>
          <img src={adminPhoto.url} alt="" />
          <h2>Admin's Contact:</h2>
          <p className="library-profile-name">Mutumba Jesse Paul</p>
          <p><a href="tel:+256750687790">+256750687790</a> / <a href="tel:+256786812837">+256786812837</a></p>
          <p><a href="mailto:freshteacheruganda256@gmail.com">freshteacheruganda256@gmail.com</a></p>
        </div>}
      </div>
    </header>
    {mobileOpen && <Button variant="source" size="source" className="library-menu-backdrop" aria-label="Close class menu" onClick={() => setMobileOpen(false)} />}
    <aside id="library-navigation" className="library-sidenav" aria-label="Class navigation">
      <div className="library-sidenav-heading"><span>Library</span><Button variant="source" size="source" className="library-mobile-close library-icon-control" aria-label="Close class menu" onClick={() => { setMobileOpen(false); trigger.current?.focus(); }}><X /></Button></div>
      <nav aria-label="Library navigation">
        <Button asChild variant="source" size="source" className={`library-menu-control ${pathname === '/' ? 'library-menu-active' : ''}`}><a href="/" aria-current={pathname === '/' ? 'page' : undefined}><Home /><span>Library home</span></a></Button>
        <MenuBranch items={menu} pathname={pathname} />
      </nav>
    </aside>
    <main className="library-content">{children}</main>
  </div>;
}