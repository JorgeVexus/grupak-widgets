# Cajas Mobile Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt modes 7, 8, and 9 of the Productos Secciones widget to the approved mobile Figma layouts while preserving the current desktop presentation exactly.

**Architecture:** Add one isolated mobile stylesheet whose selectors require both the mode and a versioned mobile class, and add one mobile-only setup function for content labels and per-element reveal behavior. Keep the source HTML and vendor desktop CSS untouched; the adapter reuses their existing content and images, applies reversible DOM decoration only inside cloned mobile screens, and lets the existing height calculator opt these three modes into natural mobile height.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Node.js built-in test runner, IntersectionObserver, local Python HTTP preview, in-app browser visual inspection.

---

## File map

- Create `widgets/productos-secciones/productos-secciones-mobile-cajas.css`: all layout, responsive sizing, cards, and reveal states for modes 7–9 under `@media (max-width: 767px)`.
- Modify `widgets/productos-secciones/productos-secciones.js`: load the new sheet, attach versioned mode classes, prepare mobile-only labels, observe reveal elements, and use natural height for modes 7–9.
- Modify `widgets/productos-secciones/productos-secciones.contract.test.js`: executable contracts proving stylesheet isolation, content reuse, visibility, animation directions, timing, and reduced-motion behavior.
- Modify `widgets/productos-secciones/preview.html`: bump only the cache-busting query value after implementation.

### Task 1: Establish isolated mobile contracts and wiring

**Files:**
- Create: `widgets/productos-secciones/productos-secciones-mobile-cajas.css`
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Add the failing stylesheet and mode-class contracts**

At the top of the test file, load the future sheet exactly as the other mobile sheets are loaded:

```js
const mobileCajasPath = path.join(dir, "productos-secciones-mobile-cajas.css");
const mobileCajas = fs.existsSync(mobileCajasPath)
    ? fs.readFileSync(mobileCajasPath, "utf8")
    : "";
```

Append these tests, and update every older automatic-height assertion from `0`–`5` to the new exact set:

```js
test("Cajas móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-cajas-styles/);
    assert.match(js, /productos-secciones-mobile-cajas\.css/);
});

test("los modos 7, 8 y 9 reciben clases móviles diferentes", () => {
    assert.match(js, /if \(entry\.mode === 7\) screen\.classList\.add\("ps-mobile-cajas-intro-v1"\)/);
    assert.match(js, /if \(entry\.mode === 8\) screen\.classList\.add\("ps-mobile-cajas-conventional-v1"\)/);
    assert.match(js, /if \(entry\.mode === 9\) screen\.classList\.add\("ps-mobile-cajas-digital-v1"\)/);
});

test("los modos móviles adaptados usan altura automática", () => {
    assert.match(js, /const adaptedMobileModes = new Set\(\["0", "1", "2", "3", "4", "5", "7", "8", "9"\]\)/);
});

test("el CSS de Cajas está encapsulado en los modos 7, 8 y 9", () => {
    assert.match(mobileCajas, /@media \(max-width: 767px\)/);
    assert.doesNotMatch(mobileCajas, /@media[^\{]*(?:768|1024|480|440|390|375|360|320)/);
    const selectors = mobileCajas.match(/#gpk-ps-widget[^\{]+(?=\{)/g) || [];
    assert.ok(selectors.length > 0);
    selectors.forEach(selector => {
        assert.match(selector, /\.ps-screen\[data-mode="(?:7|8|9)"\]\.ps-mobile-cajas-(?:intro|conventional|digital)-v1/);
    });
});
```

- [ ] **Step 2: Run the contracts and confirm the intended red state**

Run:

```powershell
node --test widgets/productos-secciones/productos-secciones.contract.test.js
```

Expected: the four new Cajas tests fail because the stylesheet, load entry, versioned classes, and expanded mode set do not exist; all pre-existing behavioral tests remain green except the assertions deliberately updated to the expanded set.

- [ ] **Step 3: Add the minimum loading, classes, and height wiring**

Add the stylesheet tuple after Láminas:

```js
["gpk-ps-mobile-cajas-styles", "productos-secciones-mobile-cajas.css"]
```

In the loop that creates each screen, add:

```js
if (entry.mode === 7) screen.classList.add("ps-mobile-cajas-intro-v1");
if (entry.mode === 8) screen.classList.add("ps-mobile-cajas-conventional-v1");
if (entry.mode === 9) screen.classList.add("ps-mobile-cajas-digital-v1");
```

