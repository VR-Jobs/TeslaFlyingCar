"""Independently reopen saved Blender candidates; never modify or save assets."""
import bpy,sys,argparse,json,hashlib,math
from pathlib import Path
from mathutils import Vector
p=argparse.ArgumentParser();p.add_argument('--asset',required=True);p.add_argument('--baseline',required=True);p.add_argument('--out',required=True)
a=p.parse_args(sys.argv[sys.argv.index('--')+1:])
checks=[]
def check(name,ok,detail=None):
    checks.append({'name':name,'pass':bool(ok),'detail':detail})
    if not ok:raise AssertionError(name)
def load(path):
    bpy.ops.wm.open_mainfile(filepath=str(Path(path).resolve()));bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
def signature(ob):
    data={'p':[[round(x,7) for x in ob.matrix_world@v.co] for v in ob.data.vertices],'f':[list(p.vertices) for p in ob.data.polygons]}
    return hashlib.sha256(json.dumps(data,separators=(',',':')).encode()).hexdigest()
def glass_color():return list(bpy.data.materials[[m.name for m in bpy.data.materials if 'Glazed_Exterior' in m.name][0]].node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value)[:3]
load(a.baseline)
protected={o.name:signature(o) for o in bpy.context.scene.objects if o.type=='MESH' and (o.name in ['body.side.left','body.side.right','body.hood'] or o.name.endswith('.tire'))}
base_origins=json.loads(bpy.context.scene['roadster.origins']);before_glass=glass_color()
load(a.asset);scene=bpy.context.scene;wing=bpy.data.objects['Active_Wing_Rig'];root=bpy.data.objects['Exterior_Root']
config=json.loads(scene['roadster.wing']);origins=json.loads(scene['roadster.origins'])
check('protected-side-shell-hood-and-four-tires-unchanged',all(name in bpy.data.objects and signature(bpy.data.objects[name])==sig for name,sig in protected.items()),list(protected))
check('wheel-centers-retain-the-same-driving-envelope',all(origins[k]==v for k,v in base_origins.items() if k.startswith('wheel')),origins)
after_glass=glass_color();check('saved-blender-glass-is-neutral-black',max(after_glass)<.01 and after_glass[2]>=after_glass[0],{'before':before_glass,'after':after_glass})
dg=bpy.context.evaluated_depsgraph_get();glass_z=[];bad=[];count=0
for ob in scene.objects:
    if not ob.get('runtimeSlot') or ob.type not in {'MESH','CURVE','FONT'} or ob['runtimeSlot']=='support':continue
    ev=ob.evaluated_get(dg);me=ev.to_mesh();me.calc_loop_triangles();count+=len(me.loop_triangles)
    for t in me.loop_triangles:
        if t.area<1e-11:bad.append(ob.name)
    for v in me.vertices:
        assert all(math.isfinite(x) for x in v.co)
        if ob.get('runtimeMaterial')=='glass':glass_z.append(-(ev.matrix_world@v.co).y)
    if ob.name.endswith('.inner_barrel'):
        origin=origins[ob['runtimeSlot']];minimum=10
        for tri in me.loop_triangles:
            c=sum((ev.matrix_world@me.vertices[i].co for i in tri.vertices),Vector())/3
            radius=math.hypot(c.z-origin[1],-c.y-origin[2]);minimum=min(minimum,radius)
        check(ob['runtimeSlot']+'-barrel-is-hollow-not-a-face-occluder',minimum>.25,{'minimumTriangleRadius':minimum})
    ev.to_mesh_clear()
check('evaluated-exterior-has-no-new-zero-area-triangles',not bad,{'triangles':count,'degenerateParts':bad})
check('rear-glass-finishes-before-the-rear-haunch',max(glass_z)<1.21,{'rearGlassZ':max(glass_z),'rearAxleZ':origins['wheel_RL'][2],'basis':'Photo-guided working scale, not a measured OEM dimension'})
maximum=0;hinge_max=0;poses=[]
for frame in range(1,82,5):
    scene.frame_set(frame);root.rotation_euler=(frame*.035,frame*.014,frame*.025);bpy.context.view_layer.update()
    for sign in [-1,1]:
        rod=bpy.data.objects['wing.telescopic_pylon.inner.'+str(sign)]
        endpoint=rod.matrix_world@Vector((0,0,.5))
        target=wing.matrix_world@Vector((sign*config['mount'][0],-config['mount'][2],config['mount'][1]))
        gap=(endpoint-target).length;maximum=max(maximum,gap)
        leading=wing.matrix_world@Vector((sign*.72,0,0))
        fixed=root.matrix_world@Vector((sign*.72,-config['pivot'][2],config['pivot'][1]))
        hinge_max=max(hinge_max,(leading-fixed).length)
        poses.append({'frame':frame,'side':sign,'upperStrutGap':gap})
root.rotation_euler=(0,0,0);scene.frame_set(1);bpy.context.view_layer.update()
check('native-wing-supports-remain-attached-during-deployment-and-car-flips',maximum<.004,{'maxGap':maximum,'poses':poses})
check('new-leading-hinge-remains-fixed-throughout-opening',hinge_max<1e-5,{'maxGap':hinge_max,'lift':config['lift'],'pitch':config['pitch']})
report={'asset':str(Path(a.asset).resolve()),'assetSha256':hashlib.sha256(Path(a.asset).read_bytes()).hexdigest(),'checks':checks,'scope':'Actual saved native exterior and motion. Photo-guided game proportions; no OEM dimensional or complete self-intersection certification. Cabin reconstruction remains deferred.'}
Path(a.out).write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({'passed':len(checks),'triangles':count,'maximumWingGap':maximum}))
