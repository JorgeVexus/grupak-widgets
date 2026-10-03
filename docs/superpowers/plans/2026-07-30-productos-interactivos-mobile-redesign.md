# Productos Interactivos Mobile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the 15-state mobile experience of Productos Interactivos as a stable editorial interface while leaving desktop visually and functionally unchanged.

**Architecture:** Keep the existing HTML state model and `goToSlide()` navigation contract. Add small semantic hooks for mobile progress, then replace the accumulated mobile CSS overrides with one final, scoped layer under `#gpk-products-widget` and `@media (max-width: 768px)`. Verify the contract statically, exercise every state in a real browser at representative mobile sizes, compile the existing Webflow embeds, and serve the local preview.

**Tech Stack:** HTML, scoped vanilla CSS, vanilla JavaScript, PowerShell static contract tests, Python compilation scripts, browser responsive testing.

---

## File map

- `widgets/productos-interactivos/productos-interactivos.html`: preserve all content and add semantic labels/progress hooks required by mobile navigation.
- `widgets/productos-interactivos/productos-interactivos.js`: update mobile progress text and reset the active pane scroll position when changing slides.
- `widgets/productos-interactivos/productos-interactivos.css`: append one authoritative mobile redesign layer; desktop declarations remain unchanged.
- `tests/productos-interactivos-mobile.static.test.ps1`: enforce mobile isolation, touch target, progress, dynamic viewport, overflow, and reduced-motion contracts.
- `grupak-productos-scroll-embed.html`, `hermes-grupak-productos-scroll-embed.html`, `preview-productos.html`, `hermes-preview-productos.html`: generated outputs from `compile_widgets.py`; never edit by hand.

### Task 1: Lock the responsive contract with a failing static test

**Files:**
- Create: `tests/productos-interactivos-mobile.static.test.ps1`
- Read: `widgets/productos-interactivos/productos-interactivos.html`
- Read: `widgets/productos-interactivos/productos-interactivos.css`
- Read: `widgets/productos-interactivos/productos-interactivos.js`

- [ ] **Step 1: Start the preview and capture the untouched desktop baseline**

Run:

```powershell
python -m http.server 8026 --bind 127.0.0.1
```

Open `http://127.0.0.1:8026/preview-productos-interactivos.html` at
1440 × 1000, wait for the preloader, and save the capture as
`scratch/productos-desktop-baseline.png`. This file is verification evidence
and must not be committed.

- [ ] **Step 2: Write the contract test**

```powershell
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.html")
$css = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.css")
$js = Get-Content -Raw (Join-Path $root "widgets/productos-interactivos/productos-interactivos.js")

function Assert-Match([string]$Text, [string]$Pattern, [string]$Message) {
    if ($Text -notmatch $Pattern) { throw $Message }
}

Assert-Match $html 'id="mobile-section-name"' "Missing mobile section label"
Assert-Match $html 'id="mobile-slide-count"' "Missing mobile slide count"
Assert-Match $html 'id="mobile-progress-fill"' "Missing mobile progress fill"
Assert-Match $css '/\* MOBILE EDITORIAL REDESIGN — AUTHORITATIVE LAYER \*/' "Missing authoritative mobile layer"
Assert-Match $css '@media\s*\(max-width:\s*768px\)' "Mobile rules are not breakpoint-scoped"
Assert-Match $css '--mobile-nav-button:\s*44px' "Touch target token must be 44px"
Assert-Match $css 'min-height:\s*100dvh' "Dynamic viewport minimum is missing"
Assert-Match $css 'overflow-x:\s*clip' "Horizontal overflow protection is missing"
Assert-Match $css 'prefers-reduced-motion:\s*reduce' "Reduced-motion handling is missing"
Assert-Match $js 'mobileSectionNames' "JavaScript mobile section map is missing"
Assert-Match $js 'scrollTo\(\{\s*top:\s*0' "Pane scroll reset is missing"

$modeCount = ([regex]::Matches($js, 'const totalSlides = 15')).Count
if ($modeCount -ne 1) { throw "The 15-slide navigation contract changed" }

Write-Host "Productos Interactivos mobile contract: PASS"
```

