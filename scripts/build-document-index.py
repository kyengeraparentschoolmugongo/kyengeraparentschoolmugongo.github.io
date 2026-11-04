"""Explicit rebuild of URL-derived document identities from editable catalog JSON."""
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
base = root / 'src/data/catalog'
refs = {}
for kind, manifest in [('resources', root/'src/data/resource-manifest.json'), ('legacy', root/'src/data/legacy/manifest.json')]:
    for path, entry in json.loads(manifest.read_text()).items():
        page = json.loads((base/'pages'/kind/entry['data']).read_text())
        for id in page['documentIds']:
            refs.setdefault(id, {'id': id, 'path': path, 'kind': kind, 'data': entry['data']})
def key(url):
    a,b = 2166136261,5381
    for c in url:
        a = ((a ^ ord(c)) * 16777619) & 0xffffffff
        b = ((b * 33) ^ ord(c)) & 0xffffffff
    return f'{a:08x}{b:08x}'
shards = {}
urls = {}
for file in sorted((base/'documents').glob('*.json')):
    for id, record in json.loads(file.read_text()).items():
        url = record['pdfUrl']; k = key(url)
        if k in urls and urls[k] != url: raise ValueError('Document URL hash collision')
        urls[k] = url
        shards.setdefault(k[:2], {}).setdefault(k, refs[id])
out = base/'document-index'; out.mkdir(exist_ok=True)
for prefix, data in shards.items():
    (out/f'{prefix}.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':'))+'\n')
print(f'Indexed {len(urls)} unique source URLs in {len(shards)} lazy shards')
