const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

// Minimal DOM for exercising the real lesson loader and keyboard dispatcher.
// Browser checks separately cover rendering, focus, and interactive controls.
function createGame(){
  const elements=new Map();
  function element(){
    const classes=new Set();
    return {
      value:"",style:{},textContent:"",hidden:false,
      classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)},
      addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},
      focus(){document.activeElement=this;},select(){this.selected=true;},
      closest(){return null;},
      set innerHTML(html){
        this.html=html;this.textContent=html.replace(/<[^>]*>/g," ")
          .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
      },
      get innerHTML(){return this.html||"";},
    };
  }
  const document={
    getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},
    createElement:element,addEventListener(){},querySelector(){return null;},
  };
  const context=vm.createContext({document,setTimeout:()=>0,clearTimeout(){}});
  for(const name of ["state","motions","popups","modes","files","render","input","levels","game"]){
    vm.runInContext(fs.readFileSync(path.join(__dirname,"..","js",name+".js"),"utf8"),context,{filename:name+".js"});
  }
  const api=vm.runInContext("({S,PLAYABLE,loadLevel,onKey,SEARCH_INDEX,searchMatches})",context);
  const press=(key,ctrlKey=false)=>api.onKey({key,ctrlKey,target:element(),preventDefault(){}});
  return {...api,document,press,
    load(title){
      const idx=api.PLAYABLE.findIndex(lv=>lv.title===title);
      assert.notEqual(idx,-1,`Lesson exists: ${title}`);api.loadLevel(idx);
    },
    play(...steps){
      for(const step of steps){
        if(typeof step==="object")press(step.ctrl,true);
        else if(["Enter","Escape","Backspace"].includes(step))press(step);
        else for(const char of step)press(char);
      }
    },
  };
}

const ctrlC={ctrl:"c"};
const solutions=[
  ["Line ends: 0 ^ $",["0"]],
  ["Create a file: :e",[":e notes.txt","Enter","ahello",ctrlC,":w","Enter"]],
  ["Open a file: :e",[":e todo.txt","Enter"]],
  ["Save a file: :w",["ciwready",ctrlC,":w","Enter"]],
  ["Save and quit: :wq",["A!",ctrlC,":wq","Enter"]],
  ["Quit without saving: :q!",["A!",ctrlC,":q!","Enter"]],
  ["Create a folder: netrw d",[" pvdnotes","Enter"]],
  ["Add a new line: o",["omiddle",ctrlC]],
  ["Delete a line: dd",["dd"]],
  ["Copy and paste a line: yy p",["yyp"]],
  ["Undo and redo: u / Ctrl-r",["ddu",{ctrl:"r"}]],
  ["Select a line: V",["Vyp"]],
  ["Move selected text: v d p",["vñd0p"]],
  ["Change a word: ciw",["ciwgoodbye",ctrlC]],
  ["LSP completion (cmp)",["A",{ctrl:" "},{ctrl:"n"},{ctrl:"y"}]],
  ["Autocomplete: accept a suggestion",["Atarg",{ctrl:"y"}]],
  ["Autocomplete: next / previous suggestion",["A",{ctrl:" "},{ctrl:"n"},{ctrl:"n"},{ctrl:"p"},{ctrl:"y"}]],
  ["Autocomplete: dismiss suggestions",["A",{ctrl:" "},{ctrl:"e"},"et"]],
];

for(const [title,steps] of solutions){
  test(`Playable lesson: ${title}`,()=>{
    const game=createGame();game.load(title);
    assert.equal(game.S.won,false,"Fresh lesson must require an action");
    game.play(...steps);
    assert.equal(game.S.won,true,"Documented key sequence must complete the lesson");
  });
}

test("Swapped line ends match normal-mode Neovim movements and leave ^ unchanged",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.S.lines=["  alpha beta "];game.S.cursor={row:0,col:6};
  game.play("$");assert.equal(game.S.cursor.col,0);
  game.play("0");assert.equal(game.S.cursor.col,12);
  game.play("^");assert.equal(game.S.cursor.col,2);
  game.S.lines=[""];game.S.cursor={row:0,col:0};
  game.play("$0");assert.equal(game.S.cursor.col,0);
});

