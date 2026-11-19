"""Create share covers from the committed numerical models (Pillow required).

These are editorial covers, not browser screenshots. Curves, distributions,
star coordinates and terrain are sampled from the same model code as the pages.
"""
from pathlib import Path
import json
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/exploration-runtime'
cards = ASSETS / 'cards'
cards.mkdir(exist_ok=True)
data = json.loads((ROOT / 'app/labs/explorations/catalogue.json').read_text())
node = r'''
const p=require('./public/exploration-runtime/modules/labs.js').models;
const w=require('./public/exploration-runtime/modules/worlds.js').models;
const s=require('./public/exploration-runtime/modules/sky.js').model;
const e=require('./public/exploration-runtime/modules/evolution-model.js');
const curves=[2.3,2.61,2.8,3.5,5].map(b=>p.traceSchwarzschild(b).points.map(q=>[q.x,q.y]));
const cfg={wavelength:550e-9,slitWidth:35e-6,separation:180e-6,distance:1};
const dist=p.detectorDistribution(cfg,.012,800),rnd=p.seededRandom(42);
const dots=Array.from({length:1600},()=>[p.sampleDetector(dist,rnd()),rnd()]);
const wave=p.stationaryBarrier(1,2.5,.35);
const tunnel=Array.from({length:800},(_,i)=>{const x=-1.2+i*3/799;return[x,wave.wave(x).re];});
const gaussians=[.25,.7,1.5].map(sig=>Array.from({length:500},(_,i)=>{const x=-5+i*10/499;return[x,p.normalDensity(x,sig)];}));
const membrane=Array.from({length:128*128},(_,i)=>p.membraneShape((i%128)/127,Math.floor(i/128)/127,3,5,Math.PI/4));
const gs=p.grayScottState(96,'coral',47);p.grayScottStep(gs,3600);
const gravity=['moon','mars','earth','jupiter'].map(k=>{const cfg={speed:12,angleDeg:55,gravity:w.GRAVITY[k].g};const end=w.projectileStats(cfg).flightTime;return {name:w.GRAVITY[k].name,colour:w.GRAVITY[k].colour,points:Array.from({length:150},(_,i)=>{const q=w.projectileAt(i/149*end,cfg);return[q.x,q.y];})};});
const orion=s.constellations.find(x=>x.id==='Ori');
const sky=s.constellationStars(orion).map(x=>{const future=s.cartesianToSpherical(s.propagateStar(x,100000));return{id:x.id,ra:x.raDeg,dec:x.decDeg,mag:x.vMag,futureRa:future.raDeg,futureDec:future.decDeg};});
const dipper=s.stars.map(x=>({id:x.id,ra:x.raDeg,dec:x.decDeg,mag:x.vMag,distance:s.distancePc(x)}));
const run=e.simulate({preset:'moon',width:96,height:48,frames:45,seed:47});
console.log(JSON.stringify({curves,dots,pattern:Array.from({length:800},(_,i)=>{const x=-.012+i*.024/799;return[x,p.diffractionIntensity(x,cfg)];}),tunnel,gaussians,membrane,gray:Array.from(gs.v),gravity,sky,dipper,dipperLinks:s.links,links:orion.links,interior:w.INTERIORS.earth.layers,tectonic:w.tectonicFrame('convergent',.7),terrain:Array.from(run.snapshots[run.frames].height)}));
'''
models = json.loads(subprocess.check_output(['node', '-e', node], cwd=ROOT, text=True))
BG, INK, COPPER, PURPLE, MUTED = '#10121b', '#f2eee5', '#d8a077', '#b8a8df', '#a5a4b5'
fontfile = ASSETS / 'fonts/Jost.ttf'
bodyfile = ASSETS / 'fonts/Inter.ttf'
def font(size, body=False): return ImageFont.truetype(str(bodyfile if body else fontfile), size)
def line(draw, points, colour=COPPER, width=3):
    if len(points)>1: draw.line(points, fill=colour, width=width, joint='curve')
def wrap(draw, words, size, width):
    lines, current = [], ''
    for word in words.split():
        trial = (current+' '+word).strip()
        if current and draw.textlength(trial,font=font(size))>width: lines.append(current);current=word
        else: current=trial
    return lines+[current]
def shade(value):
    t=max(0,min(1,value));return (int(24+t*189),int(24+t*137),int(37+t*106))

