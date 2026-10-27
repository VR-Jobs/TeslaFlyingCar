"""Photo-guided exterior candidate. Run in Blender 4.3; no OEM dimensions implied."""
import bpy, bmesh, math, json, sys, base64, struct, argparse, hashlib, time
from pathlib import Path
from mathutils import Vector

args = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument('--out', required=True)
parser.add_argument('--render', action='store_true')
opt = parser.parse_args(args)
out = Path(opt.out).resolve(); out.mkdir(parents=True, exist_ok=True)
started = time.perf_counter()
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('Roadster_2026_Exterior'); scene.collection.children.link(collection)
parts = []
def B(p): return Vector((p[0], -p[2], p[1]))
def T(p): return (p.x, p.z, -p.y)
def material(name, color, metal=0, rough=.3, coat=0, emission=0):
    m=bpy.data.materials.new(name); m.use_nodes=True
    n=m.node_tree.nodes.get('Principled BSDF'); n.inputs['Base Color'].default_value=(*color,1)
    n.inputs['Metallic'].default_value=metal; n.inputs['Roughness'].default_value=rough
    n.inputs['Coat Weight'].default_value=coat
    if emission:
        n.inputs['Emission Color'].default_value=(*color,1); n.inputs['Emission Strength'].default_value=emission
    return m
M={
 'paint':material('Ano_White_Exterior',(.76,.79,.82),.15,.23,.8),
 'glass':material('Neutral_Black_Glazed_Exterior',(.003,.004,.006),.02,.17,.35),
 'carbon':material('Satin_Carbon',(.018,.022,.026),.28,.34),
 'cavity':material('Exterior_Recess',(.006,.008,.011),.06,.7),
 'rubber':material('Tire_Rubber',(.025,.027,.030),.02,.72),
 'titanium':material('Machined_Titanium',(.72,.76,.80),.55,.22),
 'spoke':material('Dark_Titanium_Spokes',(.073,.080,.091),.84,.23),
 'brake':material('Brake_Rotor',(.21,.22,.24),.8,.4),
 'caliper':material('Brake_Caliper',(.31,.036,.026),.55,.3),
 'light':material('White_Headlamp',(.8,.9,1),.1,.18,0,3),
 'red':material('Rear_Light',(.65,.006,.01),.15,.2,0,2.4),
 'amber':material('Side_Marker',(.8,.13,.008),.1,.25,0,.7),
 'gold':material('Thruster_Titanium',(.34,.24,.12),.8,.25),
}
M['glass'].node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.22
root=bpy.data.objects.new('Exterior_Root',None); collection.objects.link(root)
root['vehicle']='Tesla Roadster Thrust prototype, user-reference exterior revision October 2026'
root['precision']='photo-guided; working dimensions and hidden attachment detail inferred'
WING={'pivot':[0,.945,1.65],'baseY':.905,'baseZ':1.80,'mount':[.48,-.025,.31],'lift':0.0,'pitch':-.62}
ORIGIN={'body':(0,0,0),'wing':tuple(WING['pivot'])}
for side in [-1,1]:
    for axle,z in [('F',-1.43),('R',1.62)]:
        ORIGIN['wheel_'+axle+('L' if side<0 else 'R')]=(side*.875,.355,z)
wing=bpy.data.objects.new('Active_Wing_Rig',None); collection.objects.link(wing); wing.parent=root
wing.location=B(ORIGIN['wing']); wing['deployment']=0.0
wing.id_properties_ui('deployment').update(min=0,max=1,description='Exterior spoiler deployment, 0 stowed / 1 raised')
def move_collection(obj):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    collection.objects.link(obj)
def register(obj,name,mat,slot='body',smooth=True,bevel=0):
    obj.name=name; move_collection(obj)
    obj.data.materials.append(M[mat]); obj['partId']=name; obj['runtimeSlot']=slot; obj['runtimeMaterial']=mat
    if smooth and obj.type=='MESH':
        for poly in obj.data.polygons: poly.use_smooth=True
    if bevel:
        mod=obj.modifiers.new('Manufactured_edge_radius','BEVEL');mod.width=bevel;mod.segments=3
        mod.limit_method='ANGLE'
        norm=obj.modifiers.new('Weighted_corner_normals','WEIGHTED_NORMAL'); norm.keep_sharp=True
    obj.parent=root
    parts.append(obj);return obj
