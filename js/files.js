/* ---------- simulated files: a fresh workspace for each lesson ---------- */
function initFileSession(lv){
  S.fileName=lv.fileName||(S.buffers?S.buffers[0].name:"init.lua");
  S.files=new Map(Object.entries(lv.files||{}).map(([name,lines])=>[name,lines.slice()]));
  if(S.buffers)for(const b of S.buffers)if(!S.files.has(b.name))S.files.set(b.name,b.lines.slice());
  if(S.fileName!=="[No Name]" && !S.files.has(S.fileName))S.files.set(S.fileName,S.lines.slice());
  S.dirs=new Set(lv.dirs||["lua","lua/theprimeagen"]);
  for(const name of [...S.files.keys(),...S.dirs]){
    const parts=name.split("/");parts.pop();
    while(parts.length){S.dirs.add(parts.join("/"));parts.pop();}
  }
  S.cwd="";S.closed=false;S.discardedChanges=false;S.filePrompt=null;S.popSelection=0;S.popRows=[];
}

function fileModified(){
  return linesModified(S.fileName,S.lines);
}
function linesModified(name,lines){return lines.join("\n")!==(S.files.get(name)||[""]).join("\n");}
function unsavedBuffers(){
  return fileModified() || !!S.buffers?.some((b,i)=>i!==S.bufIdx && linesModified(b.name,b.lines));
}

function filePath(name,base=""){
  const parts=[];
  for(const part of `${name.startsWith("/")?"":base}/${name}`.split("/")){
    if(!part||part===".")continue;
    if(part===".."){parts.pop();continue;}
    parts.push(part);
  }
  return parts.join("/");
}

function fileParent(name){return name.split("/").slice(0,-1).join("/");}

function openFile(name,force=false){
  const path=filePath(name);
  if(!path || S.dirs.has(path)){toast("Choose a filename, not a directory.");return false;}
  if(fileModified() && !force){toast("Unsaved changes — use :w to save or :e! to discard.");return false;}
  if(force){
    S.discardedChanges=fileModified();
    S.lines=(S.files.get(S.fileName)||[""]).slice();S.undo=[];S.redo=[];
  }
  if(!S.buffers)S.buffers=[{name:S.fileName,lines:S.lines.slice()}];
  syncBuf();
  let idx=S.buffers.findIndex(b=>b.name===path);
  if(idx<0){idx=S.buffers.length;S.buffers.push({name:path,lines:(S.files.get(path)||[""]).slice()});}
  S.bufIdx=idx;loadBuf();S.closed=false;
  toast((S.files.has(path)?"Opened ":"New file: ")+path+(S.files.has(path)?"":" — save with :w"));
  return true;
}

function writeFile(name){
  const path=name?filePath(name):S.fileName;
  if(!path||path==="[No Name]"){toast("No filename — use :e notes.txt or :w notes.txt.");return false;}
  const parent=fileParent(path);
  if(S.dirs.has(path) || (parent && !S.dirs.has(parent))){toast("Cannot write: the parent directory must exist.");return false;}
  S.files.set(path,S.lines.slice());
  if(S.fileName==="[No Name]"){
    S.fileName=path;
    if(S.buffers)S.buffers[S.bufIdx].name=path;
  }
  syncBuf();log(":w");toast("Saved "+path+" · "+S.lines.length+" line(s)");return true;
}

function quitFile(force=false){
  if(S.split){S.split=null;toast("Closed the split window.");return true;}
  if(S.tabs && S.tabs.length>1){closeTab();return true;}
  if(unsavedBuffers() && !force){toast("Unsaved changes — save your buffers before quitting, or use :q! to discard.");return false;}
  if(force){
    S.discardedChanges=unsavedBuffers();
    if(S.buffers)for(const b of S.buffers){b.lines=(S.files.get(b.name)||[""]).slice();b.undo=[];b.redo=[];}
    S.lines=(S.files.get(S.fileName)||[""]).slice();S.undo=[];S.redo=[];syncBuf();
  }
  S.closed=true;toast(force?"Closed without saving.":"Practice session closed.");return true;
}

