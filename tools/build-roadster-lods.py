"""Derive runtime LODs from the saved Blender exterior, never overwrite source."""
import bpy, sys, json, hashlib, argparse
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from roadster_export import export_exterior
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--source',default=str(root/'models/roadster-2026/current/roadster-exterior.blend'));parser.add_argument('--out-root',default=str(root/'models/roadster-2026/lod'));parser.add_argument('--report',default=str(root/'evidence/roadster-lod-build.json'))
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
source=Path(args.source).resolve();output_root=Path(args.out_root).resolve()
report={'source':str(source.relative_to(root)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'levels':[]}
for level,ratio in [('driving',.16),('distant',.045)]:
    bpy.ops.wm.open_mainfile(filepath=str(source))
    bpy.context.scene.frame_set(1);bpy.context.view_layer.update()
    dg=bpy.context.evaluated_depsgraph_get()
    for ob in list(bpy.context.scene.objects):
        if not ob.get('runtimeSlot') or ob.type!='MESH' or ob['runtimeSlot']=='support':continue
        evaluated=ob.evaluated_get(dg)
        mesh=bpy.data.meshes.new_from_object(evaluated,depsgraph=dg)
        ob.modifiers.clear();ob.data=mesh
        mesh.calc_loop_triangles()
        count=len(mesh.loop_triangles)
        # Protect small optical details, mounts and thin active wing geometry.
        if count>180:
            mod=ob.modifiers.new('Exterior silhouette LOD','DECIMATE')
            shape_surface=ob.name.startswith(('body.side.','body.hood','body.front_shoulder.','glass.panoramic','glass.side.','body.c_pillar.','body.rear_deck'))
            effective_ratio=max(ratio,(.24 if level=='driving' else .06)) if shape_surface else ratio
            mod.ratio=max(effective_ratio,48/count)
            mod.use_collapse_triangulate=True
    out=output_root/level
    export_exterior(out,save_blend=True)
    checks=json.loads((out/'geometry-checks.json').read_text())
    report['levels'].append({'level':level,'ratio':ratio,'bodyGlassRatio':.24 if level=='driving' else .06,'triangles':checks['triangles'],'degenerate':sum(p['degenerate'] for p in checks['parts'])})
    # Same native camera and lighting as the original saved source.
    scene=bpy.context.scene;scene.render.resolution_percentage=60;scene.cycles.samples=12
    scene.render.filepath=str(out/'front.png');bpy.ops.render.render(write_still=True)
Path(args.report).write_text(json.dumps(report,indent=2))
print(json.dumps(report))