def mesh(name,vertices,faces,mat,slot='body',smooth=True,thickness=0):
    clean=[]
    for face in faces:
        ids=[]
        for index in face:
            if not ids or (Vector(vertices[index])-Vector(vertices[ids[-1]])).length>1e-9:ids.append(index)
        if len(ids)>1 and (Vector(vertices[ids[0]])-Vector(vertices[ids[-1]])).length<1e-9:ids.pop()
        if len(ids)>=3:clean.append(tuple(ids))
    faces=clean
    d=bpy.data.meshes.new(name);d.from_pydata([B(v) for v in vertices],[],faces);d.update()
    ob=bpy.data.objects.new(name,d);collection.objects.link(ob)
    register(ob,name,mat,slot,smooth)
    if thickness:
        mod=ob.modifiers.new('Exterior_return_thickness','SOLIDIFY');mod.thickness=thickness;mod.offset=-1
    return ob
def grid(name,rows,mat,slot='body',thickness=0,flip=False,caps=False):
    nr=len(rows);nc=len(rows[0]);vs=[v for row in rows for v in row]
    fs=[(r*nc+c,r*nc+c+1,(r+1)*nc+c+1,(r+1)*nc+c) for r in range(nr-1) for c in range(nc-1)]
    if caps:
        cap_count=nc-1 if Vector(rows[0][0])==Vector(rows[0][-1]) else nc
        fs.extend([tuple(range(cap_count-1,-1,-1)),tuple((nr-1)*nc+j for j in range(cap_count))])
    if flip:fs=[tuple(reversed(f)) for f in fs]
    return mesh(name,vs,fs,mat,slot,True,thickness)
def box(name,loc,size,mat,slot='body',bevel=.005):
    bpy.ops.mesh.primitive_cube_add(size=1,location=B(loc));o=bpy.context.object
    o.scale=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return register(o,name,mat,slot,False,min(bevel,min(size)*.2))
def tube(name,points,radius,mat,slot='body',cyclic=False):
    d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.resolution_u=1;d.bevel_depth=radius;d.bevel_resolution=2
    p=d.splines.new('POLY');p.points.add(len(points)-1)
    for v,co in zip(p.points,points):v.co=(*B(co),1)
    p.use_cyclic_u=cyclic
    o=bpy.data.objects.new(name,d);collection.objects.link(o)
    return register(o,name,mat,slot)
def cylinder(name,loc,radius,depth,mat,axis='x',slot='body',verts=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=depth,location=B(loc))
    o=bpy.context.object
    direction=B((1,0,0) if axis=='x' else (0,0,1) if axis=='z' else (0,1,0))
    o.rotation_euler=Vector((0,0,1)).rotation_difference(direction).to_euler()
    return register(o,name,mat,slot,True,.001)
def ring(name,loc,r,minor,mat,axis='x',slot='body'):
    bpy.ops.mesh.primitive_torus_add(major_segments=72,minor_segments=8,location=B(loc),major_radius=r,minor_radius=minor)
    o=bpy.context.object
    direction=B((1,0,0) if axis=='x' else (0,0,1))
    o.rotation_euler=Vector((0,0,1)).rotation_difference(direction).to_euler()
    return register(o,name,mat,slot)
