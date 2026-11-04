import { useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import logo from '@/assets/resource/images-logo.png.asset.json';

// Delay feedback only, never the operation or its completed content.
export function useLoadingIndicator(loading: boolean) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!loading) { setVisible(false); return; }
    const timer = window.setTimeout(() => setVisible(true), 150);
    return () => window.clearTimeout(timer);
  }, [loading]);
  return loading && visible;
}

export function LogoLoader({ label = 'Loading…' }: { label?: string }) {
  return <div className="logo-loader" role="status" aria-label={label}>
    <span className="logo-loader-ring" aria-hidden="true" />
    <img className="logo-loader-image" src={logo.url} alt="" aria-hidden="true" />
  </div>;
}

export function PageLoader() {
  return <div className="page-loading-overlay"><LogoLoader label="Loading page…" /></div>;
}

export function NavigationLoader() {
  const pending = useRouterState({ select: state => state.status === 'pending' });
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    // Captured source links can perform full-page navigation rather than router transitions.
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a') : null;
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
      setLeaving(true);
    };
    const reset = () => setLeaving(false);
    document.addEventListener('click', click);
    window.addEventListener('pageshow', reset);
    return () => { document.removeEventListener('click', click); window.removeEventListener('pageshow', reset); };
  }, []);
  const locationKey = useRouterState({ select: state => state.location.href });
  useEffect(() => { if (!pending) setLeaving(false); }, [pending, locationKey]);
  const visible = useLoadingIndicator(pending || leaving);
  return visible ? <PageLoader /> : null;
}