- [ ] **Step 3: Run the test and verify the new contract fails**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/productos-interactivos-mobile.static.test.ps1
```

Expected: FAIL with `Missing mobile section label`.

- [ ] **Step 4: Commit the test alone**

```powershell
git add tests/productos-interactivos-mobile.static.test.ps1
git commit -m "test: define products mobile redesign contract"
```

### Task 2: Add semantic navigation hooks and mobile state updates

**Files:**
- Modify: `widgets/productos-interactivos/productos-interactivos.html:778`
- Modify: `widgets/productos-interactivos/productos-interactivos.js:39-45`
- Modify: `widgets/productos-interactivos/productos-interactivos.js:262-296`
- Modify: `widgets/productos-interactivos/productos-interactivos.js:398-430`
- Test: `tests/productos-interactivos-mobile.static.test.ps1`

- [ ] **Step 1: Replace the footer’s center content with semantic progress markup**

Keep `#footer-dots` for desktop and add a separate mobile-only progress region:

```html
<div class="footer-dots" id="footer-dots" aria-hidden="true"></div>
<div class="mobile-nav-progress" aria-live="polite">
    <div class="mobile-nav-meta">
        <span id="mobile-section-name">Introducción</span>
        <span id="mobile-slide-count">1 de 15</span>
    </div>
    <div class="mobile-progress-track" aria-hidden="true">
        <span id="mobile-progress-fill" class="mobile-progress-fill"></span>
    </div>
</div>
```

- [ ] **Step 2: Add the category map and DOM references**

Place after `const totalSlides = 15`:

```javascript
const mobileSectionNames = [
    "Introducción",
    "Productos",
    "Papel",
    "Papel",
    "Lámina",
    "Lámina",
    "Lámina",
    "Cajas y empaques",
    "Cajas y empaques",
    "Cajas y empaques",
    "Grabados",
    "Grabados",
    "Grabados",
    "Grabados",
    "Energía"
];
```

Place with the footer button references:

```javascript
const mobileSectionName = root.querySelector("#mobile-section-name");
const mobileSlideCount = root.querySelector("#mobile-slide-count");
const mobileProgressFill = root.querySelector("#mobile-progress-fill");
```

- [ ] **Step 3: Update progress inside the existing state renderer**

After the active desktop dot is updated:

```javascript
if (mobileSectionName) {
    mobileSectionName.textContent = mobileSectionNames[currentSlide];
}
if (mobileSlideCount) {
    mobileSlideCount.textContent = `${currentSlide + 1} de ${totalSlides}`;
}
if (mobileProgressFill) {
    mobileProgressFill.style.transform = `scaleX(${(currentSlide + 1) / totalSlides})`;
}
```

- [ ] **Step 4: Reset only the mobile pane scroll position after navigation**

At the end of `goToSlide(index)`, after state rendering:

```javascript
if (window.matchMedia("(max-width: 768px)").matches) {
    window.requestAnimationFrame(() => {
        board.scrollTo({ top: 0, behavior: "instant" });
    });
}
```

