"""Rebuild audited source-derived legacy data; usage: python3 scripts/import-legacy-pages.py /tmp/fresh-refactor."""
import sys,json,pathlib,re,hashlib,concurrent.futures,requests,subprocess
from bs4 import BeautifulSoup,Comment
from urllib.parse import urljoin,urlparse,unquote
root=pathlib.Path(__file__).resolve().parents[1];tmp=pathlib.Path(sys.argv[1]);out=root/'src/data/legacy';out.mkdir(parents=True,exist_ok=True);source_pages=root/'.site-import/catalog-source/legacy-pages';source_pages.mkdir(parents=True,exist_ok=True);(out/'fragments').mkdir(exist_ok=True)
base='https://fresh-teacher.github.io/';raw='https://raw.githubusercontent.com/Fresh-Teacher/fresh-teacher.github.io/main/'
existing=json.load(open(root/'src/data/resource-manifest.json'));audit=json.load(open(tmp/'remaining-audit.json'));media=json.load(open(root/'src/data/resource-media.json'));failures=[];cache=tmp/'legacy-assets';cache.mkdir(exist_ok=True)
media_urls=set();css_urls=set()
for page in audit['pages']:
 s=BeautifulSoup((tmp/'pages'/page['path']).read_text(),'html.parser')
 media_urls.update(urljoin(base,x['src']) for x in s.select('img[src],audio[src],video[src],source[src]'))
 media_urls.update(urljoin(base,m) for style in s.select('style') for m in re.findall(r'url\([\'"]?([^\)\'\"]+)',style.get_text()) if not m.startswith('data:'))
 css_urls.update(urljoin(base,x['href']) for x in s.select('link[rel=stylesheet]'))
media_urls.add(urljoin(base,'results.gif'))
css_map={urljoin(base,'css/'+n):'/resource-source/css/'+n for n in ['flipbook.style.css','font-awesome.css','footer.css']}
css_map.update({'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css':'/resource-source/css/bootstrap.min.css','https://use.fontawesome.com/releases/v5.8.1/css/all.css':'/resource-source/css/font-awesome.css'})
asset_map={urljoin(base,k):v for k,v in media.items()}
def download(url):
 key=hashlib.sha256(url.encode()).hexdigest()[:20];q=cache/key
 if q.exists():return url,q
 try:
  target=raw+unquote(urlparse(url).path.lstrip('/')) if url.startswith(base) else url
  r=requests.get(target,timeout=40)
  if r.ok:q.write_bytes(r.content);return url,q
  return url,None
 except Exception:return url,None
# Mirror CSS source and recursively resolve its own assets/styles.
pending=css_urls-set(css_map);css_text={}
while pending:
 with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:results=list(pool.map(download,pending))
 pending=set()
 for url,q in results:
  if q is None:failures.append({'url':url,'reason':'source stylesheet unavailable'});continue
  text=q.read_text(errors='replace');css_text[url]=text;css_map[url]='/legacy-source/css/'+hashlib.sha256(url.encode()).hexdigest()[:16]+'.css'
  for target in re.findall(r'@import\s+(?:url\()?\s*[\'"]([^\'"]+)',text):
   absolute=urljoin(url,target)
   if absolute not in css_map:pending.add(absolute)
  for target in re.findall(r'url\([\'"]?([^\)\'\"]+)',text):
   if not target.startswith('data:') and not target.endswith('.css'):media_urls.add(urljoin(url,target))
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:results=list(pool.map(download,media_urls-set(asset_map)))
asset_dir=root/'src/assets/legacy';asset_dir.mkdir(parents=True,exist_ok=True)
for url,q in results:
 if q is None:failures.append({'url':url,'reason':'source media unavailable'});continue
 key=hashlib.sha256(url.encode()).hexdigest()[:20];pointer=asset_dir/(key+'.asset.json')
 if not pointer.exists():
  run=subprocess.run(['lovable-assets','create','--file',str(q),'--filename',unquote(urlparse(url).path.split('/')[-1])],capture_output=True,text=True)
  if run.returncode:failures.append({'url':url,'reason':'asset hosting failed'});continue
  pointer.write_text(run.stdout)
 asset_map[url]=json.load(open(pointer))['url']
for url,text in css_text.items():
 def replace(m):
  target=m.group(1).strip('"\' ');absolute=urljoin(url,target);return 'url("'+asset_map.get(absolute,css_map.get(absolute,absolute))+'")'
 text=re.sub(r'url\(([^)]+)\)',replace,text)
 q=root/'public'/css_map[url].lstrip('/');q.parent.mkdir(parents=True,exist_ok=True);q.write_text(text)
