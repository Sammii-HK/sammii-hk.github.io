(function (root) {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const PRESETS = {
    earth: {name:'Earth', kind:'Rocky planet', radius:6371, colour:[119,136,91], low:[57,88,73], ocean:true, heat:1, equilibrium:.34, cooling:1500, diffusion:100, impacts:55, volcanoes:85, uplift:.0011, note:'Water, active rock and a surface continually reworked. The continents here are generated, not historical maps.'},
    moon: {name:'Moon', kind:'Rocky moon', radius:1737.4, colour:[174,172,162], low:[102,103,103], heat:1, equilibrium:.015, cooling:760, diffusion:.55, impacts:145, volcanoes:22, uplift:0, note:'An airless world retains the scars of impacts. Early volcanic plains can bury older terrain.'},
    mars: {name:'Mars', kind:'Rocky planet', radius:3389.5, colour:[186,113,76], low:[105,65,53], heat:1, equilibrium:.07, cooling:1150, diffusion:5, impacts:95, volcanoes:48, uplift:.00015, note:'A cooling rocky world with a long volcanic history. Wind, rivers and climate are not solved in this model.'},
    mercury: {name:'Mercury', kind:'Rocky planet', radius:2439.7, colour:[166,151,133], low:[96,85,80], heat:1, equilibrium:.035, cooling:850, diffusion:.7, impacts:130, volcanoes:30, uplift:0, note:'Impacts and early volcanic resurfacing compete as this small rocky world cools.'},
    venus: {name:'Venus', kind:'Rocky planet', radius:6051.8, colour:[192,150,87], low:[105,73,51], heat:1, equilibrium:.3, cooling:1600, diffusion:75, impacts:45, volcanoes:150, uplift:.0005, note:'A volcanic world seen without its clouds. This is a synthetic surface, not a prediction of a global resurfacing event.'},
    io: {name:'Io', kind:'Volcanic moon', radius:1821.6, colour:[210,179,94], low:[122,72,42], heat:.72, equilibrium:.05, cooling:420, tides:.73, diffusion:6, impacts:45, volcanoes:360, uplift:0, note:'Tidal heating sustains volcanism and buries older scars. The time and resurfacing rates are accelerated and uncalibrated.'},
    europa: {name:'Europa', kind:'Icy moon', radius:1560.8, colour:[203,210,202], low:[146,151,145], icy:true, heat:.32, equilibrium:.03, cooling:680, tides:.3, diffusion:8, impacts:65, volcanoes:100, uplift:0, note:'Ice relaxation and renewed surface material erase scars. Fracture traces are illustrative; ice-shell stresses are not solved.'},
    enceladus: {name:'Enceladus', kind:'Icy moon', radius:252.1, colour:[212,224,225], low:[134,160,173], icy:true, heat:.28, equilibrium:.02, cooling:230, tides:.26, diffusion:.06, impacts:70, volcanoes:90, uplift:0, note:'A small icy world with sustained internal activity. This whole-sphere model does not resolve the real south-polar jets.'}
  };
  function seeded(seed) { let value = seed >>> 0 || 1; return () => { value ^= value << 13; value ^= value >>> 17; value ^= value << 5; return (value >>> 0) / 4294967296; }; }
  function geometry(width=96,height=48) {
    const n=width*height,x=new Float64Array(n),y=new Float64Array(n),z=new Float64Array(n),east=new Float64Array(height),north=new Float64Array(height),south=new Float64Array(height);
    const dm=2/height,dl=TAU/width;
    let maxSum=0;
    for(let j=0;j<height;j++) {
      const mu=-1+(j+.5)*dm,ring=Math.sqrt(1-mu*mu);
      east[j]=1/((1-mu*mu)*dl*dl); north[j]=(1-(-1+(j+1)*dm)**2)/(dm*dm); south[j]=(1-(-1+j*dm)**2)/(dm*dm);
      maxSum=Math.max(maxSum,2*east[j]+north[j]+south[j]);
      for(let i=0;i<width;i++){const k=j*width+i,l=(i+.5)*dl;x[k]=ring*Math.sin(l);y[k]=mu;z[k]=ring*Math.cos(l);}
    }
    return {width,height,n,x,y,z,east,north,south,maxSum};
  }
  // Equal-area finite-volume diffusion on a sphere. Polar fluxes are zero;
  // longitude wraps. Stable explicit substeps are chosen from the row sums.
  function diffuse(field,g,amount) {
    if(amount<=0)return field.slice();
    const count=Math.max(1,Math.ceil(amount*g.maxSum/.45)),a=amount/count;
    let src=field.slice(),dst=new Float32Array(g.n);
    for(let step=0;step<count;step++){
      for(let j=0;j<g.height;j++)for(let i=0;i<g.width;i++){
        const k=j*g.width+i,v=src[k],le=j*g.width+(i+g.width-1)%g.width,ri=j*g.width+(i+1)%g.width;
        let change=g.east[j]*(src[le]+src[ri]-2*v);
        if(j+1<g.height)change+=g.north[j]*(src[k+g.width]-v);
        if(j>0)change+=g.south[j]*(src[k-g.width]-v);
        dst[k]=v+a*change;
      }
      const swap=src;src=dst;dst=swap;
    }
    return src;
  }
  function heatAt(p,time,tideScale=1){const floor=p.equilibrium+(p.tides||0)*tideScale;return floor+(p.heat-floor)*Math.exp(-time/p.cooling);}
  function initial(g,p,seed){
    const rng=seeded(seed),phases=Array.from({length:8},()=>rng()*TAU),field=new Float32Array(g.n),material=new Float32Array(g.n),fresh=new Float32Array(g.n);
    for(let k=0;k<g.n;k++){
      const x=g.x[k],y=g.y[k],z=g.z[k];
      let v=0;
      for(let q=0;q<6;q++){const f=(q+1)*1.7;v+=Math.sin(x*f+phases[q])*Math.cos(y*f*.73+phases[(q+2)%8])*Math.sin(z*f*.91+phases[(q+4)%8])/(q+1);}
      field[k]=v*(p.icy?.6:2.7)-(p.ocean?.3:0);
      material[k]=.15+.3*(Math.sin(x*8+phases[0])*Math.cos(z*9+phases[1])+.5);
    }
    return {height:field,material,fresh,time:0,heat:p.heat,impacts:0,eruptions:0};
  }
  function direction(rng){const mu=rng()*2-1,lon=rng()*TAU,r=Math.sqrt(1-mu*mu);return {x:r*Math.sin(lon),y:mu,z:r*Math.cos(lon)};}
  function crater(state,g,centre,radius,depth){
    const outer=Math.cos(radius*1.55);
    let changed=0;
    for(let k=0;k<g.n;k++){
      const dot=g.x[k]*centre.x+g.y[k]*centre.y+g.z[k]*centre.z;
      if(dot<outer)continue;
      const q=Math.acos(clamp(dot,-1,1))/radius;
      // Bowl plus raised rim. No claim of a hydrocode crater-scaling solution.
      const bowl=q<1?-depth*(1-q*q):0;
      const rim=depth*.27*Math.exp(-(((q-1.02)/.15)**2));
      state.height[k]+=bowl+rim;
      state.material[k]=clamp(state.material[k]+.09*Math.exp(-q*q),0,1);
      state.fresh[k]=Math.max(state.fresh[k],.8*Math.exp(-q*q));changed++;
    }
    state.impacts++;return changed;
  }
  function deposit(state,g,centre,radius,amount,icy){
    const threshold=Math.cos(radius*2.2);
    let local=0,weight=0;
    for(let k=0;k<g.n;k++){
      const d=g.x[k]*centre.x+g.y[k]*centre.y+g.z[k]*centre.z;
      if(d>Math.cos(radius)){local+=state.height[k];weight++;}
    }
    const level=weight?local/weight:0;
    for(let k=0;k<g.n;k++){
      const dot=g.x[k]*centre.x+g.y[k]*centre.y+g.z[k]*centre.z;if(dot<threshold)continue;
      const q=Math.acos(clamp(dot,-1,1))/radius,w=Math.exp(-q*q*1.6);
      state.height[k]+=amount*w+Math.max(0,level-state.height[k])*.7*w;
      state.material[k]=state.material[k]*(1-.65*w)+(icy?.7:.05)*.65*w;
      state.fresh[k]=Math.max(state.fresh[k],w);
    }
    state.eruptions++;
  }
  function stats(state){let sum=0,ss=0,lo=Infinity,hi=-Infinity,fresh=0;for(let i=0;i<state.height.length;i++){const v=state.height[i];sum+=v;ss+=v*v;lo=Math.min(lo,v);hi=Math.max(hi,v);if(state.fresh[i]>.15)fresh++;}const mean=sum/state.height.length;return {mean,roughness:Math.sqrt(Math.max(0,ss/state.height.length-mean*mean)),min:lo,max:hi,fresh:100*fresh/state.height.length};}
  function simulate(options={}){
    const key=options.preset||'moon',p=PRESETS[key];if(!p)throw new Error('Unknown world');
    const g=geometry(options.width||128,options.height||64),seed=(options.seed??47)>>>0,rng=seeded(seed^0x9e3779b9),impactRng=seeded(seed^0x6a09e667),volcanoRng=seeded(seed^0xbb67ae85),frames=options.frames||180,duration=options.duration||4500,dt=duration/frames;
    const impactScale=clamp(options.impacts??1,0,3),volcanicScale=clamp(options.volcanism??1,0,3),diffusionScale=clamp(options.erosion??1,0,3),tides=clamp(options.tides??1,0,3);
    const events=options.events||[],snapshots=[],eventLog=[];let state=initial(g,p,seed);
    const save=()=>snapshots.push({...state,height:state.height.slice(),material:state.material.slice(),fresh:state.fresh.slice(),stats:stats(state)});
    save();
    const vents=Array.from({length:18},()=>direction(rng));
    const maxHeat=Math.max(p.heat,p.equilibrium+(p.tides||0)*3);
    for(let f=1;f<=frames;f++){
      state.time=f*dt;state.heat=heatAt(p,state.time,tides);
      state.height=diffuse(state.height,g,p.diffusion*diffusionScale*dt/(p.radius*p.radius));
      for(let k=0;k<g.n;k++){
        state.fresh[k]*=Math.exp(-dt/(p.icy?90:160));
        if(p.uplift)state.height[k]+=p.uplift*dt*state.heat*(Math.sin(g.x[k]*8+g.z[k]*5+f*.018)*Math.cos(g.y[k]*6))*.15;
      }
      // Draw the same 3x candidate catalogue in every experiment. Independent
      // acceptance marks make lower intensities subsets of higher ones, and
      // volcanic conditions cannot change the bombardment sequence.
      const impactMean=p.impacts*3/frames*(.25+2.4*Math.exp(-state.time/900));
      const ni=Math.floor(impactMean)+(impactRng()<impactMean%1?1:0);
      for(let n=0;n<ni;n++){
        const centre=direction(impactRng),radius=.025+Math.pow(impactRng(),2)*.14,depth=(p.icy?.65:2.2)*radius/.1,mark=impactRng();
        if(mark<impactScale/3){crater(state,g,centre,radius,depth);if(radius>.12)eventLog.push({frame:f,type:'Impact basin',text:'A large impact excavates a bowl and raises a rim.'});}
      }
      const volcanicMean=p.volcanoes*3*maxHeat/frames;
      const nv=Math.floor(volcanicMean)+(volcanoRng()<volcanicMean%1?1:0);
      for(let n=0;n<nv;n++){
        const vent=vents[Math.floor(volcanoRng()*vents.length)],r=.07+volcanoRng()*.17,mark=volcanoRng();
        if(mark<volcanicScale*state.heat/(3*maxHeat)){deposit(state,g,vent,r,(p.icy?.13:.4)*(.5+state.heat),p.icy);if(r>.2)eventLog.push({frame:f,type:p.icy?'Surface renewed':'Volcanic episode',text:p.icy?'New material renews a patch of ice.':'A flow builds new terrain and fills some existing relief.'});}
      }
      for(const event of events.filter(e=>e.frame===f)){
        crater(state,g,event.centre,event.radius||.15,event.depth||3.8);
        eventLog.push({frame:f,type:'Your impact',text:'The impact you placed changes this world’s subsequent history.'});
      }
      save();
    }
    return {preset:key,p,geometry:g,seed,frames,duration,snapshots,eventLog,options:{...options,preset:key,seed,frames,duration}};
  }
  function sample(field,g,x,y,z){const lon=(Math.atan2(x,z)+TAU)%TAU,u=lon/TAU*g.width-.5,v=(clamp(y,-1,1)+1)/2*g.height-.5;const ix=Math.floor(u),iy=Math.floor(v),fx=u-ix,fy=v-iy;const at=(i,j)=>field[clamp(j,0,g.height-1)*g.width+(i+g.width)%g.width];return at(ix,iy)*(1-fx)*(1-fy)+at(ix+1,iy)*fx*(1-fy)+at(ix,iy+1)*(1-fx)*fy+at(ix+1,iy+1)*fx*fy;}
  const API={PRESETS,seeded,geometry,diffuse,heatAt,initial,crater,deposit,stats,simulate,sample,clamp};
  if(typeof module!=='undefined'&&module.exports)module.exports=API;root.EvolutionModels=API;
})(typeof window!=='undefined'?window:globalThis);