def lerp_profile(z,profile):
    if z<=profile[0][0]:return profile[0][1]
    slopes=[(b[1]-a[1])/(b[0]-a[0]) for a,b in zip(profile,profile[1:])]
    def tangent(i):
        if i==0:return slopes[0]
        if i==len(profile)-1:return slopes[-1]
        before,after=slopes[i-1],slopes[i]
        if before*after<=0:return 0.0
        h0=profile[i][0]-profile[i-1][0];h1=profile[i+1][0]-profile[i][0]
        w0=2*h1+h0;w1=h1+2*h0
        return (w0+w1)/(w0/before+w1/after)
    for i,((a,v),(b,w)) in enumerate(zip(profile,profile[1:])):
        if z<=b:
            t=(z-a)/(b-a);h=b-a
            return (2*t**3-3*t*t+1)*v+(t**3-2*t*t+t)*h*tangent(i)+(-2*t**3+3*t*t)*w+(t**3-t*t)*h*tangent(i+1)
    return profile[-1][1]
WIDTH=[(-2.25,.84),(-2.05,.94),(-1.55,.99),(-.9,.985),(.4,1.0),(1.62,1.015),(2.24,.965)]
BELT=[(-2.25,.49),(-2.05,.63),(-1.55,.79),(-1.08,.835),(-.2,.85),(.7,.90),(1.6,.94),(2.24,.93)]
BASE=[(-2.25,.17),(-1.7,.14),(.7,.14),(1.8,.18),(2.24,.29)]
def w(z):return lerp_profile(z,WIDTH)
def belt(z):return lerp_profile(z,BELT)
def base(z):return lerp_profile(z,BASE)
def arch(z):
    y=base(z)
    for axle in [-1.43,1.62]:
        d=z-axle
        if abs(d)<.389:y=max(y,.355+math.sqrt(max(0,.389**2-d*d)))
    return y
def side_x(z,y):
    t=max(0,min(1,(y-base(z))/(belt(z)-base(z))))
    return w(z)*(.985+.015*t)+.004*math.sin(t*math.pi)
zs=sorted(set([round(-2.25+i*4.49/150,6) for i in range(151)]+[round(a+.389*math.cos(i*math.pi/40),6) for a in [-1.43,1.62] for i in range(41)]))
for sign in [-1,1]:
    label='left' if sign<0 else 'right'
    rows=[]
    for z in zs:
        low=arch(z);hi=max(low+.015,belt(z))
        rows.append([(sign*side_x(z,low+(hi-low)*j/8),low+(hi-low)*j/8,z) for j in range(9)])
    grid('body.side.'+label,rows,'paint',thickness=.012,flip=sign<0)
    for axle,name in [(-1.43,'front'),(1.62,'rear')]:
        # A formed lip and recessed wheel tub share the same arch curve.
        lip=[];tub=[]
        for i in range(65):
            angle=math.pi*i/64;z=axle+.389*math.cos(angle);yy=.355+.389*math.sin(angle)
            lip.append([(sign*(side_x(z,yy)+.001),yy,z),(sign*(side_x(z,yy)-.024),yy-.003,z)])
            tub.append([(sign*.79,yy-.014,z),(sign*(side_x(z,yy)-.024),yy-.014,z)])
        grid('body.arch_lip.'+label+'.'+name,lip,'paint')
        grid('body.wheel_tub.'+label+'.'+name,tub,'cavity')
    sill=[(sign*(w(z)-.017),.14+(z+1)*.012,z) for z in [-.98,-.7,0,.7,1.18]]
    tube('body.rocker_trim.'+label,sill,.022,'carbon')

HOOD=[(-2.25,.476),(-2.0,.565),(-1.55,.73),(-1.08,.844)]
def hood_width(z):return lerp_profile(z,[(-2.25,.64),(-1.7,.715),(-1.08,.77)])
hood_rows=[]
for i in range(61):
    z=-2.25+i*1.17/60;cx=hood_width(z);yy=lerp_profile(z,HOOD)
    hood_rows.append([(cx*(-1+2*j/24),yy+.007*(1-(-1+2*j/24)**2),z) for j in range(25)])