- [ ] **Step 5: Run the contract test**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/productos-interactivos-mobile.static.test.ps1
```

Expected: FAIL with `Missing authoritative mobile layer`.

- [ ] **Step 6: Commit semantic and behavioral changes**

```powershell
git add widgets/productos-interactivos/productos-interactivos.html widgets/productos-interactivos/productos-interactivos.js
git commit -m "feat: add accessible mobile products navigation"
```

### Task 3: Build the authoritative editorial mobile layer

**Files:**
- Modify: `widgets/productos-interactivos/productos-interactivos.css` after the existing final rule
- Test: `tests/productos-interactivos-mobile.static.test.ps1`

- [ ] **Step 1: Add the mobile foundation and isolation marker**

Append one final layer so it wins over legacy mobile declarations without touching desktop:

```css
/* MOBILE EDITORIAL REDESIGN — AUTHORITATIVE LAYER */
@media (max-width: 768px) {
    #gpk-products-widget {
        --mobile-bg: #f2f4ef;
        --mobile-surface: #ffffff;
        --mobile-text: #263229;
        --mobile-muted: #687269;
        --mobile-line: rgba(56, 76, 58, 0.16);
        --mobile-accent: #5f9d2f;
        --mobile-nav-button: 44px;
        --mobile-gutter: clamp(16px, 5vw, 22px);
        overflow-x: clip;
        background: var(--mobile-bg);
        color: var(--mobile-text);
    }

    #gpk-products-widget .products-scroll-tracker,
    #gpk-products-widget .products-viewport {
        width: 100%;
        height: auto;
        min-height: 100dvh;
        overflow: visible;
    }

    #gpk-products-widget .products-board {
        position: relative;
        width: 100%;
        height: 100dvh;
        min-height: 100dvh;
        padding:
            max(18px, env(safe-area-inset-top))
            var(--mobile-gutter)
            calc(92px + env(safe-area-inset-bottom));
        overflow-x: clip;
        overflow-y: auto;
        overscroll-behavior: contain;
        background: var(--mobile-bg);
        box-shadow: none;
    }
}
```

- [ ] **Step 2: Add shared editorial typography, media, and content rules**

```css
@media (max-width: 768px) {
    #gpk-products-widget .products-board h1,
    #gpk-products-widget .products-board h2 {
        max-width: 15ch;
        margin: 0;
        color: var(--mobile-text);
        font-size: clamp(27px, 8vw, 36px);
        font-weight: 750;
        line-height: 0.98;
        letter-spacing: -0.045em;
        text-wrap: balance;
    }

    #gpk-products-widget .products-board h3 {
        color: var(--mobile-text);
        font-size: clamp(17px, 4.8vw, 21px);
        line-height: 1.15;
        letter-spacing: -0.025em;
    }

    #gpk-products-widget .products-board p {
        max-width: 62ch;
        color: var(--mobile-muted);
        font-size: clamp(13px, 3.6vw, 15px);
        line-height: 1.55;
    }

    #gpk-products-widget .intro-mobile-img,
    #gpk-products-widget .overview-mobile-img,
    #gpk-products-widget .papel-main-image,
    #gpk-products-widget .product-img,
    #gpk-products-widget .laminas-stack-img,
    #gpk-products-widget .spec-img,
    #gpk-products-widget .cajas-mobile-hero-img,
    #gpk-products-widget .cajas-main-image,
    #gpk-products-widget .digital-main-image,
    #gpk-products-widget .grabados-service-image,
    #gpk-products-widget .energia-mobile-image {
        display: block;
        width: 100%;
        max-width: 100%;
        height: auto;
        object-fit: contain;
        filter: none;
        box-shadow: none;
    }
}
```

- [ ] **Step 3: Recompose introduction and product overview**

```css
@media (max-width: 768px) {
    #gpk-products-widget .products-intro-pane {
        display: grid;
        align-content: start;
        gap: 22px;
        width: 100%;
        min-height: 0;
        padding: 0;
    }

    #gpk-products-widget .intro-mobile-img-container {
        order: 2;
        width: 100%;
        min-height: 210px;
        padding: 12px 0;
        border: 0;
        background: transparent;
    }

    #gpk-products-widget .intro-mobile-desc {
        order: 3;
        margin: 0;
        padding: 0 0 18px;
        border-bottom: 1px solid var(--mobile-line);
    }

    #gpk-products-widget .intro-kpis-grid-new {
        order: 4;
        display: grid;
        grid-template-columns: 1fr;
        gap: 0;
        width: 100%;
    }

    #gpk-products-widget .overview-grid-new {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: min(82vw, 330px);
        gap: 14px;
        width: calc(100% + var(--mobile-gutter));
        padding: 4px var(--mobile-gutter) 14px 0;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
    }

    #gpk-products-widget .overview-col-new {
        display: grid;
        grid-template-rows: 210px auto 1fr auto;
        gap: 12px;
        min-width: 0;
        padding: 18px;
        border: 1px solid var(--mobile-line);
        border-radius: 18px;
        background: var(--mobile-surface);
        box-shadow: none;
        scroll-snap-align: start;
    }
}
```

- [ ] **Step 4: Recompose Papel, Láminas, Cajas, Grabados, and Energía**

Use one-column content flow for every active pane and remove fixed-height grids:

```css
@media (max-width: 768px) {
    #gpk-products-widget .details-pane {
        position: relative;
        inset: auto;
        width: 100%;
        min-height: 0;
        padding: 0;
        overflow: visible;
    }

    #gpk-products-widget .papel-products-grid,
    #gpk-products-widget .laminas-specs-container,
    #gpk-products-widget .cajas-intro-content,
    #gpk-products-widget .cajas-convencionales-content,
    #gpk-products-widget .digital-content-wrapper,
    #gpk-products-widget .grabados-cards-grid-new,
    #gpk-products-widget .energia-rows {
        display: grid;
        grid-template-columns: 1fr;
        grid-auto-rows: auto;
        gap: 16px;
        width: 100%;
        height: auto;
        overflow: visible;
    }

    #gpk-products-widget .product-card,
    #gpk-products-widget .spec-text-box,
    #gpk-products-widget .cajas-column,
    #gpk-products-widget .cajas-text-container,
    #gpk-products-widget .digital-text-content,
    #gpk-products-widget .grabados-green-card,
    #gpk-products-widget .energia-row {
        min-width: 0;
        min-height: 0;
        height: auto;
        padding: 18px 0;
        border: 0;
        border-top: 1px solid var(--mobile-line);
        border-radius: 0;
        background: transparent;
        box-shadow: none;
    }
}
```

Add mode-specific selectors immediately after this shared block to expose only
the active content already controlled by modes 0–14; do not change mode
numbers, source order, text, or asset paths.

- [ ] **Step 5: Build stable navigation controls and progress**

```css
@media (max-width: 768px) {
    #gpk-products-widget .products-nav-footer {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        display: grid;
        grid-template-columns: var(--mobile-nav-button) minmax(0, 1fr) var(--mobile-nav-button);
        align-items: center;
        gap: 14px;
        min-height: 72px;
        padding: 10px var(--mobile-gutter) calc(10px + env(safe-area-inset-bottom));
        border-top: 1px solid var(--mobile-line);
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(12px);
    }

    #gpk-products-widget .footer-arrow {
        display: grid;
        place-items: center;
        width: var(--mobile-nav-button);
        min-width: var(--mobile-nav-button);
        height: var(--mobile-nav-button);
        min-height: var(--mobile-nav-button);
        padding: 0;
        border-radius: 50%;
    }

    #gpk-products-widget .footer-arrow.next {
        border-color: var(--mobile-accent);
        background: var(--mobile-accent);
        color: #fff;
    }

    #gpk-products-widget .footer-arrow:active {
        transform: scale(0.94);
    }

    #gpk-products-widget .footer-dots {
        display: none;
    }

    #gpk-products-widget .mobile-nav-progress {
        display: grid;
        gap: 7px;
        min-width: 0;
    }

    #gpk-products-widget .mobile-nav-meta {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        color: var(--mobile-muted);
        font-size: 10px;
        font-weight: 650;
    }

    #gpk-products-widget .mobile-progress-track {
        height: 3px;
        overflow: hidden;
        border-radius: 999px;
        background: #dfe5dc;
    }

    #gpk-products-widget .mobile-progress-fill {
        display: block;
        width: 100%;
        height: 100%;
        transform: scaleX(0.0667);
        transform-origin: left center;
        background: var(--mobile-accent);
        transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
    }
}
```

- [ ] **Step 6: Add small-height and reduced-motion safety rules**

```css
@media (max-width: 768px) and (max-height: 700px) {
    #gpk-products-widget .products-board {
        padding-top: 14px;
    }
}