function runFileEx(cmd){
  let match=cmd.match(/^(e|edit)(!)?(?:\s+(.+))?$/);
  if(match){
    const name=match[3]||S.fileName;
    if(name==="[No Name]"){toast("Use :e followed by a filename.");return true;}
    if(openFile(name,!!match[2]))log(":e "+filePath(name));
    return true;
  }
  match=cmd.match(/^(w|write)(!)?(?:\s+(.+))?$/);
  if(match){writeFile(match[3]);return true;}
  match=cmd.match(/^(wq|x|exit)(!)?$/);
  if(match){
    if((match[1]!=="wq" && !fileModified()) || writeFile()){
      if(quitFile(!!match[2]))log(":"+match[1]);
    }
    return true;
  }
  match=cmd.match(/^(q|quit)(!)?$/);
  if(match){if(quitFile(!!match[2]))log(match[2]?":q!":":q");return true;}
  return false;
}

/* ---------- netrw: browse, create a file with %, or a directory with d ---------- */
function renderNetrw(){
  const prefix=S.cwd?S.cwd+"/":"";
  const dirs=[...S.dirs].filter(name=>fileParent(name)===S.cwd).sort();
  const files=[...S.files.keys()].filter(name=>fileParent(name)===S.cwd).sort();
  S.popRows=[{label:"../",name:fileParent(S.cwd),directory:true},
    ...dirs.map(name=>({label:name.slice(prefix.length)+"/",name,directory:true})),
    ...files.map(name=>({label:name.slice(prefix.length),name,directory:false}))];
  S.popSelection=clamp(S.popSelection,0,S.popRows.length-1);
  document.getElementById("popTitle").textContent="netrw · ~/"+prefix;
  document.getElementById("popFoot").textContent=S.filePrompt
    ? `${S.filePrompt.kind==="file"?"New file":"New directory"}: ${S.filePrompt.text}▏ · Enter confirms · Esc cancels`
    : "k/l move · Enter opens · % new file · d new directory · Esc closes";
  document.getElementById("popBody").innerHTML=S.popRows.map((row,i)=>
    `<div class="poprow${i===S.popSelection?' sel':''}">${esc(row.label)}</div>`).join("");
}

function handleNetrwKey(key){
  if(S.filePrompt){
    if(key==="Escape"||key==="<C-c>"){S.filePrompt=null;renderNetrw();return;}
    if(key==="Backspace")S.filePrompt.text=S.filePrompt.text.slice(0,-1);
    else if(key==="Enter"){
      const {kind,text}=S.filePrompt;S.filePrompt=null;
      if(!text.trim()){renderNetrw();return;}
      const path=filePath(text.trim(),S.cwd),parent=fileParent(path);
      if(!path || S.dirs.has(path) || S.files.has(path)){toast("That file or directory already exists.");renderNetrw();return;}
      if(parent && !S.dirs.has(parent)){toast("Create the parent directory first.");renderNetrw();return;}
      if(kind==="directory"){S.dirs.add(path);log("netrw d "+path);toast("Created directory: "+path);renderNetrw();}
      else {
        if(fileModified()){toast("Save your current changes before creating a file.");renderNetrw();return;}
        S.files.set(path,[""]);
        if(openFile(path)){log("netrw % "+path);closePop();}
      }
      return;
    }else if(key.length===1)S.filePrompt.text+=key;
    renderNetrw();return;
  }
  if(key==="Escape"||key==="<C-c>"||key==="q"){closePop();return;}
  if(key==="%"||key==="d"){S.filePrompt={kind:key==="%"?"file":"directory",text:""};renderNetrw();return;}
  if(key==="k")S.popSelection=clamp(S.popSelection+1,0,S.popRows.length-1);
  else if(key==="l")S.popSelection=clamp(S.popSelection-1,0,S.popRows.length-1);
  else if(key==="Enter"){
    const row=S.popRows[S.popSelection];
    if(row.directory){S.cwd=row.name;S.popSelection=0;}
    else if(openFile(row.name)){log(":e "+row.name);closePop();return;}
  }
  renderNetrw();
}
