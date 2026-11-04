export const readingModes = ['book', 'vertical'] as const;
export type ReadingMode = typeof readingModes[number];

export function flipbookOptions(pdfUrl: string) {
  return {
    pdfUrl, lightBox: false, viewMode: 'webgl',
    singlePageMode: false, singlePageModeIfMobile: false, layout: 1,
    sound: true, menuOverBook: false, btnSize: 18,
    currentPage: { enabled: true, title: 'Go to page', vAlign: 'top', hAlign: 'center' },
    btnPrev: { enabled: true, title: 'Previous page' }, btnNext: { enabled: true, title: 'Next page' },
    btnZoomIn: { enabled: true, title: 'Zoom in' }, btnZoomOut: { enabled: true, title: 'Zoom out' },
    btnThumbs: { enabled: true, title: 'Page thumbnails' },
    btnExpand: { enabled: false }, btnClose: { enabled: false },
    btnShare: { enabled: false }, btnPrint: { enabled: false }, btnDownloadPdf: { enabled: false },
    btnDownloadPages: { enabled: false }, btnSound: { enabled: true, title: 'Page-turn sound' }, btnAutoplay: { enabled: false },
    btnSearch: { enabled: false }, btnSelect: { enabled: false }, btnBookmark: { enabled: false }, btnToc: { enabled: false },
  };
}