/* ---------- CH1: problem explorer ---------- */
const PROBLEMS=[
 {k:"House price",real:"120 m², 4 bedrooms, built 1998",vin:"[120, 4, 1998]",vout:"[389000]",pred:"$389,000",type:"Regression",inp:"Tabular",note:"A single continuous number as output."},
 {k:"Molecule",real:"Ethanol, C₂H₆O",vin:"atoms and bonds as a graph",vout:"[−114, 78]",pred:"freezing point −114 °C, boiling point 78 °C",type:"Multivariate regression",inp:"Graph",note:"Several continuous numbers at once."},
 {k:"Review",real:"“The food was excellent.”",vin:"[27, 5120, 88, 4051]",vout:"[0.94  0.06]",pred:"positive",type:"Binary classification",inp:"Variable-length sequence",note:"Word indices from a vocabulary of 10,000 entries."},
 {k:"Music genre",real:"audio clip, 10 s",vin:"441,000 integers (44.1 kHz, 16 bit)",vout:"[0.02  0.81  0.05 …]",pred:"jazz",type:"Multiclass classification",inp:"Very high-dimensional",note:"A probability vector of length N for N genres."},
 {k:"Image object",real:"photo, 640 × 480 pixels",vin:"921,600 RGB values",vout:"[0.01  0.93  0.02 …]",pred:"cat",type:"Multiclass classification",inp:"Spatially structured",note:"Neighboring pixels are related even when they are far apart in the vector."},
 {k:"Remaining useful life",real:"vibration signal of a rolling bearing",vin:"25,600 samples per second",vout:"[1840]",pred:"≈ 1,840 operating hours",type:"Regression",inp:"Time series",note:"Labels come from documented failures.",ind:true},
 {k:"Defect class",real:"camera image of a cast part",vin:"RGB values per pixel",vout:"[0.03  0.91  0.02  0.01  0.02  0.01]",pred:"crack",type:"Multiclass classification",inp:"Spatially structured",note:"Five defect types plus OK give N = 6.",ind:true}
];
let peSel=0;
function renderPE(){
  const c=$("pe-chips"); c.innerHTML="";
  PROBLEMS.forEach((p,i)=>{ const b=document.createElement("button"); b.className="chip"+(p.ind?" ind":""); b.id="pe-"+i; b.textContent=p.k; b.setAttribute("aria-pressed",String(i===peSel)); b.onclick=()=>{peSel=i; renderPE();}; c.appendChild(b); });
  const p=PROBLEMS[peSel];
  $("pe-real").textContent=p.real; $("pe-vin").textContent=p.vin; $("pe-vout").textContent=p.vout; $("pe-pred").textContent=p.pred;
  $("pe-type").textContent=p.type; $("pe-inp").textContent="Input: "+p.inp; $("pe-note").textContent=p.note;
}
renderPE();

/* ---------- CH1: order demo ---------- */
let ordSw=false;
function renderOrd(anim){
  const tab=ordSw?["built 1998","area 120 m²","bedrooms 4"]:["area 120 m²","bedrooms 4","built 1998"];
  const txt=ordSw?["The man","bites","the dog"]:["The dog","bites","the man"];
  const put=(id,arr)=>{ const el=$(id); el.classList.remove("anim"); el.innerHTML=arr.map(t=>`<span class="otok">${t}</span>`).join(""); if(anim){ void el.offsetWidth; el.classList.add("anim"); } };
  put("ord-tab",tab); put("ord-txt",txt);
  $("ord-tab-r").textContent=ordSw?"After retraining: $389,000. Meaning unchanged.":"Prediction: $389,000";
  const r=$("ord-txt-r"); r.textContent=ordSw?"Subject and object swapped. Meaning changed.":"The dog does the biting."; r.className="ores"+(ordSw?" bad":"");
  $("ord-btn").textContent=ordSw?"Restore original order":"Swap the order";
}
$("ord-btn").onclick=()=>{ ordSw=!ordSw; renderOrd(true); };
renderOrd(false);

/* ---------- CH1: structured output grids (SVG) ---------- */
(function(){
  const NS="http://www.w3.org/2000/svg";
  const cow=["00000","01110","11111","01010","00000"];
  const shade=["01012","12221","22222","12121","01010"];
  const mk=(g,x0,y0,fn)=>{ for(let r=0;r<5;r++) for(let c=0;c<5;c++){ const e=document.createElementNS(NS,"rect"); e.setAttribute("x",x0+c*18); e.setAttribute("y",y0+r*18); e.setAttribute("width",16); e.setAttribute("height",16); e.setAttribute("rx",2); e.setAttribute("class",fn(r,c)); g.appendChild(e);} };
  mk($("seg-in"),30,70,(r,c)=>"cell-"+shade[r][c]);
  mk($("seg-out"),210,70,(r,c)=>cow[r][c]==="1"?"cell-a":"cell-b");
})();