grid('body.hood',hood_rows,'paint',thickness=.008,flip=True)
for sign in [-1,1]:
    rows=[]
    for i in range(61):
        z=-2.25+i*1.17/60;inner=hood_width(z);hh=lerp_profile(z,HOOD)
        rows.append([(sign*(inner+(w(z)-inner)*j/10),hh+(belt(z)-hh)*j/10+.006*math.sin(j/10*math.pi),z) for j in range(11)])
    grid('body.front_shoulder.'+str(sign),rows,'paint',thickness=.012,flip=sign>0)
    tube('body.hood_shutline.'+str(sign),[(sign*hood_width(z),lerp_profile(z,HOOD)+.001,z) for z in [-2.245,-2.1,-1.9,-1.7,-1.4,-1.08]],.0014,'cavity')

CABIN_END=1.20
CANOPY=[[-1.08,.77,.844,.830],[-.88,.735,.952,.918],[-.55,.69,1.105,1.057],[-.18,.65,1.215,1.165],[.25,.635,1.218,1.178],[.60,.59,1.175,1.14],[.94,.505,1.055,1.025],[CABIN_END,.43,.957,.945]]
def canopy(z,k):return lerp_profile(z,[(r[0],r[k]) for r in CANOPY])
rows=[]
for i in range(101):
    z=-1.08+i*(CABIN_END+1.08)/100;ww=canopy(z,1);hh=canopy(z,2);edge=canopy(z,3)
    rows.append([(ww*(-1+2*j/30),hh-(hh-edge)*abs(-1+2*j/30)**3,z) for j in range(31)])
grid('glass.panoramic_canopy',rows,'glass',thickness=.004,flip=True)
for sign in [-1,1]:
    glass=[];shoulder=[];gasket_top=[];gasket_bottom=[];c_pillar=[]
    for i in range(101):
        z=-1.08+i*(CABIN_END+1.08)/100;roofx=canopy(z,1);top=canopy(z,3);bottom=belt(z)+.01
        lowx=w(z)-.075
        if top<bottom+.006:top=bottom+.006
        q=max(0,min(1,(z-.78)/(CABIN_END-.78)));q=q*q*(3-2*q)
        side_x_top=roofx+(lowx-roofx)*q;side_y_top=top+(bottom-top)*q
        glass.append([(sign*(lowx+(side_x_top-lowx)*j/12+.004*(1-q)*math.sin(j/12*math.pi)),bottom+(side_y_top-bottom)*j/12,z) for j in range(13)])
        if q>0:c_pillar.append([(sign*(side_x_top+(roofx-side_x_top)*j/6),side_y_top+(top-side_y_top)*j/6,z) for j in range(7)])
        shoulder.append([(sign*(lowx+(w(z)-lowx)*j/4),bottom+(belt(z)-bottom)*j/4,z) for j in range(5)])
        gasket_top.append((sign*roofx,top,z));gasket_bottom.append((sign*lowx,bottom,z))
    grid('glass.side.'+str(sign),glass,'glass',thickness=.003,flip=sign<0)
    grid('body.shoulder_rail.'+str(sign),shoulder,'paint',thickness=.01,flip=sign>0)
    grid('body.c_pillar.'+str(sign),c_pillar,'paint',thickness=.008,flip=sign<0)
    tube('body.roof_rail.'+str(sign),gasket_top,.0075,'paint')
    tube('glass.belt_seal.'+str(sign),gasket_bottom,.004,'carbon')
    for z,name in [(-.67,'quarter_division'),(.68,'rear_division')]:
        tube('glass.'+name+'.'+str(sign),[(sign*(w(z)-.074),belt(z)+.012,z),(sign*canopy(z,1),canopy(z,3),z)],.004,'carbon')
    door=[]
    for z,yy in [(-.91,belt(-.91)),(-.86,.70),(-.88,.26),(-.77,.22),(.56,.22),(.70,.29),(.72,belt(.72))]:
        door.append((sign*(side_x(z,yy)+.002),yy,z))
    tube('body.door_shutline.'+str(sign),door,.0018,'cavity')
    box('body.flush_handle.'+str(sign),(sign*(w(.57)+.003),.77,.57),(.006,.017,.075),'spoke',bevel=.003)
    box('lamp.side_marker.'+str(sign),(sign*(w(-.99)+.004),.714,-.99),(.008,.017,.095),'cavity')
    box('lamp.side_marker_glow.'+str(sign),(sign*(w(-.99)+.009),.716,-1.013),(.005,.007,.025),'amber',bevel=.001)

