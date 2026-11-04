import { useEffect, useRef, useState } from 'react';
import { BookOpen, ExternalLink, Maximize, Minimize, RotateCcw, Rows3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { documentViewer } from '@/lib/document-viewer';
import { flipbookOptions, type ReadingMode } from '@/lib/flipbook-options';
import { resourceTitle, type ResourceRecord } from '@/lib/resources';
import media from '@/data/resource-media.json';

export function DocumentViewer({ item }: { item: ResourceRecord }) {
  const viewer = documentViewer(item.pdfUrl);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<ReadingMode>('book');
  const [revision, setRevision] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const reader = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const change = () => setExpanded(document.fullscreenElement === reader.current);
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);
  useEffect(() => {
    if (viewer.kind !== 'text') return;
    const controller = new AbortController();
    void fetch(viewer.src, { signal: controller.signal }).then(response => { if (!response.ok) throw new Error(); return response.text(); }).then(setText).catch(() => { if (!controller.signal.aborted) setError('Preview unavailable. Please open or download the original file.'); });
    return () => controller.abort();
  }, [item.pdfUrl]);
  const title = `Viewer for ${resourceTitle(item)}`;
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (reader.current?.requestFullscreen) await reader.current.requestFullscreen();
      else setExpanded(value => !value);
    } catch { setExpanded(value => !value); }
  };
  if (viewer.kind === 'pdf' || viewer.kind === 'office') {
    const pdfSrc = viewer.kind === 'pdf' ? viewer.src : item.pdfUrl;
    const options = JSON.stringify({ ...flipbookOptions(pdfSrc), assets: { preloader: media['images/preloader.jpg'], overlay: media['images/overlay.png'], flipMp3: media['mp3/turnPage.mp3'], spinner: media['images/spinner.gif'] } }).replace(/</g, '\\u003c');
    const escapedUrl = pdfSrc.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const verticalHtml = `<!doctype html><html class="vertical-reader"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/viewer-frame.css"></head><body data-pdf-url="${escapedUrl}"><div id="reader-status" role="status">Loading document…</div><main id="reader" aria-label="Document pages"></main><script src="/resource-source/js/pdf.min.js"></script><script src="/reader-vertical.js"></script></body></html>`;
    const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/resource-source/css/flipbook.style.css"><link rel="stylesheet" href="/resource-source/css/font-awesome.css"><link rel="stylesheet" href="/viewer-frame.css"></head><body><div id="reader"></div><script src="/resource-source/js/jquery.js"></script><script src="/resource-source/js/flipbook.min.js"></script><script>jQuery('#reader').flipBook(${options}); function labelControls(){document.querySelectorAll('.flipbook-right-arrow,.flipbook-left-arrow').forEach(function(el){el.title=el.classList.contains('flipbook-right-arrow')?'Next page':'Previous page'});var input=document.querySelector('.flipbook-currentPageInput');if(input)input.setAttribute('aria-label','Go to page');document.querySelectorAll('[title]:not([data-accessible])').forEach(function(el){el.dataset.accessible='true';el.setAttribute('aria-label',el.title);if(el.matches('[title]')){el.setAttribute('role','button');el.tabIndex=0;el.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();el.click();}})}})}labelControls();new MutationObserver(labelControls).observe(document.getElementById('reader'),{childList:true,subtree:true});</script></body></html>`;
    return <div ref={reader} className={`document-reader${expanded ? ' document-reader-expanded' : ''}`}>
      <div className="document-reader-toolbar" role="toolbar" aria-label="Document viewer controls">
        {viewer.kind === 'pdf' && <div className="document-reader-modes" role="group" aria-label="Reading mode">
          <Button variant="source" size="source" className="document-reader-control" title="Flipbook mode" aria-label="Flipbook mode" aria-pressed={mode === 'book'} onClick={() => setMode('book')}><BookOpen size={18} /><span>Flipbook</span></Button>
          <Button variant="source" size="source" className="document-reader-control" title="Vertical scroll mode" aria-label="Vertical scroll mode" aria-pressed={mode === 'vertical'} onClick={() => setMode('vertical')}><Rows3 size={18} /><span>Vertical</span></Button>
        </div>}
        <div className="document-reader-tools">
          <Button variant="source" size="source" className="document-reader-control" title="Reload preview" aria-label="Reload preview" onClick={() => setRevision(value => value + 1)}><RotateCcw size={18} /></Button>
          <Button asChild variant="source" size="source" className="document-reader-control" title="Open viewer in new tab"><a aria-label="Open viewer in new tab" href={viewer.kind === 'office' ? viewer.src : item.pdfUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={18} /></a></Button>
          <Button variant="source" size="source" className="document-reader-control" title={expanded ? 'Exit fullscreen' : 'Fullscreen'} aria-label={expanded ? 'Exit fullscreen' : 'Fullscreen'} onClick={() => void fullscreen()}>{expanded ? <Minimize size={18} /> : <Maximize size={18} />}</Button>
        </div>
      </div>
      <iframe key={`${mode}-${revision}`} className="document-viewer" title={title} srcDoc={viewer.kind === 'pdf' ? (mode === 'vertical' ? verticalHtml : html) : undefined} src={viewer.kind === 'office' ? viewer.src : undefined} allow="fullscreen" />
      {viewer.kind === 'office' && <p className="document-viewer-note">Preview unavailable? <a href={viewer.src} target="_blank" rel="noopener noreferrer">Open the viewer in a new tab</a> or <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">open the original file</a>.</p>}
    </div>;
  }
  if (viewer.kind === 'image') return <div className="document-image-viewer"><img src={viewer.src} alt={resourceTitle(item)} /></div>;
  if (viewer.kind === 'text') return <pre className="document-text-viewer">{error || text || 'Loading document…'}</pre>;
  return <p role="status">This file format cannot be previewed here. <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">Open the original file</a> or download it.</p>;
}