@media (max-width: 768px) and (prefers-reduced-motion: reduce) {
    #gpk-products-widget *,
    #gpk-products-widget *::before,
    #gpk-products-widget *::after {
        scroll-behavior: auto !important;
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
    }
}
```

- [ ] **Step 7: Run the static contract**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/productos-interactivos-mobile.static.test.ps1
```

Expected: `Productos Interactivos mobile contract: PASS`.

- [ ] **Step 8: Commit the authoritative mobile layer**

```powershell
git add widgets/productos-interactivos/productos-interactivos.css
git commit -m "style: rebuild products widget mobile experience"
```

### Task 4: Verify all states and protect desktop

**Files:**
- Inspect: `preview-productos-interactivos.html`
- Inspect: `widgets/productos-interactivos/productos-interactivos.css`
- Test: `tests/productos-interactivos-mobile.static.test.ps1`

- [ ] **Step 1: Confirm the existing local preview is running**

Run:

```powershell
python -m http.server 8026 --bind 127.0.0.1
```

Expected: server listens on `http://127.0.0.1:8026`.

- [ ] **Step 2: Exercise all 15 mobile states**

At 390 × 844, click Next from state 0 through state 14 and verify for each:

```text
no horizontal scrollbar
top content is visible after navigation
text is not clipped
images stay within their container
footer controls remain circular and aligned
category and count match the state
vertical scroll works when content is taller than the viewport
```

