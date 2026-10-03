# Certifications Slider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dependency-free, embeddable certifications carousel matching Figma, with six cards, manual navigation, and responsive 3/2/1-card layouts.

**Architecture:** Keep the repository's autonomous-widget pattern: one semantic HTML fragment, one fully scoped stylesheet, and one JavaScript loader/controller. The controller loads the fragment when embedded, resolves asset paths, calculates a card-based transform, and exposes accessible buttons, keyboard controls, and pointer gestures without autoplay.

**Tech Stack:** HTML5, scoped CSS, vanilla JavaScript, Node.js built-in test runner, local static preview.

---

## File map

- Create `widgets/slider certificaciones new/slider-certificaciones.html`: carousel landmark, six cards, controls, and live status.
- Create `widgets/slider certificaciones new/slider-certificaciones.css`: Figma styling, responsive 3/2/1 layout, focus, fallback, and reduced-motion rules.
- Create `widgets/slider certificaciones new/slider-certificaciones.js`: embed loader, image path resolution, navigation state, resize handling, keyboard, and pointer gestures.
- Create `widgets/slider certificaciones new/slider-certificaciones.contract.test.js`: static contract coverage for markup, styling, loader, and interaction requirements.
- Create `widgets/slider certificaciones new/preview.html`: local integration harness.

### Task 1: Define the semantic six-card contract

**Files:**
- Create: `widgets/slider certificaciones new/slider-certificaciones.contract.test.js`
- Create: `widgets/slider certificaciones new/slider-certificaciones.html`

- [ ] **Step 1: Write the failing markup contract**

Create the test file with the imports and these assertions:

```js
"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var test = require("node:test");

var directory = __dirname;
var htmlPath = path.join(directory, "slider-certificaciones.html");

test("renders six ordered certification cards with local assets", function () {
    var html = fs.readFileSync(htmlPath, "utf8");
    assert.equal((html.match(/class="gpk-cert-card"/g) || []).length, 6);
    ["ISO 22716", "PETA", "RSPO", "Ocean Bound Plastic", "Huella de carbono", "Cumplimiento Regulatorio"].forEach(function (label) {
        assert.match(html, new RegExp(label));
    });
    ["iso.png", "peta.png", "RSPO.png", "ocean bound.png"].forEach(function (asset) {
        assert.match(html, new RegExp(asset.replace(".", "\\.")));
    });
    assert.equal((html.match(/carbonfree-certified\.png/g) || []).length, 2);
});

test("provides accessible manual carousel controls", function () {
    var html = fs.readFileSync(htmlPath, "utf8");
    assert.match(html, /role="region"/);
    assert.match(html, /aria-roledescription="carrusel"/);
    assert.match(html, /aria-label="Certificaciones"/);
    assert.match(html, /class="gpk-cert-button gpk-cert-prev"/);
    assert.match(html, /class="gpk-cert-button gpk-cert-next"/);
    assert.match(html, /aria-live="polite"/);
    assert.doesNotMatch(html, /autoplay/i);
});
```

- [ ] **Step 2: Run the test and confirm the fixture is missing**

Run: `node --test "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"`

Expected: FAIL with `ENOENT` for `slider-certificaciones.html`.

- [ ] **Step 3: Create the complete HTML fragment**

Create `slider-certificaciones.html` with one `.gpk-cert-widget` region, a focusable `.gpk-cert-viewport`, an ordered `.gpk-cert-track`, six `.gpk-cert-card` articles in the approved order, two real `button` controls, and a visually hidden `.gpk-cert-status[aria-live="polite"]`. Use the exact Figma copy from node `2419:50653`, these image mappings, and meaningful Spanish alt text:

```text
ISO 22716 -> Images/iso.png
PETA -> Images/peta.png
RSPO -> Images/RSPO.png
Ocean Bound Plastic -> Images/ocean bound.png
Huella de carbono -> Images/carbonfree-certified.png
Cumplimiento Regulatorio -> Images/carbonfree-certified.png
```

