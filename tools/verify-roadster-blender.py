"""Independent saved-.blend checks. Run after opening the actual saved asset."""
import bpy, json, math, sys, argparse, hashlib
from pathlib import Path
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--out',required=True)
args=p.parse_args(sys.argv[sys.argv.index('--')+1:])
asset=Path(bpy.data.filepath)
wing=bpy.data.objects['Active_Wing_Rig'];scene=bpy.context.scene
wing_config=json.loads(scene.get('roadster.wing',json.dumps({'mount':[.48,-.023,-.010]})))
maximum=0;poses=[]
for frame in [1,11,21,31,41,51,61,71,81]:
 scene.frame_set(frame);bpy.context.view_layer.update()
 for sign in [-1,1]:
  rod=bpy.data.objects['wing.telescopic_pylon.inner.'+str(sign)]
  endpoint=rod.matrix_world@Vector((0,0,.5))
  m=wing_config['mount'];mount=wing.matrix_world@Vector((sign*m[0],-m[2],m[1]))
  gap=(endpoint-mount).length;maximum=max(maximum,gap)
  poses.append({'frame':frame,'side':sign,'gap':gap})
scene.frame_set(1);bpy.context.view_layer.update()
limits=[Vector((float('inf'),)*3),Vector((-float('inf'),)*3)];count=0
for ob in scene.objects:
 if not ob.get('runtimeSlot'):continue
 for corner in ob.bound_box:
  v=ob.matrix_world@Vector(corner)
  assert all(math.isfinite(x) for x in v)
  for i in range(3):limits[0][i]=min(limits[0][i],v[i]);limits[1][i]=max(limits[1][i],v[i])
 count+=1
report={'asset':str(asset),'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'exteriorObjects':count,'workingDimensions':list(limits[1]-limits[0]),'maximumWingMountGap':maximum,'poses':poses,'scope':'Independent saved Blender source inspection. Units are inferred game-scale metres, not measured OEM specifications.'}
Path(args.out).write_text(json.dumps(report,indent=2),encoding='utf-8')
assert maximum<.004,'Saved Blender wing attachment is disconnected'
print('PASS saved Blender exterior and deployed hinge connections',maximum)