rows=[]
for i in range(42):
    z=CABIN_END+(WING['pivot'][2]-CABIN_END)*i/41
    # The fixed deck ends at the real front hinge of the movable aero panel.
    center=lerp_profile(z,[(CABIN_END,.945),(1.45,.942),(WING['pivot'][2],.945)])
    rows.append([(w(z)*(-1+2*j/30),center+(belt(z)-center)*abs(-1+2*j/30)**2,z) for j in range(31)])
grid('body.rear_deck',rows,'paint',thickness=.012,flip=True)
return_rows=[]
for j in range(31):
    x=.43*(-1+2*j/30)
    yy=canopy(CABIN_END,2)-(canopy(CABIN_END,2)-canopy(CABIN_END,3))*abs(x/.43)**3
    return_rows.append([(x,yy,CABIN_END),(x,.945+(belt(CABIN_END)-.945)*(x/w(CABIN_END))**2,CABIN_END+.006)])
grid('body.rear_glass_return',return_rows,'paint',thickness=.006)
tube('glass.rear_seal',[(.43*(-1+2*j/30),canopy(CABIN_END,2)-(canopy(CABIN_END,2)-canopy(CABIN_END,3))*abs(-1+2*j/30)**3,CABIN_END+.001) for j in range(31)],.003,'carbon')

box('nose.lightbar',(0,.477,-2.257),(1.282,.010,.012),'light',bevel=.003)
box('nose.dark_fascia',(0,.362,-2.235),(1.28,.205,.035),'carbon',bevel=.014)
box('nose.intake_recess',(0,.215,-2.218),(1.24,.103,.045),'cavity',bevel=.018)
for s in [-1,1]:
    mesh('nose.corner_bumper.'+str(s),[(s*.64,.477,-2.25),(s*.84,.49,-2.25),(s*.93,.63,-2.05),(s*.89,.18,-2.05),(s*.82,.17,-2.17),(s*.64,.18,-2.17)],[(0,1,4,5),(1,2,3,4)] if s>0 else [(5,4,1,0),(4,3,2,1)],'paint',thickness=.012)
    # Light lenses sit in the sloping fender, with a dark housing return.
    points=[]
    for xx,zz in [(.674,-2.09),(.878,-1.91),(.846,-2.025)]:
        t=(xx-hood_width(zz))/(w(zz)-hood_width(zz));hh=lerp_profile(zz,HOOD)
        yy=hh+(belt(zz)-hh)*t+.006*math.sin(t*math.pi)
        points.append((s*xx,yy+.001,zz))
    face=(0,1,2) if s>0 else (0,2,1)
    mesh('lamp.front_housing.'+str(s),points,[face],'cavity',thickness=.016)
    center=sum((Vector(p) for p in points),Vector())/3
    inner=[tuple(center+(Vector(p)-center)*.50+Vector((0,.004,0))) for p in points]
    mesh('lamp.front_lens.'+str(s),inner,[face],'light',thickness=.003)