Replace the automatic-height set with:

```js
const adaptedMobileModes = new Set(["0", "1", "2", "3", "4", "5", "7", "8", "9"]);
```

Create the stylesheet with the isolation boundary only:

```css
@media (max-width: 767px) {
  #gpk-ps-widget .ps-screen[data-mode="7"].ps-mobile-cajas-intro-v1,
  #gpk-ps-widget .ps-screen[data-mode="8"].ps-mobile-cajas-conventional-v1,
  #gpk-ps-widget .ps-screen[data-mode="9"].ps-mobile-cajas-digital-v1 {
    overflow: hidden;
  }
}
```

- [ ] **Step 4: Run the tests and confirm the wiring is green**

Run the same Node command. Expected: all contracts pass.

- [ ] **Step 5: Commit the isolated wiring**

```powershell
git add widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-cajas.css widgets/productos-secciones/productos-secciones.contract.test.js
git commit -m "feat: scaffold cajas mobile sections"
```

### Task 2: Implement the three responsive Figma layouts

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-cajas.css`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Add failing contracts for visibility, source reuse, and mobile composition**

Append:

```js
test("Cajas móvil reutiliza las imágenes y contenidos existentes", () => {
    assert.match(sourceHtml, /class="cajas-mobile-hero-img"/);
    assert.match(sourceHtml, /Cajas y empaques 1\.webp/);
    assert.match(sourceHtml, /Cajas y empaques 2-1\.webp/);
    assert.match(mobileCajas, /\.cajas-mobile-hero-img/);
    assert.match(mobileCajas, /\.cajas-main-image/);
    assert.match(mobileCajas, /\.digital-main-image/);
});

test("cada modo de Cajas oculta sus paneles hermanos", () => {
    assert.match(mobileCajas, /data-mode="7"[^\{]+#cajas-convencionales-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="7"[^\{]+#cajas-digital-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="8"[^\{]+#cajas-intro-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="8"[^\{]+#cajas-digital-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="9"[^\{]+#cajas-intro-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="9"[^\{]+#cajas-convencionales-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
});

test("las tarjetas informativas móviles tienen etiquetas propias", () => {
    assert.match(js, /Soluciones Convencionales/);
    assert.match(js, /Impresión Digital/);
    assert.match(js, /ps-cajas-card-label/);
    assert.match(js, /Tecnología Single Pass/);
    assert.match(mobileCajas, /\.ps-cajas-card-label/);
});
```

- [ ] **Step 2: Run the tests and verify layout contracts fail**

Run the Node test command. Expected: three failures for missing layout selectors and mobile labels.

- [ ] **Step 3: Build the isolated responsive layout**

Inside the single `@media (max-width: 767px)` block, every comma-separated selector must repeat a complete one of these roots:

```css
#gpk-ps-widget .ps-screen[data-mode="7"].ps-mobile-cajas-intro-v1
#gpk-ps-widget .ps-screen[data-mode="8"].ps-mobile-cajas-conventional-v1
#gpk-ps-widget .ps-screen[data-mode="9"].ps-mobile-cajas-digital-v1
```

Apply these exact layout rules:

```css
/* Shared reset: neutralize the fixed 1850×1030 canvas only in adapted mobile screens. */
[scoped-root] .ps-board-shell,
[scoped-root] .products-board,
[scoped-root] #pane-cajas {
  position: relative !important;
  inset: auto !important;
  width: 100% !important;
  height: auto !important;
  min-height: 0 !important;
  transform: none !important;
}
[scoped-root] #pane-cajas {
  padding: clamp(34px, 9vw, 48px) clamp(18px, 5.5vw, 24px) clamp(48px, 14vw, 64px) !important;
  overflow: hidden !important;
}