for item in data['items']:
    image=Image.new('RGB',(1600,900),BG); draw=ImageDraw.Draw(image)
    ident=item['id']; cx,cy=1170,445
    if ident=='black-hole-light':
        for n,curve in enumerate(models['curves']):
            points=[(cx+x*32,cy-y*32) for x,y in curve if -13<x<13 and -9<y<9]
            line(draw,points,COPPER if n==1 else '#65596a',4 if n==1 else 2)
        draw.ellipse((cx-48,cy-48,cx+48,cy+48),outline='#5a5266',width=2)
        draw.ellipse((cx-32,cy-32,cx+32,cy+32),fill='#04070d',outline=COPPER,width=2)
    elif ident=='black-hole':
        for y,rate in [(300,1),(590,math.sqrt(1-1/1.5))]:
            draw.ellipse((cx-115,y-115,cx+115,y+115),outline='#484253',width=3)
            angle=1.9*rate
            line(draw,[(cx,y),(cx+90*math.sin(angle),y-90*math.cos(angle))],COPPER,5)
            draw.ellipse((cx-5,y-5,cx+5,y+5),fill=INK)
        draw.text((cx+150,280),'1.00×',font=font(32),fill=MUTED)
        draw.text((cx+150,570),'0.58×',font=font(32),fill=COPPER)
    elif ident=='double-slit':
        line(draw,[(850+x/.024*640+320,340-v*170) for x,v in models['pattern']],COPPER,3)
        for x,y in models['dots']:
            px,py=850+(x/.024+.5)*640,420+y*220
            draw.ellipse((px-1.8,py-1.8,px+1.8,py+1.8),fill=PURPLE)
    elif ident=='tunnelling':
        draw.rectangle((1070,240,1145,660),fill='#322e3c',outline='#6f5e75',width=2)
        line(draw,[(815+(x+1.2)/3*700,450-y*135) for x,y in models['tunnel']],COPPER,3)
        line(draw,[(810,450),(1520,450)],'#454151',1)
    elif ident=='uncertainty':
        for i,curve in enumerate(models['gaussians']):line(draw,[(820+(x+5)*70,650-y*260) for x,y in curve],[COPPER,PURPLE,'#6b728d'][i],4)
        line(draw,[(810,650),(1520,650)],'#454151',1)
    elif ident in ('sound-patterns','living-patterns'):
        size=128 if ident=='sound-patterns' else 96
        values=models['membrane'] if ident=='sound-patterns' else models['gray']
        tile=Image.new('RGB',(size,size));pixels=tile.load()
        for y in range(size):
            for x in range(size):
                value=values[y*size+x]
                intensity=math.exp(-abs(value)*17) if ident=='sound-patterns' else value/.4
                pixels[x,y]=shade(intensity)
        image.paste(tile.resize((640,640),Image.Resampling.BICUBIC),(835,130));draw=ImageDraw.Draw(image)
    elif ident=='gravity':
        for curve in models['gravity']:
            line(draw,[(830+x*6,690-y*9) for x,y in curve['points']],curve['colour'],4)
        line(draw,[(825,690),(1530,690)],'#454151',2)
    elif ident in ('stories','time'):
        points={q['id']:(cx-(q['ra']-84)*19,cy-(q['dec']-4)*16) for q in models['sky']}
        for a,b in models['links']:
            if a in points and b in points:line(draw,[points[a],points[b]],'#75667c',3)
        for q in models['sky']:
            x,y=points[q['id']];r=max(3,8-q['mag'])
            draw.ellipse((x-r,y-r,x+r,y+r),fill=INK)
            if ident=='time':line(draw,[(x,y),(cx-(q['futureRa']-84)*19,cy-(q['futureDec']-4)*16)],PURPLE,2)
    elif ident=='depth':
        points={q['id']:(830+(q['ra']-160)*12,650-(q['dec']-45)*16) for q in models['dipper']}
        for a,b in models['dipperLinks']:
            line(draw,[points[a],points[b]],'#75667c',3)
        for q in models['dipper']:
            x,y=points[q['id']];r=max(4,9-q['mag']);draw.ellipse((x-r,y-r,x+r,y+r),fill=INK)
            draw.text((x+12,y+8),str(round(q['distance']*3.26156))+' ly',font=font(18,True),fill=MUTED)
    elif ident=='interiors':
        for layer in models['interior']:
            r=300*layer['r'];draw.ellipse((cx-r,cy-r,cx+r,cy+r),fill=layer['colour'])
        draw.pieslice((cx-300,cy-300,cx+300,cy+300),225,315,fill=BG)
    elif ident=='evolution':
        planet=Image.new('RGB',(600,600),BG);pix=planet.load();field=models['terrain']
        for y in range(600):
            for x in range(600):
                nx,ny=(x-300)/285,(300-y)/285;r2=nx*nx+ny*ny
                if r2>=1:continue
                nz=math.sqrt(1-r2);lon=math.atan2(nx,nz)%(2*math.pi)
                row=min(47,max(0,int((ny+1)*24)));col=min(95,int(lon/(2*math.pi)*96))
                h=field[row*96+col];light=max(.12,nz*.7-nx*.4+ny*.25)
                v=int(max(20,min(255,(150+h*19)*light)))
                pix[x,y]=(v,int(v*.97),int(v*.94))
        image.paste(planet,(870,145));draw=ImageDraw.Draw(image)
    elif ident=='past-earth':
        draw.polygon([(830,410),(1090,410),(1180,485),(1480,485),(1480,590),(1110,590),(1030,485),(830,485)],fill='#866254')
        draw.polygon([(1070,390),(1180,390),(1270,300),(1380,390),(1500,390),(1500,460),(1180,460)],fill='#b9876b')
        line(draw,[(840,400),(1075,400),(1190,510),(1380,610)],COPPER,7)
    elif ident=='surfaces':
        for y in range(210,690):
            t=(y-210)/480;draw.line([(820,y),(1515,y)],fill=(int(63+t*122),int(54+t*85),int(63+t*57)))
        draw.ellipse((1155,410,1275,530),fill='#e2c3a1')
        draw.polygon([(820,620),(930,565),(1050,615),(1200,570),(1350,630),(1515,595),(1515,690),(820,690)],fill='#47312d')
    # Panel boundary keeps the cover legible without pretending to be a screenshot.
    draw.line((755,95,755,770),fill='#34323f',width=2)
    draw.text((72,89),'EXPLORATIONS / '+item['category'].upper(),font=font(21,True),fill=COPPER)
    lines=wrap(draw,item['title'],72,620);y=245
    for text in lines:draw.text((68,y),text,font=font(72),fill=INK);y+=88
    short=wrap(draw,item['topic'],28,600)
    for text in short:draw.text((72,y+35),text,font=font(28,True),fill=MUTED);y+=42
    draw.text((72,780),'Sammii Kellow',font=font(33),fill=INK)
    draw.text((72,828),'labs.sammii.dev',font=font(22,True),fill=MUTED)
    image.save(cards/(item['slug']+'.png'),optimize=True)

print(json.dumps({'cards':len(data['items']),'dimensions':[1600,900],'model_source':'committed exploration-runtime modules'}))
