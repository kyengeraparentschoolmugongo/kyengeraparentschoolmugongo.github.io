// Fetches remote file sizes via HEAD requests and caches them per URL.

const cache = new Map<string, Promise<number | null>>();

export function fileSize(url: string): Promise<number | null> {
  let cached = cache.get(url);
  if (!cached) {
    cached = fetch(url, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) return null;
        const length = response.headers.get('content-length');
        const bytes = length ? Number(length) : Number.NaN;
        return Number.isFinite(bytes) ? bytes : null;
      })
      .catch(() => null);
    cache.set(url, cached);
  }
  return cached;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