// These outcomes were checked in headless Neovim with the user's keymaps.lua.
for(const [keys,lines,register,col] of [
  ["d$","a beta ","  alph",0],
  ["d0","  alph","a beta ",5],
  ["y$","  alpha beta ","  alph",0],
  ["y0","  alpha beta ","a beta ",6],
  ["c$","Xa beta ","  alph",0],
  ["c0","  alphX","a beta ",6],
  ["v$y","  alpha beta ","  alpha",0],
  ["v0y","  alpha beta ","a beta ",6],
]){
  test(`Swapped line-end operation matches Neovim: ${keys}`,()=>{
    const game=createGame();game.load("Create a file: :e");
    game.S.lines=["  alpha beta "];game.S.cursor={row:0,col:6};
    game.play(keys);if(keys.startsWith("c"))game.play("X","Escape");
    assert.equal(game.S.lines.join("\n"),lines);assert.equal(game.S.reg.text,register);
    assert.equal(game.S.reg.linewise,false);assert.equal(game.S.cursor.col,col);
    assert.equal(game.S.mode,"normal");
  });
}

test("Remapped 0 deletes the last character when already at the line end",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.S.lines=["abc"];game.S.cursor={row:0,col:2};game.play("d0");
  assert.equal(game.S.lines.join("\n"),"ab");assert.equal(game.S.reg.text,"c");
});

for(const keys of ["d$","c$"]){
  test(`Start-boundary operator preserves the register, mode and redo: ${keys}`,()=>{
    const game=createGame();game.load("Create a file: :e");
    game.S.lines=["abc"];game.S.cursor={row:0,col:0};game.play("xu");
    game.S.reg={text:"seed",linewise:false};game.play(keys);
    assert.equal(game.S.lines.join("\n"),"abc");assert.equal(game.S.reg.text,"seed");
    assert.equal(game.S.mode,"normal");assert.equal(game.S.redo.length,1);
    assert.equal(game.S.keyLog.includes(keys),false);
  });
}

test("Start-boundary yank matches Neovim's empty yank without changing history",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.S.lines=["abc"];game.S.cursor={row:0,col:0};game.play("xu");
  game.S.reg={text:"seed",linewise:false};game.play("y$");
  assert.equal(game.S.lines.join("\n"),"abc");assert.equal(game.S.reg.text,"");
  assert.equal(game.S.mode,"normal");assert.equal(game.S.redo.length,1);
});

test("Zeros within a count stay numeric and a standalone 0 goes to the line end",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.S.lines=Array.from({length:20},(_,i)=>"line "+(i+1));game.S.cursor={row:0,col:0};
  game.play("10k");assert.equal(game.S.cursor.row,10);assert.equal(game.S.count,"");
  game.play("0");assert.equal(game.S.cursor.col,"line 11".length-1);
});

test("Remapped dollar extends a pending count like Neovim's zero key",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.S.lines=Array.from({length:25},(_,i)=>"line "+(i+1));game.S.cursor={row:0,col:3};
  game.play("2$");assert.equal(game.S.count,"20");assert.equal(game.S.cursor.col,3);
  game.play("k");assert.equal(game.S.cursor.row,20);assert.equal(game.S.count,"");
});

test("Line-end keys remain literal text in insert and command modes",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.play("a$0",ctrlC);assert.equal(game.S.lines.join("\n"),"$0");
  game.load("Create a file: :e");game.play(":e file$0.txt","Enter");
  assert.equal(game.S.fileName,"file$0.txt");
});

test("Creating a named buffer does not save it until :w",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.play(":e notes.txt","Enter","ahello",ctrlC);
  assert.equal(game.S.fileName,"notes.txt");
  assert.equal(game.S.files.has("notes.txt"),false);
  assert.equal(game.S.won,false);
  assert.match(game.document.getElementById("stFile").textContent,/\[\+\]/);
  game.play(":w","Enter");
  assert.equal(game.S.files.get("notes.txt").join("\n"),"hello");
  assert.equal(game.S.won,true);
});

test("Saving unchanged or wrong contents cannot complete the save lesson",()=>{
  const game=createGame();game.load("Save a file: :w");
  game.play(":w","Enter");assert.equal(game.S.won,false);
  game.play("ciwwrong",ctrlC,":w","Enter");assert.equal(game.S.won,false);
  assert.equal(game.S.files.get("status.txt").join("\n"),"wrong");
});