/* Mode 7: hero, title, and two stacked option cards. */
[mode-7-root] #pillars-container,
[mode-7-root] #cajas-convencionales-content,
[mode-7-root] #cajas-digital-content { display: none !important; }
[mode-7-root] .pane-header-centered,
[mode-7-root] .cajas-mobile-hero-container,
[mode-7-root] #cajas-intro-content { display: flex !important; position: relative !important; inset: auto !important; }
[mode-7-root] .cajas-mobile-hero-container { justify-content: center; width: 100%; }
[mode-7-root] .cajas-mobile-hero-img { display: block; width: clamp(170px, 52vw, 228px); height: auto; object-fit: contain; }
[mode-7-root] .pane-header-centered { margin-top: 24px; justify-content: flex-start; }
[mode-7-root] .pane-title-centered { font-size: clamp(30px, 8.5vw, 38px) !important; line-height: 1.04 !important; text-align: left !important; }
[mode-7-root] #cajas-intro-content { flex-direction: column; gap: 16px; margin-top: 24px; }
[mode-7-root] .cajas-column { width: 100% !important; min-height: 0 !important; padding: 22px 20px !important; border-radius: 18px; background: #fff; }
[mode-7-root] .cajas-column h2 { font-size: clamp(21px, 6vw, 26px) !important; line-height: 1.12 !important; }
[mode-7-root] .cajas-column p { font-size: clamp(15px, 4.1vw, 17px) !important; line-height: 1.45 !important; }

/* Mode 8: product image, conventional copy, green “Ideales para” card. */
[mode-8-root] .pane-header-centered,
[mode-8-root] .cajas-mobile-hero-container,
[mode-8-root] #cajas-intro-content,
[mode-8-root] #cajas-digital-content { display: none !important; }
[mode-8-root] #cajas-convencionales-content { display: flex !important; position: relative !important; flex-direction: column; inset: auto !important; gap: 24px; }
[mode-8-root] .cajas-image-container,
[mode-8-root] .cajas-text-container { position: relative !important; inset: auto !important; width: 100% !important; }
[mode-8-root] .cajas-main-image { display: block; width: min(100%, 390px); height: auto; margin-inline: auto; object-fit: contain; }
[mode-8-root] .cajas-detail-title { font-size: clamp(28px, 8vw, 36px) !important; line-height: 1.06 !important; }
[mode-8-root] .cajas-green-line { width: 48px !important; height: 3px !important; margin: 14px 0 20px !important; }
[mode-8-root] .cajas-paragraph-1 { font-size: clamp(16px, 4.5vw, 19px) !important; line-height: 1.5 !important; }
[mode-8-root] .cajas-paragraph-2 { margin-top: 24px !important; padding: 22px 20px !important; border-radius: 18px; background: #eaf3e5 !important; }

/* Mode 9: printed displays first, digital copy, white technology card. */
[mode-9-root] .pane-header-centered,
[mode-9-root] .cajas-mobile-hero-container,
[mode-9-root] #cajas-intro-content,
[mode-9-root] #cajas-convencionales-content { display: none !important; }
[mode-9-root] #cajas-digital-content,
[mode-9-root] .digital-content-wrapper { display: flex !important; position: relative !important; inset: auto !important; width: 100% !important; height: auto !important; }
[mode-9-root] .digital-content-wrapper { flex-direction: column; gap: 24px; }
[mode-9-root] .digital-image-container { order: 1; position: relative !important; inset: auto !important; width: 100% !important; }
[mode-9-root] .digital-text-content { order: 2; position: relative !important; inset: auto !important; width: 100% !important; }
[mode-9-root] .digital-main-image { display: block; width: min(100%, 390px); height: auto; margin-inline: auto; object-fit: contain; }
[mode-9-root] .digital-subtitle { font-size: clamp(28px, 8vw, 36px) !important; line-height: 1.06 !important; }
[mode-9-root] .digital-green-line { width: 48px !important; height: 3px !important; margin: 14px 0 20px !important; }
[mode-9-root] .digital-paragraph-1 { font-size: clamp(16px, 4.5vw, 19px) !important; line-height: 1.5 !important; }
[mode-9-root] .digital-paragraph-2 { margin-top: 24px !important; padding: 22px 20px !important; border-radius: 18px; background: #fff !important; }

[mode-8-root] .ps-cajas-card-label,
[mode-9-root] .ps-cajas-card-label { display: block; margin-bottom: 10px; color: #569b2f; font-size: clamp(20px, 5.5vw, 24px); line-height: 1.15; }
[mode-8-root] br.desktop-only,
[mode-9-root] br.desktop-only { display: none !important; }
```

In this plan's CSS notation, `[scoped-root]` expands to each of the three complete roots listed immediately above, while `[mode-7-root]`, `[mode-8-root]`, and `[mode-9-root]` expand respectively to those exact mode-specific roots. These are plan-only abbreviations to keep the repeated selector prefixes reviewable; the implementation must contain the expanded selectors and no bracketed abbreviation.

- [ ] **Step 4: Run the tests and inspect CSS for forbidden leakage**

Run:

```powershell
node --test widgets/productos-secciones/productos-secciones.contract.test.js
rg -n "^([^@]|@media)" widgets/productos-secciones/productos-secciones-mobile-cajas.css
```

Expected: contracts pass; every effective rule is inside the 767px media query and anchored to one versioned mode root.

- [ ] **Step 5: Commit the layouts**

```powershell
git add widgets/productos-secciones/productos-secciones-mobile-cajas.css widgets/productos-secciones/productos-secciones.contract.test.js
git commit -m "feat: adapt cajas sections for mobile"
```

### Task 3: Add controlled reveals and verify all target widths

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Modify: `widgets/productos-secciones/productos-secciones-mobile-cajas.css`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Modify: `widgets/productos-secciones/preview.html`

- [ ] **Step 1: Add failing reveal and accessibility contracts**

Append:

```js
test("Cajas móvil revela elementos individuales una sola vez", () => {
    assert.match(js, /function setupMobileCajasReveal\(root\)/);
    assert.match(js, /threshold:\s*0\.2/);
    assert.match(js, /},\s*150\)/);
    assert.match(js, /observer\.unobserve\(element\)/);
    assert.match(js, /element\.classList\.add\("ps-cajas-revealed"\)/);
    assert.match(js, /prefers-reduced-motion: reduce/);
});

test("las entradas de Cajas respetan las direcciones aprobadas", () => {
    assert.match(mobileCajas, /data-mode="7"[^\{]+\[data-ps-cajas-reveal\][^\{]*\{[^}]*translateY\(32px\)/s);
    assert.match(mobileCajas, /data-mode="8"[^\{]+\.cajas-image-container[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileCajas, /data-mode="8"[^\{]+\.ps-cajas-main-copy[^\{]*\{[^}]*translateX\(70px\)/s);
    assert.match(mobileCajas, /data-mode="9"[^\{]+\.digital-image-container[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileCajas, /data-mode="9"[^\{]+\.ps-cajas-main-copy[^\{]*\{[^}]*translateX\(70px\)/s);
    assert.match(mobileCajas, /\.ps-cajas-revealed\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translate\(0,\s*0\)/s);
});
```

- [ ] **Step 2: Run the test and confirm both animation contracts fail**

Run the Node test command. Expected: two failures for the missing setup function and reveal CSS.

- [ ] **Step 3: Implement mobile-only content preparation and one-shot observer**

Call `setupMobileCajasReveal(root);` immediately after `setupMobileLaminasReveal(root);` in `build` and add this function after the Láminas setup:

```js
function setupMobileCajasReveal(root) {
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const intro = root.querySelector('.ps-screen[data-mode="7"].ps-mobile-cajas-intro-v1');
    const conventional = root.querySelector('.ps-screen[data-mode="8"].ps-mobile-cajas-conventional-v1');
    const digital = root.querySelector('.ps-screen[data-mode="9"].ps-mobile-cajas-digital-v1');
    if (!intro || !conventional || !digital) return;

    const introHeadings = intro.querySelectorAll(".cajas-column h2");
    if (introHeadings[0]) introHeadings[0].textContent = "Soluciones Convencionales";
    if (introHeadings[1]) introHeadings[1].textContent = "Impresión Digital";

    const idealCard = conventional.querySelector(".cajas-paragraph-2");
    if (idealCard && !idealCard.querySelector(".ps-cajas-card-label")) {
        const copy = idealCard.textContent.trim().replace(/^Ideales para\s*/i, "");
        idealCard.innerHTML = `<strong class="ps-cajas-card-label">Ideales para:</strong>${copy}`;
    }

    const technologyCard = digital.querySelector(".digital-paragraph-2");
    if (technologyCard && !technologyCard.querySelector(".ps-cajas-card-label")) {
        technologyCard.innerHTML = `<strong class="ps-cajas-card-label">Tecnología Single Pass</strong>${technologyCard.textContent.trim()}`;
    }

    const mainCopies = [
        conventional.querySelector(".cajas-text-container"),
        digital.querySelector(".digital-text-content")
    ].filter(Boolean);
    mainCopies.forEach(element => element.classList.add("ps-cajas-main-copy"));

    [
        intro.querySelector(".cajas-mobile-hero-container"),
        intro.querySelector(".pane-header-centered"),
        ...intro.querySelectorAll(".cajas-column"),
        conventional.querySelector(".cajas-image-container"),
        conventional.querySelector(".ps-cajas-main-copy"),
        idealCard,
        digital.querySelector(".digital-image-container"),
        digital.querySelector(".ps-cajas-main-copy"),
        technologyCard
    ].filter(Boolean).forEach(element => element.dataset.psCajasReveal = "1");

    const elements = Array.from(root.querySelectorAll("[data-ps-cajas-reveal]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
        elements.forEach(element => element.classList.add("ps-cajas-revealed"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            observer.unobserve(element);
            window.setTimeout(() => {
                element.classList.add("ps-cajas-revealed");
            }, 150);
        });
    }, { threshold: 0.2 });

    elements.forEach(element => observer.observe(element));
}
```

- [ ] **Step 4: Add exact reveal states and reduced-motion fallback**

Add under the same scoped mobile media query:

```css
[mode-7-root] [data-ps-cajas-reveal],
[mode-8-root] [data-ps-cajas-reveal],
[mode-9-root] [data-ps-cajas-reveal] {
  opacity: 0;
  transition: opacity 650ms ease, transform 650ms cubic-bezier(.22, 1, .36, 1);
  will-change: opacity, transform;
}
[mode-7-root] [data-ps-cajas-reveal] { transform: translateY(32px); }
[mode-8-root] .cajas-image-container[data-ps-cajas-reveal],
[mode-9-root] .digital-image-container[data-ps-cajas-reveal] { transform: translateX(-70px); }
[mode-8-root] .ps-cajas-main-copy[data-ps-cajas-reveal],
[mode-9-root] .ps-cajas-main-copy[data-ps-cajas-reveal] { transform: translateX(70px); }
[mode-8-root] .cajas-paragraph-2[data-ps-cajas-reveal],
[mode-9-root] .digital-paragraph-2[data-ps-cajas-reveal] { transform: translateY(32px); }
[mode-7-root] .ps-cajas-revealed,
[mode-8-root] .ps-cajas-revealed,
[mode-9-root] .ps-cajas-revealed { opacity: 1; transform: translate(0, 0); }

@media (prefers-reduced-motion: reduce) {
  [mode-7-root] [data-ps-cajas-reveal],
  [mode-8-root] [data-ps-cajas-reveal],
  [mode-9-root] [data-ps-cajas-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

Expand every plan-only root abbreviation to its complete versioned selector. Keep the reduced-motion block nested inside the 767px block so it cannot affect desktop.

- [ ] **Step 5: Bump cache keys and run the complete automated suite**

Change `assetVersion` from `seccion-reveal-25` to `seccion-reveal-26`. Change the preview script query to `?v=26`.

Run:

```powershell
node --test widgets/productos-secciones/productos-secciones.contract.test.js
git diff --check
```

Expected: every contract passes and `git diff --check` prints no errors.

- [ ] **Step 6: Verify the three sections visually at all supported widths**

Serve the worktree on port 8027 and open:

```text
http://127.0.0.1:8027/widgets/productos-secciones/preview.html?v=26
```

At viewport widths 440, 390, 375, 360, and 320 px, inspect modes 7, 8, and 9 and confirm:

- no horizontal overflow (`document.documentElement.scrollWidth === document.documentElement.clientWidth`);
- mode 7 shows the open-box image, heading, then two stacked cards and no pillar artwork;
- mode 8 shows the conventional image, copy, then the green “Ideales para” card;
- mode 9 shows the WOWPAK image, copy, then the white “Tecnología Single Pass” card;
- each element remains hidden until roughly 20% enters the viewport, then reveals once after 150 ms;
- navigation remains inside the widget and the bottom bar does not cover the final card;
- desktop at 1440 px is pixel-identical in geometry to the pre-task version.

- [ ] **Step 7: Commit the verified animation and cache bump**

```powershell
git add widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-cajas.css widgets/productos-secciones/productos-secciones.contract.test.js widgets/productos-secciones/preview.html
git commit -m "feat: animate cajas mobile sections"
```

## Final review checklist

- The Figma structures for nodes `2274:29909`, `2274:29943`, and `2274:29972` each map to one mobile mode.
- The source HTML, vendor CSS, and desktop rules remain unchanged.
- All new selectors include mode, versioned mobile class, and the widget root.
- There are no additional breakpoint-specific overrides; `clamp()` and fluid widths cover 320–440 px.
- Existing images and copy are reused; only cloned mobile labels are decorated in JavaScript.
- Reveals use the approved 32 px / 70 px directions, 650 ms duration, 150 ms delay, 20% threshold, one-shot unobserve, and reduced-motion fallback.
- The work remains isolated on `codex/productos-mobile-section-1` until all remaining mobile sections are complete.
