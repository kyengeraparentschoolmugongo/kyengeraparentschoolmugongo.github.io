import { convertedPdfUrl } from '@/lib/converted-documents';
import { useState } from 'react';
import { Download, LoaderCircle, MessageCircle, Check, Share2, Link2, Mail, Facebook, Twitter, Send, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { resourceTitle, type ResourceRecord } from '@/lib/resources';
import { documentSlug } from '@/lib/document-metadata';

export function DocumentShare({ item }: { item: ResourceRecord }) {
  const [copied, setCopied] = useState(false);
  const title = resourceTitle(item);
  const link = () => new URL(`/doc/${documentSlug(item)}`, window.location.origin).href;
  const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  const enc = encodeURIComponent;
  const copy = async () => {
    try { await navigator.clipboard.writeText(link()); setCopied(true); toast.success('Link copied'); window.setTimeout(() => setCopied(false), 2000); }
    catch { toast.error('Could not copy link'); }
  };
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="source" size="source" className="dg-action dg-share" aria-label={`Share ${title}`} title="Share"><Share2 size={16} /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-52">
      <DropdownMenuItem onSelect={() => void copy()}>{copied ? <Check size={16} /> : <Link2 size={16} />} Copy link</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => open(`https://wa.me/?text=${enc(`${title}\n${link()}`)}`)}><MessageCircle size={16} /> WhatsApp</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => { window.location.href = `mailto:?subject=${enc(title)}&body=${enc(`${title}\n${link()}`)}`; }}><Mail size={16} /> Email</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => open(`https://www.facebook.com/sharer/sharer.php?u=${enc(link())}`)}><Facebook size={16} /> Facebook</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => open(`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(link())}`)}><Twitter size={16} /> X (Twitter)</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => open(`https://t.me/share/url?url=${enc(link())}&text=${enc(title)}`)}><Send size={16} /> Telegram</DropdownMenuItem>
      {canNativeShare && <DropdownMenuItem onSelect={() => { void navigator.share({ title, url: link() }).catch(() => {}); }}><MoreHorizontal size={16} /> More apps…</DropdownMenuItem>}
    </DropdownMenuContent>
  </DropdownMenu>;
}

export function DocumentDownload({ item }: { item: ResourceRecord }) {
  const pdf = convertedPdfUrl(item.pdfUrl);
  if (!pdf) return <FileDownload item={item} url={item.pdfUrl} />;
  return <><FileDownload item={item} url={pdf} label="PDF" /><FileDownload item={item} url={item.pdfUrl} label={(item.pdfUrl.split('.').pop() ?? 'Original').toUpperCase()} /></>;
}

function FileDownload({ item, url: fileUrl, label }: { item: ResourceRecord; url: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const download = async () => {
    setState('loading');
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('File unavailable');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = decodeURIComponent(fileUrl.split('/').pop() ?? '') || 'document';
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setState('done');
    } catch { setState('error'); }
  };
  return <><Button variant="source" size="source" className="dg-action dg-download" disabled={state === 'loading'} onClick={() => void download()} aria-label={`Download ${resourceTitle(item)}${label ? ` as ${label}` : ''}`}>
    {state === 'loading' ? <LoaderCircle className="dg-spin" size={16} /> : state === 'done' ? <Check size={16} /> : <Download size={16} />}{state === 'loading' ? 'Downloading…' : state === 'done' ? 'Downloaded' : label ? `Download ${label}` : 'Download'}
  </Button>{state === 'error' && <span role="alert" className="dg-download-error">Download unavailable. <a href={fileUrl} target="_blank" rel="noopener noreferrer">Open original file</a></span>}</>;
}