Expected state labels:

```text
0 Introducción
1 Productos
2–3 Papel
4–6 Lámina
7–9 Cajas y empaques
10–13 Grabados
14 Energía
```

- [ ] **Step 3: Verify boundary sizes**

Repeat representative states 0, 1, 3, 6, 9, 13, and 14 at:

```text
320 × 568
375 × 667
430 × 932
768 × 1024
```

Expected: no overlaps, horizontal overflow, unreachable text, or distorted
navigation controls.

- [ ] **Step 4: Compare desktop after the change**

Capture 1440 × 1000 again at the same scroll position and compare with the
saved `scratch/productos-desktop-baseline.png`.

Expected: the desktop board geometry, content placement, transitions, and
footer are unchanged.

- [ ] **Step 5: Run final static verification**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/productos-interactivos-mobile.static.test.ps1
git diff --check
```

Expected: contract PASS and no whitespace errors.

### Task 5: Compile and deliver the local preview

**Files:**
- Generate: `grupak-productos-scroll-embed.html`
- Generate: `hermes-grupak-productos-scroll-embed.html`
- Generate: `preview-productos.html`
- Generate: `hermes-preview-productos.html`
- Update: `changelogs/2026-07-30.md`

- [ ] **Step 1: Compile source files into embeds and previews**

Run:

```powershell
python compile_widgets.py
```

Expected:

```text
Successfully compiled source into grupak-productos-scroll-embed.html
Successfully compiled source into hermes-grupak-productos-scroll-embed.html
```

- [ ] **Step 2: Confirm compiled files contain the new contract**

Run:

```powershell
Select-String -Path grupak-productos-scroll-embed.html -Pattern "MOBILE EDITORIAL REDESIGN"
Select-String -Path hermes-grupak-productos-scroll-embed.html -Pattern "mobile-progress-fill"
```

Expected: one or more matches in both commands.

- [ ] **Step 3: Add the changelog entry**

Append under the current date:

```markdown
### Productos interactivos

- Se reconstruyó desde cero la experiencia móvil con composición editorial,
  scroll vertical natural y navegación inferior accesible.
- Se validaron los 15 estados en viewports móviles y se preservó sin cambios la
  versión de escritorio.
- Se recompilaron los embeds y previews locales.
```

- [ ] **Step 4: Run the complete verification suite**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/productos-interactivos-mobile.static.test.ps1
powershell -ExecutionPolicy Bypass -File tests/navbar-menu.static.test.ps1
git diff --check
```

Expected: both static test suites PASS and no whitespace errors.

- [ ] **Step 5: Commit generated outputs and documentation**

```powershell
git add widgets/productos-interactivos/productos-interactivos.html widgets/productos-interactivos/productos-interactivos.css widgets/productos-interactivos/productos-interactivos.js tests/productos-interactivos-mobile.static.test.ps1 changelogs/2026-07-30.md
git add -f grupak-productos-scroll-embed.html hermes-grupak-productos-scroll-embed.html preview-productos.html hermes-preview-productos.html
git commit -m "feat: deliver products widget mobile redesign"
```

- [ ] **Step 6: Hand off the local review URL**

Keep the local server running and provide:

```text
http://127.0.0.1:8026/preview-productos-interactivos.html
```

Do not deploy or push to production.
