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
      addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},focus(){},
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
  ["Move selected text: v d p",["vñd$p"]],
  ["Change a word: ciw",["ciwgoodbye",ctrlC]],
];

for(const [title,steps] of solutions){
  test(`Playable lesson: ${title}`,()=>{
    const game=createGame();game.load(title);
    assert.equal(game.S.won,false,"Fresh lesson must require an action");
    game.play(...steps);
    assert.equal(game.S.won,true,"Documented key sequence must complete the lesson");
  });
}

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
  game.play("$p");assert.equal(game.S.lines.join("\n"),"/* comment text*/");assert.equal(game.S.won,true);
});

test("Copying or manually rewriting the delimiter does not complete the move lesson",()=>{
  const game=createGame();game.load("Move selected text: v d p");
  game.play("vñy$p");assert.equal(game.S.won,false);
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
  ]){
    const found=game.SEARCH_INDEX.filter(entry=>game.searchMatches(entry,terms)).map(entry=>game.PLAYABLE[entry.i].title);
    assert.ok(found.includes(title),`Search ${terms.join(" ")} finds ${title}`);
  }
});
