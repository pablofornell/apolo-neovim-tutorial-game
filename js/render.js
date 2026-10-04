/* ---------- centering (zz / zzzv emulation) ---------- */
function centerCursor(){ S._center=true; }

/* ---------- toast / shake ---------- */
let toastT=null;
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2200); }
function shake(){ const ed=document.getElementById("editor"); ed.classList.add("shake");
  setTimeout(()=>ed.classList.remove("shake"),300); }

/* ---------- rendering ---------- */
/* Build the HTML for the current buffer's lines (cursor + selection). Pulled
   out so a window split can render the same buffer into two panes. */
function renderBufHTML(){
  let html="";
  for(let r=0;r<S.lines.length;r++){
    const isCur=r===S.cursor.row;
    const relnum=isCur?(r+1):Math.abs(r-S.cursor.row);
    const line=S.lines[r];
    let body="";
    if(line.length===0){
      if(isCur && (S.mode==="normal"||S.mode==="visual"||S.mode==="vline"))
        body=`<span class="cur-cell">&nbsp;</span>`;
      else if(isCur && S.mode==="insert") body=`<span class="cur-cell ins">&nbsp;</span>`;
      else if(isSelected(r,0)) body=`<span class="sel">&nbsp;</span>`;
      else body="&nbsp;";
    }else{
      for(let c=0;c<line.length;c++){
        const ch=esc(line[c]);
        const onCur=isCur&&c===S.cursor.col;
        const sel=isSelected(r,c);
        if(onCur&&(S.mode==="normal"||S.mode==="visual"||S.mode==="vline"))
          body+=`<span class="cur-cell">${ch}</span>`;
        else if(onCur&&S.mode==="insert") body+=`<span class="cur-cell ins">${ch}</span>`;
        else if(sel) body+=`<span class="sel">${ch}</span>`;
        else body+=ch;
      }
      if(isCur&&S.cursor.col>=line.length){
        body+= S.mode==="insert"?`<span class="cur-cell ins">&nbsp;</span>`:`<span class="cur-cell">&nbsp;</span>`;
      }
    }
    html+=`<div class="row${isCur?' cur':''}" data-r="${r}"><span class="gut">${relnum}</span>`+
          `<span class="txt">${body}<span class="ccline" style="left:${80}ch"></span></span></div>`;
  }
  return html;
}
function render(){
  if(S.modesSeen) S.modesSeen.add(S.mode);
  const buf=document.getElementById("buf");
  const rows=S.closed?'<div class="poprow">Practice session closed. Reset or choose another game.</div>':renderBufHTML();
  let tab="";
  if(S.tabs&&S.tabs.length>1){
    tab=`<div class="tabline">`+S.tabs.map((t,i)=>
      `<span class="tab${i===S.tabIdx?' acttab':''}">${esc(" "+(i+1)+" "+t.name+" ")}</span>`).join("")+
      `<span class="tabfill"></span></div>`;
  }
  if(S.split){
    const cls=S.split.type==="v"?"v":"h";
    buf.innerHTML=tab+`<div class="split ${cls}">`+
      `<div class="bufpane${S.split.active===0?' actpane':''}">${rows}</div>`+
      `<div class="bufpane${S.split.active===1?' actpane':''}">${rows}</div></div>`;
  }else buf.innerHTML=tab+rows;
  // status line
  const mb=document.getElementById("modeBox");
  const map={normal:["NORMAL","normal"],insert:["INSERT","insert"],visual:["VISUAL","visual"],vline:["V-LINE","vline"],cmd:["COMMAND","cmd"]};
  const[label,cls]=map[S.mode]; mb.textContent=label; mb.className="mode "+cls;
  document.getElementById("stPos").textContent=(S.cursor.row+1)+":"+(S.cursor.col+1);
  document.getElementById("stFile").textContent = (S.fileName==="[No Name]"?S.fileName:"~/"+S.fileName)
    +(S.closed?" [closed]":fileModified()?" [+]":"");
  const cl=document.getElementById("cmdline");
  cl.textContent = S.cmd? (S.cmd.type==="search"?"/"+S.cmd.text
    : S.cmd.type==="ex"?":"+S.cmd.text
    : `:%s/${S.cmd.word}/${S.cmd.text}`) : (S.count||"");   // pending count = vim's showcmd
  document.getElementById("kc").textContent=S.keys;
  // center if requested
  const curRow=buf.querySelector(".row.cur");
  if(curRow){ curRow.scrollIntoView({block:S._center?"center":"nearest"}); }
  S._center=false;
  // nvim-cmp floating menu
  const cmpEl=document.getElementById("cmp");
  if(S.cmp&&S.cmp.open&&S.mode==="insert"){
    cmpEl.innerHTML=S.cmp.items.map((it,i)=>
      `<div class="cmprow${i===S.cmp.sel?' sel':''}"><span class="ic"></span>${esc(it)}<span class="kind">text</span></div>`).join("");
    const cell=buf.querySelector(".row.cur .cur-cell"), ed=document.getElementById("editor");
    if(cell){ const cr=cell.getBoundingClientRect(), er=ed.getBoundingClientRect();
      cmpEl.style.left=(cr.left-er.left)+"px"; cmpEl.style.top=(cr.bottom-er.top+2)+"px"; }
    cmpEl.style.display="block";
  }else cmpEl.style.display="none";
}