test(":q and :e protect unsaved edits; :q! restores the saved file",()=>{
  const game=createGame();game.load("Quit without saving: :q!");
  game.play("A!",ctrlC,":q","Enter");
  assert.equal(game.S.closed,false);assert.equal(game.S.won,false);
  game.play(":e other.txt","Enter");
  assert.equal(game.S.fileName,"message.txt");assert.equal(game.S.lines.join("\n"),"hello!");
  assert.equal(game.S.files.get("message.txt").join("\n"),"hello");
  game.play(":q!","Enter");
  assert.equal(game.S.lines.join("\n"),"hello");assert.equal(game.S.won,true);
  assert.match(game.document.getElementById("stFile").textContent,/\[closed\]/);
});

test("Quitting without making changes cannot complete the discard lesson",()=>{
  const game=createGame();game.load("Quit without saving: :q!");
  game.play(":q!","Enter");
  assert.equal(game.S.closed,true);assert.equal(game.S.won,false);
});

test("Failed write does not close the session or create a file",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.play(":wq","Enter");assert.equal(game.S.closed,false);
  game.play(":e missing/notes.txt","Enter","ahello",ctrlC,":wq","Enter");
  assert.equal(game.S.closed,false);assert.equal(game.S.files.has("missing/notes.txt"),false);
});

test("Netrw creates files and folders, supports cancellation and directory navigation",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.play(" pvdnotes","Enter");assert.equal(game.S.dirs.has("notes"),true);
  game.play("dunused","Escape");assert.equal(game.S.dirs.has("unused"),false);
  game.play("k","Enter");assert.equal(game.S.cwd,"lua");
  game.play("%example.txt","Enter");
  assert.equal(game.S.fileName,"lua/example.txt");
  assert.equal(game.S.files.get("lua/example.txt").join("\n"),"");
  assert.equal(game.S.popOpen,false);
  game.play("aexample",ctrlC,":w","Enter");
  assert.equal(game.S.files.get("lua/example.txt").join("\n"),"example");
});

test("Undo and redo restore content; a new change clears redo but yanking does not",()=>{
  const game=createGame();game.load("Undo and redo: u / Ctrl-r");
  game.play("ddu");assert.equal(game.S.lines.join("\n"),"keep first\nremove me\nkeep last");
  game.play("yy");assert.equal(game.S.redo.length,1);
  game.play({ctrl:"r"});assert.equal(game.S.won,true);
  game.load("Undo and redo: u / Ctrl-r");game.play("ddux");
  assert.equal(game.S.redo.length,0);
  const edited=game.S.lines.join("\n");game.play({ctrl:"r"});
  assert.equal(game.S.lines.join("\n"),edited);assert.equal(game.S.won,false);
});

test("Undo histories remain attached to their own buffers",()=>{
  const game=createGame();game.load("Buffers");
  const initial=game.S.lines.join("\n");game.play("x",":b 2","Enter");
  const next=game.S.lines.join("\n");game.play("u");assert.equal(game.S.lines.join("\n"),next);
  game.play(":b 1","Enter","u");assert.equal(game.S.lines.join("\n"),initial);
});

test("No-op undo and redo cannot complete the undo lesson",()=>{
  const game=createGame();game.load("Undo and redo: u / Ctrl-r");
  game.play("udd",{ctrl:"r"});
  assert.equal(game.S.won,false);
  assert.equal(game.S.keyLog.includes("u"),false);
  assert.equal(game.S.keyLog.includes("<C-r>"),false);
  game.play("u",{ctrl:"r"});assert.equal(game.S.won,true);
});

test("Move selected text cuts only the closing delimiter and preserves the comment",()=>{
  const game=createGame();game.load("Move selected text: v d p");
  game.play("vñ");
  assert.equal(game.S.mode,"visual");assert.equal(game.S.anchor.col,3);assert.equal(game.S.cursor.col,4);
  game.play("d");
  assert.equal(game.S.reg.text,"*/");assert.equal(game.S.reg.linewise,false);
  assert.equal(game.S.lines.join("\n"),"/* comment text");assert.equal(game.S.won,false);
  game.play("0p");assert.equal(game.S.lines.join("\n"),"/* comment text*/");assert.equal(game.S.won,true);
});

