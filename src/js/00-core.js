/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmt = (v,d=2) => v.toFixed(d).replace("-","−");
function tok(){ const s=getComputedStyle(document.documentElement); const g=n=>s.getPropertyValue(n).trim(); return {bg:g("--bg"),surface:g("--surface"),surface2:g("--surface2"),ink:g("--ink"),muted:g("--muted"),line:g("--line"),accent:g("--accent"),data:g("--data"),ok:g("--ok"),bad:g("--bad"),face:g("--face"),faceLine:g("--face-line"),fBody:g("--f-body"),fMono:g("--f-mono"),fMath:g("--f-math")}; }
function rgb(h){ h=h.replace("#",""); if(h.length===3) h=h.split("").map(c=>c+c).join(""); const n=parseInt(h,16); return [n>>16&255,n>>8&255,n&255]; }
function prep(cv){
  const w=cv.clientWidth; if(!w) return null;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const h=Math.round(w*(parseFloat(cv.dataset.ar)||0.62));
  const W=Math.round(w*dpr), H=Math.round(h*dpr);
  if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; cv.style.height=h+"px"; }
  const ctx=cv.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
  return {ctx,w,h};
}
function arrowHead(ctx,x1,y1,x2,y2,size){ const a=Math.atan2(y2-y1,x2-x1); ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-size*Math.cos(a-0.45),y2-size*Math.sin(a-0.45)); ctx.lineTo(x2-size*Math.cos(a+0.45),y2-size*Math.sin(a+0.45)); ctx.closePath(); ctx.fill(); }
const widgets=[];
const pauseHooks=[]; /* f(activeChapterId) is called on every chapter switch */
function redrawAll(){ widgets.forEach(f=>{ try{ f(); }catch(e){ console.error(e); } }); }
let rsz=0; window.addEventListener("resize",()=>{ cancelAnimationFrame(rsz); rsz=requestAnimationFrame(redrawAll); });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{ themeGen++; redrawAll(); });
new MutationObserver(()=>{ themeGen++; redrawAll(); }).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
let themeGen=0;
function randn(){ let u=0,v=0; while(!u) u=Math.random(); while(!v) v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }

/* ---------- storage ---------- */
const STORE_KEY="udl-quiz-v1";
let state={answers:{},onlyOpen:{},active:"ch1"};
try{ const s=JSON.parse(localStorage.getItem(STORE_KEY)||"null"); if(s&&s.answers) state=Object.assign(state,s); }catch(e){}
function save(){ try{ localStorage.setItem(STORE_KEY,JSON.stringify(state)); }catch(e){} }

/* ---------- chapters & navigation ---------- */
const hash=(location.hash||"").slice(1);
if(QUIZ.some(c=>c.id===hash)) state.active=hash;
if(!QUIZ.some(c=>c.id===state.active)) state.active="ch1";
function counts(id){ const ch=QUIZ.find(c=>c.id===id); let ok=0,bad=0; ch.questions.forEach(q=>{ const a=state.answers[q.id]; if(a===undefined) return; a===0?ok++:bad++; }); return {ok,bad,total:ch.questions.length}; }
function renderTabs(){
  const t=$("tabs"); t.innerHTML="";
  QUIZ.forEach(ch=>{ const c=counts(ch.id); const b=document.createElement("button"); b.className="tab"; b.id="tab-"+ch.id; b.setAttribute("role","tab"); b.setAttribute("aria-selected",String(ch.id===state.active)); b.innerHTML=`Ch. ${ch.num} · ${CH_TITLES[ch.id]} <span class="n">${c.ok}/${c.total}</span>`; b.onclick=()=>showChapter(ch.id,true); t.appendChild(b); });
  const up=document.createElement("button"); up.className="tab"; up.disabled=true; up.textContent=`Ch. ${UPCOMING} coming soon`; t.appendChild(up);
}
function showChapter(id,scroll){
  state.active=id; save();
  document.querySelectorAll("article.chapter").forEach(a=>a.hidden=(a.dataset.ch!==id));
  pauseHooks.forEach(f=>f(id));
  renderTabs();
  requestAnimationFrame(redrawAll);
  if(scroll) $("tabs").scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"});
}
document.querySelectorAll(".subnav button").forEach(b=>b.addEventListener("click",()=>$(b.dataset.go).scrollIntoView({behavior:reduced?"auto":"smooth",block:"start"})));