box('nose.splitter',(0,.139,-2.245),(1.71,.035,.19),'carbon',bevel=.015)
box('rear.upper_fascia',(0,.855,2.225),(1.915,.135,.043),'paint',bevel=.022)
box('rear.light_recess',(0,.865,2.252),(1.88,.060,.018),'carbon',bevel=.006)
box('rear.full_width_taillight',(0,.873,2.264),(1.855,.012,.012),'red',bevel=.003)
box('rear.carbon_diffuser',(0,.285,2.16),(1.62,.28,.15),'carbon',bevel=.023)
for x in [-.63,-.32,0,.32,.63]:box('rear.diffuser_vane.'+str(x),(x,.195,2.17),(.017,.23,.21),'carbon',bevel=.002)
box('rear.thruster_crossmember',(0,.46,2.168),(1.30,.095,.14),'carbon',bevel=.014)
box('rear.recessed_carbon_valance',(0,.58,2.192),(1.80,.35,.13),'carbon',bevel=.035)
for j in range(5):box('rear.vent_slat.'+str(j),(0,.588+j*.027,2.264),(1.60,.009,.025),'spoke',bevel=.002)
for i,x in enumerate([-.465,-.155,.155,.465]):
    cylinder('rear.coldgas_recess.'+str(i),(x,.461,2.254),.047,.015,'cavity','z')
    ring('rear.coldgas_lip.'+str(i),(x,.461,2.263),.046,.005,'gold','z')
box('rear.plate_mount',(0,.674,2.275),(.31,.105,.009),'spoke',bevel=.008)
for sign in [-1,1]:
    mesh('rear.sculpted_bumper_return.'+str(sign),[(sign*.965,.785,2.244),(sign*.72,.77,2.257),(sign*.72,.43,2.20),(sign*.94,.30,2.20)],[(0,1,2,3)] if sign>0 else [(3,2,1,0)],'paint',thickness=.012)
bpy.ops.object.text_add(location=B((0,.654,2.282)))
plate=bpy.context.object;plate.data.body='RDSTR';plate.data.align_x='CENTER';plate.data.size=.055;plate.data.extrude=.0005;plate.rotation_euler=(math.pi/2,0,0)
register(plate,'rear.plate_lettering','cavity',smooth=False)
bpy.ops.object.convert(target='MESH')
bm=bmesh.new();bm.from_mesh(plate.data)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-6)
bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=1e-6)
bmesh.ops.triangulate(bm,faces=list(bm.faces))
bmesh.ops.delete(bm,geom=[f for f in bm.faces if f.calc_area()<1e-9],context='FACES')
bm.to_mesh(plate.data);bm.free();plate.data.update()
box('underbody.exterior_guard',(0,.117,0),(1.64,.025,3.95),'carbon',bevel=.035)
for sign in [-1,1]:
    for z in [-1.82,2.14]:
        cylinder('exterior.lift_nozzle.'+str(sign)+'.'+str(z),(sign*(.58 if z<0 else .79),.104,z),.040,.045,'gold','y',verts=32)

