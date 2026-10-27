"""Materialize public presentation assets and remove live-service bootstraps."""
from pathlib import Path
import urllib.request, urllib.parse, re, hashlib, concurrent.futures, json, shutil

ROOT = Path(__file__).resolve().parent.parent
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
def get(url):
    return opener.open(urllib.request.Request(url,headers={'User-Agent':UA}),timeout=30).read()

html = (ROOT/'original/index.html').read_text('utf-8')
html = html.replace('<html lang="en">', '<html lang="zh">')
html = re.sub(r'<script\b[^>]*src="https://pagead2[^>]*></script>', '', html)
html = re.sub(r'<link\b[^>]*rel="(?:preconnect|modulepreload)"[^>]*>', '', html)
html = re.sub(r'<link\b[^>]*href="https://fonts.googleapis.com/[^>]*>', '<link rel="stylesheet" href="/assets/fonts.css" />', html)
html = html.replace('/assets/game-Da4QmlDf.js','/src/game.js').replace('/assets/game-Ck26lq_b.css','/assets/game.css')
html = html.replace('<title>Roadster Dash – Free Tesla Roadster Game Online</title>','<title>Roadster Dash · Local</title>')
(ROOT/'public/index.html').write_text(html,encoding='utf-8')
shutil.copy2(ROOT/'original/assets/game-Ck26lq_b.css',ROOT/'public/assets/game.css')
shutil.copy2(ROOT/'original/third-party-notices.txt',ROOT/'public/third-party-notices.txt')

font_url='https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&family=Noto+Sans+KR:wght@400;700;800&family=Noto+Sans+SC:wght@800&family=Noto+Sans+JP:wght@800&family=Inter:wght@700&display=swap'
css=get(font_url).decode('utf-8')
urls=sorted(set(re.findall(r'https://fonts.gstatic.com/[^\s)]+',css)))
dest=ROOT/'public/fonts';dest.mkdir(exist_ok=True)
def download(url):
    name=hashlib.sha256(url.encode()).hexdigest()[:20]+'.'+urllib.parse.urlparse(url).path.split('.')[-1]
    file=dest/name
    if not file.exists(): file.write_bytes(get(url))
    return url,'/fonts/'+name,file.stat().st_size
rows=[]
print('Font assets:',len(urls),flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
    for index,row in enumerate(pool.map(download,urls),1):
        rows.append(row)
        if index%40==0:print('Downloaded fonts',index,flush=True)
for url,local,size in rows:css=css.replace(url,local)
(ROOT/'public/assets/fonts.css').write_text(css,encoding='utf-8')
(ROOT/'evidence/font-assets.json').write_text(json.dumps([{'url':u,'local':l,'bytes':n} for u,l,n in rows],indent=2),encoding='utf-8')
print('Local font bytes:',sum(row[2] for row in rows),flush=True)
