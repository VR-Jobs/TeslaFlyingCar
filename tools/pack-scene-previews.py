"""Compress actual browser captures and embed them for both module/file builds."""
from pathlib import Path
from PIL import Image
import base64, hashlib, json

root = Path(__file__).resolve().parent.parent
capture = json.loads((root/'evidence/scene-preview-capture.json').read_text(encoding='utf-8'))
assert not capture['errors']
folder = root/'public/previews'
folder.mkdir(parents=True, exist_ok=True)
data, report = {}, {}
for scene in ['space', 'coast', 'starRing']:
    assert capture['frames'][scene]['selected'] == scene
    source = root/f'evidence/scene-preview-{scene}-source.png'
    target = folder/f'{scene}-gameplay.webp'
    with Image.open(source) as image:
        image = image.convert('RGB')
        image.thumbnail((960, 540), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=90, method=6)
        width, height = image.size
    content = target.read_bytes()
    data[scene] = {'src': 'data:image/webp;base64,'+base64.b64encode(content).decode('ascii'), 'width':width, 'height':height}
    report[scene] = {
        'source':str(source.relative_to(root)), 'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
        'preview':str(target.relative_to(root)), 'previewSha256':hashlib.sha256(content).hexdigest(),
        'bytes':len(content), 'width':width, 'height':height,
        'processing':'Resize and WebP compression only; game content and colors unchanged.',
    }
(root/'src/assets/scene-preview-data.js').write_text('export default '+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
(root/'evidence/scene-preview-assets.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