/* ---------- CH1: faces, noise, latent ---------- */
function faceParams(z1,z2){ return {smile:Math.tanh(0.75*z1), eye:1/(1+Math.exp(-1.3*z2)), brow:Math.tanh(0.55*z1-0.45*z2)}; }
function drawFace(ctx,cx,cy,r,p,T,alpha){
  ctx.save(); ctx.globalAlpha=alpha==null?1:alpha;
  ctx.lineCap="round"; ctx.lineWidth=Math.max(1.6,r*0.04);
  ctx.fillStyle=T.face; ctx.strokeStyle=T.faceLine;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
  for(const s of [-1,1]){
    const ex=cx+s*r*0.36, ey=cy-r*0.1, ry=r*(0.018+0.12*p.eye);
    ctx.fillStyle=T.surface; ctx.beginPath(); ctx.ellipse(ex,ey,r*0.14,ry,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    if(p.eye>0.1){ ctx.fillStyle=T.faceLine; ctx.beginPath(); ctx.arc(ex,ey,Math.min(r*0.06,ry*0.85),0,Math.PI*2); ctx.fill(); }
    const by=cy-r*0.33-r*0.1*p.eye, ox=ex+s*r*0.16, ix=ex-s*r*0.16;
    ctx.beginPath(); ctx.moveTo(ox,by); ctx.lineTo(ix,by+p.brow*r*0.09); ctx.stroke();
  }
  const my=cy+r*0.42, mw=r*0.36;
  ctx.beginPath(); ctx.moveTo(cx-mw,my-p.smile*r*0.06); ctx.quadraticCurveTo(cx,my+p.smile*r*0.36,cx+mw,my-p.smile*r*0.06); ctx.stroke();
  ctx.restore();
}
let noiseImg=null;
function newNoise(){ const c=document.createElement("canvas"); c.width=40; c.height=40; const x=c.getContext("2d"); const d=x.createImageData(40,40); for(let i=0;i<d.data.length;i+=4){ d.data[i]=Math.random()*256; d.data[i+1]=Math.random()*256; d.data[i+2]=Math.random()*256; d.data[i+3]=255; } x.putImageData(d,0,0); noiseImg=c; }
newNoise();
function drawNoise(){
  const a=prep($("cv-noise")); if(!a) return; const T=tok();
  a.ctx.imageSmoothingEnabled=false; a.ctx.drawImage(noiseImg,0,0,a.w,a.h);
  const b=prep($("cv-noiseface")); if(!b) return;
  b.ctx.fillStyle=T.surface2; b.ctx.fillRect(0,0,b.w,b.h);
  drawFace(b.ctx,b.w/2,b.h/2,b.w*0.38,faceParams(pad.z[0],pad.z[1]),T);
}
$("noise-btn").onclick=()=>{ newNoise(); drawNoise(); };
widgets.push(drawNoise);

const pad={z:[0.9,0.6],drag:false};
const ZR=3;
function drawPad(){
  const a=prep($("cv-pad")); if(!a) return; const {ctx,w,h}=a; const T=tok();
  const sx=v=>w/2+v/ZR*(w/2-10), sy=v=>h/2-v/ZR*(h/2-10);
  ctx.fillStyle=T.surface2; ctx.fillRect(0,0,w,h);
  for(const [k,al] of [[2,0.10],[1,0.18]]){ ctx.fillStyle=T.accent; ctx.globalAlpha=al; ctx.beginPath(); ctx.arc(w/2,h/2,k/ZR*(w/2-10),0,Math.PI*2); ctx.fill(); }
  ctx.globalAlpha=1; ctx.strokeStyle=T.line; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(10,h/2); ctx.lineTo(w-10,h/2); ctx.moveTo(w/2,10); ctx.lineTo(w/2,h-10); ctx.stroke();
  ctx.fillStyle=T.muted; ctx.font=`500 12px ${T.fMono}`; ctx.textAlign="right"; ctx.fillText("z₁ ≈ smile",w-12,h/2-8); ctx.textAlign="left"; ctx.fillText("z₂ ≈ eyes",w/2+8,20);
  const px=sx(pad.z[0]), py=sy(pad.z[1]);
  ctx.fillStyle=T.data; ctx.strokeStyle=T.surface; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(px,py,8,0,Math.PI*2); ctx.fill(); ctx.stroke();
  const b=prep($("cv-face")); if(!b) return;
  b.ctx.fillStyle=T.surface2; b.ctx.fillRect(0,0,b.w,b.h);
  drawFace(b.ctx,b.w/2,b.h/2,b.w*0.38,faceParams(pad.z[0],pad.z[1]),T);
  $("pad-read").innerHTML=`<span>z = (<b>${fmt(pad.z[0])}</b>, <b>${fmt(pad.z[1])}</b>)</span>`;
}
widgets.push(drawPad);
(function(){
  const cv=$("cv-pad");
  const set=e=>{ const r=cv.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height; const k=r.width/(r.width-20); pad.z=[Math.max(-ZR,Math.min(ZR,(x-0.5)*2*ZR*k)),Math.max(-ZR,Math.min(ZR,-(y-0.5)*2*ZR*k))]; drawPad(); drawNoise(); };
  cv.addEventListener("pointerdown",e=>{ pad.drag=true; cv.setPointerCapture(e.pointerId); set(e); });
  cv.addEventListener("pointermove",e=>{ if(pad.drag) set(e); });
  cv.addEventListener("pointerup",()=>pad.drag=false);
  cv.addEventListener("keydown",e=>{ const d={ArrowLeft:[-.2,0],ArrowRight:[.2,0],ArrowUp:[0,.2],ArrowDown:[0,-.2]}[e.key]; if(!d) return; e.preventDefault(); pad.z=[Math.max(-ZR,Math.min(ZR,pad.z[0]+d[0])),Math.max(-ZR,Math.min(ZR,pad.z[1]+d[1]))]; drawPad(); drawNoise(); });
  $("pad-sample").onclick=()=>{ pad.z=[Math.max(-ZR,Math.min(ZR,randn())),Math.max(-ZR,Math.min(ZR,randn()))]; drawPad(); drawNoise(); };
})();

const ZA=[-1.9,-1.6], ZB=[1.9,1.7];
function drawLerp(){
  const t=parseFloat($("lerp-t").value); const T=tok();
  const a=prep($("cv-lerp")); if(!a) return;
  a.ctx.fillStyle=T.surface2; a.ctx.fillRect(0,0,a.w,a.h);
  drawFace(a.ctx,a.w/2,a.h/2,a.w*0.38,faceParams(ZA[0]+(ZB[0]-ZA[0])*t,ZA[1]+(ZB[1]-ZA[1])*t),T);
  const b=prep($("cv-blend")); if(!b) return;
  b.ctx.fillStyle=T.surface2; b.ctx.fillRect(0,0,b.w,b.h);
  drawFace(b.ctx,b.w/2,b.h/2,b.w*0.38,faceParams(ZA[0],ZA[1]),T,1-t);
  drawFace(b.ctx,b.w/2,b.h/2,b.w*0.38,faceParams(ZB[0],ZB[1]),T,t);
}
widgets.push(drawLerp);
$("lerp-t").addEventListener("input",drawLerp);
let lerpAnim=null;
$("lerp-play").onclick=()=>{
  if(lerpAnim){ cancelAnimationFrame(lerpAnim); lerpAnim=null; $("lerp-play").textContent="Play"; return; }
  $("lerp-play").textContent="Pause"; const t0=performance.now();
  const step=now=>{ const u=((now-t0)/4000)%2; $("lerp-t").value=(u<1?u:2-u).toFixed(2); drawLerp(); lerpAnim=requestAnimationFrame(step); };
  lerpAnim=requestAnimationFrame(step);
};

/* ---------- CH1: gridworld Q-learning ---------- */
const GW={W:8,H:5,start:[0,2],walls:new Set(),rew:{"1,0":1,"4,0":10},gamma:0.9,alpha:0.5,maxSteps:80};
const ACT=[[0,-1],[1,0],[0,1],[-1,0]];
const gw={Q:null,pos:null,steps:0,ep:0,hist:[],running:false,acc:0,last:0};
function gwReset(){ gw.Q=new Float32Array(GW.W*GW.H*4); gw.pos=GW.start.slice(); gw.steps=0; gw.ep=0; gw.hist=[]; }
gwReset();
const gi=(x,y)=>(y*GW.W+x)*4;
function gwMax(x,y){ const i=gi(x,y); return Math.max(gw.Q[i],gw.Q[i+1],gw.Q[i+2],gw.Q[i+3]); }
function gwArg(x,y){ const i=gi(x,y); let m=-Infinity,best=[]; for(let a=0;a<4;a++){ const q=gw.Q[i+a]; if(q>m+1e-9){m=q;best=[a];} else if(Math.abs(q-m)<=1e-9) best.push(a); } return best[Math.floor(Math.random()*best.length)]; }
function gwStep(eps){
  const [x,y]=gw.pos; const a=Math.random()<eps?Math.floor(Math.random()*4):gwArg(x,y);
  let nx=x+ACT[a][0], ny=y+ACT[a][1];
  if(nx<0||ny<0||nx>=GW.W||ny>=GW.H||GW.walls.has(nx+","+ny)){ nx=x; ny=y; }
  const r=GW.rew[nx+","+ny]||0, term=r>0;
  const target=r+(term?0:GW.gamma*gwMax(nx,ny));
  const i=gi(x,y)+a; gw.Q[i]+=GW.alpha*(target-gw.Q[i]);
  gw.pos=[nx,ny]; gw.steps++;
  if(term||gw.steps>=GW.maxSteps){ gw.hist.push(r); if(gw.hist.length>20) gw.hist.shift(); gw.ep++; gw.pos=GW.start.slice(); gw.steps=0; }
}
const SPEEDS=[{n:"slow motion",ms:180,k:1},{n:"normal",ms:40,k:1},{n:"fast",ms:16,k:25},{n:"very fast",ms:16,k:400}];
function drawGrid(){
  const a=prep($("cv-grid")); if(!a) return; const {ctx,w}=a; const T=tok();
  const cs=w/GW.W; const [ar,ag,ab]=rgb(T.accent);
  for(let y=0;y<GW.H;y++) for(let x=0;x<GW.W;x++){
    const X=x*cs, Y=y*cs, key=x+","+y;
    if(GW.walls.has(key)){ ctx.fillStyle=T.line; ctx.fillRect(X,Y,cs,cs); continue; }
    ctx.fillStyle=T.surface2; ctx.fillRect(X+1,Y+1,cs-2,cs-2);
    const v=Math.max(0,Math.min(1,gwMax(x,y)/6));
    if(v>0){ ctx.fillStyle=`rgba(${ar},${ag},${ab},${0.08+0.8*Math.sqrt(v)})`; ctx.fillRect(X+1,Y+1,cs-2,cs-2); }
    if(GW.rew[key]){
      ctx.strokeStyle=T.ok; ctx.lineWidth=3; ctx.strokeRect(X+3,Y+3,cs-6,cs-6);
      ctx.fillStyle=T.ink; ctx.font=`700 ${Math.round(cs*0.28)}px ${T.fBody}`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("+"+GW.rew[key],X+cs/2,Y+cs/2);
    } else if(gwMax(x,y)>0.005){
      const i=gi(x,y); let b=0; for(let k=1;k<4;k++) if(gw.Q[i+k]>gw.Q[i+b]) b=k;
      const cx=X+cs/2, cy=Y+cs/2, L=cs*0.22, dx=ACT[b][0]*L, dy=ACT[b][1]*L;
      ctx.strokeStyle=v>0.45?T.bg:T.ink; ctx.fillStyle=ctx.strokeStyle; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx-dx,cy-dy); ctx.lineTo(cx+dx*0.6,cy+dy*0.6); ctx.stroke(); arrowHead(ctx,cx-dx,cy-dy,cx+dx,cy+dy,cs*0.14);
    }
    if(x===GW.start[0]&&y===GW.start[1]){ ctx.fillStyle=T.muted; ctx.font=`600 ${Math.round(cs*0.16)}px ${T.fMono}`; ctx.textAlign="left"; ctx.textBaseline="top"; ctx.fillText("Start",X+5,Y+5); }
  }
  ctx.fillStyle=T.data; ctx.strokeStyle=T.surface; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.arc(gw.pos[0]*cs+cs/2,gw.pos[1]*cs+cs/2,cs*0.19,0,Math.PI*2); ctx.fill(); ctx.stroke();
  const big=gw.hist.filter(r=>r===10).length, small=gw.hist.filter(r=>r===1).length, none=gw.hist.length-big-small;
  $("gw-read").innerHTML=`<span>Episodes <b>${gw.ep}</b></span><span>Last ${gw.hist.length}: <b>${big}×</b> +10 · <b>${small}×</b> +1 · <b>${none}×</b> no goal</span><span>Value of start <b>${fmt(gwMax(GW.start[0],GW.start[1]))}</b></span>`;
}
widgets.push(drawGrid);
function gwBtn(){ $("gw-run").textContent=gw.running?"Pause":(gw.ep?"Continue training":"Start training"); }
function gwLoop(now){
  if(!gw.running) return;
  const sp=SPEEDS[+$("gw-speed").value], eps=parseFloat($("gw-eps").value);
  if(now-gw.last>=sp.ms){ gw.last=now; for(let k=0;k<sp.k;k++) gwStep(eps); drawGrid(); }
  requestAnimationFrame(gwLoop);
}
$("gw-run").onclick=()=>{ gw.running=!gw.running; gwBtn(); if(gw.running) requestAnimationFrame(gwLoop); };
$("gw-reset").onclick=()=>{ gwReset(); drawGrid(); gwBtn(); };
$("gw-eps").addEventListener("input",()=>$("gw-eps-o").textContent=fmt(parseFloat($("gw-eps").value)));
$("gw-speed").addEventListener("input",()=>$("gw-speed-o").textContent=SPEEDS[+$("gw-speed").value].n);
pauseHooks.push(id=>{ if(id!=="kap1"){ gw.running=false; gwBtn(); } });
