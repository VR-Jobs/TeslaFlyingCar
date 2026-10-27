"""Package this editable offline project; preserve earlier deliveries."""
from pathlib import Path
import json,hashlib,zipfile,datetime
root=Path(__file__).resolve().parent.parent
out=root.parent/'Tesla-Music-Parkour-Roadster-BlackGlass-20261026.zip'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
build=json.loads((root/'evidence/standalone-build.json').read_text(encoding='utf-8'))
browser=json.loads((root/'evidence/iteration-browser-checks.json').read_text(encoding='utf-8'))
assert browser['failed']==0
ring=json.loads((root/'evidence/star-ring-browser-checks.json').read_text(encoding='utf-8'))
assert ring and all(row['pass'] for row in ring['checks'])
for name in ['star-ring-physics-checks.json','star-ring-ui-checks.json','star-ring-tutorial-checks.json','star-ring-tutorial-browser-checks.json','star-ring-gap-checks.json','star-ring-gap-browser-checks.json']:
 assert all(row['pass'] for row in json.loads((root/'evidence'/name).read_text(encoding='utf-8'))['checks'])
for name in ['star-ring-surface-checks.json','star-ring-surface-browser-checks.json']:
 assert all(row['pass'] for row in json.loads((root/'evidence'/name).read_text(encoding='utf-8'))['checks'])
for name in ['star-ring-glass-checks.json','star-ring-glass-browser-checks.json']:
 assert all(row['pass'] for row in json.loads((root/'evidence'/name).read_text(encoding='utf-8'))['checks'])
for name in ['star-ring-bloom-checks.json','star-ring-bloom-browser-checks.json','star-ring-bloom-image-checks.json']:
 assert all(row['pass'] for row in json.loads((root/'evidence'/name).read_text(encoding='utf-8'))['checks'])
for name in ['star-ring-pickup-checks.json','star-ring-pickup-browser-checks.json']:
 assert all(row['pass'] for row in json.loads((root/'evidence'/name).read_text(encoding='utf-8'))['checks'])
checks=['iteration-browser-checks.json','handling-route-checks.json','roadster-lod-runtime-checks.json','lod-driving-native-readback.json','lod-distant-native-readback.json','normal-play-check.json','landing-rim-check.json','landing-rim-geometry.json','scene-picker-checks.json','scene-preview-capture.json','scene-preview-assets.json','scene-preview-ui-checks.json']
checks += ['star-ring-physics-checks.json','star-ring-browser-checks.json','star-ring-ui-checks.json']
checks += ['star-ring-tutorial-checks.json','star-ring-tutorial-browser-checks.json']
checks += ['star-ring-gap-checks.json','star-ring-gap-browser-checks.json']
checks += ['star-ring-surface-checks.json','star-ring-surface-browser-checks.json']
checks += ['star-ring-glass-checks.json','star-ring-glass-browser-checks.json']
checks += ['star-ring-bloom-checks.json','star-ring-bloom-browser-checks.json','star-ring-bloom-image-checks.json']
checks += ['star-ring-pickup-checks.json','star-ring-pickup-browser-checks.json']
checks += ['roadster-blackglass-native-readback.json','roadster-blackglass-showroom-checks.json','roadster-blackglass-browser-checks.json']
native=json.loads((root/'evidence/roadster-blackglass-native-readback.json').read_text(encoding='utf-8'))
assert all(row['pass'] for row in native['checks'])
showroom=json.loads((root/'evidence/roadster-blackglass-showroom-checks.json').read_text(encoding='utf-8'))
assert showroom['checks']['status']=='PASS' and not showroom['errors']
assert all(row['pass'] for row in json.loads((root/'evidence/roadster-blackglass-browser-checks.json').read_text(encoding='utf-8'))['checks'])
images=['space-journey-orbit-20261025.png','space-journey-backlight-20261025.png','teaching-core-optional-20261025.png','normal-play-jump.png','landing-rim-preview.png','start-scene-picker.png','scene-picker-real-previews.png','star-ring-inverted.png','star-ring-mode-picker.png','scene-preview-starRing-source.png']
images += ['star-ring-tutorial-step1.png','star-ring-tutorial-step2.png','star-ring-tutorial-step3.png']
images += ['star-ring-gap-warning.png','star-ring-gap-ready.png']
images += ['star-ring-surface-fixed.png','star-ring-bottom-blocked.png']
images += ['star-ring-glass-saturn.png','star-ring-glass-inverted.png']
images += ['star-ring-track-detailed.png','star-ring-track-curve.png','star-ring-track-inverted.png','star-ring-track-gap.png']
images += ['star-ring-bloom-on.png','star-ring-bloom-off.png','star-ring-bloom-preview.png','star-ring-bloom-gap.png']
images += ['star-ring-three-rails.png','star-ring-pickup-air.png','star-ring-pickup-crystal.png','star-ring-pickup-gold.png','star-ring-pickup-collect.png']
images += ['roadster-blackglass-front.png','roadster-blackglass-rear.png','roadster-blackglass-wing.png','roadster-blackglass-driving.png','roadster-blackglass-showroom.png','scene-preview-space-source.png','scene-preview-coast-source.png']
report={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'html':build,'previousHtmlBytes':20645146,
 'browserChecks':{'passed':browser['passed'],'failed':browser['failed'],'transport':'Exact standalone HTML over loopback HTTP. file:// navigation blocked by test browser policy.'},
 'starRingChecks':ring,
 'checks':{name:sha(root/'evidence'/name) for name in checks},
 'screenshots':{name:sha(root/'evidence'/name) for name in images if (root/'evidence'/name).exists()},
 'modelScope':'Photo-guided Blender exterior revision 20261026-blackglass-photo-exterior; black glazing and hinged rear flap shared by all three LODs. Previous native model and scripts preserved in revisions/20261026-blackglass/baseline. Original traffic meshes retained. Exterior only; no OEM CAD or engineering-accuracy claim.'}
(root/'evidence/driving-polish-delivery.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
skip={'.git','node_modules','.npm-cache','__pycache__','dist','cache','export-check'}
files=[]
for p in sorted(root.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(root)
 if any(part in skip for part in rel.parts) or p.suffix in {'.blend1','.blend2','.log'}:continue
 files.append(p)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,Path(root.name)/p.relative_to(root))
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 assert hashlib.sha256(z.read(root.name+'/RoadsterDash.html')).hexdigest()==build['sha256']
 for name in ['current','lod/driving','lod/distant']:
  p=root/f'models/roadster-2026/{name}/roadster-exterior.blend'
  assert hashlib.sha256(z.read(root.name+'/'+p.relative_to(root).as_posix())).hexdigest()==sha(p)
digest=sha(out)
out.with_suffix('.zip.sha256').write_text(digest+'  '+out.name+'\n',encoding='ascii')
print(json.dumps({'file':str(out),'bytes':out.stat().st_size,'files':len(files),'sha256':digest},ensure_ascii=False))