for slot,center in list(ORIGIN.items()):
    if not slot.startswith('wheel'):continue
    side=-1 if slot.endswith('L') else 1;cx,cy,cz=center
    profile=[(-.142,.264),(-.15,.299),(-.143,.329),(-.122,.348),(-.08,.355),(0,.357),(.08,.355),(.122,.348),(.143,.329),(.15,.299),(.142,.264),(-.142,.264)]
    tire=[]
    for i in range(97):
        a=i*2*math.pi/96
        tire.append([(cx+t,cy+r*math.sin(a),cz+r*math.cos(a)) for t,r in profile])
    grid(slot+'.tire',tire,'rubber',slot)
    for offset in [-.072,-.023,.023,.072]:
        ring(slot+'.tread_groove.'+str(offset),(cx+offset,cy,cz),.355,.0017,'cavity','x',slot)
    face=cx+side*.151
    # A hollow barrel, not a capped cylinder hiding the inset silver aero faces.
    barrel=[]
    for k in range(97):
        angle=k*2*math.pi/96
        barrel.append([(cx+xx,cy+rr*math.sin(angle),cz+rr*math.cos(angle)) for xx,rr in [(-.129,.266),(.129,.266),(.129,.258),(-.129,.258),(-.129,.266)]])
    grid(slot+'.inner_barrel',barrel,'spoke',slot)
    cylinder(slot+'.rotor',(cx+side*.09,cy,cz),.225,.012,'brake','x',slot)
    ring(slot+'.machined_rim',(face,cy,cz),.263,.006,'titanium','x',slot)
    ring(slot+'.inner_rim',(face-side*.012,cy,cz),.247,.004,'spoke','x',slot)
    for i in range(5):
        a=2*math.pi*i/5+.12
        for branch in [-1,1]:
            v=[]
            for radius,angle in [(.058,a+branch*.16),(.258,a+branch*.058+.11),(.257,a+branch*.058+.17),(.065,a+branch*.16+.20)]:
                v.append((face+side*.003,cy+math.sin(angle)*radius,cz+math.cos(angle)*radius))
            mesh(slot+'.spoke.'+str(i)+'.'+str(branch),v,[(0,1,2,3)],'spoke',slot,False,.013)
        # Five subtly dished silver aero sectors, matching the official wheel layout.
        sec=[]
        for j in range(15):
            angle=a+.26+j*(2*math.pi/5-.41)/14
            sec.append([(face-side*.018,cy+.083*math.sin(angle),cz+.083*math.cos(angle)),(face-side*.027,cy+.245*math.sin(angle),cz+.245*math.cos(angle))])
        grid(slot+'.aero_sector.'+str(i),sec,'titanium',slot,flip=side>0,thickness=.003)
    cylinder(slot+'.centre_cap',(face+side*.012,cy,cz),.057,.021,'spoke','x',slot,verts=40)
    for i in range(5):
        a=i*2*math.pi/5
        cylinder(slot+'.lug.'+str(i),(face+side*.02,cy+.038*math.sin(a),cz+.038*math.cos(a)),.006,.004,'titanium','x',slot,verts=12)
    box(slot+'.visible_caliper',(cx+side*.07,cy+.02,cz+.184),(.046,.126,.071),'caliper',slot,.012)

# The active blade is a real airfoil with a closed return, not a floating plane.
wing_parts_start=len(parts)
rows=[]
for i in range(49):
    x=-.974+1.948*i/48;row=[]
    for z,yy in [(1.65,.950),(1.75,.963),(1.96,.978),(2.238,.951),(2.246,.935),(1.96,.932),(1.75,.932),(1.65,.950)]:
        row.append((x,yy+.008*(abs(x)/.974)**2,z))
    rows.append(row)
grid('wing.airfoil',rows,'paint','wing',caps=True)
for sign in [-1,1]:
    mesh('wing.endplate.'+str(sign),[(sign*.978,.950,1.65),(sign*.996,.950,2.246),(sign*.996,.845,2.274),(sign*.978,.900,1.67)],[(0,1,2,3) if sign>0 else (3,2,1,0)],'paint','wing',False,.008)
    box('wing.underside_hinge.'+str(sign),(sign*.48,.920,1.96),(.068,.041,.082),'spoke','wing',.009)
    box('wing.deck_mount.'+str(sign),(sign*.48,.905,1.80),(.105,.025,.133),'spoke','body',.009)
    cylinder('wing.upper_pivot.'+str(sign),(sign*.486,.920,1.96),.019,.077,'titanium','x','wing',verts=32)
    cylinder('wing.lower_pivot.'+str(sign),(sign*.486,.905,1.80),.017,.080,'titanium','x','body',verts=32)
    cylinder('wing.leading_hinge.'+str(sign),(sign*.72,.945,1.65),.014,.09,'spoke','x','body',verts=32)
for ob in parts[wing_parts_start:]:
    if ob['runtimeSlot']=='wing':
        world=ob.matrix_world.copy();ob.parent=wing;ob.matrix_world=world
for component,index,expression in [('rotation_euler',0,'-.62*d')]:
    f=wing.driver_add(component,index);dr=f.driver;dr.type='SCRIPTED'
    v=dr.variables.new();v.name='d';v.type='SINGLE_PROP';v.targets[0].id=wing;v.targets[0].data_path='["deployment"]'
    dr.expression=expression
