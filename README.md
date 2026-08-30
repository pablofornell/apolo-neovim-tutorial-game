# Apolo Neovim Tutorial Game

**Prime Motions** — a tiny in-browser Neovim emulator that teaches the keymaps
from ThePrimeagen's `init.lua`. Pure vanilla HTML/CSS/JS, no build step, no
dependencies.

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
  render.js       buffer rendering, toast/shake
  input.js        key dispatch
  levels.js       the lesson curriculum
  game.js         level loading, win check, sidebar, bootstrap
```
