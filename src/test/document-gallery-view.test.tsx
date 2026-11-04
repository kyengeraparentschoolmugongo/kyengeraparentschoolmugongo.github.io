import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { DocumentGallery } from '@/components/document-gallery';

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: '/PrimaryFiveClassPastPapers.html' }),
  Link: ({ children, params }: { children: React.ReactNode; params: { slug: string } }) => <a href={`/doc/${params.slug}`}>{children}</a>,
}));
const thumbnails = vi.hoisted(() => ({ load: vi.fn(async (): Promise<string | null> => null) }));
vi.mock('@/lib/pdf-thumbs', () => ({ pdfThumbnail: thumbnails.load, pdfPageCount: () => undefined }));
vi.mock('@/lib/file-sizes', () => ({ fileSize: async () => null, formatSize: () => '' }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); thumbnails.load.mockReset(); });

it('displays an instantly ready thumbnail without waiting for the spinner', async () => {
  vi.useFakeTimers();
  thumbnails.load.mockResolvedValue('data:image/png;base64,ready');
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {}
    observe() { this.callback([{ isIntersecting: true }]); }
    disconnect() {}
  });
  const view = render(<DocumentGallery items={[{ pdfUrl: 'https://fresh-teacher.github.io/instant.pdf', description: '', price: 5000 }]} />);
  await act(async () => {});
  const image = view.container.querySelector<HTMLImageElement>('.dg-thumb img');
  expect(image?.getAttribute('src')).toBe('data:image/png;base64,ready');
  expect(screen.queryByRole('status', { name: 'Loading document thumbnail…' })).toBeNull();
  if (!image) throw new Error('Ready thumbnail missing');
  fireEvent.load(image);
  act(() => { vi.advanceTimersByTime(1000); });
  expect(screen.queryByRole('status', { name: 'Loading document thumbnail…' })).toBeNull();
});

it('clears an unfinished thumbnail spinner immediately when the image loads', async () => {
  vi.useFakeTimers();
  let finish: ((result: string) => void) | undefined;
  thumbnails.load.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: (entries: { isIntersecting: boolean }[]) => void) {}
    observe() { this.callback([{ isIntersecting: true }]); }
    disconnect() {}
  });
  const view = render(<DocumentGallery items={[{ pdfUrl: 'https://fresh-teacher.github.io/pending.pdf', description: '', price: 5000 }]} />);
  act(() => { vi.advanceTimersByTime(150); });
  expect(screen.queryByRole('status', { name: 'Loading document thumbnail…' })).not.toBeNull();
  await act(async () => { finish?.('data:image/png;base64,ready'); });
  const image = view.container.querySelector<HTMLImageElement>('.dg-thumb img');
  if (!image) throw new Error('Ready thumbnail missing');
  fireEvent.load(image);
  expect(screen.queryByRole('status', { name: 'Loading document thumbnail…' })).toBeNull();
});

it('opens catalog PDFs through the original overlay callback but keeps Word viewing on its dedicated page', async () => {
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  const pdf = { pdfUrl: 'https://fresh-teacher.github.io/lesson.pdf', description: '', price: 5000 };
  const word = { ...pdf, pdfUrl: 'https://fresh-teacher.github.io/lesson.docx' };
  const onView = vi.fn();
  await act(async () => { render(<DocumentGallery items={[pdf, word]} onView={onView} />); });
  const view = screen.getByRole('button', { name: /^View$/ });
  fireEvent.click(view);
  expect(onView).toHaveBeenCalledWith(view, pdf);
  expect(screen.getByRole('link', { name: /^View$/ }).getAttribute('href')).toMatch(/^\/doc\//);
  expect(onView).toHaveBeenCalledTimes(1);
});