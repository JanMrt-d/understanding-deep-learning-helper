/* ---------- Quiz ---------- */
function seeded(str){ let h=2166136261; for(const c of str){ h^=c.charCodeAt(0); h=Math.imul(h,16777619);} return ()=>{ h^=h<<13; h^=h>>>17; h^=h<<5; return ((h>>>0)%10000)/10000; }; }
function order(q){ const r=seeded(q.id+"x"); const idx=q.opts.map((_,i)=>i); for(let i=idx.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [idx[i],idx[j]]=[idx[j],idx[i]]; } return idx; }
function renderQuiz(id){
  const ch=QUIZ.find(c=>c.id===id), root=$("quiz-"+id), c=counts(id), onlyOpen=!!state.onlyOpen[id];
  const pct=v=>(100*v/c.total).toFixed(2)+"%";
  root.innerHTML=`<div class="qhead">
      <p>Verständnisfragen ohne Rechenaufgaben. Antwort anklicken, Begründung lesen, falsche Fragen gezielt wiederholen.</p>
      <div class="stats"><div class="stat"><b>${c.ok}</b><span>richtig</span></div><div class="stat"><b>${c.bad}</b><span>falsch</span></div><div class="stat"><b>${c.total-c.ok-c.bad}</b><span>offen</span></div>
      <div class="bar" aria-hidden="true"><i class="g" style="width:${pct(c.ok)}"></i><i class="r" style="width:${pct(c.bad)}"></i></div></div>
      <div class="ctl"><button class="btn" id="q-open-${id}" aria-pressed="${onlyOpen}">Nur offene anzeigen</button><button class="btn" id="q-retry-${id}" ${c.bad?"":"disabled"}>Falsche wiederholen (${c.bad})</button><button class="btn" id="q-reset-${id}">Kapitel zurücksetzen</button></div>
    </div><ol class="qlist" id="ql-${id}" style="margin-top:16px"></ol>`;
  $("q-open-"+id).onclick=()=>{ state.onlyOpen[id]=!onlyOpen; save(); renderQuiz(id); };
  $("q-retry-"+id).onclick=()=>{ ch.questions.forEach(q=>{ if(state.answers[q.id]!==undefined&&state.answers[q.id]!==0) delete state.answers[q.id]; }); save(); renderQuiz(id); renderTabs(); };
  const rb=$("q-reset-"+id);
  rb.onclick=()=>{ if(rb.dataset.armed){ ch.questions.forEach(q=>delete state.answers[q.id]); save(); renderQuiz(id); renderTabs(); return; } rb.dataset.armed="1"; rb.textContent="Wirklich zurücksetzen?"; setTimeout(()=>{ if(rb.isConnected){ delete rb.dataset.armed; rb.textContent="Kapitel zurücksetzen"; } },3500); };
  const list=$("ql-"+id); let shown=0; const L="ABCD";
  ch.questions.forEach((q,qi)=>{
    const ans=state.answers[q.id]; if(onlyOpen&&ans!==undefined) return; shown++;
    const li=document.createElement("li"); li.className="qcard"; const ord=order(q);
    li.innerHTML=`<div class="q-meta"><span>Frage ${qi+1} von ${ch.questions.length}</span><span class="${q.transfer?"tr":""}">${q.transfer?"Transfer":"§ "+q.sec}</span></div><h5>${q.q}</h5><div class="opts" role="group" aria-label="Antwortoptionen"></div>`;
    const opts=li.querySelector(".opts");
    ord.forEach((oi,pos)=>{
      const b=document.createElement("button"); b.className="opt"; b.id=`opt-${q.id}-${oi}`;
      b.innerHTML=`<span class="k">${L[pos]}</span><span>${q.opts[oi]}</span>`;
      if(ans!==undefined){ b.disabled=true; b.classList.add(oi===0?"correct":(oi===ans?"wrong":"dim")); }
      else b.onclick=()=>{ state.answers[q.id]=oi; save(); const y=window.scrollY; renderQuiz(id); renderTabs(); window.scrollTo(0,y); };
      opts.appendChild(b);
    });
    if(ans!==undefined){ const fb=document.createElement("div"); fb.className="fb "+(ans===0?"ok":"bad"); fb.innerHTML=`<strong>${ans===0?"Richtig.":"Nicht ganz. Richtig ist "+L[ord.indexOf(0)]+"."}</strong><p>${q.exp}</p>`; li.appendChild(fb); }
    list.appendChild(li);
  });
  if(!shown) list.innerHTML=`<li class="empty">Alle Fragen dieses Kapitels sind beantwortet.</li>`;
}