test("Copying or manually rewriting the delimiter does not complete the move lesson",()=>{
  const game=createGame();game.load("Move selected text: v d p");
  game.play("vñy0p");assert.equal(game.S.won,false);
  game.load("Move selected text: v d p");
  game.play("vñd","A*/",ctrlC);
  assert.equal(game.S.lines.join("\n"),"/* comment text*/");assert.equal(game.S.won,false);
});

test("Quit protects edits in inactive buffers and forced quit discards them",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.play(":e scratch.txt","Enter","aunsaved",ctrlC,":bn","Enter",":q","Enter");
  assert.equal(game.S.fileName,"[No Name]");assert.equal(game.S.closed,false);
  game.play(":w named.txt","Enter",":wq","Enter");assert.equal(game.S.closed,false);
  game.play(":q!","Enter");
  assert.equal(game.S.closed,true);assert.equal(game.S.discardedChanges,true);
  assert.equal(game.S.buffers.find(b=>b.name==="scratch.txt").lines.join("\n"),"");
  assert.equal(game.S.files.has("scratch.txt"),false);
});

test("Reset restores lesson files, folders, redo history and closed state",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.play(" pvdnotes","Enter","Escape",":e notes.txt","Enter","ahello",ctrlC,":wq","Enter");
  assert.equal(game.S.closed,true);
  game.load("Create a file: :e");
  assert.equal(game.S.fileName,"[No Name]");assert.equal(game.S.files.size,0);
  assert.equal(game.S.dirs.has("notes"),false);assert.equal(game.S.closed,false);
  assert.equal(game.S.undo.length,0);assert.equal(game.S.redo.length,0);assert.equal(game.S.won,false);
});

test("File creation and other basic tasks are in the search index",()=>{
  const game=createGame();
  for(const [terms,title] of [
    [["create","file"],"Create a file: :e"],[["crete","file"],"Create a file: :e"],
    [["create","folder"],"Create a folder: netrw d"],[["save","quit"],"Save and quit: :wq"],
    [["copy","paste"],"Copy and paste a line: yy p"],[["undo","redo"],"Undo and redo: u / Ctrl-r"],
    [["move","selected","text"],"Move selected text: v d p"],
    [["comment","*/"],"Move selected text: v d p"],
    [["autocomplete","accept"],"Autocomplete: accept a suggestion"],
    [["sugestion","menu"],"Autocomplete: accept a suggestion"],
    [["target"],"Autocomplete: accept a suggestion"],
    [["previous","suggestion"],"Autocomplete: next / previous suggestion"],
    [["dismiss","suggestions"],"Autocomplete: dismiss suggestions"],
  ]){
    const found=game.SEARCH_INDEX.filter(entry=>game.searchMatches(entry,terms)).map(entry=>game.PLAYABLE[entry.i].title);
    assert.ok(found.includes(title),`Search ${terms.join(" ")} finds ${title}`);
  }
});

test("Typing targ opens suggestions; selection does not edit until Ctrl-y",()=>{
  const game=createGame();game.load("Autocomplete: accept a suggestion");
  game.play("Atarg");
  assert.equal(game.S.lines[0],"local result = targ");assert.equal(game.S.won,false);
  assert.equal(game.S.cmp.open,true);assert.equal(game.S.cmp.prefix,"targ");
  assert.deepEqual(Array.from(game.S.cmp.items),["target","targetCount","targetName"]);
  const menu=game.document.getElementById("cmp");
  assert.equal(menu.style.display,"block");assert.match(menu.innerHTML,/Ctrl y.*accept/);
  game.play({ctrl:"n"});
  assert.equal(game.S.lines[0],"local result = targ");assert.equal(game.S.cmp.sel,1);
  game.play({ctrl:"p"},{ctrl:"y"});
  assert.equal(game.S.lines[0],"local result = target");assert.equal(game.S.won,true);
  assert.equal(menu.style.display,"none");assert.equal(game.S.mode,"insert");
});

