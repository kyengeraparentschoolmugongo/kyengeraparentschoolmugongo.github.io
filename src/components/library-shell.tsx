import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { BookOpen, ChevronDown, ChevronRight, Download, Home, Menu, X } from 'lucide-react';
import adminPhoto from '@/assets/admin-photo.jpg.asset.json';
import { Button } from '@/components/ui/button';
import menu from '@/data/navigation/menu.json';

interface MenuItem { label: string; href: string; children?: MenuItem[] }

function activeBranch(items: MenuItem[], pathname: string): number[] {
  const index = items.findIndex(item => item.children && containsPath(item, pathname));
  const item = items[index];
  return item?.children ? [index, ...activeBranch(item.children, pathname)] : [];
}

interface MenuBranchProps {
  items: MenuItem[];
  pathname: string;
  openPath: number[];
  branchPath?: number[];
  onToggle: (path: number[]) => void;
  onNavigate: () => void;
}

function MenuBranch({ items, pathname, openPath, branchPath = [], onToggle, onNavigate }: MenuBranchProps) {
  const depth = branchPath.length;
  return <ul className={`library-menu-list library-menu-depth-${Math.min(depth, 3)}`}>
    {items.map((item, index) => <MenuEntry key={`${item.href}-${index}`} item={item} pathname={pathname} openPath={openPath} branchPath={[...branchPath, index]} onToggle={onToggle} onNavigate={onNavigate} />)}
  </ul>;
}

function containsPath(item: MenuItem, pathname: string): boolean {
  return item.href === pathname || (item.children?.some(child => containsPath(child, pathname)) ?? false);
}

function MenuEntry({ item, pathname, openPath, branchPath, onToggle, onNavigate }: Omit<MenuBranchProps, 'items' | 'branchPath'> & { item: MenuItem; branchPath: number[] }) {
  const depth = branchPath.length - 1;
  const expanded = branchPath.every((index, level) => openPath[level] === index);
  return <li>
    {item.children ? <>
      <Button type="button" variant="source" size="source" className="library-menu-control" aria-expanded={expanded} onClick={() => onToggle(branchPath)}>
        {depth === 0 && <BookOpen aria-hidden="true" />}<span>{item.label}</span>{expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
      </Button>
      {expanded && <MenuBranch items={item.children} pathname={pathname} openPath={openPath} branchPath={branchPath} onToggle={onToggle} onNavigate={onNavigate} />}
    </> : <Button asChild variant="source" size="source" className={`library-menu-control ${item.href === pathname ? 'library-menu-active' : ''}`}>
      <a href={item.href} onClick={onNavigate} aria-current={item.href === pathname ? 'page' : undefined} {...(item.href.endsWith('.apk') ? { download: true } : {})}>
        {depth === 0 && <Download aria-hidden="true" />}<span>{item.label}</span>
      </a>
    </Button>}
  </li>;
}

export function LibraryShell({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: location => location.pathname });
  const [openPath, setOpenPath] = useState<number[]>(() => activeBranch(menu, pathname));
  const previousPathname = useRef(pathname);
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
  useEffect(() => {
    setMobileOpen(false); setProfileOpen(false);
    if (previousPathname.current !== pathname) {
      setOpenPath([]);
      previousPathname.current = pathname;
    }
  }, [pathname]);
  const navigate = () => { setOpenPath([]); setMobileOpen(false); setProfileOpen(false); };
  const toggleBranch = (path: number[]) => {
    setOpenPath(current => path.every((index, level) => current[level] === index) ? path.slice(0, -1) : path);
  };
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
    setProfileOpen(false);
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
        <Button asChild variant="source" size="source" className={`library-menu-control ${pathname === '/' ? 'library-menu-active' : ''}`}><a href="/" onClick={navigate} aria-current={pathname === '/' ? 'page' : undefined}><Home /><span>Library home</span></a></Button>
        <MenuBranch items={menu} pathname={pathname} openPath={openPath} onToggle={toggleBranch} onNavigate={navigate} />
      </nav>
    </aside>
    <main className="library-content">{children}</main>
  </div>;
}