Each article must use this complete internal structure so CSS and JavaScript have stable hooks:

```html
<article class="gpk-cert-card" aria-label="1 de 6: ISO 22716">
    <div class="gpk-cert-media">
        <img src="Images/iso.png" alt="Logotipo de la certificación ISO 22716">
        <span class="gpk-cert-image-fallback" aria-hidden="true">ISO 22716</span>
    </div>
    <div class="gpk-cert-body">
        <header class="gpk-cert-header">
            <h2>ISO 22716</h2>
            <span class="gpk-cert-divider" aria-hidden="true"></span>
            <p class="gpk-cert-tagline">Confianza en cada detalle de la experiencia del huésped</p>
        </header>
        <div class="gpk-cert-copy">
            <p>Operamos bajo certificación ISO 22716, lo que garantiza que nuestros procesos de fabricación de cosméticos cumplen con estándares internacionales de calidad, seguridad y control.</p>
            <p>Para los hoteles, esto significa ofrecer amenidades confiables, consistentes y seguras en cada habitación. Para el huésped, representa una experiencia de cuidado personal alineada con estándares globales, generando confianza y satisfacción durante su estancia.</p>
        </div>
    </div>
</article>
```

- [ ] **Step 4: Run the contract test**

Run: `node --test "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"`

Expected: 2 tests PASS.

- [ ] **Step 5: Commit the semantic contract**

```bash
git add "widgets/slider certificaciones new/slider-certificaciones.html" "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"
git commit -m "test: define certifications slider contract"
```

### Task 2: Implement the responsive Figma styling

**Files:**
- Modify: `widgets/slider certificaciones new/slider-certificaciones.contract.test.js`
- Create: `widgets/slider certificaciones new/slider-certificaciones.css`

- [ ] **Step 1: Add a failing CSS contract**

Append:

```js
test("defines scoped Figma styling and responsive 3-2-1 layouts", function () {
    var styles = fs.readFileSync(path.join(directory, "slider-certificaciones.css"), "utf8");
    assert.match(styles, /--gpk-cert-visible:\s*3/);
    assert.match(styles, /@media \(max-width: 1023px\)[\s\S]*--gpk-cert-visible:\s*2/);
    assert.match(styles, /@media \(max-width: 639px\)[\s\S]*--gpk-cert-visible:\s*1/);
    assert.match(styles, /\.gpk-cert-button:focus-visible/);
    assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(styles, /rgba\(72, 169, 197, 0\.1\)/);
});
```

- [ ] **Step 2: Run the test and confirm the stylesheet is missing**

Run: `node --test "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"`

Expected: the new test FAILS with `ENOENT` for `slider-certificaciones.css`.

- [ ] **Step 3: Create the scoped stylesheet**

Implement these exact sizing rules and visual tokens:

```css
.gpk-cert-widget {
    --gpk-cert-visible: 3;
    --gpk-cert-gap: clamp(16px, 1.8vw, 35px);
    --gpk-cert-ink: #506d85;
    --gpk-cert-accent: #48a9c5;
    width: 100%;
    overflow: hidden;
    color: var(--gpk-cert-ink);
    font-family: "Rubik", Arial, sans-serif;
}

.gpk-cert-widget *, .gpk-cert-widget *::before, .gpk-cert-widget *::after { box-sizing: border-box; }
.gpk-cert-shell { position: relative; width: min(100%, 1800px); margin-inline: auto; padding: 20px clamp(50px, 5vw, 86px) 28px; }
.gpk-cert-viewport { overflow: hidden; touch-action: pan-y; outline: none; }
.gpk-cert-track { display: flex; gap: var(--gpk-cert-gap); transform: translate3d(var(--gpk-cert-offset, 0px), 0, 0); transition: transform 520ms cubic-bezier(.25, 1, .5, 1); will-change: transform; }
.gpk-cert-card { flex: 0 0 calc((100% - (var(--gpk-cert-visible) - 1) * var(--gpk-cert-gap)) / var(--gpk-cert-visible)); min-width: 0; overflow: hidden; background: #fff; box-shadow: 4px 5px 14.4px rgba(0,0,0,.1); }
.gpk-cert-media { position: relative; display: grid; place-items: center; aspect-ratio: 568 / 434; overflow: hidden; background: rgba(72, 169, 197, 0.1); }
.gpk-cert-media img { position: relative; z-index: 1; display: block; width: min(58%, 323px); max-height: 78%; object-fit: contain; }
.gpk-cert-image-fallback { position: absolute; inset: 0; display: grid; place-items: center; padding: 24px; font: 500 clamp(24px, 3vw, 40px)/1.05 "Montserrat", Arial, sans-serif; text-align: center; }
.gpk-cert-media.is-missing img { visibility: hidden; }
.gpk-cert-body { padding: clamp(24px, 2vw, 35px) clamp(20px, 2vw, 27px) clamp(28px, 2.4vw, 42px); }
.gpk-cert-header { display: grid; grid-template-columns: minmax(0, auto) 1px minmax(120px, 1fr); align-items: center; gap: clamp(14px, 1.6vw, 30px); min-height: 54px; }
.gpk-cert-header h2 { margin: 0; font-family: "Montserrat", Arial, sans-serif; font-size: clamp(28px, 2.6vw, 50px); font-weight: 500; line-height: 1; letter-spacing: -.035em; }
.gpk-cert-divider { width: 1px; height: 38px; background: rgba(80,109,133,.15); }
.gpk-cert-tagline { margin: 0; font-family: "Instrument Serif", Georgia, serif; font-size: clamp(17px, 1.15vw, 20px); font-style: italic; line-height: 1.05; }
.gpk-cert-copy { margin-top: clamp(25px, 3vw, 39px); font-size: clamp(14px, .95vw, 16px); line-height: 1.35; }
.gpk-cert-copy p { margin: 0 0 1.35em; }
.gpk-cert-copy p:last-child { margin-bottom: 0; }
.gpk-cert-button { position: absolute; top: 50%; z-index: 3; width: 44px; height: 44px; border: 1px solid rgba(80,109,133,.24); border-radius: 50%; background: #fff; color: var(--gpk-cert-ink); cursor: pointer; transform: translateY(-50%); }
.gpk-cert-prev { left: 0; } .gpk-cert-next { right: 0; }
.gpk-cert-button:disabled { opacity: .32; cursor: default; }
.gpk-cert-button:focus-visible, .gpk-cert-viewport:focus-visible { outline: 3px solid var(--gpk-cert-accent); outline-offset: 3px; }
.gpk-cert-status { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 1023px) { .gpk-cert-widget { --gpk-cert-visible: 2; } }
@media (max-width: 639px) { .gpk-cert-widget { --gpk-cert-visible: 1; --gpk-cert-gap: 16px; } .gpk-cert-shell { padding-inline: 42px; } .gpk-cert-header { grid-template-columns: 1fr; gap: 10px; } .gpk-cert-divider { width: 42px; height: 1px; } }
@media (prefers-reduced-motion: reduce) { .gpk-cert-track { transition: none; } }
```

Add scoped SVG arrow styling and card-specific logo sizing (`iso`, `peta`, `ocean`, `carbon`) through modifier classes, without global selectors.

- [ ] **Step 4: Run the contract test**

Run: `node --test "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"`

Expected: 3 tests PASS.

- [ ] **Step 5: Commit the visual layer**

```bash
git add "widgets/slider certificaciones new/slider-certificaciones.css" "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"
git commit -m "feat: style responsive certifications slider"
```

### Task 3: Implement manual carousel behavior and embed loading

**Files:**
- Modify: `widgets/slider certificaciones new/slider-certificaciones.contract.test.js`
- Create: `widgets/slider certificaciones new/slider-certificaciones.js`

- [ ] **Step 1: Add the failing controller contract**

Append:

