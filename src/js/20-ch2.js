/* ---------- CH2: linear regression & gradient descent ---------- */
const LX=[0.12,0.25,0.4,0.52,0.66,0.8,0.95,1.1,1.28,1.45,1.62,1.85];
const LN=[0.09,-0.13,0.05,0.12,-0.07,0.03,-0.11,0.08,-0.04,0.1,-0.09,0.05];
const LY=LX.map((x,i)=>0.35+0.55*x+LN[i]);
const PR=[-0.6,1.4];
const lin={p0:1.1,p1:-0.3,path:[],gd:false,it:0,heat:null,heatGen:-1};
function lossAt(p0,p1){ let s=0; for(let i=0;i<LX.length;i++){ const r=p0+p1*LX[i]-LY[i]; s+=r*r; } return s; }
function gradAt(p0,p1){ let g0=0,g1=0; for(let i=0;i<LX.length;i++){ const r=p0+p1*LX[i]-LY[i]; g0+=2*r; g1+=2*r*LX[i]; } return [g0,g1]; }
const LOPT=(()=>{ const n=LX.length; let sx=0,sy=0,sxx=0,sxy=0; LX.forEach((x,i)=>{sx+=x;sy+=LY[i];sxx+=x*x;sxy+=x*LY[i];}); const p1=(n*sxy-sx*sy)/(n*sxx-sx*sx); return [(sy-p1*sx)/n,p1]; })();
function buildHeat(T){
  const N=150, c=document.createElement("canvas"); c.width=N; c.height=N; const x=c.getContext("2d"); const img=x.createImageData(N,N);
  const vals=new Float32Array(N*N); let lo=Infinity,hi=-Infinity;
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const p0=PR[0]+(PR[1]-PR[0])*(i+0.5)/N, p1=PR[1]-(PR[1]-PR[0])*(j+0.5)/N; const v=Math.log(lossAt(p0,p1)); vals[j*N+i]=v; lo=Math.min(lo,v); hi=Math.max(hi,v); }
  const A=rgb(T.accent), B=rgb(T.surface2), C=rgb(T.muted);
  const band=v=>Math.floor((v-lo)/(hi-lo)*12);
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){
    const v=vals[j*N+i], u=Math.pow((v-lo)/(hi-lo),0.85), k=(j*N+i)*4;
    let col=[0,1,2].map(q=>A[q]*(1-u)+B[q]*u);
    const b=band(v); if((i<N-1&&band(vals[j*N+i+1])!==b)||(j<N-1&&band(vals[(j+1)*N+i])!==b)) col=col.map((q,idx)=>q*0.55+C[idx]*0.45);
    img.data[k]=col[0]; img.data[k+1]=col[1]; img.data[k+2]=col[2]; img.data[k+3]=255;
  }
  x.putImageData(img,0,0); return c;
}
function axes(ctx,T,m,w,h,xr,yr,ticks,xl,yl){
  ctx.strokeStyle=T.line; ctx.lineWidth=1; ctx.fillStyle=T.muted; ctx.font=`400 11px ${T.fMono}`;
  const X=v=>m.l+(v-xr[0])/(xr[1]-xr[0])*(w-m.l-m.r), Y=v=>h-m.b-(v-yr[0])/(yr[1]-yr[0])*(h-m.t-m.b);
  ctx.textAlign="center"; ctx.textBaseline="top";
  ticks.x.forEach(v=>{ ctx.beginPath(); ctx.moveTo(X(v),m.t); ctx.lineTo(X(v),h-m.b); ctx.globalAlpha=.5; ctx.stroke(); ctx.globalAlpha=1; ctx.fillText(fmt(v,1),X(v),h-m.b+5); });
  ctx.textAlign="right"; ctx.textBaseline="middle";
  ticks.y.forEach(v=>{ ctx.beginPath(); ctx.moveTo(m.l,Y(v)); ctx.lineTo(w-m.r,Y(v)); ctx.globalAlpha=.5; ctx.stroke(); ctx.globalAlpha=1; ctx.fillText(fmt(v,1),m.l-6,Y(v)); });
  ctx.fillStyle=T.ink; ctx.font=`500 12px ${T.fBody}`; ctx.textAlign="center"; ctx.textBaseline="bottom"; ctx.fillText(xl,m.l+(w-m.l-m.r)/2,h-2);
  ctx.save(); ctx.translate(12,m.t+(h-m.t-m.b)/2); ctx.rotate(-Math.PI/2); ctx.textBaseline="middle"; ctx.fillText(yl,0,0); ctx.restore();
  return {X,Y};
}
function drawLin(){
  const T=tok();
  const a=prep($("cv-lin")); if(!a) return; const {ctx,w,h}=a; const m={l:40,r:10,t:10,b:38};
  const {X,Y}=axes(ctx,T,m,w,h,[0,2],[0,2],{x:[0,0.5,1,1.5,2],y:[0,0.5,1,1.5,2]},"Input x","Output y");
  ctx.save(); ctx.beginPath(); ctx.rect(m.l,m.t,w-m.l-m.r,h-m.t-m.b); ctx.clip();
  ctx.strokeStyle=T.data; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
  LX.forEach((x,i)=>{ ctx.beginPath(); ctx.moveTo(X(x),Y(LY[i])); ctx.lineTo(X(x),Y(lin.p0+lin.p1*x)); ctx.stroke(); });
  ctx.setLineDash([]); ctx.strokeStyle=T.accent; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(X(0),Y(lin.p0)); ctx.lineTo(X(2),Y(lin.p0+2*lin.p1)); ctx.stroke();
  ctx.restore();
  ctx.fillStyle=T.data; ctx.strokeStyle=T.surface; ctx.lineWidth=1.5;
  LX.forEach((x,i)=>{ ctx.beginPath(); ctx.arc(X(x),Y(LY[i]),5,0,Math.PI*2); ctx.fill(); ctx.stroke(); });

  const b=prep($("cv-loss")); if(!b) return; const c2=b.ctx; const W=b.w, H=b.h;
  if(!lin.heat||lin.heatGen!==themeGen){ lin.heat=buildHeat(T); lin.heatGen=themeGen; }
  const m2={l:40,r:10,t:10,b:38};
  c2.imageSmoothingEnabled=true; c2.drawImage(lin.heat,m2.l,m2.t,W-m2.l-m2.r,H-m2.t-m2.b);
  const ax=axes(c2,T,m2,W,H,PR,PR,{x:[-0.5,0,0.5,1],y:[-0.5,0,0.5,1]},"ϕ₀ intercept","ϕ₁ slope");
  c2.save(); c2.beginPath(); c2.rect(m2.l,m2.t,W-m2.l-m2.r,H-m2.t-m2.b); c2.clip();
  c2.strokeStyle=T.ok; c2.lineWidth=2; c2.beginPath(); const ox=ax.X(LOPT[0]), oy=ax.Y(LOPT[1]); c2.moveTo(ox-6,oy); c2.lineTo(ox+6,oy); c2.moveTo(ox,oy-6); c2.lineTo(ox,oy+6); c2.stroke();
  if(lin.path.length>1){ c2.strokeStyle=T.ink; c2.lineWidth=1.6; c2.beginPath(); lin.path.forEach((p,i)=>i?c2.lineTo(ax.X(p[0]),ax.Y(p[1])):c2.moveTo(ax.X(p[0]),ax.Y(p[1]))); c2.stroke(); c2.fillStyle=T.ink; lin.path.forEach(p=>{ c2.beginPath(); c2.arc(ax.X(p[0]),ax.Y(p[1]),2,0,Math.PI*2); c2.fill(); }); }
  c2.fillStyle=T.data; c2.strokeStyle=T.surface; c2.lineWidth=2.5; c2.beginPath(); c2.arc(ax.X(lin.p0),ax.Y(lin.p1),7,0,Math.PI*2); c2.fill(); c2.stroke();
  c2.restore();
  $("lin-p0").value=lin.p0; $("lin-p1").value=lin.p1;
  $("lin-p0-o").textContent=fmt(lin.p0); $("lin-p1-o").textContent=fmt(lin.p1); $("gd-lr-o").textContent=fmt(parseFloat($("gd-lr").value),3);
  $("lin-read").innerHTML=`<span>Loss L = <b>${fmt(lossAt(lin.p0,lin.p1),3)}</b></span><span>Minimum L = <b>${fmt(lossAt(LOPT[0],LOPT[1]),3)}</b> at ϕ = (${fmt(LOPT[0])}, ${fmt(LOPT[1])})</span>${lin.it?`<span>Steps <b>${lin.it}</b></span>`:""}`;
}
widgets.push(drawLin);
function setLin(p0,p1,keepPath){ lin.p0=Math.max(PR[0],Math.min(PR[1],p0)); lin.p1=Math.max(PR[0],Math.min(PR[1],p1)); if(!keepPath){ lin.path=[]; lin.it=0; stopGD(""); } drawLin(); }
$("lin-p0").addEventListener("input",e=>setLin(parseFloat(e.target.value),lin.p1));
$("lin-p1").addEventListener("input",e=>setLin(lin.p0,parseFloat(e.target.value)));
$("gd-lr").addEventListener("input",()=>$("gd-lr-o").textContent=fmt(parseFloat($("gd-lr").value),3));
$("lin-opt").onclick=()=>{ setLin(LOPT[0],LOPT[1]); status("Closed-form solution applied. No iterations needed.","ok"); };
(function(){
  const cv=$("cv-loss"); let drag=false;
  const set=e=>{ const r=cv.getBoundingClientRect(); const m={l:40,r:10,t:10,b:38}; const u=(e.clientX-r.left-m.l)/(r.width-m.l-m.r), v=(e.clientY-r.top-m.t)/(r.height-m.t-m.b); setLin(PR[0]+u*(PR[1]-PR[0]),PR[1]-v*(PR[1]-PR[0])); };
  cv.addEventListener("pointerdown",e=>{ drag=true; cv.setPointerCapture(e.pointerId); set(e); });
  cv.addEventListener("pointermove",e=>{ if(drag) set(e); });
  cv.addEventListener("pointerup",()=>drag=false);
  cv.addEventListener("keydown",e=>{ const d={ArrowLeft:[-.05,0],ArrowRight:[.05,0],ArrowUp:[0,.05],ArrowDown:[0,-.05]}[e.key]; if(!d) return; e.preventDefault(); setLin(lin.p0+d[0],lin.p1+d[1]); });
})();
function status(t,cls){ const s=$("gd-status"); s.textContent=t; s.className="status"+(cls?" "+cls:""); }
function stopGD(msg,cls){ lin.gd=false; $("gd-run").textContent="Gradientenabstieg starten"; if(msg!==undefined) status(msg,cls); }
$("gd-run").onclick=()=>{
  if(lin.gd){ stopGD("Stopped."); return; }
  lin.gd=true; lin.path=[[lin.p0,lin.p1]]; lin.it=0; $("gd-run").textContent="Stop"; status("Running. Each dot on the right is one step.");
  let last=0;
  const step=now=>{
    if(!lin.gd) return;
    if(now-last>=(reduced?0:70)){ last=now;
      const lr=parseFloat($("gd-lr").value); const [g0,g1]=gradAt(lin.p0,lin.p1);
      lin.p0-=lr*g0; lin.p1-=lr*g1; lin.it++; lin.path.push([lin.p0,lin.p1]);
      const gn=Math.hypot(g0,g1);
      if(!isFinite(lin.p0)||Math.abs(lin.p0)>6||Math.abs(lin.p1)>6){ lin.p0=Math.max(PR[0],Math.min(PR[1],lin.p0||0)); lin.p1=Math.max(PR[0],Math.min(PR[1],lin.p1||0)); drawLin(); stopGD(`Diverged after ${lin.it} steps. The learning rate is too large, so every step overshoots the valley further.`,"bad"); return; }
      drawLin();
      if(gn<2e-3){ stopGD(`Converged after ${lin.it} steps. The gradient is practically zero.`,"ok"); return; }
      if(lin.it>=400){ stopGD(`Stopped after 400 steps. With this learning rate, progress is slow.`); return; }
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/* ---------- CH2: polynomial under/overfitting ---------- */
const TRUEF=x=>0.5+0.35*Math.sin(2*Math.PI*0.9*x);
const PX=[0.03,0.13,0.22,0.34,0.44,0.56,0.66,0.77,0.88,0.97];
const PNz=[0.06,-0.08,0.1,-0.05,0.07,-0.1,0.04,0.09,-0.07,0.05];
const PY=PX.map((x,i)=>TRUEF(x)+PNz[i]);
const TX=[0.07,0.18,0.28,0.39,0.5,0.61,0.71,0.82,0.92,0.995];
const TNz=[-0.05,0.07,-0.06,0.08,-0.04,0.06,-0.08,0.05,0.07,-0.06];
const TY=TX.map((x,i)=>TRUEF(x)+TNz[i]);
function polyFit(d){
  const n=d+1, M=Array.from({length:n},()=>new Float64Array(n+1));
  PX.forEach((x,k)=>{ const t=2*x-1; const pw=[]; for(let i=0;i<n;i++) pw.push(Math.pow(t,i)); for(let i=0;i<n;i++){ for(let j=0;j<n;j++) M[i][j]+=pw[i]*pw[j]; M[i][n]+=pw[i]*PY[k]; } });
  for(let i=0;i<n;i++) M[i][i]+=1e-10;
  for(let c=0;c<n;c++){ let p=c; for(let r=c+1;r<n;r++) if(Math.abs(M[r][c])>Math.abs(M[p][c])) p=r; [M[c],M[p]]=[M[p],M[c]]; for(let r=0;r<n;r++){ if(r===c) continue; const f=M[r][c]/M[c][c]; for(let k=c;k<=n;k++) M[r][k]-=f*M[c][k]; } }
  return M.map((row,i)=>row[n]/row[i]);
}
const polyEval=(w,x)=>{ const t=2*x-1; let s=0,p=1; for(const c of w){ s+=c*p; p*=t; } return s; };
const mse=(w,X,Y)=>X.reduce((s,x,i)=>s+(polyEval(w,x)-Y[i])**2,0)/X.length;
const POLY=Array.from({length:10},(_,d)=>{ const w=polyFit(d); return {w,tr:mse(w,PX,PY),te:mse(w,TX,TY)}; });
const BEST=POLY.reduce((b,p,i)=>p.te<POLY[b].te?i:b,0);
function drawPoly(){
  const d=+$("poly-d").value, P=POLY[d], T=tok();
  const a=prep($("cv-poly")); if(!a) return; const {ctx,w,h}=a; const m={l:40,r:10,t:10,b:38};
  const {X,Y}=axes(ctx,T,m,w,h,[0,1],[-0.2,1.2],{x:[0,0.25,0.5,0.75,1],y:[0,0.5,1]},"Input x","Output y");
  ctx.save(); ctx.beginPath(); ctx.rect(m.l,m.t,w-m.l-m.r,h-m.t-m.b); ctx.clip();
  ctx.strokeStyle=T.muted; ctx.globalAlpha=.35; ctx.lineWidth=1.5; ctx.setLineDash([3,4]); ctx.beginPath(); for(let i=0;i<=200;i++){ const x=i/200; i?ctx.lineTo(X(x),Y(TRUEF(x))):ctx.moveTo(X(x),Y(TRUEF(x))); } ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha=1;
  ctx.strokeStyle=T.accent; ctx.lineWidth=2.8; ctx.beginPath(); for(let i=0;i<=400;i++){ const x=i/400; const y=Math.max(-5,Math.min(5,polyEval(P.w,x))); i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)); } ctx.stroke();
  ctx.restore();
  ctx.lineWidth=2; ctx.strokeStyle=T.muted; TX.forEach((x,i)=>{ ctx.beginPath(); ctx.arc(X(x),Y(TY[i]),4.5,0,Math.PI*2); ctx.stroke(); });
  ctx.fillStyle=T.data; ctx.strokeStyle=T.surface; ctx.lineWidth=1.5; PX.forEach((x,i)=>{ ctx.beginPath(); ctx.arc(X(x),Y(PY[i]),5,0,Math.PI*2); ctx.fill(); ctx.stroke(); });

  const b=prep($("cv-polyerr")); if(!b) return; const c=b.ctx, W=b.w, H=b.h, m2={l:48,r:62,t:12,b:38};
  const lo=-4, hi=1;
  const Xd=v=>m2.l+v/9*(W-m2.l-m2.r), Yl=v=>H-m2.b-(Math.max(lo,Math.min(hi,Math.log10(v)))-lo)/(hi-lo)*(H-m2.t-m2.b);
  c.strokeStyle=T.line; c.lineWidth=1; c.fillStyle=T.muted; c.font=`400 11px ${T.fMono}`; c.textAlign="right"; c.textBaseline="middle";
  for(let k=lo;k<=hi;k++){ const yy=H-m2.b-(k-lo)/(hi-lo)*(H-m2.t-m2.b); c.globalAlpha=.5; c.beginPath(); c.moveTo(m2.l,yy); c.lineTo(W-m2.r,yy); c.stroke(); c.globalAlpha=1; c.fillText(k===0?"1":"10"+["⁻⁴","⁻³","⁻²","⁻¹","","¹"][k+4],m2.l-6,yy); }
  c.textAlign="center"; c.textBaseline="top"; for(let i=0;i<=9;i++) c.fillText(String(i),Xd(i),H-m2.b+5);
  c.fillStyle=T.ink; c.font=`500 12px ${T.fBody}`; c.textBaseline="bottom"; c.fillText("Polynomial degree",m2.l+(W-m2.l-m2.r)/2,H-2);
  c.save(); c.translate(12,m2.t+(H-m2.t-m2.b)/2); c.rotate(-Math.PI/2); c.textBaseline="middle"; c.fillText("Mean squared error",0,0); c.restore();
  c.fillStyle=T.accent; c.globalAlpha=.12; c.fillRect(Xd(d)-8,m2.t,16,H-m2.t-m2.b); c.globalAlpha=1;
  for(const [key,col,lab] of [["tr",T.accent,"Training"],["te",T.data,"Test"]]){
    c.strokeStyle=col; c.lineWidth=2.4; c.beginPath(); POLY.forEach((p,i)=>i?c.lineTo(Xd(i),Yl(p[key])):c.moveTo(Xd(i),Yl(p[key]))); c.stroke();
    c.fillStyle=col; POLY.forEach((p,i)=>{ c.beginPath(); c.arc(Xd(i),Yl(p[key]),i===d?5.5:3,0,Math.PI*2); c.fill(); });
    c.font=`600 12px ${T.fBody}`; c.textAlign="left"; c.textBaseline="middle"; c.fillText(lab,Xd(9)+8,Yl(POLY[9][key]));
  }
  let diag,cls;
  if(d<BEST && P.te>1.3*POLY[BEST].te){ diag="Underfitting: the model is too rigid for the true function."; cls="bad"; }
  else if(d>BEST && P.te>1.3*POLY[BEST].te){ diag="Overfitting: the model also fits the noise in the training data."; cls="bad"; }
  else { diag="Good generalization: the capacity matches the problem."; cls="ok"; }
  $("poly-d-o").textContent=String(d);
  $("poly-read").innerHTML=`<span>Training error <b>${P.tr.toExponential(1)}</b></span><span>Test error <b>${P.te.toExponential(1)}</b></span><span class="status ${cls}" style="font-family:var(--f-body)">${diag}</span>`;
}
widgets.push(drawPoly);
$("poly-d").addEventListener("input",drawPoly);
