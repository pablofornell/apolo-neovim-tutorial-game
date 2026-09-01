// Red-glasses vision toggle.
// Mirrors the Neovim theme switch in apolo-configs (:ThemeToggle / <leader>tt):
// flips between the normal solarized palette and a warm, red-channel-only palette
// that stays legible through red-tinted (blue-blocking) glasses. The heavy lifting
// lives in styles.css (`body.redglasses`); this just toggles the class, updates the
// button label, and remembers the choice across reloads.
(function () {
  "use strict";
  var KEY = "primeVision"; // stored value: "red" | "normal"
  var btn = document.getElementById("themeBtn");

  function apply(mode) {
    var red = mode === "red";
    document.body.classList.toggle("redglasses", red);
    if (btn) btn.textContent = red ? "🔴 red" : "🔵 vision";
    try { localStorage.setItem(KEY, red ? "red" : "normal"); } catch (e) {}
  }

  var saved = "normal";
  try { saved = localStorage.getItem(KEY) || "normal"; } catch (e) {}
  apply(saved);

  if (btn) {
    btn.addEventListener("click", function () {
      apply(document.body.classList.contains("redglasses") ? "normal" : "red");
    });
  }
})();
