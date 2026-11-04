import type { ResourceRecord } from './resources';
import media from '@/data/resource-media.json';

let loading: Promise<void> | undefined;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); reject(new Error('The file viewer could not load.')); };
    document.body.appendChild(script);
  });
}

export async function openResourceViewer(element: HTMLElement, item: ResourceRecord, allowPageExport = false) {
  if (!loading) {
    loading = loadScript('/resource-source/js/jquery.js')
      .then(() => loadScript('/resource-source/js/flipbook.min.js'))
      .catch(error => { loading = undefined; throw error; });
  }
  await loading;
  const jquery = (window as unknown as { jQuery?: (node: HTMLElement) => { flipBook: (options: Record<string, unknown>) => unknown; trigger: (event: string) => void } }).jQuery;
  if (!jquery) throw new Error('The file viewer is unavailable.');
  const button = jquery(element);
  if (!element.dataset['viewerReady']) {
    button.flipBook({
      pdfUrl: convertedPdfUrl(item.pdfUrl) ?? item.pdfUrl, lightBox: true, layout: 3,
      currentPage: { vAlign: 'bottom', hAlign: 'left' },
      btnShare: { enabled: false }, btnPrint: { enabled: allowPageExport }, btnDownloadPages: { enabled: allowPageExport },
      btnColor: 'rgb(255,120,60)', sideBtnColor: 'rgb(255,120,60)', sideBtnSize: 60,
      sideBtnBackground: 'rgba(0,0,0,.7)', sideBtnRadius: 60,
      btnSound: { vAlign: 'top', hAlign: 'left' }, btnAutoplay: { vAlign: 'top', hAlign: 'left' },
      assets: {
        preloader: media['images/preloader.jpg'], overlay: media['images/overlay.png'],
        flipMp3: media['mp3/turnPage.mp3'], spinner: media['images/spinner.gif'],
      },
    });
    element.dataset['viewerReady'] = 'true';
    button.trigger('click');
  }
}