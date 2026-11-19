(() => {
  'use strict';
  const M=window.EvolutionModels,$=id=>document.getElementById(id),ctx=$('planet-canvas').getContext('2d'),off=document.createElement('canvas'),ox=off.getContext('2d');
  const controls=['impacts','volcanism','erosion','tides'];
  let currentView="surface";
  const slopeCache=new WeakMap();
  let run=null,frame=30,angle=.4,playing=false,comparing=false,armed=false,seed=47,events=[],dirty=true,last=0,elapsed=0,drag=null,hover=null,raf=0,revision=0;
  const sphereSize=360;off.width=off.height=sphereSize;
  const pixels=[];
  for(let py=0;py<sphereSize;py++)for(let px=0;px<sphereSize;px++){
    const x=(px+.5-sphereSize/2)/(sphereSize/2),y=-(py+.5-sphereSize/2)/(sphereSize/2),rr=x*x+y*y;
    if(rr<=1)pixels.push({i:(py*sphereSize+px)*4,x,y,z:Math.sqrt(1-rr),left:px<sphereSize/2});
  }
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*M.clamp(t,0,1));
  Object.entries(M.PRESETS).forEach(([key,p])=>{const o=document.createElement('option');o.value=key;o.textContent=p.name+' · '+p.kind;$('world-select').append(o)});
  $('world-select').value='moon';
  function setPlaying(value){playing=value;$('play').textContent=value?'Pause':'Play';$('play').setAttribute('aria-pressed',String(value));}
  function setArmed(value){if(value&&comparing){comparing=false;$('compare').setAttribute('aria-pressed','false');update();}armed=value;$('impact').setAttribute('aria-pressed',String(value));$('impact').textContent=value?'Cancel impact':'Place an impact';$('viewer').classList.toggle('armed',value);$('gesture-hint').textContent=value?'Tap the globe to make an impact':'Drag to turn · arrows on keyboard';}
  function options(){return {preset:$('world-select').value,seed,events,...Object.fromEntries(controls.map(k=>[k,Number($(k).value)]))};}
  async function calculate(target=30,playAfter=false,appliedOptions=null){
    setPlaying(false);setArmed(false);const mine=++revision;$('busy').hidden=false;$('rerun').disabled=true;
    await new Promise(resolve=>setTimeout(resolve,25));
    try{
      const result=M.simulate(appliedOptions||options());if(mine!==revision)return;run=result;frame=M.clamp(target,0,run.frames);
      $('world-name').textContent=run.p.name;$('world-kind').textContent=run.p.kind+' · synthetic terrain';$('world-note').textContent=run.p.note;
      $('seed').textContent='Terrain seed '+seed+' · radius '+run.p.radius.toLocaleString('en-GB')+' km';
      $('tides').disabled=!run.p.tides;$('tides-out').textContent=run.p.tides?Number($('tides').value).toFixed(1)+'×':'Not applied';
      $('experiment').textContent=run.p.tides?'Turn sustained tidal heat off and rerun. Does the same world keep renewing its surface?':'Turn surface renewal off. How many more scars survive on the same starting world?';
      update();dirty=true;setPlaying(playAfter);
    }catch(error){$('toast').textContent='The simulation could not run: '+error.message;console.error(error)}
    finally{if(mine===revision){$('busy').hidden=true;$('rerun').disabled=false;}}
  }
  function update(){if(!run)return;const s=run.snapshots[frame];$('timeline').value=frame;$('timeline').setAttribute('aria-valuetext',(s.time/1000).toFixed(2)+' billion model years');$('age').textContent=(s.time/1000).toFixed(2)+' billion years';$('heat-stat').textContent=s.heat.toFixed(2);$('impact-stat').textContent=s.impacts;$('fresh-stat').textContent=s.stats.fresh.toFixed(1)+'%';
    const ev=run.eventLog.filter(e=>e.frame<=frame).slice(-1)[0];
    $('event-status').textContent=frame===0?'The starting terrain. Press Play to begin its history.':ev?ev.type+' at '+(run.snapshots[ev.frame].time/1000).toFixed(2)+' billion model years. '+ev.text:'Cooling and relief relaxation continue between events.';
    $('compare-hint').textContent=comparing?'Left: start · Right: selected time':'Numerical process model';dirty=true;
  }
  function viewport(){const rect=$('planet-canvas').getBoundingClientRect();return {w:rect.width,h:rect.height,r:Math.min(rect.width*.39,rect.height*(rect.width<500?.34:.39)),cx:rect.width/2,cy:rect.height*(rect.width<500?.56:.52)};}
  function worldPoint(clientX,clientY){const rect=$('planet-canvas').getBoundingClientRect(),v=viewport(),x=(clientX-rect.left-v.cx)/v.r,y=-(clientY-rect.top-v.cy)/v.r;if(x*x+y*y>1)return null;const z=Math.sqrt(Math.max(0,1-x*x-y*y));return {x:x*Math.cos(angle)+z*Math.sin(angle),y,z:-x*Math.sin(angle)+z*Math.cos(angle),comparisonStart:comparing&&x<0};}
  function inspect(point){if(!run||!point)return;const s=run.snapshots[point.comparisonStart?0:frame],h=M.sample(s.height,run.geometry,point.x,point.y,point.z),lat=Math.asin(point.y)*180/Math.PI,lon=Math.atan2(point.x,point.z)*180/Math.PI;$('inspect').textContent=(point.comparisonStart?'Starting elevation ':'Model elevation ')+h.toFixed(2)+' km · '+Math.abs(lat).toFixed(1)+'°'+(lat<0?'S':'N')+' / '+Math.abs(lon).toFixed(1)+'°'+(lon<0?'W':'E')+' · '+(armed?'Tap to place an impact.':'Drag to explore.');}
  async function impact(point){if(!run||!point)return;if(comparing){comparing=false;$('compare').setAttribute('aria-pressed','false');update();}const f=Math.max(1,frame);events.push({frame:f,centre:point,radius:.16,depth:run.p.icy?1.4:4});$('toast').textContent='Impact added to the running conditions. Unrun slider changes remain pending.';await calculate(f,false,{...run.options,events:[...events]});}
  function colour(p,s,h,mat,fresh,x,y,z,baseHeight){
    const mode=currentView;
    if(mode==='elevation'){return h<0?mix([35,66,98],[111,157,174],(h+7)/7):mix([149,131,92],[243,235,218],h/6);}
    if(mode==='change'){const delta=h-baseHeight;return delta<0?mix([94,89,106],[135,103,209],-delta/4):mix([94,89,106],[240,176,103],delta/4);}
    let c;
    if(p.ocean&&h<0&&s.heat<.72)c=mix([24,55,77],[64,130,144],M.clamp(1+h/2,0,1));
    else c=mix(p.low,p.colour,.45+mat*.5+h*.08);
    if(p.ocean&&h>=0){c=mix(c,[209,195,157],Math.max(0,h-1)/4);if(Math.abs(y)>.83&&s.heat<.6)c=mix(c,[212,224,219],(Math.abs(y)-.83)/.12);}
    if(p.icy){const fracture=Math.abs(Math.sin(x*22+y*11+z*3)*Math.sin(z*17-x*7));if(fracture<.035)c=mix(c,[133,92,71],.65*(1-fracture/.035));}
    const magma=Math.max(0,(s.heat-.66)/.38);if(!p.icy&&magma>0){const flow=M.clamp(magma*(1.1-.17*h)+fresh*.25,0,1);c=mix(c,[230,80+50*magma,22],flow);}
    if(presetIsIo(p)&&fresh>.55)c=mix(c,[230,101,39],(fresh-.55)*1.8);
    return c;
  }
  function presetIsIo(p){return p===M.PRESETS.io;}
  function slopes(state,g){if(slopeCache.has(state))return slopeCache.get(state);const dx=new Float32Array(g.n),dy=new Float32Array(g.n);for(let j=0;j<g.height;j++)for(let i=0;i<g.width;i++){const k=j*g.width+i;dx[k]=(state.height[j*g.width+(i+1)%g.width]-state.height[j*g.width+(i+g.width-1)%g.width])*.26;dy[k]=(state.height[Math.min(g.height-1,j+1)*g.width+i]-state.height[Math.max(0,j-1)*g.width+i])*.18;}const value={dx,dy};slopeCache.set(state,value);return value;}
  function render(){if(!run)return;const v=viewport(),dpr=Math.min(window.devicePixelRatio||1,1.5),canvas=$('planet-canvas');if(canvas.width!==Math.round(v.w*dpr)||canvas.height!==Math.round(v.h*dpr)){canvas.width=Math.round(v.w*dpr);canvas.height=Math.round(v.h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,v.w,v.h);
    const starRng=M.seeded(99);for(let n=0;n<100;n++){const sx=starRng()*v.w,sy=starRng()*v.h;ctx.fillStyle='rgba(207,216,235,'+(.12+starRng()*.45)+')';ctx.fillRect(sx,sy,n%9===0?1.5:.7,n%9===0?1.5:.7);}
    const glow=ctx.createRadialGradient(v.cx,v.cy,v.r*.9,v.cx,v.cy,v.r*1.23);glow.addColorStop(0,'#91b3c822');glow.addColorStop(1,'#91b3c800');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(v.cx,v.cy,v.r*1.23,0,Math.PI*2);ctx.fill();
    const out=ox.createImageData(sphereSize,sphereSize),g=run.geometry,now=run.snapshots[frame],start=run.snapshots[0],cos=Math.cos(angle),sin=Math.sin(angle);
    for(const pt of pixels){
      const s=comparing&&pt.left?start:now,x=pt.x*cos+pt.z*sin,z=-pt.x*sin+pt.z*cos,y=pt.y,h=M.sample(s.height,g,x,y,z),mat=M.sample(s.material,g,x,y,z),fresh=M.sample(s.fresh,g,x,y,z),base=M.sample(start.height,g,x,y,z);
      const lon=(Math.atan2(x,z)+Math.PI*2)%(Math.PI*2),j=M.clamp(Math.floor((y+1)*g.height/2),0,g.height-1),i=Math.floor(lon/(Math.PI*2)*g.width),k=j*g.width+i;
      const normals=slopes(s,g),dx=M.sample(normals.dx,g,x,y,z),dy=M.sample(normals.dy,g,x,y,z);
      let shade=M.clamp(.22+.9*(-.42*pt.x+.4*pt.y+.78*pt.z)+dx*cos-dy,.10,1.22);
      const c=colour(run.p,s,h,mat,fresh,x,y,z,base),grain=1+.035*Math.sin(97*x+61*y+48*z)*Math.cos(111*z-45*x+78*y),rim=Math.pow(1-pt.z,5)*.15;
      out.data[pt.i]=M.clamp(c[0]*shade*grain+rim*75,0,255);out.data[pt.i+1]=M.clamp(c[1]*shade*grain+rim*105,0,255);out.data[pt.i+2]=M.clamp(c[2]*shade*grain+rim*140,0,255);out.data[pt.i+3]=255;
    }
    ox.putImageData(out,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(off,v.cx-v.r,v.cy-v.r,v.r*2,v.r*2);
    if(comparing){ctx.strokeStyle='#e9dfcc88';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(v.cx,v.cy-v.r);ctx.lineTo(v.cx,v.cy+v.r);ctx.stroke();ctx.fillStyle='#e8dfd0';ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText('START',v.cx-v.r*.48,v.cy+v.r+18);ctx.fillText('NOW',v.cx+v.r*.48,v.cy+v.r+18);}
    renderChart();dirty=false;
  }
  function renderChart(){const c=$('history-chart'),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);c.width=Math.round(r.width*d);c.height=80*d;const x=c.getContext('2d');x.scale(d,d);const max=Math.max(1,...run.snapshots.map(s=>s.heat)),w=r.width;x.strokeStyle='#39404d';x.beginPath();x.moveTo(0,72);x.lineTo(w,72);x.stroke();x.strokeStyle='#ddb38c';x.lineWidth=1.6;x.beginPath();run.snapshots.forEach((s,i)=>{const px=i/run.frames*w,py=68-s.heat/max*55;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();x.strokeStyle='#b9a9df';x.beginPath();x.moveTo(frame/run.frames*w,5);x.lineTo(frame/run.frames*w,75);x.stroke();}
  function tick(now){const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(playing&&run){elapsed+=dt*Number($('speed').value);if(elapsed>=1){const step=Math.floor(elapsed);elapsed-=step;frame=Math.min(run.frames,frame+step);update();if(frame===run.frames)setPlaying(false);}}if(dirty)render();raf=requestAnimationFrame(tick);}
  $('play').onclick=()=>{if(!run)return;if(frame===run.frames){frame=0;update()}setPlaying(!playing);};
  $('restart').onclick=()=>{setPlaying(false);frame=0;update();};
  $('timeline').oninput=()=>{setPlaying(false);frame=Number($('timeline').value);update();};
  $('compare').onclick=()=>{comparing=!comparing;$('compare').setAttribute('aria-pressed',String(comparing));update();};
  $('impact').onclick=()=>{setPlaying(false);setArmed(!armed);};
  $('view-mode').onchange=()=>{const mode=$('view-mode').value;currentView=mode;$('view-badge').textContent=mode==='surface'?'Surface':mode==='elevation'?'Elevation':'Change';$('view-legend').textContent=mode==='surface'?'Synthetic colours and exaggerated relief; an illustration of the calculated surface.':mode==='elevation'?'Blue: lower terrain · sand / ivory: higher terrain. Model heights are in kilometres.':'Violet: lowered since start · copper: raised since start · grey: little change.';dirty=true;};
  for(const key of controls)$(key).oninput=()=>{$(key+'-out').textContent=Number($(key).value).toFixed(1)+'×';$('toast').textContent='Conditions changed. Run them to update the history.';};
  $('rerun').onclick=()=>{$('toast').textContent='History recalculated with your conditions.';calculate(0,false);};
  $('new-seed').onclick=()=>{seed=(seed+137)>>>0;events=[];$('toast').textContent='A new terrain, under the same conditions.';calculate(30,false);};
  function defaults(){events=[];controls.forEach(k=>{$(k).value=1;$(k+'-out').textContent='1.0×';});$('toast').textContent='';calculate(30,false);}
  $('world-select').onchange=defaults;$('reset').onclick=defaults;
  const canvas=$('planet-canvas');canvas.addEventListener('pointerdown',e=>{const point=worldPoint(e.clientX,e.clientY);if(armed){impact(point);return;}drag={x:e.clientX,angle,moved:false};canvas.setPointerCapture(e.pointerId);inspect(point);});
  canvas.addEventListener('pointermove',e=>{if(drag){if(Math.abs(e.clientX-drag.x)>3)drag.moved=true;angle=drag.angle+(e.clientX-drag.x)/150;dirty=true;}else inspect(worldPoint(e.clientX,e.clientY));});
  canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){angle+=(e.key==='ArrowLeft'?-1:1)*.15;dirty=true;e.preventDefault();}else if(e.key.toLowerCase()==='i'){setPlaying(false);impact({x:Math.sin(angle),y:0,z:Math.cos(angle)});e.preventDefault();}else if(e.key===' '){setPlaying(!playing);e.preventDefault();}});
  const ro=new ResizeObserver(()=>{dirty=true;});ro.observe($('viewer'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);ro.disconnect();});
  calculate();raf=requestAnimationFrame(tick);
})();