test("Typing the full word or accepting another suggestion cannot win the acceptance lesson",()=>{
  const game=createGame();game.load("Autocomplete: accept a suggestion");
  game.play("Atarget",{ctrl:"y"});assert.equal(game.S.won,false);
  assert.equal(game.S.lines[0],"local result = targetCount");
  game.load("Autocomplete: accept a suggestion");game.play("Atarget");
  assert.equal(game.S.lines[0],"local result = target");assert.equal(game.S.won,false);
  game.load("Autocomplete: accept a suggestion");game.play("Atarg",{ctrl:"n"},{ctrl:"y"});
  assert.equal(game.S.lines[0],"local result = targetCount");assert.equal(game.S.won,false);
});

test("Suggestions refresh after typing and backspacing, without accepting stale matches",()=>{
  const game=createGame();game.load("Autocomplete: accept a suggestion");
  game.play("AtargetN");assert.deepEqual(Array.from(game.S.cmp.items),["targetName"]);
  game.play("Backspace");assert.equal(game.S.cmp.prefix,"target");
  assert.deepEqual(Array.from(game.S.cmp.items),["targetCount","targetName"]);
  game.play("Backspace","Backspace");assert.equal(game.S.cmp.prefix,"targ");
  game.play({ctrl:"y"});assert.equal(game.S.lines[0],"local result = target");
  assert.equal(game.S.won,true);
});

test("No-match completion leaves text intact and does not offer unrelated words",()=>{
  const game=createGame();game.load("Autocomplete: accept a suggestion");
  game.play("Axyz",{ctrl:" "},{ctrl:"y"});
  assert.equal(game.S.cmp,null);assert.equal(game.S.lines[0],"local result = xyz");
  assert.equal(game.S.cmpActions.length,0);assert.equal(game.S.won,false);
  assert.equal(game.document.getElementById("cmp").style.display,"none");
});

test("Next and previous suggestions wrap and keep the prefix unchanged",()=>{
  const game=createGame();game.load("Autocomplete: next / previous suggestion");
  game.play("A",{ctrl:" "},{ctrl:"p"});assert.equal(game.S.cmp.sel,2);
  game.play({ctrl:"n"});assert.equal(game.S.cmp.sel,0);
  game.play({ctrl:"n"});assert.equal(game.S.cmp.sel,1);
  assert.equal(game.S.lines[0],"local result = targ");assert.equal(game.S.won,false);
  game.play({ctrl:"y"});assert.equal(game.S.lines[0],"local result = targetCount");
  assert.equal(game.S.won,true);
});

test("Ctrl-e dismisses without editing, permits continued typing and manual reopening",()=>{
  const game=createGame();game.load("Autocomplete: dismiss suggestions");
  game.play("A",{ctrl:"e"},"et");assert.equal(game.S.won,false);
  game.load("Autocomplete: dismiss suggestions");game.play("A",{ctrl:" "},{ctrl:"e"});
  assert.equal(game.S.mode,"insert");assert.equal(game.S.lines[0],"local result = targ");
  assert.equal(game.S.cmp.open,false);assert.equal(game.S.won,false);
  game.play({ctrl:" "});assert.equal(game.S.cmp.open,true);
  game.play({ctrl:"e"},"et");assert.equal(game.S.won,true);
});

test("Closing suggestions by leaving Insert mode cannot substitute for Ctrl-e in the dismiss lesson",()=>{
  const game=createGame();game.load("Autocomplete: dismiss suggestions");
  game.play("A",{ctrl:" "},"Escape","Aet");
  assert.equal(game.S.lines[0],"local result = target");assert.equal(game.S.mode,"insert");
  assert.equal(game.S.won,false);
});

for(const exit of ["Escape",ctrlC]){
  test(`Leaving Insert mode closes suggestions in one key: ${typeof exit==="string"?exit:"Ctrl-c"}`,()=>{
    const game=createGame();game.load("Autocomplete: accept a suggestion");
    game.play("Atarg",exit);
    assert.equal(game.S.mode,"normal");assert.equal(game.S.cmp.open,false);
    assert.equal(game.S.lines[0],"local result = targ");assert.equal(game.S.cursor.col,18);
    assert.equal(game.S.won,false);
    game.play("A",{ctrl:" "},{ctrl:"y"});assert.equal(game.S.won,true);
  });
}

