/* ---------- popups (telescope/netrw/etc) ---------- */
const POPS={
  netrw:{title:"netrw  ~/init.lua/",foot:"file explorer · k/l move · <CR> open",
    rows:["../","lua/","lua/theprimeagen/","init.lua","README.md","lazy-lock.json"]},
  files:{title:"Telescope find_files",foot:"<leader>pf · fuzzy find any file",
    rows:["lua/theprimeagen/remap.lua","lua/theprimeagen/set.lua","lua/theprimeagen/lazy/lsp.lua","lua/theprimeagen/lazy/telescope.lua","init.lua"]},
  git:{title:"Telescope git_files",foot:"<C-p> · only git-tracked files",
    rows:["init.lua","lua/theprimeagen/remap.lua","lua/theprimeagen/set.lua","README.md"]},
  grep:{title:"Grep > vim.keymap",foot:"<leader>ps · live grep across the project",
    rows:["remap.lua:2  vim.keymap.set(\"n\", \"<leader>pv\", vim.cmd.Ex)","remap.lua:9  vim.keymap.set(\"n\", \"J\", \"mzJ`z\")","telescope.lua:24  vim.keymap.set('n','<leader>pf',...)"]},
  undo:{title:"UndoTree",foot:"<leader>u · time-travel your edits",
    rows:["@ 0  (root)","@ 1  ──● typed code","@ 2    └─● deleted line","@ 3  ──● current"]},
  git_status:{title:"fugitive · git status",foot:"<leader>gs · stage/commit; <leader>p push, <leader>P pull",
    rows:["Head: master","Unstaged (1)","  M lua/theprimeagen/remap.lua","Untracked (1)","  index.html"]},
  harpoon:{title:"harpoon · quick menu",foot:"press 1–4 to jump · esc to close",
    rows:["1   lua/theprimeagen/remap.lua","2   lua/theprimeagen/set.lua","3   init.lua","4   lua/theprimeagen/lazy/lsp.lua"]},
  trouble:{title:"Trouble · Diagnostics",foot:"<leader>tt toggle · ]t / [t cycle items",
    rows:["init.lua  ●1  ⚠ 0","remap.lua:55  E  undefined global 'err'","set.lua:31  W  trailing whitespace"]},
};
function openPop(kind){
  const p=POPS[kind]; if(!p)return;
  document.getElementById("popTitle").textContent=p.title;
  document.getElementById("popFoot").textContent=p.foot;
  document.getElementById("popBody").innerHTML=p.rows.map((r,i)=>
    `<div class="poprow${i===(kind==='netrw'?3:0)?' sel':''}">${esc(r)}</div>`).join("");
  document.getElementById("pop").classList.add("show");
  S.popOpen=true; S.popKind=kind;
  if(kind==="netrw"){S.popSelection=0;S.filePrompt=null;renderNetrw();}
}
function closePop(){ document.getElementById("pop").classList.remove("show"); S.popOpen=false; S.popKind=null;S.filePrompt=null; }
