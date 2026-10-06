/* ======================================================================
   CURRICULUM — every level teaches a piece of THIS init.lua
   ====================================================================== */
function L(o){ return Object.assign({par:null},o); }
const LEVELS=[
{group:"Survival"},
L({title:"Insert & escape",
  goal:"Press i, type anything, then leave insert with <C-c>",
  buf:["function greet()","    -- put your name here","end"], cur:{row:1,col:7},
  lesson:`<h2>Modes & the <code>C-c</code> remap</h2><div class="sub">remap.lua</div>
  <p>Neovim starts in <b>NORMAL</b> mode — keys are commands, not text. Press <kbd>i</kbd> to <b>insert</b>.</p>
  <div class="card do"><h3>Try it</h3>Press <kbd>i</kbd>, type a few letters, then press <kbd>Ctrl</kbd>+<kbd>c</kbd>.</div>
  <div class="card"><h3>Your swap: i ⇄ a</h3><kbd>i</kbd> inserts <b>after</b> the character and <kbd>a</kbd> <b>before</b> it — the inverse of stock vim.
  <div class="why">The green caret lands just right of the char after <kbd>i</kbd>, and just left of it after <kbd>a</kbd>.</div></div>
  <div class="card"><h3>Why this config?</h3>This init.lua maps <code>&lt;C-c&gt;</code> → <code>&lt;Esc&gt;</code> in insert mode:
  <div class="why">vim.keymap.set("i","&lt;C-c&gt;","&lt;Esc&gt;") — "This is going to get me cancelled."</div></div>`,
  check:()=>S.enteredInsert && S.keyLog.includes("<C-c>") && S.mode==="normal"}),

L({title:"Move with j k l ñ",
  goal:"Walk the cursor onto the ★ — use j k l ñ, no arrow keys!",
  buf:["+----------------+","|  . . . . . .   |","|  . . . . ★ .   |","|  . . . . . .   |","+----------------+"],
  cur:{row:1,col:3}, target:{row:2,col:12}, par:9,
  lesson:`<h2>Your home row: <kbd>j</kbd><kbd>k</kbd><kbd>l</kbd><kbd>ñ</kbd></h2><div class="sub">your remap — hjkl shifted one key right</div>
  <ul class="keylist">
   <li><kbd>j</kbd><span class="d">left</span></li><li><kbd>k</kbd><span class="d">down</span></li>
   <li><kbd>l</kbd><span class="d">up</span></li><li><kbd>ñ</kbd><span class="d">right</span></li></ul>
  <div class="card do"><h3>Goal</h3>Land the cursor exactly on the ★. Press <kbd>k</kbd> to go down, then <kbd>ñ</kbd> to go right.</div>
  <p class="why">Arrow keys — and <kbd>h</kbd> — are disabled on purpose, so the new habit sticks.</p>`,
  check:()=>S.cursor.row===2 && S.cursor.col===12}),

L({title:"Word motions w b e",
  goal:"Move RIGHT with b until you land on 'fortytwo'",
  buf:["const answer = compute(value, fortytwo)"], cur:{row:0,col:0}, par:7,
  lesson:`<h2>Word hops: <kbd>w</kbd> <kbd>b</kbd> <kbd>e</kbd></h2><div class="sub">your swap — w and b are flipped</div>
  <ul class="keylist"><li><kbd>b</kbd><span class="d">next word — moves <b>RIGHT</b></span></li>
  <li><kbd>w</kbd><span class="d">previous word — moves <b>LEFT</b></span></li>
  <li><kbd>e</kbd><span class="d">end of the next word</span></li></ul>
  <div class="card do"><h3>Goal</h3>The cursor starts at the beginning. Press <kbd>b</kbd> to hop <b>right</b>, word by word, until you reach <code>fortytwo</code>.</div>
  <p class="why">In stock vim <code>w</code> goes forward and <code>b</code> back — here they're swapped, so <kbd>b</kbd>=right, <kbd>w</kbd>=left.</p>`,
  check:()=>curLine().slice(S.cursor.col,S.cursor.col+8)==="fortytwo"}),

L({title:"Line ends: 0 ^ $",
  goal:"Jump to the LAST character of the line with 0",
  buf:["    return value + offset   "], cur:{row:0,col:8}, par:1,
  lesson:`<h2><kbd>$</kbd> <kbd>^</kbd> <kbd>0</kbd></h2><div class="sub">your swap — $ and 0 are flipped</div>
  <ul class="keylist"><li><kbd>$</kbd><span class="d">first column</span></li>
  <li><kbd>^</kbd><span class="d">first non-blank</span></li>
  <li><kbd>0</kbd><span class="d">end of line</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>0</kbd> to fly to the last character of the line, including trailing spaces.</div>
  <p class="why">Your config maps $ → 0 and 0 → $. The swap also works when selecting text or after an operator: d0 deletes to the end, d$ deletes back to the start. ^ still goes to the first non-blank character.</p>`,
  check:()=>S.cursor.col===maxCol() && S.keyLog.includes("0")}),

L({title:"Top & bottom: gg / G",
  goal:"Go to the last line with G, then back to the top with gg",
  buf:["line 1 — top","line 2","line 3","line 4","line 5 — bottom"], cur:{row:0,col:0}, par:2,
  lesson:`<h2><kbd>g</kbd><kbd>g</kbd> and <kbd>G</kbd></h2><div class="sub">core vim</div>
  <p><kbd>G</kbd> jumps to the last line, <kbd>g</kbd><kbd>g</kbd> to the first.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>G</kbd> then <kbd>gg</kbd> — end back on line 1.</div>`,
  check:()=>S.keyLog.includes("G") && S.keyLog.includes("gg") && S.cursor.row===0}),

L({title:"Count lines: 5k / 3l",
  goal:"Read the gutter, then jump straight onto the ★ with one counted hop",
  buf:["-- Relative numbers: the gutter counts the rows FOR you.",
       "local steps = {",
       "  'one',",
       "  'two',",
       "  'three',   -- you start here",
       "  'four',",
       "  'five',",
       "  'six',",
       "  'seven ★', -- land here in ONE jump",
       "  'eight',",
       "}"],
  cur:{row:4,col:2}, target:{row:8,col:2}, par:2,
  lesson:`<h2>Counted jumps: <kbd>{count}</kbd> then <kbd>k</kbd>/<kbd>l</kbd></h2><div class="sub">core vim · relativenumber (set.lua)</div>
  <p>This config sets <code>vim.opt.relativenumber = true</code>, so the gutter shows every other line's <b>distance</b> from yours — the current line shows its real number, and the rows above and below count outward <code>… 3 2 1 ↕ 1 2 3 …</code>.</p>
  <p>Put a number in front of a vertical motion to fly that many lines in one go — no need to tap <kbd>k</kbd> over and over:</p>
  <ul class="keylist">
   <li><kbd>{n} k</kbd><span class="d">jump <b>n</b> lines <b>down</b></span></li>
   <li><kbd>{n} l</kbd><span class="d">jump <b>n</b> lines <b>up</b></span></li>
   <li><kbd>{n} G</kbd><span class="d">jump to absolute line <b>n</b></span></li></ul>
  <div class="card do"><h3>Goal</h3>The ★ line shows a number in the gutter — that's its distance. Type that number, then <kbd>k</kbd> (down) to land on it in a single hop. Watch the count appear bottom-right as you type it.</div>
  <p class="why">Reading the relative number and prefixing it onto <kbd>k</kbd>/<kbd>l</kbd> is the fastest way to cross a function — far quicker than counting by eye or holding a key.</p>`,
  check:()=>S.cursor.row===8 && S.keyLog.some(k=>/^[1-9]\d*[jk]$/.test(k))}),

{group:"Everyday basics"},
L({title:"Create a file: :e",
  goal:"Create notes.txt, type hello, then save it with :w",
  fileName:"[No Name]", files:{}, buf:[""], cur:{row:0,col:0},
  lesson:`<h2>Create a file with <kbd>:e</kbd></h2><div class="sub">everyday basics · edit and write</div>
  <p><code>:e</code> opens a filename. If it does not exist yet, you get an empty buffer; <code>:w</code> writes it to disk.</p>
  <div class="card do"><h3>Goal</h3>Type <kbd>:</kbd><code>e notes.txt</code><kbd>Enter</kbd>, press <kbd>a</kbd> to insert before the cursor, type <code>hello</code>, press <kbd>Ctrl</kbd>+<kbd>c</kbd>, then type <kbd>:</kbd><code>w</code><kbd>Enter</kbd>.</div>`,
  check:()=>S.mode==="normal" && S.fileName==="notes.txt" && S.lines.join("\n")==="hello" &&
    S.files.get("notes.txt")?.join("\n")==="hello" &&
    S.keyLog.includes(":e notes.txt") && S.keyLog.includes(":w")}),

L({title:"Open a file: :e",
  goal:"Open the existing todo.txt file with :e",
  fileName:"[No Name]", files:{"todo.txt":["buy milk","call Alex"]}, buf:[""], cur:{row:0,col:0},
  lesson:`<h2>Open a file with <kbd>:e</kbd></h2><div class="sub">everyday basics · edit a file</div>
  <p><code>:e filename</code> loads an existing file into the editor.</p>
  <div class="card do"><h3>Goal</h3>Type <kbd>:</kbd><code>e todo.txt</code><kbd>Enter</kbd>. Read the two tasks that appear.</div>`,
  check:()=>S.mode==="normal" && S.fileName==="todo.txt" &&
    S.lines.join("\n")==="buy milk\ncall Alex" && S.keyLog.includes(":e todo.txt")}),

L({title:"Save a file: :w",
  goal:"Change draft to ready in status.txt, then save with :w",
  fileName:"status.txt", files:{"status.txt":["draft"]}, buf:["draft"], cur:{row:0,col:0},
  lesson:`<h2>Save with <kbd>:w</kbd></h2><div class="sub">everyday basics · write</div>
  <p>Editing changes the buffer. <code>:w</code> writes those changes to the saved file.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>c</kbd><kbd>i</kbd><kbd>w</kbd>, type <code>ready</code>, press <kbd>Ctrl</kbd>+<kbd>c</kbd>, then type <kbd>:</kbd><code>w</code><kbd>Enter</kbd>.</div>`,
  check:()=>S.mode==="normal" && S.fileName==="status.txt" && S.lines.join("\n")==="ready" &&
    S.files.get("status.txt")?.join("\n")==="ready" && S.keyLog.includes("ciw") && S.keyLog.includes(":w")}),

L({title:"Save and quit: :wq",
  goal:"Append ! to hello, then save and quit with :wq",
  fileName:"message.txt", files:{"message.txt":["hello"]}, buf:["hello"], cur:{row:0,col:0},
  lesson:`<h2>Save and quit with <kbd>:wq</kbd></h2><div class="sub">everyday basics · write and exit</div>
  <p><code>:wq</code> writes the current buffer and closes the editor.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>A</kbd>, type <code>!</code>, press <kbd>Ctrl</kbd>+<kbd>c</kbd>, then type <kbd>:</kbd><code>wq</code><kbd>Enter</kbd>.</div>`,
  check:()=>S.mode==="normal" && S.closed===true && S.fileName==="message.txt" &&
    S.lines.join("\n")==="hello!" && S.files.get("message.txt")?.join("\n")==="hello!" &&
    S.keyLog.includes("A") && S.keyLog.includes(":wq") && S.keyLog.includes(":w")}),

L({title:"Quit without saving: :q!",
  goal:"Append !, then quit without saving to discard it",
  fileName:"message.txt", files:{"message.txt":["hello"]}, buf:["hello"], cur:{row:0,col:0},
  lesson:`<h2>Discard edits with <kbd>:q!</kbd></h2><div class="sub">everyday basics · exit without writing</div>
  <p><code>:q!</code> closes the editor and throws away unsaved changes.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>A</kbd>, type <code>!</code>, press <kbd>Ctrl</kbd>+<kbd>c</kbd>, then type <kbd>:</kbd><code>q!</code><kbd>Enter</kbd>. The saved file should still say <code>hello</code>.</div>`,
  check:()=>S.mode==="normal" && S.closed===true && S.discardedChanges===true &&
    S.fileName==="message.txt" && S.lines.join("\n")==="hello" &&
    S.files.get("message.txt")?.join("\n")==="hello" &&
    S.keyLog.includes("A") && S.keyLog.includes(":q!")}),

L({title:"Create a folder: netrw d",
  goal:"Open netrw and create the notes folder (directory) with d",
  buf:["-- project files"], cur:{row:0,col:0}, dirs:[],
  lesson:`<h2>Create a folder in netrw</h2><div class="sub">everyday basics · directory</div>
  <p><kbd>Space</kbd><kbd>p</kbd><kbd>v</kbd> opens the file explorer. Inside netrw, <kbd>d</kbd> creates a directory.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>Space</kbd><kbd>p</kbd><kbd>v</kbd>, then <kbd>d</kbd>, type <code>notes</code>, and press <kbd>Enter</kbd>.</div>`,
  check:()=>S.mode==="normal" && S.dirs.has("notes") &&
    S.keyLog.includes("<leader>pv") && S.keyLog.includes("netrw d notes")}),

L({title:"Add a new line: o",
  goal:"Add middle between first and last with o",
  buf:["first","last"], cur:{row:0,col:0},
  lesson:`<h2>Open a line with <kbd>o</kbd></h2><div class="sub">everyday basics · insert</div>
  <p><kbd>o</kbd> opens a blank line below the cursor and enters INSERT mode.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>o</kbd>, type <code>middle</code>, then press <kbd>Ctrl</kbd>+<kbd>c</kbd>.</div>`,
  check:()=>S.mode==="normal" && S.lines.join("\n")==="first\nmiddle\nlast" && S.keyLog.includes("o")}),

L({title:"Delete a line: dd",
  goal:"Remove the entire 'remove me' line with dd",
  buf:["keep first","remove me","keep last"], cur:{row:1,col:0},
  lesson:`<h2>Delete a line with <kbd>dd</kbd></h2><div class="sub">everyday basics · normal mode</div>
  <p><kbd>d</kbd><kbd>d</kbd> deletes the whole current line.</p>
  <div class="card do"><h3>Goal</h3>The cursor is on <code>remove me</code>. Press <kbd>d</kbd><kbd>d</kbd>.</div>`,
  check:()=>S.mode==="normal" && S.lines.join("\n")==="keep first\nkeep last" && S.keyLog.includes("dd")}),

L({title:"Copy and paste a line: yy p",
  goal:"Copy the 'copy me' line with yy, then paste it with p",
  buf:["copy me"], cur:{row:0,col:0},
  lesson:`<h2>Copy and paste a line</h2><div class="sub">everyday basics · yank and put</div>
  <p><kbd>y</kbd><kbd>y</kbd> copies the current line. <kbd>p</kbd> pastes it below.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>y</kbd><kbd>y</kbd>, then <kbd>p</kbd>. You should see two copies of <code>copy me</code>.</div>`,
  check:()=>S.mode==="normal" && S.lines.join("\n")==="copy me\ncopy me" &&
    S.keyLog.includes("yy") && S.keyLog.includes("p")}),

L({title:"Undo and redo: u / Ctrl-r",
  goal:"Delete 'remove me', undo it, then redo the deletion",
  buf:["keep first","remove me","keep last"], cur:{row:1,col:0},
  lesson:`<h2>Undo and redo</h2><div class="sub">everyday basics · recover an edit</div>
  <p><kbd>u</kbd> undoes your last change. <kbd>Ctrl</kbd>+<kbd>r</kbd> redoes an undone change.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>d</kbd><kbd>d</kbd>, then <kbd>u</kbd> to bring the line back, then <kbd>Ctrl</kbd>+<kbd>r</kbd> to remove it again.</div>`,
  check:()=>S.mode==="normal" && S.lines.join("\n")==="keep first\nkeep last" &&
    S.keyLog.includes("dd") && S.keyLog.includes("u") && S.keyLog.includes("<C-r>")}),

L({title:"Select a line: V",
  goal:"Select 'select me' with V, copy it with y, then paste with p",
  buf:["select me"], cur:{row:0,col:0},
  lesson:`<h2>Select a whole line with <kbd>V</kbd></h2><div class="sub">everyday basics · visual line mode</div>
  <p><kbd>V</kbd> selects the current line. <kbd>y</kbd> copies it, and <kbd>p</kbd> pastes a copy below.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>V</kbd>, then <kbd>y</kbd>, then <kbd>p</kbd>.</div>`,
  check:()=>S.mode==="normal" && S.lines.join("\n")==="select me\nselect me" &&
    S.keyLog.includes("V") && S.keyLog.includes("y") && S.keyLog.includes("p")}),

L({title:"Move selected text: v d p",
  goal:"Select only the closing */ and move it after comment text",
  buf:["/* */comment text"], cur:{row:0,col:3},
  lesson:`<h2>Move selected characters</h2><div class="sub">everyday basics · visual selection, cut and paste</div>
  <p>When a comment pair <code>/* */</code> is already present, you can move the closing <code>*/</code> anywhere without moving the rest of the line.</p>
  <ul class="keylist">
   <li><kbd>v</kbd><span class="d">start selecting individual characters</span></li>
   <li><kbd>ñ</kbd><span class="d">extend the selection one character right in your config</span></li>
   <li><kbd>d</kbd><span class="d">cut the selected text into the register</span></li>
   <li><kbd>p</kbd> / <kbd>P</kbd><span class="d">paste after / before the cursor in NORMAL mode</span></li></ul>
  <div class="card do"><h3>Goal</h3>The cursor starts on the closing <code>*</code>. Press <kbd>v</kbd><kbd>ñ</kbd> to select exactly <code>*/</code>, then <kbd>d</kbd> to cut it. Press <kbd>0</kbd> to go to the end of the text with your new remap, then <kbd>p</kbd> to paste. Finish with <code>/* comment text*/</code>.</div>
  <p class="why">For another destination, move there after cutting, then use p or P. In stock Neovim, l moves right; this game uses your ñ remap. If you are typing in INSERT mode, press Esc before selecting.</p>`,
  check:()=>S.mode==="normal" && S.lines.join("\n")==="/* comment text*/" &&
    S.reg.text==="*/" && !S.reg.linewise && S.keyLog.includes("v") &&
    S.keyLog.includes("d") && (S.keyLog.includes("p") || S.keyLog.includes("P"))}),

L({title:"Change a word: ciw",
  goal:"Change hello world into goodbye world with ciw",
  buf:["hello world"], cur:{row:0,col:0},
  lesson:`<h2>Change a word with <kbd>ciw</kbd></h2><div class="sub">everyday basics · text object</div>
  <p><kbd>c</kbd><kbd>i</kbd><kbd>w</kbd> removes the word under the cursor and enters INSERT mode.</p>
  <div class="card do"><h3>Goal</h3>The cursor is on <code>hello</code>. Press <kbd>c</kbd><kbd>i</kbd><kbd>w</kbd>, type <code>goodbye</code>, then press <kbd>Ctrl</kbd>+<kbd>c</kbd>.</div>`,
  check:()=>S.mode==="normal" && S.lines.join("\n")==="goodbye world" && S.keyLog.includes("ciw")}),

{group:"Core motions & edits"},
L({title:"Find a char: f / t",
  goal:"Jump straight onto the ( with f(",
  buf:["return foo(bar, baz, qux)"], cur:{row:0,col:0}, par:1,
  lesson:`<h2><kbd>f</kbd> <kbd>t</kbd> <kbd>F</kbd> <kbd>T</kbd> — fly along a line</h2><div class="sub">core vim</div>
  <p>These jump to a character on the current line — far faster than tapping <kbd>ñ</kbd> repeatedly.</p>
  <ul class="keylist">
   <li><kbd>f x</kbd><span class="d"><b>onto</b> the next <code>x</code></span></li>
   <li><kbd>t x</kbd><span class="d"><b>just before</b> the next <code>x</code></span></li>
   <li><kbd>F x</kbd> · <kbd>T x</kbd><span class="d">same, but searching backward</span></li>
   <li><kbd>;</kbd> · <kbd>,</kbd><span class="d">repeat the last find forward / backward</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>f</kbd> then <kbd>(</kbd> to land on the opening paren.</div>
  <p class="why">Pair them with operators too: <code>dt)</code> deletes up to the next <code>)</code>, <code>cf,</code> changes through the next comma.</p>`,
  check:()=>curLine()[S.cursor.col]==="(" && S.keyLog.includes("f(")}),

L({title:"Text objects: ci( ci\"",
  goal:"Change what's inside the quotes with ci\" — type bye",
  buf:['greet("hello", name)'], cur:{row:0,col:8}, par:null,
  lesson:`<h2>Inner / around text objects</h2><div class="sub">core vim — works with any operator</div>
  <p>A text object is a <i>noun</i> you give an operator (<kbd>d</kbd>/<kbd>c</kbd>/<kbd>y</kbd>): <kbd>i</kbd> = <b>inner</b>, <kbd>a</kbd> = <b>around</b>.</p>
  <ul class="keylist">
   <li><kbd>i w</kbd> · <kbd>a w</kbd><span class="d">inner / a word</span></li>
   <li><kbd>i "</kbd> · <kbd>a "</kbd><span class="d">inside / around quotes</span></li>
   <li><kbd>i (</kbd> · <kbd>i {</kbd> · <kbd>i [</kbd><span class="d">inside brackets/braces</span></li></ul>
  <div class="card"><code>ciw</code> change a word · <code>ci(</code> change inside parens · <code>ya"</code> yank a string · <code>di{</code> empty a block</div>
  <div class="card do"><h3>Goal</h3>Cursor is inside the string. Press <kbd>c</kbd> <kbd>i</kbd> <kbd>"</kbd>, type <code>bye</code>, then <kbd>Ctrl</kbd>+<kbd>c</kbd>.</div>`,
  check:()=>!curLine().includes("hello") && S.keyLog.includes('ci"')}),

L({title:"Replace a char: r",
  goal:"Fix the typo: turn lel into let with r t",
  buf:["lel = require('telescope')"], cur:{row:0,col:2}, par:1,
  lesson:`<h2><kbd>r</kbd> — replace one character</h2><div class="sub">core vim</div>
  <p><kbd>r</kbd> then a character overwrites the one under the cursor and drops you straight back in NORMAL — no mode change, no <kbd>Esc</kbd>.</p>
  <div class="card do"><h3>Goal</h3>The cursor sits on the second <code>l</code> of <code>lel</code>. Press <kbd>r</kbd> then <kbd>t</kbd>.</div>
  <p class="why">Big brother <kbd>R</kbd> enters <b>Replace</b> mode and overtypes until you press <kbd>Esc</kbd>.</p>`,
  check:()=>S.lines[0]==="let = require('telescope')" && S.keyLog.includes("r")}),

L({title:"Repeat with the dot: .",
  goal:"Turn xxxxx into ===== : r= once, then ñ and . across",
  buf:["xxxxx = config"], cur:{row:0,col:0}, par:9,
  lesson:`<h2><kbd>.</kbd> — repeat your last change</h2><div class="sub">core vim — the superpower</div>
  <p>The dot command replays your most recent edit. Make a small, repeatable change once, then sprint with <kbd>.</kbd>.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>r</kbd> <kbd>=</kbd> to turn the first <code>x</code> into <code>=</code>. Then alternate <kbd>ñ</kbd> (right) and <kbd>.</kbd> until all five are <code>=</code>.</div>
  <p class="why">"Make the change repeatable, then repeat it" is the core of editing fast in vim — it composes with motions, finds and text objects.</p>`,
  check:()=>S.lines[0].startsWith("=====") && S.keyLog.filter(k=>k===".").length>=2}),

{group:"Modes, buffers & windows"},
L({title:"The mode system",
  goal:"Visit INSERT, VISUAL and COMMAND, then return to NORMAL",
  buf:["-- Neovim is modal: each mode remaps every key.","-- NORMAL: move around and run operators.","-- INSERT: type text.   VISUAL: select text.","-- COMMAND: run : commands (:w, :q, :vsplit…).","local modes = { 'normal', 'insert', 'visual' }"], cur:{row:4,col:0}, par:null,
  lesson:`<h2>Modes — the heart of vim</h2><div class="sub">core concept · watch the status line</div>
  <p>In a modal editor the same key does different things per mode. The coloured box bottom-left always tells you where you are.</p>
  <ul class="keylist">
   <li><kbd>i</kbd> / <kbd>a</kbd> / <kbd>o</kbd><span class="d">enter <b>INSERT</b> (type text)</span></li>
   <li><kbd>v</kbd> / <kbd>V</kbd> / <kbd>Ctrl-v</kbd><span class="d"><b>VISUAL</b> char / line / block</span></li>
   <li><kbd>:</kbd><span class="d"><b>COMMAND</b>-line for ex commands</span></li>
   <li><kbd>Ctrl-c</kbd> / <kbd>Esc</kbd><span class="d">back to <b>NORMAL</b> from anywhere</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>i</kbd> then <kbd>Ctrl</kbd>+<kbd>c</kbd>; <kbd>v</kbd> then <kbd>Ctrl</kbd>+<kbd>c</kbd>; <kbd>:</kbd> then <kbd>Esc</kbd>. End back in NORMAL.</div>
  <p class="why">NORMAL is home base — you spend most time there, darting into the other modes for short bursts.</p>`,
  check:()=>S.modesSeen.has("insert") && S.modesSeen.has("visual") && S.modesSeen.has("cmd") && S.mode==="normal"}),

L({title:"Buffers",
  goal:"List open buffers with :ls, then go to the next one with :bnext",
  buf:["-- buffers"], cur:{row:0,col:0}, par:null,
  buffers:[
    {name:"init.lua",lines:["-- init.lua   (buffer 1)","require('theprimeagen')","-- a buffer is a file loaded into memory"]},
    {name:"remap.lua",lines:["-- remap.lua   (buffer 2)","vim.g.mapleader = ' '","vim.keymap.set('n', '<leader>pv', vim.cmd.Ex)"]},
    {name:"set.lua",lines:["-- set.lua   (buffer 3)","vim.opt.nu = true","vim.opt.relativenumber = true"]},
  ],
  lesson:`<h2>Buffers — files held in memory</h2><div class="sub">core concept</div>
  <p>Opening a file (<code>:e</code>, Telescope, harpoon) loads it into a <b>buffer</b>. You can have dozens open at once; a buffer doesn't need to be visible in a window.</p>
  <ul class="keylist">
   <li><kbd>:ls</kbd><span class="d">list every open buffer</span></li>
   <li><kbd>:bn</kbd> / <kbd>:bp</kbd><span class="d">next / previous buffer</span></li>
   <li><kbd>:b 2</kbd><span class="d">jump to buffer 2 (or <code>:b set</code> by name)</span></li>
   <li><kbd>:bd</kbd><span class="d">delete (close) a buffer</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>:</kbd><code>ls</code><kbd>Enter</kbd> to see the list, close it, then <kbd>:</kbd><code>bnext</code><kbd>Enter</kbd>. Watch <code>~/…</code> in the status line change.</div>
  <p class="why">This config rarely types <code>:bnext</code> — harpoon and Telescope jump between hot buffers instead. But knowing the buffer list is fundamental.</p>`,
  check:()=>S.bufIdx===1 && S.keyLog.includes(":bnext")}),

L({title:"Windows (splits)",
  goal:"Split with :vsplit, then hop to the other window",
  buf:["local function setup()","    require('telescope').setup({})","    require('harpoon').setup({})","end"], cur:{row:0,col:0}, par:null,
  lesson:`<h2>Windows — viewports onto buffers</h2><div class="sub">the integrated window system</div>
  <p>A <b>window</b> (or split) is a view into a buffer. Several windows can show the same buffer or different ones — edit in either pane and the buffer updates everywhere.</p>
  <ul class="keylist">
   <li><kbd>:vsplit</kbd> · <kbd>:split</kbd><span class="d">split vertically / horizontally</span></li>
   <li><kbd>Ctrl-w</kbd> <kbd>h j k l</kbd><span class="d">move between windows</span></li>
   <li><kbd>Ctrl-w</kbd> <kbd>q</kbd> · <kbd>Ctrl-w</kbd> <kbd>o</kbd><span class="d">close this / keep only this</span></li>
   <li><kbd>Ctrl-w</kbd> <kbd>=</kbd><span class="d">equalize sizes</span></li></ul>
  <div class="card do"><h3>Goal</h3>Run <kbd>:</kbd><code>vsplit</code><kbd>Enter</kbd>, then switch panes with <kbd>:</kbd><code>wincmd w</code><kbd>Enter</kbd> (or <kbd>Ctrl-w</kbd> <kbd>w</kbd> — your browser may steal <kbd>Ctrl-w</kbd>).</div>
  <p class="why">ThePrimeagen leans on <b>tmux</b> (<kbd>Ctrl-f</kbd> sessionizer) for big layouts, so his config keeps native splits mostly default.</p>`,
  check:()=>S.split && S.keyLog.includes(":vsplit") && S.keyLog.includes("<C-w>w")}),

L({title:"Tabs",
  goal:"Open a tab with :tabnew, then switch with gt",
  buf:["-- A tab page is a whole window LAYOUT,","-- not a single file (unlike VS Code tabs).","-- :tabnew opens one · gt / gT cycle them."], cur:{row:0,col:0}, par:null,
  lesson:`<h2>Tab pages — saved layouts</h2><div class="sub">core concept · often misunderstood</div>
  <p>A vim <b>tab</b> is not "one file" — it's a saved arrangement of windows. Think of tabs as workspaces, and buffers as the files inside them.</p>
  <ul class="keylist">
   <li><kbd>:tabnew</kbd><span class="d">open a new tab page</span></li>
   <li><kbd>g t</kbd> / <kbd>g T</kbd><span class="d">next / previous tab</span></li>
   <li><kbd>:tabclose</kbd><span class="d">close the current tab</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>:</kbd><code>tabnew</code><kbd>Enter</kbd> — a tabline appears up top — then press <kbd>g</kbd><kbd>t</kbd> to cycle.</div>
  <p class="why">Because buffers + harpoon already cover "many files", most vimmers keep only a couple of tabs (or none).</p>`,
  check:()=>S.tabs && S.tabs.length>=2 && S.keyLog.includes("gt")}),

{group:"The Primeagen Touch"},
L({title:"Centered scrolling",
  goal:"Press <C-d> to fly half a page down — watch it re-center",
  buf:Array.from({length:40},(_,i)=>`${(i+1).toString().padStart(2)}  line of a long file`),
  cur:{row:0,col:0}, par:2,
  lesson:`<h2><kbd>Ctrl</kbd>+<kbd>d</kbd> / <kbd>Ctrl</kbd>+<kbd>u</kbd></h2><div class="sub">remap.lua</div>
  <p>Vanilla vim scrolls and leaves your cursor at the edge. This config keeps you centered:</p>
  <div class="card"><code>&lt;C-d&gt; → &lt;C-d&gt;zz</code><br><code>&lt;C-u&gt; → &lt;C-u&gt;zz</code>
  <div class="why">The <code>zz</code> recenters the screen so your eyes never lose the cursor.</div></div>
  <div class="card do"><h3>Goal</h3>Press <kbd>Ctrl</kbd>+<kbd>d</kbd> at least once.</div>`,
  check:()=>S.keyLog.includes("<C-d>") && S.cursor.row>=8}),

L({title:"Centered search: n / N",
  goal:"Search 'TODO' with Alt / then jump matches with n",
  buf:["fn a(){}","// TODO: refactor a","fn b(){}","fn c(){}","// TODO: write tests","fn d(){}","// TODO: ship it"],
  cur:{row:0,col:0}, par:null,
  lesson:`<h2>Search, then <kbd>n</kbd> / <kbd>N</kbd></h2><div class="sub">remap.lua</div>
  <p>In Neovim, <kbd>/</kbd> searches the buffer. This game uses <kbd>/</kbd> to focus game search, so press <kbd>Alt</kbd>+<kbd>/</kbd> here, type a pattern, then <kbd>Enter</kbd>. <kbd>n</kbd> repeats forward and <kbd>N</kbd> backward.</p>
  <div class="card"><code>n → nzzzv</code> &nbsp; <code>N → Nzzzv</code>
  <div class="why">Again the trailing <code>zz</code>: every match lands dead-center. <code>zv</code> opens folds.</div></div>
  <div class="card do"><h3>Goal</h3>Press <kbd>Alt</kbd>+<kbd>/</kbd>, type <code>TODO</code>, press <kbd>Enter</kbd>, then press <kbd>n</kbd> to reach a later TODO.</div>`,
  check:()=>S.keyLog.includes("n") && curLine().includes("TODO") && S.cursor.row>=4}),

L({title:"Join lines with J",
  goal:"Join the two lines into one with J",
  buf:["const sum = 1","    + 2 + 3"], cur:{row:0,col:0}, par:1,
  lesson:`<h2><kbd>J</kbd> — join, cursor stays put</h2><div class="sub">remap.lua</div>
  <p><kbd>J</kbd> joins the next line onto this one. Vanilla vim moves your cursor to the seam; this config pins it:</p>
  <div class="card"><code>J → mzJ`+"`"+`z</code>
  <div class="why">Sets mark <code>z</code>, joins, then jumps back to <code>z</code> — cursor doesn't budge.</div></div>
  <div class="card do"><h3>Goal</h3>Press <kbd>J</kbd> to make <code>const sum = 1 + 2 + 3</code>.</div>`,
  check:()=>S.lines.length===1 && S.lines[0].replace(/\s+/g," ").trim()==="const sum = 1 + 2 + 3"}),

L({title:"Move lines in visual: K / L",
  goal:"Reorder the steps to 1,2,3,4 by moving lines in V-LINE mode",
  buf:["step 1","step 3","step 2","step 4"], cur:{row:1,col:0}, par:null,
  lesson:`<h2>The signature remap: <kbd>K</kbd>/<kbd>L</kbd> in visual</h2><div class="sub">remap.lua</div>
  <p>Select lines with <kbd>V</kbd>, then <kbd>K</kbd> drags them <b>down</b> and <kbd>L</kbd> drags them <b>up</b> — auto-reindenting. (Shift of your <kbd>k</kbd>=down / <kbd>l</kbd>=up, so it stays coherent with jklñ.)</p>
  <div class="card"><code>vmap K :m '>+1&lt;CR&gt;gv=gv</code><br><code>vmap L :m '&lt;-2&lt;CR&gt;gv=gv</code></div>
  <div class="card do"><h3>Goal</h3>On "step 3": press <kbd>V</kbd> then <kbd>K</kbd> to push it below "step 2". End with steps in order.</div>`,
  check:()=>S.lines.join("|")==="step 1|step 2|step 3|step 4"}),

L({title:"The greatest remap: <leader>p",
  goal:"Replace both FOO with the yanked WORLD — register stays intact",
  buf:["greeting = FOO","farewell = FOO"], cur:{row:0,col:11}, par:null,
  preReg:{text:"WORLD",linewise:false},
  lesson:`<h2>“The greatest remap ever”: <kbd>Space</kbd><kbd>p</kbd></h2><div class="sub">remap.lua</div>
  <p>Normally, pasting <b>over</b> a visual selection clobbers your yank with the deleted text — so you can't paste it again. This config fixes it:</p>
  <div class="card"><code>xmap &lt;leader&gt;p "_dP</code>
  <div class="why">Delete the selection to the black-hole register <code>"_</code>, then paste — your yank survives.</div></div>
  <div class="card do"><h3>Goal</h3>You've already yanked <code>WORLD</code>. Visually select each <code>FOO</code> (<kbd>v</kbd> <kbd>e</kbd>) and press <kbd>Space</kbd><kbd>p</kbd>. The second paste proves the register wasn't lost.</div>`,
  check:()=>S.lines[0]==="greeting = WORLD" && S.lines[1]==="farewell = WORLD" &&
           S.keyLog.filter(k=>k==="<leader>p").length>=2}),

L({title:"Void delete: <leader>d",
  goal:"Delete the word JUNK without clobbering your yank (Space d)",
  buf:["keep_this = JUNK + payload"], cur:{row:12,col:0}, preReg:{text:"GOLD",linewise:false},
  lesson:`<h2><kbd>Space</kbd><kbd>d</kbd> — delete to the black hole</h2><div class="sub">remap.lua</div>
  <p><code>{n,v} &lt;leader&gt;d → "_d</code>. Deletes text but throws it into the void register, so whatever you yanked earlier stays ready to paste.</p>
  <div class="card do"><h3>Goal</h3>Move onto <code>JUNK</code>, select it (<kbd>v</kbd> <kbd>e</kbd>), press <kbd>Space</kbd><kbd>d</kbd>.</div>
  <p class="why">Sibling map: <code>&lt;leader&gt;y → "+y</code> yanks to the system clipboard.</p>`,
  check:()=>!curLine().includes("JUNK") && S.keyLog.includes("<leader>d")}),

L({title:"Substitute word: <leader>s",
  goal:"Replace every 'foo' with 'bar' via Space s",
  buf:["foo = foo + 1","print(foo)","return foo"], cur:{row:0,col:0},
  lesson:`<h2><kbd>Space</kbd><kbd>s</kbd> — rename the word under cursor</h2><div class="sub">remap.lua</div>
  <p>Puts you in a ready-made global substitute for the word under the cursor:</p>
  <div class="card"><code>:%s/\\&lt;word\\&gt;/word/gI</code>
  <div class="why">The word is pre-filled on both sides — just type the replacement and hit Enter.</div></div>
  <div class="card do"><h3>Goal</h3>Cursor on <code>foo</code>, press <kbd>Space</kbd><kbd>s</kbd>, type <code>bar</code>, press <kbd>Enter</kbd>.</div>`,
  check:()=>!S.lines.join("").includes("foo") && S.lines.join("").includes("bar")}),

{group:"Power tools"},
L({title:"netrw: <leader>pv",
  goal:"Open the file explorer with Space pv",
  buf:["-- press  Space p v  to open netrw","-- (esc / C-c closes it)"], cur:{row:0,col:0},
  lesson:`<h2><kbd>Space</kbd><kbd>p</kbd><kbd>v</kbd> — netrw</h2><div class="sub">remap.lua</div>
  <p><code>&lt;leader&gt;pv → :Ex</code> opens Neovim's built-in file explorer in the current directory.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>Space</kbd><kbd>p</kbd><kbd>v</kbd>.</div>`,
  check:()=>S.keyLog.includes("<leader>pv")}),

L({title:"Telescope find_files & git_files",
  goal:"Fuzzy-find files: Space p f, then git files with Ctrl-p",
  buf:["-- Space p f  → find_files","-- Ctrl  p    → git_files"], cur:{row:0,col:0},
  lesson:`<h2>Telescope</h2><div class="sub">lazy/telescope.lua</div>
  <ul class="keylist"><li><kbd>Space p f</kbd><span class="d">find_files (everything)</span></li>
  <li><kbd>Ctrl p</kbd><span class="d">git_files (tracked only)</span></li>
  <li><kbd>Space p s</kbd><span class="d">live grep</span></li>
  <li><kbd>Space p w s</kbd><span class="d">grep word under cursor</span></li>
  <li><kbd>Space v h</kbd><span class="d">help tags</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>Space p f</kbd>, close it, then <kbd>Ctrl</kbd>+<kbd>p</kbd>.</div>`,
  check:()=>S.keyLog.includes("<leader>pf") && S.keyLog.includes("<C-p>")}),

L({title:"Grep the project: <leader>ps",
  goal:"Open live grep with Space p s",
  buf:["-- Space p s  → grep across the whole project"], cur:{row:0,col:0},
  lesson:`<h2><kbd>Space</kbd><kbd>p</kbd><kbd>s</kbd> — live grep</h2><div class="sub">lazy/telescope.lua</div>
  <p>Prompts for a search string and greps the entire project (needs <code>ripgrep</code>).
  <code>&lt;leader&gt;pws</code> greps the word already under your cursor.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>Space</kbd><kbd>p</kbd><kbd>s</kbd>.</div>`,
  check:()=>S.keyLog.includes("<leader>ps")}),

L({title:"UndoTree: <leader>u",
  goal:"Open the undo history with Space u",
  buf:["-- Space u  → time-travel through every edit"], cur:{row:0,col:0},
  lesson:`<h2><kbd>Space</kbd><kbd>u</kbd> — UndoTree</h2><div class="sub">lazy/undotree.lua</div>
  <p>Neovim's undo is a <i>tree</i>, not a line. UndoTree visualises every branch so you can recover edits a plain <kbd>u</kbd> would lose.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>Space</kbd><kbd>u</kbd>.</div>`,
  check:()=>S.keyLog.includes("<leader>u")}),

L({title:"fugitive: <leader>gs",
  goal:"Open git status with Space g s",
  buf:["-- Space g s  → :Git status","-- in there: Space p = push, Space P = pull --rebase"], cur:{row:0,col:0},
  lesson:`<h2><kbd>Space</kbd><kbd>g</kbd><kbd>s</kbd> — fugitive</h2><div class="sub">lazy/fugitive.lua</div>
  <p><code>&lt;leader&gt;gs → :Git</code> opens the status buffer: stage with <kbd>s</kbd>, commit with <kbd>cc</kbd>.</p>
  <ul class="keylist"><li><kbd>Space p</kbd><span class="d">:Git push (in status buffer)</span></li>
  <li><kbd>Space P</kbd><span class="d">:Git pull --rebase</span></li>
  <li><kbd>gu</kbd> / <kbd>gh</kbd><span class="d">diffget //2 //3 (merge conflicts)</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>Space</kbd><kbd>g</kbd><kbd>s</kbd>.</div>`,
  check:()=>S.keyLog.includes("<leader>gs")}),

L({title:"Trouble & quickfix",
  goal:"Toggle Trouble with Space t t, then step quickfix with Ctrl-k",
  buf:["fn broken() {","  undefined_var","}","fn also_broken(){}"], cur:{row:0,col:0},
  lesson:`<h2>Diagnostics navigation</h2><div class="sub">lazy/trouble.lua + remap.lua</div>
  <ul class="keylist"><li><kbd>Space t t</kbd><span class="d">toggle Trouble panel</span></li>
  <li><kbd>]t</kbd> / <kbd>[t</kbd><span class="d">next / prev item</span></li>
  <li><kbd>Ctrl k</kbd> / <kbd>Ctrl j</kbd><span class="d">:cnext / :cprev (quickfix, centered)</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>Space t t</kbd>, close it, then <kbd>Ctrl</kbd>+<kbd>k</kbd>.</div>`,
  check:()=>S.keyLog.includes("<leader>tt") && S.keyLog.includes("<C-k>")}),

{group:"Workflow & plugins"},
L({title:"Harpoon: pin & jump",
  goal:"Pin this file (Space a), open the menu (Ctrl e), then jump with Space 1",
  buf:["-- Harpoon = bookmark your handful of hot files","-- then teleport between them by number","-- (this lives in local.lua → ~/personal/harpoon)"], cur:{row:0,col:0},
  lesson:`<h2>Harpoon — your hot files</h2><div class="sub">local.lua · ThePrimeagen's own fork</div>
  <p>Harpoon pins the few files you bounce between constantly, then jumps to them by number — no fuzzy-finding, no thinking.</p>
  <ul class="keylist">
   <li><kbd>Space a</kbd><span class="d">add current file to the list</span></li>
   <li><kbd>Space A</kbd><span class="d">prepend (add to the front)</span></li>
   <li><kbd>Ctrl e</kbd><span class="d">open the quick menu</span></li>
   <li><kbd>Space 1</kbd>…<kbd>Space 4</kbd><span class="d">jump straight to file 1–4</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>Space</kbd><kbd>a</kbd> to pin, <kbd>Ctrl</kbd>+<kbd>e</kbd> to open the menu, then press <kbd>1</kbd> <b>inside the menu</b> to jump to file 1. <br>(Or close the menu with <kbd>Esc</kbd> and jump straight from normal mode with <kbd>Space</kbd><kbd>1</kbd>.)</div>
  <p class="why">Jump straight to a pinned file from normal mode with <kbd>Space</kbd>+number — no menu needed.</p>`,
  check:()=>S.keyLog.includes("<leader>a") && S.keyLog.includes("<C-e>") && S.keyLog.includes("<leader>1")}),

L({title:"LSP completion (cmp)",
  goal:"Complete the word: A → Ctrl Space → Ctrl n → Ctrl y",
  buf:["local result = comp"], cur:{row:0,col:18},
  lesson:`<h2>nvim-cmp completion</h2><div class="sub">lazy/lsp.lua</div>
  <p>The autocomplete popup is driven entirely from the home row:</p>
  <ul class="keylist">
   <li><kbd>Ctrl Space</kbd><span class="d">trigger completion</span></li>
   <li><kbd>Ctrl n</kbd> / <kbd>Ctrl p</kbd><span class="d">next / previous item</span></li>
   <li><kbd>Ctrl y</kbd><span class="d">confirm the selection</span></li></ul>
  <div class="card do"><h3>Goal</h3>Press <kbd>A</kbd> to append, <kbd>Ctrl</kbd>+<kbd>Space</kbd> to pop the menu, <kbd>Ctrl</kbd>+<kbd>n</kbd> to pick an item, then <kbd>Ctrl</kbd>+<kbd>y</kbd> to accept it.</div>
  <p class="why">cmp uses Select behavior — <kbd>Ctrl n</kbd> only highlights; nothing is inserted until <kbd>Ctrl y</kbd>.</p>`,
  check:()=>S.lines.join("\n")==="local result = computed" &&
    S.cmpActions.some(a=>a.kind==="accept" && a.prefix==="comp" && a.item==="computed") &&
    S.keyLog.includes("<C-Space>") && S.keyLog.includes("<C-n>")}),

L({title:"Treesitter text objects",
  goal:"Delete the whole function with d a f (delete-around-function)",
  buf:["-- keep this comment","local function add(a, b)","    return a + b","end","-- and this comment"], cur:{row:1,col:6},
  lesson:`<h2>Function text objects: <kbd>af</kbd> / <kbd>if</kbd></h2><div class="sub">lazy/treesitter.lua</div>
  <p>Treesitter gives you <i>structural</i> text objects you can pair with any operator:</p>
  <ul class="keylist">
   <li><kbd>d a f</kbd><span class="d">delete <b>a</b>round <b>f</b>unction (signature + body)</span></li>
   <li><kbd>d i f</kbd><span class="d">delete <b>i</b>nner function (just the body)</span></li>
   <li><kbd>c i f</kbd> · <kbd>y a f</kbd><span class="d">change the body · yank the whole function</span></li></ul>
  <div class="card"><code>keymaps = { ["af"]="@function.outer", ["if"]="@function.inner" }</code></div>
  <div class="card do"><h3>Goal</h3>Cursor is inside the function — press <kbd>d</kbd>, then <kbd>a</kbd>, then <kbd>f</kbd>.</div>`,
  check:()=>S.lines.length===2 && !S.lines.join(" ").includes("function") && S.keyLog.includes("daf")}),

{group:"Menus & autocomplete"},
L({title:"Autocomplete: accept a suggestion",
  goal:"Type targ, then accept the suggested target with Ctrl y",
  buf:["local result = "], cur:{row:0,col:14}, autoComplete:true,
  completions:["target","targetCount","targetName"],
  lesson:`<h2>Accept an autocomplete suggestion</h2><div class="sub">insert mode · suggestion menu</div>
  <p>As you type a word, matching suggestions appear. The highlighted item is only a preview; <kbd>Ctrl</kbd>+<kbd>y</kbd> inserts it.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>A</kbd>, type <code>targ</code>, then press <kbd>Ctrl</kbd>+<kbd>y</kbd> to complete it to <code>target</code>.</div>
  <p class="why">If the menu is closed, <kbd>Ctrl</kbd>+<kbd>Space</kbd> opens it explicitly. <kbd>Esc</kbd> or <kbd>Ctrl</kbd>+<kbd>c</kbd> leaves INSERT mode.</p>`,
  check:()=>S.lines.join("\n")==="local result = target" &&
    S.cmpActions.some(a=>a.kind==="accept" && a.prefix==="targ" && a.item==="target")}),

L({title:"Autocomplete: next / previous suggestion",
  goal:"Open suggestions, move down twice and up once, then accept targetCount",
  buf:["local result = targ"], cur:{row:0,col:18},
  completions:["target","targetCount","targetName"],
  lesson:`<h2>Move through suggestions</h2><div class="sub">insert mode · suggestion menu</div>
  <p><kbd>Ctrl</kbd>+<kbd>Space</kbd> opens the menu. <kbd>Ctrl</kbd>+<kbd>n</kbd> highlights the next suggestion, and <kbd>Ctrl</kbd>+<kbd>p</kbd> highlights the previous one. <kbd>Ctrl</kbd>+<kbd>y</kbd> accepts the highlighted item.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>A</kbd>, <kbd>Ctrl</kbd>+<kbd>Space</kbd>, <kbd>Ctrl</kbd>+<kbd>n</kbd> twice, <kbd>Ctrl</kbd>+<kbd>p</kbd> once, then <kbd>Ctrl</kbd>+<kbd>y</kbd>. Finish with <code>targetCount</code>.</div>`,
  check:()=>S.lines.join("\n")==="local result = targetCount" &&
    S.cmpActions.some(a=>a.kind==="next" && a.prefix==="targ") &&
    S.cmpActions.some(a=>a.kind==="previous" && a.prefix==="targ") &&
    S.cmpActions.some(a=>a.kind==="accept" && a.prefix==="targ" && a.item==="targetCount")}),

L({title:"Autocomplete: dismiss suggestions",
  goal:"Dismiss the menu with Ctrl e, then finish target yourself in INSERT mode",
  buf:["local result = targ"], cur:{row:0,col:18},
  completions:["target","targetCount","targetName"],
  lesson:`<h2>Dismiss suggestions</h2><div class="sub">insert mode · suggestion menu</div>
  <p><kbd>Ctrl</kbd>+<kbd>e</kbd> closes an open suggestion menu and keeps you in INSERT mode, so you can continue typing. <kbd>Esc</kbd> or <kbd>Ctrl</kbd>+<kbd>c</kbd> leaves INSERT mode.</p>
  <div class="card do"><h3>Goal</h3>Press <kbd>A</kbd>, <kbd>Ctrl</kbd>+<kbd>Space</kbd>, <kbd>Ctrl</kbd>+<kbd>e</kbd>, then type <code>et</code> yourself to finish <code>target</code>.</div>`,
  check:()=>S.mode==="insert" && S.lines.join("\n")==="local result = target" &&
    S.cmpActions.some(a=>a.kind==="dismiss" && a.key==="<C-e>" && a.prefix==="targ") &&
    !S.cmpActions.some(a=>a.kind==="accept")}),

{group:"Finish"},
L({title:"Reload config: <leader><leader>",
  goal:"Re-source the config with Space Space — graduation!",
  buf:["-- You've learned the whole config.","-- One last reflex: Space Space  → :so","-- (re-sources the current file)"], cur:{row:0,col:0},
  lesson:`<h2><kbd>Space</kbd><kbd>Space</kbd> — re-source</h2><div class="sub">remap.lua</div>
  <p><code>&lt;leader&gt;&lt;leader&gt; → :so</code> sources the current file — instant config reload while you tweak your init.lua.</p>
  <div class="card do"><h3>Final goal</h3>Press <kbd>Space</kbd><kbd>Space</kbd>. 🎓</div>
  <p class="why">You now know the heart of ThePrimeagen's init.lua. Go forth and edit at the speed of thought.</p>`,
  check:()=>S.keyLog.includes("<leader> ")}),
];
