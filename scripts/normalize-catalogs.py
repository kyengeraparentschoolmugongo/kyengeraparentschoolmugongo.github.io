"""One-off/re-import conversion of audited snapshots to editable, normalized static JSON.

Run after an audited import, not after manually editing the normalized JSON.
"""
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/data/catalog'
SOURCE = ROOT / '.site-import/catalog-source'


def read(path):
    return json.loads(path.read_text())


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def category(path):
    # Classification comes from the original page address, never PDF filename guesses.
    match = re.match(r'^(Primary|Senior)(One|Two|Three|Four|Five|Six|Seven)(.*)\.html$', path)
    nursery = re.match(r'^(Baby|Middle|Top)(?:Class)?(.*)\.html$', path)
    if match:
        group, year, tail = match.groups()
        level, klass = ('primary' if group == 'Primary' else 'secondary'), (group + year)
    elif nursery:
        year, tail = nursery.groups()
        level, klass = 'nursery', year + 'Class'
    else:
        return ['unclassified', 'other', 'other', 'all']
    material = re.search(r'(LessonNotes|PastPapers|Schemes[oO]fWork)$', tail)
    if not material:
        return ['unclassified', 'other', 'other', 'all']
    subject = tail[:material.start()]
    subject = {'Entreprenuership': 'Entrepreneurship'}.get(subject, subject)
    return [level, klass, material.group().replace('of', 'Of'), subject or 'all']


def main():
    recoveries = read(OUT / 'recoveries.json')
    manifests = {kind: read(ROOT / filename) for kind, filename in [
        ('resources', 'src/data/resource-manifest.json'),
        ('legacy', 'src/data/legacy/manifest.json')]}
    source_dirs = {'resources': 'resources', 'legacy': 'legacy-pages'}
    raw = {path: read(SOURCE / source_dirs[kind] / entry['data'])
           for kind, manifest in manifests.items() for path, entry in manifest.items()}
    shards, hierarchy, total = {}, {}, 0
    for kind, manifest in manifests.items():
        for path, entry in manifest.items():
            page = dict(raw[path])
            items = page.pop('items')
            recovery = recoveries.get(path)
            if recovery:
                items = recovery.get('items', raw[recovery.get('catalogPath', path)]['items'])
                page['missingData'] = None
                page['recoverySource'] = recovery['source']
            ids = []
            for item in items:
                # Full-record identity keeps genuine description/price differences intact.
                identity = json.dumps(item, sort_keys=True, ensure_ascii=False, separators=(',', ':'))
                key = hashlib.sha256(identity.encode()).hexdigest()[:20]
                shard = shards.setdefault(key[:2], {})
                if key in shard and shard[key] != item:
                    raise ValueError('Document identity collision')
                shard[key] = item
                ids.append(key)
            page['documentIds'] = ids
            write(OUT / 'pages' / kind / entry['data'], page)
            if page.get('mode') != 'static':
                branch = hierarchy
                for key in category(path):
                    branch = branch.setdefault(key, {})
                branch[path] = {'kind': kind, 'data': entry['data'], 'count': len(ids),
                                'status': 'unavailable' if page.get('missingData') else 'available'}
            total += len(ids)
    for key, documents in shards.items():
        write(OUT / 'documents' / (key + '.json'), documents)
    write(OUT / 'index.json', {'version': 1, 'levels': hierarchy})
    write(OUT / 'summary.json', {'pages': sum(map(len, manifests.values())),
          'references': total, 'uniqueRecords': sum(map(len, shards.values())),
          'recovered': list(recoveries), 'unavailable': [path for path, page in raw.items()
          if page.get('missingData') and path not in recoveries]})
    print('Normalized', total, 'references into', sum(map(len, shards.values())), 'records')


if __name__ == '__main__':
    main()