def href(value):
 if value.startswith(('#','javascript:','data:text/html')):return '#' if value.startswith(('javascript:','data:text/html')) else value
 absolute=urljoin(base,value);p=urlparse(absolute)
 if p.netloc==urlparse(base).netloc:
  if p.path.lower().endswith('.pdf'):return absolute
  return p.path+('?' +p.query if p.query else '')+('#'+p.fragment if p.fragment else '')
 return value
def clean(soup):
 for el in soup.select('link'):
  if el.contents:el.unwrap()
  else:el.decompose()
 for el in soup.select('script,style,noscript,meta,title'):el.decompose()
 for el in soup.select('iframe'):
  if any(x in el.get('src','') for x in ['googletagmanager','doubleclick','googlesyndication']):el.decompose()
 for el in soup.find_all():
  for k in list(el.attrs):
   if k.startswith('on'):del el[k]
  if el.get('href') is not None:el['href']=href(el['href'])
  if el.get('src'):el['src']=asset_map.get(urljoin(base,el['src']),urljoin(base,el['src']))
  if el.get('style'):
   el['style']=re.sub(r'url\([\'"]?([^\)\'\"]+)[\'"]?\)',lambda m:'url("'+asset_map.get(urljoin(base,m[1]),urljoin(base,m[1]))+'")',el['style'])
 for el in list(soup.find_all(['html','body','head'])):el.unwrap()
 for el in soup.find_all(string=lambda t:isinstance(t,Comment)):el.extract()
 return soup
fragments={}
def fragment(html):
 key=hashlib.sha256(html.encode()).hexdigest()[:16];fragments[key]=html;return key
manifest={}; counts={}
for page in audit['pages']:
 name=page['path'];text=(tmp/'pages'/name).read_text();s=BeautifulSoup(text,'html.parser');styles='\n'.join(x.get_text() for x in s.select('style'));title=s.title.get_text(' ',strip=True) if s.title else ''
 label=re.sub(r'(?<=[a-z])(?=[A-Z])',' ',name.removesuffix('.html'));title=label+' | Fresh Teacher'
 desc=s.select_one('meta[name=description]');description=desc.get('content') if desc else 'Browse '+label+' in Fresh Teacher’s e-Library.'
 links=list(dict.fromkeys(css_map[urljoin(base,x['href'])] for x in s.select('link[rel=stylesheet]') if urljoin(base,x['href']) in css_map))
 items=[];mode='static';missing=None
 if page['data_load_literals']:
  filename=page['data_load_literals'][0];q=tmp/'remaining-data'/filename
  if q.exists():items=json.load(open(q));assert isinstance(items,list) and all('pdfUrl' in i for i in items)
  else:missing=filename;failures.append({'path':name,'reason':'source catalog missing or invalid','data':filename})
  mode='infinite' if s.select_one('#cardsContainer') else 'paginated'
 body=BeautifulSoup(text,'html5lib');body=clean(body)
 # Deduplicate shared header/footer/chat independently of page-specific content.
 for selector in ['nav.navbar','footer','#africavotes-chat','a.africaVotesChat']:
  for node in list(body.select(selector)):
   key=fragment(str(node));slot=body.new_tag('fresh-fragment');slot['data-key']=key;node.replace_with(slot)
 # Exact body matches share one template; variable shelf/menu content stays source-derived.
 html=str(body);key=fragment(html);stylekey=fragment(styles)
 data={'title':title,'description':description,'template':key,'styles':stylekey,'items':items,'mode':mode,'missingData':missing,'links':links}
 filename=hashlib.sha256(name.encode()).hexdigest()[:16]+'.json';(source_pages/filename).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
 manifest[name]={'data':filename,'title':title,'description':description,'mode':mode,'count':len(items),'family':page['signature']};counts[mode]=counts.get(mode,0)+1
for key,text in fragments.items():(out/'fragments'/(key+'.json')).write_text(json.dumps(text,ensure_ascii=False))
(out/'manifest.json').write_text(json.dumps(manifest,indent=2));(out/'asset-map.json').write_text(json.dumps(asset_map,indent=2));(out/'source-issues.json').write_text(json.dumps(failures,indent=2));(out/'coverage.json').write_text(json.dumps({'sourcePaths':sorted([*existing,*manifest,'index.html']),'remaining':len(manifest),'modes':counts,'records':sum(x['count'] for x in manifest.values()),'fragments':len(fragments)},indent=2))
print('Imported',len(manifest),'pages',counts,'records',sum(x['count'] for x in manifest.values()),'fragments',len(fragments),'source issues',len(failures))
subprocess.run([sys.executable,str(root/'scripts/normalize-catalogs.py')],check=True)