struts=[]
for sign in [-1,1]:
    base_target=bpy.data.objects.new('wing.base_target.'+str(sign),None);collection.objects.link(base_target)
    base_target.parent=root;base_target.location=B((sign*.48,WING['baseY'],WING['baseZ']))
    top_target=bpy.data.objects.new('wing.hinge_target.'+str(sign),None);collection.objects.link(top_target)
    top_target.parent=wing;top_target.location=B((sign*.48,WING['mount'][1],WING['mount'][2]))
    for segment,mat,fraction,midpoint in [('outer','spoke',.58,.29),('inner','titanium',.55,.725)]:
        ob=box('wing.telescopic_pylon.'+segment+'.'+str(sign),(sign*.48,.94,2.065),(1,1,1),mat,bevel=0)
        ob['runtimeSlot']='support'
        ob.scale=(.047 if segment=='outer' else .026,.069 if segment=='outer' else .045,1)
        base_constraint=ob.constraints.new('COPY_LOCATION');base_constraint.target=base_target
        midpoint_constraint=ob.constraints.new('COPY_LOCATION');midpoint_constraint.target=top_target;midpoint_constraint.influence=midpoint
        track=ob.constraints.new('DAMPED_TRACK');track.target=top_target;track.track_axis='TRACK_Z'
        curve=ob.driver_add('scale',2);driver=curve.driver;driver.type='SCRIPTED'
        variable=driver.variables.new();variable.name='length';variable.type='LOC_DIFF'
        variable.targets[0].id=base_target;variable.targets[1].id=top_target
        driver.expression='max(.006,length*'+str(fraction)+')'
        struts.append(ob)
for frame,value in [(1,0),(21,.5),(41,1),(61,.5),(81,0)]:
    scene.frame_set(frame);wing['deployment']=value;wing.keyframe_insert(data_path='["deployment"]',frame=frame)
scene.frame_start=1;scene.frame_end=81;scene.frame_set(1);bpy.context.view_layer.update()

# Fixed neutral studio cameras; identical positions are kept across candidates.
world=bpy.data.worlds.new('Neutral_Studio');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.13,.15,.18,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.4
def area(name,loc,power,size,target=(0,.5,0)):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=B(loc)
    o.rotation_euler=(B(target)-o.location).to_track_quat('-Z','Y').to_euler()
area('Key_Softbox',(2.8,6,-2.5),1400,5)
area('White_Rim',(-3,3,2),1100,4)
area('Front_Fill',(1,2,-6),550,3)
floor_mat=material('Studio_Floor',(.065,.075,.09),.1,.55)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.005));floor=bpy.context.object;floor.name='Studio_Floor';floor.data.materials.append(floor_mat)
camera=bpy.data.objects.new('Fixed_Review_Camera',bpy.data.cameras.new('Fixed_Review_Camera'));scene.collection.objects.link(camera);scene.camera=camera
VIEWS={'front':((7.5,3.0,-9.2),65),'side':((10.2,1.2,0),63),'rear':((7.4,3.0,9.0),65),'wing':((7.0,3.8,9.3),62)}
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.cycles.max_bounces=4
scene.render.resolution_x=1100;scene.render.resolution_y=760;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
camera.location=B(VIEWS['front'][0]);camera.rotation_euler=(B((0,.63,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=65

# Persist runtime slots so a manually edited .blend can be exported directly.
scene['roadster.origins']=json.dumps(ORIGIN)
scene['roadster.wing']=json.dumps(WING)
scene['roadster.revision']='20261026-blackglass-photo-exterior'
scene['roadster.reviewViews']=json.dumps(VIEWS)
sys.path.insert(0,str(Path(__file__).resolve().parent))
from roadster_export import export_exterior
export_exterior(out,save_blend=True)
if opt.render:
    for name,(position,lens) in VIEWS.items():
        scene.frame_set(41 if name=='wing' else 1)
        camera.location=B(position);camera.rotation_euler=(B((0,.63 if name!='wing' else .82,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=lens
        scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
print('ROADSTER_BUILD_COMPLETE',json.dumps({'objects':len(parts),'elapsedSeconds':time.perf_counter()-started}))