test("Enter adds a newline and Tab explains the acceptance key",()=>{
  const game=createGame();game.load("Autocomplete: accept a suggestion");game.play("Atarg");
  game.press("Tab");assert.equal(game.S.cmp.open,true);
  assert.equal(game.S.lines[0],"local result = targ");
  assert.match(game.document.getElementById("toast").textContent,/Ctrl y/);
  game.play("Enter");assert.equal(game.S.lines.join("\n"),"local result = targ\n");
  assert.equal(game.S.cmp.open,false);
  assert.equal(game.S.cmpActions.some(action=>action.kind==="accept"),false);
});

test("Accepting completion preserves text after the cursor and can be undone and redone",()=>{
  const game=createGame();game.load("Autocomplete: next / previous suggestion");
  game.S.lines=["local result = targ + tail"];game.S.cursor.col=19;
  game.play("a",{ctrl:" "},{ctrl:"y"});
  assert.equal(game.S.lines[0],"local result = target + tail");assert.equal(game.S.cursor.col,21);
  game.play("Escape","u");assert.equal(game.S.lines[0],"local result = targ + tail");
  game.play({ctrl:"r"});assert.equal(game.S.lines[0],"local result = target + tail");
});

test("Reset clears the completion menu and its actions across lessons",()=>{
  const game=createGame();game.load("Autocomplete: accept a suggestion");
  game.play("Atarg",{ctrl:"n"});assert.ok(game.S.cmpActions.length);
  game.load("Autocomplete: dismiss suggestions");
  assert.equal(game.S.cmp,null);assert.equal(game.S.cmpActions.length,0);
  assert.equal(game.document.getElementById("cmp").style.display,"none");assert.equal(game.S.won,false);
});

test("Slash from Shift+7 focuses game search and selects the existing query without playing a move",()=>{
  const game=createGame();game.load("Create a file: :e");
  const search=game.document.getElementById("gameSearch");search.value="autocomplete";
  let prevented=false;
  game.onKey({key:"/",code:"Digit7",shiftKey:true,target:game.document.getElementById("buf"),preventDefault(){prevented=true;}});
  assert.equal(game.document.activeElement,search);assert.equal(search.selected,true);
  assert.equal(prevented,true);assert.equal(game.S.mode,"normal");assert.equal(game.S.keys,0);
  assert.equal(game.S.lines[0],"");
});

test("Slash focuses search after winning or closing the editor, including from Insert mode",()=>{
  const game=createGame();
  for(const state of [{won:true,mode:"insert"},{closed:true}]){
    game.load("Create a file: :e");Object.assign(game.S,state);game.play("/");
    assert.equal(game.document.activeElement,game.document.getElementById("gameSearch"));
    assert.equal(game.S.keys,0);
  }
});

test("Slash stays literal when typing text, commands, file paths and character replacements",()=>{
  const game=createGame();game.load("Create a file: :e");
  game.play("a/",ctrlC);assert.equal(game.S.lines[0],"/");
  game.load("Create a file: :e");game.play(":e lua/example.txt","Enter");
  assert.equal(game.S.fileName,"lua/example.txt");
  game.load("Create a file: :e");game.play(" pv%lua/example.txt","Enter");
  assert.equal(game.S.fileName,"lua/example.txt");
  game.load("Create a file: :e");game.S.lines=["abc"];game.play("r/");
  assert.equal(game.S.lines[0],"/bc");
  assert.equal(game.document.activeElement,game.document.getElementById("buf"));
});

test("Slash does not hijack text fields or an IME composition",()=>{
  const game=createGame();game.load("Create a file: :e");
  const buf=game.document.getElementById("buf");
  game.onKey({key:"/",target:{closest(){return {};}}});
  assert.equal(game.document.activeElement,buf);
  game.onKey({key:"/",isComposing:true,target:buf,preventDefault(){}});
  assert.equal(game.document.activeElement,buf);
  assert.equal(game.S.mode,"normal");assert.equal(game.S.keys,0);
});

test("Alt-slash keeps the Neovim buffer search lesson playable",()=>{
  const game=createGame();game.load("Centered search: n / N");
  game.onKey({key:"/",altKey:true,target:game.document.getElementById("buf"),preventDefault(){}});
  assert.equal(game.S.mode,"cmd");assert.equal(game.S.cmd.type,"search");
  game.play("TODO","Enter","n");assert.equal(game.S.won,true);
  assert.equal(game.S.cursor.row,4);
});
