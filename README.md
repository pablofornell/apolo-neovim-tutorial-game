# Apolo Neovim Tutorial Game

**Prime Motions** — a tiny in-browser Neovim emulator that teaches the keymaps
from ThePrimeagen's `init.lua`. Pure vanilla HTML/CSS/JS, no build step, no
dependencies.

Search the sidebar for a task such as **create a file**, **save and quit**, or
**copy a line**. The **Everyday basics** games cover creating and opening files,
saving or discarding edits, creating folders, adding and deleting lines, copying
and pasting, undo/redo, visual selection, moving selected characters, and changing
a word. Search **move selected text** to practice cutting only a closing `*/`
and pasting it elsewhere in a comment.

The game follows your movement remaps in `lua/config/keymaps.lua`: j/k/l/ñ for
left/down/up/right, b/w for forward/backward words, i/a for append/insert, and
the line-end swap **$ → first column**, **0 → last character**. The $/0 swap
also applies to visual selections and operators such as `d0`, `d$`, `y0`, and
`c0`; `^` still goes to the first non-blank character.

File exercises use a simulated workspace that resets with each lesson. They do
not read or write files on your computer. The status line shows `[+]` for unsaved
changes and `[closed]` after quitting the practice session.

## How to launch

### Option 1 — just open the file

Open `index.html` in any browser. The scripts load as plain `<script>` tags, so
it works straight from the filesystem (`file://`).

```sh
xdg-open index.html   # Linux
# open index.html     # macOS
```

### Option 2 — serve it locally

Any static file server works:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Project layout

```
index.html        markup; links styles.css and the scripts below (in order)
styles.css        all styling
js/
  state.js        editor state, helpers, j/k/l/ñ movement remap
  motions.js      motions, search, visual-range selection
  popups.js       telescope/netrw/harpoon overlays
  modes.js        normal/visual/insert/command handlers, leader maps
  files.js        simulated files, saving/quitting, interactive netrw
  render.js       buffer rendering, toast/shake
  input.js        key dispatch
  levels.js       the lesson curriculum
  game.js         level loading, win check, sidebar, bootstrap
```

## Verification

Run the regression tests with Node.js (no package installation needed):

```sh
node --test tests/game.test.js
```
