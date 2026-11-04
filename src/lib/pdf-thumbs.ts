// Renders first-page thumbnails for remote PDFs using the pdf.js copy that
// already ships with the flipbook viewer (public/resource-source/js/pdf.min.js).

let loading: Promise<void> | undefined;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); reject(new Error('pdf.js could not load.')); };
    document.body.appendChild(script);
  });
}

interface PdfPage {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
}

interface PdfDocument {
  numPages?: number;
  getPage: (page: number) => Promise<PdfPage>;
  destroy?: () => void;
}

interface PdfJsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { url: string }) => { promise: Promise<PdfDocument> };
}

async function ensurePdfJs(): Promise<PdfJsLib> {
  if (!loading) {
    loading = loadScript('/resource-source/js/pdf.min.js').then(() => {
      const lib = (window as unknown as { pdfjsLib?: PdfJsLib }).pdfjsLib;
      if (!lib) throw new Error('pdf.js is unavailable.');
      lib.GlobalWorkerOptions.workerSrc = '/resource-source/js/pdf.worker.min.js';
    }).catch(error => { loading = undefined; throw error; });
  }
  await loading;
  return (window as unknown as { pdfjsLib: PdfJsLib }).pdfjsLib;
}

// Limit concurrent renders so a full page of cards does not open dozens of
// PDF downloads at once.
let active = 0;
const waiters: Array<() => void> = [];

async function acquire() {
  if (active >= 2) await new Promise<void>(resolve => waiters.push(resolve));
  active += 1;
}

function release() {
  active -= 1;
  waiters.shift()?.();
}

const cache = new Map<string, Promise<string | null>>();
const pageCounts = new Map<string, number>();

export function pdfPageCount(url: string) { return pageCounts.get(url); }

async function render(url: string): Promise<string | null> {
  await acquire();
  let doc: PdfDocument | undefined;
  try {
    const lib = await ensurePdfJs();
    doc = await lib.getDocument({ url }).promise;
    if (doc.numPages) pageCounts.set(url, doc.numPages);
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 240 / base.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch {
    return null;
  } finally {
    doc?.destroy?.();
    release();
  }
}

export function pdfThumbnail(url: string): Promise<string | null> {
  let cached = cache.get(url);
  if (!cached) {
    cached = render(url);
    cache.set(url, cached);
  }
  return cached;
}
