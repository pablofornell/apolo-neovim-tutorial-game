/* flatten groups + levels into an index */
const PLAYABLE=LEVELS.filter(x=>!x.group);
let curIdx=0;
const done=new Set();
let winTimer=null;

function loadLevel(i){
  clearTimeout(winTimer);
  curIdx=i; const lv=PLAYABLE[i];
  S.lines=lv.buf.slice(); S.cursor={...lv.cur}; S.mode="normal"; S.anchor=null;
  S.reg=lv.preReg?{...lv.preReg}:{text:"",linewise:false};
  S.sysclip=""; S.pending="";S.awaitLeader=false;S.leaderBuf="";S.count="";S.cmd=null;
  S.lastSearch="";S.undo=[];S.redo=[];S.keyLog=[];S.keys=0;S.enteredInsert=false;S.won=false;S.cmp=null;
  S.findPending=null;S.lastFind=null;S.replacePending=false;S.dot=null;
  S.winPending=false;S.split=null;S.tabs=null;S.tabIdx=0;S.modesSeen=new Set();
  if(lv.buffers){ S.buffers=lv.buffers.map(b=>({name:b.name,lines:b.lines.slice()}));
    S.bufIdx=0; S.lines=S.buffers[0].lines.slice(); }
  else { S.buffers=null; S.bufIdx=0; }
  if(lv.tabs){ S.tabs=lv.tabs.map(t=>({...t})); S.tabIdx=0; }
  initFileSession(lv);
  clampCursor();
  document.getElementById("lvTitle").textContent=`Level ${i+1} / ${PLAYABLE.length} · ${lv.title}`;
  document.getElementById("lvGoal").textContent=lv.goal;
  document.getElementById("lesson").innerHTML=lv.lesson;
  const pw=document.getElementById("parWrap");
  if(lv.par){pw.style.display="inline";document.getElementById("par").textContent=lv.par;}else pw.style.display="none";
  document.getElementById("win").classList.remove("show");
  closePop();
  buildSidebar();
  render();
  document.getElementById("buf").focus();
}

function checkWin(){
  if(S.won)return;
  const lv=PLAYABLE[curIdx];
  let ok=false; try{ ok=lv.check(); }catch(e){ ok=false; }
  if(ok){
    S.won=true; done.add(curIdx); buildSidebar();
    const wp=document.getElementById("winPar");
    if(lv.par){ const good=S.keys<=lv.par;
      wp.textContent=`${S.keys} keystrokes · par ${lv.par} ${good?"— 🏌 under par!":""}`; }
    else wp.textContent=`${S.keys} keystrokes`;
    document.getElementById("winTitle").textContent = curIdx===PLAYABLE.length-1?"🎓 Config mastered!":"Level clear!";
    document.getElementById("winMsg").textContent = curIdx===PLAYABLE.length-1
      ? "You've learned ThePrimeagen's init.lua end to end." : lv.goal;
    const nb=document.getElementById("nextBtn");
    nb.textContent = curIdx===PLAYABLE.length-1?"↺ play again":"next level →";
    winTimer=setTimeout(()=>document.getElementById("win").classList.add("show"),260);
  }
}

/* ---------- sidebar ---------- */
function normalizeSearch(text){
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
}

// Cache lesson text, including decoded keymaps, without indexing HTML tags.
const SEARCH_INDEX=[];
let searchGroup="";
for(const item of LEVELS){
  if(item.group){searchGroup=item.group;continue;}
  const lesson=document.createElement("div");
  lesson.innerHTML=item.lesson.replace(/<[^>]*>/g," ");
  const text=normalizeSearch(`${item.title} ${item.goal} ${searchGroup} ${lesson.textContent}`);
  SEARCH_INDEX.push({i:SEARCH_INDEX.length,group:searchGroup,text,
    words:[...new Set(text.match(/[\p{L}\p{N}_]+/gu)||[])]});
}
const SEARCH_FILLERS=new Set(["i","want","know","how","to","a","an","the","do","can","me","show","please"]);

// Allow one missing, extra, replaced, or transposed letter in longer words.
function searchNearWord(a,b){
  if(Math.abs(a.length-b.length)>1)return false;
  let i=0,j=0,edits=0;
  while(i<a.length && j<b.length){
    if(a[i]===b[j]){i++;j++;continue;}
    if(++edits>1)return false;
    if(a.length>b.length)i++;
    else if(b.length>a.length)j++;
    else if(a[i]===b[j+1] && a[i+1]===b[j]){i+=2;j+=2;}
    else {i++;j++;}
  }
  return edits+(a.length-i)+(b.length-j)<=1;
}

function searchMatches(entry,terms){
  return terms.every(term=>entry.text.includes(term) ||
    (term.length>=4 && entry.words.some(word=>searchNearWord(term,word))));
}

function buildSidebar(){
  const list=document.getElementById("levelList");
  const query=normalizeSearch(document.getElementById("gameSearch").value);
  const allTerms=query.split(" ").filter(Boolean);
  const meaningful=allTerms.filter(term=>!SEARCH_FILLERS.has(term));
  const terms=meaningful.length?meaningful:allTerms;
  const matches=SEARCH_INDEX.filter(entry=>searchMatches(entry,terms));
  document.getElementById("clearSearch").hidden=!query;
  document.getElementById("searchCount").textContent=query
    ? `${matches.length} of ${PLAYABLE.length} games` : `${PLAYABLE.length} games`;
  let html="",group="";
  for(const entry of matches){
    if(entry.group!==group){group=entry.group;html+=`<div class="grp">${esc(group)}</div>`;}
    const i=entry.i,item=PLAYABLE[i];
    const cls=(i===curIdx?"active ":"")+(done.has(i)?"done ":"");
    html+=`<button type="button" class="lv ${cls}" data-i="${i}"${i===curIdx?' aria-current="true"':""}><span class="num">${i+1}</span>
      <span class="dot"></span><span class="t">${esc(item.title)}</span></button>`;
  }
  list.innerHTML=html || `<div class="search-empty"><p>No games found.</p>
    <p class="hint">Try a topic like “create file”, “undo”, or “split”.</p></div>`;
  list.querySelectorAll(".lv").forEach(el=>el.addEventListener("click",()=>loadLevel(+el.dataset.i)));
}

/* ---------- wiring ---------- */
const gameSearch=document.getElementById("gameSearch");
gameSearch.addEventListener("input",()=>{
  buildSidebar();document.getElementById("levelList").scrollTop=0;
});
function clearGameSearch(){gameSearch.value="";buildSidebar();gameSearch.focus();}
document.getElementById("clearSearch").addEventListener("click",clearGameSearch);
gameSearch.addEventListener("keydown",e=>{
  if(e.key==="Escape"){e.preventDefault();clearGameSearch();}
  else if(e.key==="Enter"){
    e.preventDefault();document.querySelector("#levelList .lv")?.click();
  }
});
document.addEventListener("keydown",onKey);
document.getElementById("resetBtn").addEventListener("click",()=>loadLevel(curIdx));
document.getElementById("nextBtn").addEventListener("click",()=>{
  if(curIdx===PLAYABLE.length-1) loadLevel(0);
  else loadLevel(curIdx+1);
});
document.getElementById("buf").addEventListener("click",()=>document.getElementById("buf").focus());
loadLevel(0);