```js
test("implements a dependency-free manual controller without autoplay", function () {
    var script = fs.readFileSync(path.join(directory, "slider-certificaciones.js"), "utf8");
    assert.match(script, /gpk-slider-certificaciones-widget-root/);
    assert.match(script, /function initWidget/);
    assert.match(script, /function updateSlider/);
    assert.match(script, /pointerdown/);
    assert.match(script, /pointerup/);
    assert.match(script, /ArrowLeft/);
    assert.match(script, /ArrowRight/);
    assert.match(script, /ResizeObserver|resize/);
    assert.match(script, /aria-hidden/);
    assert.doesNotMatch(script, /setInterval|setTimeout\s*\(/);
});
```

- [ ] **Step 2: Run the test and confirm the controller is missing**

Run: `node --test "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"`

Expected: the new test FAILS with `ENOENT` for `slider-certificaciones.js`.

- [ ] **Step 3: Create the embed loader and controller**

Implement this IIFE, keeping all state local to each widget instance:

```js
(function () {
    "use strict";

    var isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
    var baseURL = isLocalhost ? "/widgets/slider%20certificaciones%20new" : "https://grupak-widgets.vercel.app/widgets/slider%20certificaciones%20new";

    function injectStyles() {
        if (document.getElementById("gpk-slider-certificaciones-styles")) return;
        var link = document.createElement("link");
        link.id = "gpk-slider-certificaciones-styles";
        link.rel = "stylesheet";
        link.href = baseURL + "/slider-certificaciones.css";
        document.head.appendChild(link);
    }

    function resolveImages(root) {
        root.querySelectorAll("img").forEach(function (image) {
            var source = image.getAttribute("src");
            if (source && !/^(?:https?:|data:)/.test(source)) image.src = baseURL + "/" + source;
            image.addEventListener("error", function () {
                var media = image.closest(".gpk-cert-media");
                if (media) media.classList.add("is-missing");
            });
        });
    }

    function initWidget(widget) {
        if (!widget || widget.dataset.gpkCertReady === "true") return;
        var viewport = widget.querySelector(".gpk-cert-viewport");
        var track = widget.querySelector(".gpk-cert-track");
        var cards = Array.prototype.slice.call(widget.querySelectorAll(".gpk-cert-card"));
        var previous = widget.querySelector(".gpk-cert-prev");
        var next = widget.querySelector(".gpk-cert-next");
        var status = widget.querySelector(".gpk-cert-status");
        if (!viewport || !track || !cards.length || !previous || !next || !status) return;

        widget.dataset.gpkCertReady = "true";
        var index = 0;
        var visible = 1;
        var step = 0;
        var dragStartX = null;

        function updateSlider(announce) {
            var maxIndex = Math.max(cards.length - visible, 0);
            index = Math.max(0, Math.min(index, maxIndex));
            track.style.setProperty("--gpk-cert-offset", (-index * step) + "px");
            previous.disabled = index === 0;
            next.disabled = index === maxIndex;
            cards.forEach(function (card, cardIndex) {
                card.setAttribute("aria-hidden", String(cardIndex < index || cardIndex >= index + visible));
            });
            if (announce) status.textContent = "Mostrando certificaciones " + (index + 1) + " a " + Math.min(index + visible, cards.length) + " de " + cards.length;
        }

        function updateMetrics() {
            visible = Number.parseInt(getComputedStyle(widget).getPropertyValue("--gpk-cert-visible"), 10) || 1;
            var gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
            step = cards[0].getBoundingClientRect().width + gap;
            updateSlider(false);
        }

        function move(delta) {
            index += delta;
            updateSlider(true);
        }

        previous.addEventListener("click", function () { move(-1); });
        next.addEventListener("click", function () { move(1); });
        viewport.addEventListener("keydown", function (event) {
            if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
            if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        });
        viewport.addEventListener("pointerdown", function (event) {
            dragStartX = event.clientX;
            if (viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);
        });
        viewport.addEventListener("pointerup", function (event) {
            if (dragStartX === null) return;
            var dragDeltaX = event.clientX - dragStartX;
            dragStartX = null;
            if (Math.abs(dragDeltaX) > 50) move(dragDeltaX < 0 ? 1 : -1);
        });
        viewport.addEventListener("pointercancel", function () { dragStartX = null; });

        if ("ResizeObserver" in window) new ResizeObserver(updateMetrics).observe(viewport);
        else window.addEventListener("resize", updateMetrics, { passive: true });
        updateMetrics();
    }

    function start() {
        injectStyles();
        var root = document.getElementById("gpk-slider-certificaciones-widget-root");
        var inlineWidget = document.querySelector(".gpk-cert-widget");
        if (!root) { if (inlineWidget) { resolveImages(inlineWidget); initWidget(inlineWidget); } return; }
        fetch(baseURL + "/slider-certificaciones.html")
            .then(function (response) { if (!response.ok) throw new Error("No se pudo cargar el HTML"); return response.text(); })
            .then(function (html) { root.innerHTML = html; var widget = root.querySelector(".gpk-cert-widget"); resolveImages(widget); initWidget(widget); })
            .catch(function (error) { console.error("[gpk-slider-certificaciones]", error); });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
}());
```

