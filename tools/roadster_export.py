"""Shared evaluated-mesh export for generated or manually edited Blender sources."""
import bpy, json, base64, struct, time
from pathlib import Path
from mathutils import Vector

def T(p): return (p.x,p.z,-p.y)

def export_exterior(output, save_blend=False):
    out=Path(output).resolve();out.mkdir(parents=True,exist_ok=True)
    started=time.perf_counter()
    scene=bpy.context.scene
    parts=[ob for ob in scene.objects if ob.get('runtimeSlot') and ob.type in {'MESH','CURVE','FONT'}]
    ORIGIN=json.loads(scene['roadster.origins'])
    VIEWS=json.loads(scene['roadster.reviewViews'])
    root=bpy.data.objects['Exterior_Root'];wing=bpy.data.objects['Active_Wing_Rig']
    scene.frame_set(1);bpy.context.view_layer.update()
    # Export evaluated geometry, including Blender bevels, normals and thickness.
    def pack(fmt,values):return base64.b64encode(struct.pack('<'+fmt*len(values),*values)).decode()
    groups={};dg=bpy.context.evaluated_depsgraph_get();geometry_checks=[]
    for ob in parts:
        slot=ob['runtimeSlot']
        if slot=='support':continue
        evaluated=ob.evaluated_get(dg);me=evaluated.to_mesh();me.calc_loop_triangles();normal_matrix=evaluated.matrix_world.to_3x3().inverted().transposed()
        mat=ob['runtimeMaterial']
        key=(slot,mat)
        g=groups.setdefault(key,{'slot':slot,'material':mat,'members':[],'position':[],'normal':[],'index':[],'dedup':{}});g['members'].append(ob.name)
        origin=Vector(ORIGIN[slot]);degenerate=0
        for tri in me.loop_triangles:
            if tri.area<1e-11:degenerate+=1
            for li in tri.loops:
                v=Vector(T(evaluated.matrix_world@me.vertices[me.loops[li].vertex_index].co))-origin
                n=Vector(T(normal_matrix@me.corner_normals[li].vector)).normalized()
                value=tuple(round(f,6) for f in (*v,*n))
                if value not in g['dedup']:
                    g['dedup'][value]=len(g['position'])//3;g['position'].extend(value[:3]);g['normal'].extend(value[3:])
                g['index'].append(g['dedup'][value])
        geometry_checks.append({'part':ob.name,'vertices':len(me.vertices),'triangles':len(me.loop_triangles),'degenerate':degenerate})
        evaluated.to_mesh_clear()
    wing_config=json.loads(scene.get('roadster.wing',json.dumps({'pivot':[0,.945,2.075],'baseY':.921,'baseZ':2.065,'mount':[.48,-.023,-.010],'lift':.40,'pitch':-.10})))
    payload={'schema':'roadster-blender-exterior-v1','vehicle':'Tesla Roadster Thrust prototype exterior','revision':scene.get('roadster.revision','previous-exterior'),'precision':'User-photo-guided game exterior; black glass requested by user; working scale inferred, not OEM CAD','origins':ORIGIN,'wing':wing_config,'groups':[]}
    for g in groups.values():
        del g['dedup'];g['position']=pack('f',g['position']);g['normal']=pack('f',g['normal']);g['index']=pack('I',g['index']);payload['groups'].append(g)
    (out/'roadster-exterior.json').write_text(json.dumps(payload,separators=(',',':')),encoding='utf-8')
    (out/'geometry-checks.json').write_text(json.dumps({'parts':geometry_checks,'triangles':sum(p['triangles'] for p in geometry_checks),'scope':'Evaluated exterior geometry. Hidden engineering dimensions and complete self-intersection analysis not verified.','elapsedSeconds':time.perf_counter()-started},indent=2),encoding='utf-8')
    (out/'review-cameras.json').write_text(json.dumps({'views':VIEWS,'target':[0,.63,0],'precision':'Fixed review cameras; qualitative photo comparison, not a solved OEM calibration'},indent=2),encoding='utf-8')
    if save_blend:bpy.ops.wm.save_as_mainfile(filepath=str(out/'roadster-exterior.blend'))
    bpy.ops.object.select_all(action='DESELECT')
    for ob in list(parts)+[root,wing]:ob.select_set(True)
    bpy.context.view_layer.objects.active=root
    bpy.ops.export_scene.gltf(filepath=str(out/'roadster-exterior.glb'),export_format='GLB',use_selection=True,export_animations=False,export_apply=True)
