/* ---------- init ---------- */
QUIZ.forEach(c=>renderQuiz(c.id));
$("gw-eps-o").textContent=fmt(0.02); $("gw-speed-o").textContent=SPEEDS[1].n;
showChapter(state.active,false);
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(redrawAll);