Inside `initWidget`, store `index`, `visible`, `step`, `dragStartX`, and `dragDeltaX`. `updateMetrics()` must read `--gpk-cert-visible`, calculate `step` from the first card width plus the computed track gap, clamp `index` to `cards.length - visible`, and call `updateSlider(false)`. `updateSlider(announce)` must set `--gpk-cert-offset`, set real `disabled` states, update each card's `aria-hidden`, and announce `Mostrando certificaciones X a Y de 6` only after user navigation. Advance exactly one card from buttons, `ArrowLeft`/`ArrowRight`, or a pointer delta whose absolute value exceeds 50 pixels. Use pointer capture when available and never create an interval or timer.

- [ ] **Step 4: Run the full contract test**

Run: `node --test "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"`

Expected: 4 tests PASS.

- [ ] **Step 5: Commit the controller**

```bash
git add "widgets/slider certificaciones new/slider-certificaciones.js" "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"
git commit -m "feat: add manual certifications carousel controls"
```

### Task 4: Add and verify the integration preview

**Files:**
- Create: `widgets/slider certificaciones new/preview.html`

- [ ] **Step 1: Create the local embed harness**

```html
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vista previa — Slider de certificaciones</title>
    <style>body { margin: 0; padding: clamp(16px, 4vw, 60px); background: #f4f5f5; }</style>
</head>
<body>
    <div id="gpk-slider-certificaciones-widget-root"></div>
    <script src="slider-certificaciones.js"></script>
</body>
</html>
```

- [ ] **Step 2: Run all contract tests**

Run: `node --test "widgets/slider certificaciones new/slider-certificaciones.contract.test.js"`

Expected: 4 tests PASS and 0 failures.

- [ ] **Step 3: Serve the repository locally**

Run: `python -m http.server 8026 --bind 127.0.0.1`

Open: `http://127.0.0.1:8026/widgets/slider%20certificaciones%20new/preview.html`

Expected: six cards load from local assets; three are visible at 1440 px.

- [ ] **Step 4: Perform responsive visual verification**

At 1440 px verify 3 cards; at 800 px verify 2; at 390 px verify 1. At every width, click through to the last valid index, confirm the next button disables, return to the first index, confirm the previous button disables, and verify no page-level horizontal scrollbar appears.

- [ ] **Step 5: Perform interaction and accessibility verification**

Focus the viewport and use both arrow keys. Drag/swipe more than 50 px in both directions. Confirm no movement occurs without input. Enable reduced motion in browser emulation and confirm transforms update without animated transition. Temporarily rename one image URL in DevTools and confirm the textual fallback appears without collapsing the card.

- [ ] **Step 6: Run final repository checks**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: only the five new slider files are modified/untracked for this implementation, with pre-existing unrelated work left untouched.

- [ ] **Step 7: Commit the preview and final verification state**

```bash
git add "widgets/slider certificaciones new/preview.html"
git commit -m "chore: add certifications slider preview"
```
