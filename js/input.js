/* ---------- key dispatch ---------- */
function keyName(e){
  const k=e.key;
  if(e.ctrlKey){
    const m={"d":"<C-d>","u":"<C-u>","p":"<C-p>","n":"<C-n>","y":"<C-y>","c":"<C-c>",
             "k":"<C-k>","j":"<C-j>","f":"<C-f>","e":"<C-e>","w":"<C-w>","r":"<C-r>"," ":"<C-Space>"};
    if(m[k.toLowerCase()])return m[k.toLowerCase()];
  }
  return k;
}
function onKey(e){
  if(e.isComposing)return;
  // Ctrl+/ opens game search; match the character for Spanish Ctrl+Shift+7.
  const typing=e.target.closest('input, textarea, select, [contenteditable]');
  if(e.key==="/" && e.ctrlKey && !e.altKey && !e.metaKey && !typing){
    e.preventDefault();
    const search=document.getElementById("gameSearch");
    search.focus();search.select();
    return;
  }
  // Search and sidebar controls use normal browser typing and navigation.
  if(e.target.closest('input, textarea, select, [contenteditable], #side')) return;
  if(S.won && e.key!=="Enter") return;
  if(S.closed)return;
  if(["Control","Shift","Alt","Meta","CapsLock"].includes(e.key)) return; // ignore bare modifier presses
  const kn=keyName(e);

  // popups: in the harpoon menu, 1-4 jumps to that file; esc/C-c/q/Enter just close
  if(S.popOpen){
    e.preventDefault();
    if(S.popKind==="netrw"){S.keys++;handleNetrwKey(kn);afterKey();return;}
    if(S.popKind==="harpoon" && /^[1-4]$/.test(kn)){
      closePop(); log("<leader>"+kn); toast("→ harpoon file "+kn+"  (<leader>"+kn+")"); afterKey(); return;
    }
    if(kn==="Escape"||kn==="<C-c>"||kn==="Enter"||kn==="q"){ closePop(); render(); checkWin(); }
    return;
  }

  // global ctrl maps that work in normal/visual
  const handledCtrl=["<C-d>","<C-u>","<C-p>","<C-k>","<C-j>","<C-f>","<C-e>","<C-y>","<C-n>","<C-w>","<C-Space>"];
  if(handledCtrl.includes(kn) && (S.mode==="normal"||S.mode==="visual"||S.mode==="vline")){
    e.preventDefault(); ctrlMap(kn); afterKey(); return;
  }

  // arrow-key scold (teach hjkl)
  if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){
    e.preventDefault(); toast("Use j k l ñ — no arrow keys!"); shake(); return;
  }

  e.preventDefault();
  S.keys++;
  if(S.mode==="insert") handleInsert(kn,e);
  else if(S.mode==="cmd") handleCmd(kn);
  else if(S.mode==="visual"||S.mode==="vline") handleVisual(kn,e);
  else handleNormal(kn,e);
  afterKey();
}
function ctrlMap(kn){
  switch(kn){
    case"<C-d>": S.cursor.row=clamp(S.cursor.row+8,0,S.lines.length-1);clampCursor();centerCursor();log("<C-d>");toast("<C-d>zz — half page down, re-centered");break;
    case"<C-u>": S.cursor.row=clamp(S.cursor.row-8,0,S.lines.length-1);clampCursor();centerCursor();log("<C-u>");toast("<C-u>zz — half page up, re-centered");break;
    case"<C-p>": openPop("git");toast("<C-p> → Telescope git_files");log("<C-p>");break;
    case"<C-k>": S.cursor.row=clamp(S.cursor.row+1,0,S.lines.length-1);clampCursor();centerCursor();log("<C-k>");toast("<C-k> → :cnext (quickfix)");break;
    case"<C-j>": S.cursor.row=clamp(S.cursor.row-1,0,S.lines.length-1);clampCursor();centerCursor();log("<C-j>");toast("<C-j> → :cprev (quickfix)");break;
    case"<C-f>": toast("<C-f> → tmux-sessionizer (project switcher)");log("<C-f>");break;
    case"<C-e>": openPop("harpoon");toast("<C-e> → harpoon quick menu");log("<C-e>");break;
    case"<C-w>": S.winPending=true; log("<C-w>"); toast("<C-w> — window cmd next: w switch · q close · v/s split");break;
    default: log(kn);
  }
}
function afterKey(){ render(); checkWin(); }
