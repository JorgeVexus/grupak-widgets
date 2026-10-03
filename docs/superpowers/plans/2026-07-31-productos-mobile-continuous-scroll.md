# Productos Mobile Continuous Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile 15-state arrow navigation with one continuous vertical document while preserving the complete desktop widget.

**Architecture:** Keep the existing desktop board, modes, and scroll controller unchanged above 768 px. On mobile, add a dedicated `.mobile-continuous-flow` that reuses the existing content nodes in document order, navigates through stable anchors, and reports the active category through `IntersectionObserver`; CSS makes that flow authoritative and hides the legacy board navigation.

**Tech Stack:** Scoped HTML, vanilla CSS, vanilla JavaScript, IntersectionObserver, PowerShell contract tests, Python embed compiler, in-app browser responsive testing.

---

## File map

- `widgets/productos-interactivos/productos-interactivos.html`: add mobile flow wrapper, section anchors, and sticky orientation bar.
- `widgets/productos-interactivos/productos-interactivos.js`: initialize continuous mobile navigation, anchor jumps, progress, and resize cleanup.
- `widgets/productos-interactivos/productos-interactivos.css`: define gray mobile hero, continuous section layout, sticky bar, and strict desktop isolation.
- `tests/productos-interactivos-mobile.static.test.ps1`: replace the state-navigation assertions with continuous-flow contracts.
- `changelogs/2026-07-31.md`: document the navigation change and local build.
- Generated embeds/previews: produced only through `python compile_widgets.py`.

### Task 1: Replace the old mobile contract with a failing continuous-flow contract

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`

- [ ] **Step 1: Add contract assertions**

Replace assertions for `activePane.scrollTo`, arrow sizing, and fixed board overflow with:

```powershell
Assert-Match $html 'class="mobile-continuous-flow"' "Missing continuous mobile flow"
Assert-Match $html 'id="mobile-products-index"' "Missing products index anchor"
Assert-Match $html 'data-mobile-section="papel"' "Missing Papel anchor"
Assert-Match $html 'data-mobile-section="lamina"' "Missing Lamina anchor"
Assert-Match $html 'data-mobile-section="cajas"' "Missing Cajas anchor"
Assert-Match $html 'data-mobile-section="grabados"' "Missing Grabados anchor"
Assert-Match $html 'class="mobile-scroll-status"' "Missing sticky scroll status"
Assert-Match $css '--mobile-desktop-grey:\s*#d9d9d9' "Hero background must match desktop"
Assert-Match $css '(?s)\.mobile-continuous-flow\s*\{[^}]*display:\s*block' "Continuous flow is not enabled on mobile"
Assert-Match $css '(?s)\.products-nav-footer\s*\{[^}]*display:\s*none' "Legacy arrows must be hidden on mobile"
Assert-Match $js 'IntersectionObserver' "Missing section observer"
Assert-Match $js 'scrollIntoView' "Missing anchor navigation"
Assert-Match $js 'mobileContinuousSections' "Missing continuous section registry"
```

- [ ] **Step 2: Run the contract and verify RED**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/productos-interactivos-mobile.static.test.ps1
```

Expected: FAIL with `Missing continuous mobile flow`.

### Task 2: Add semantic mobile flow and anchor navigation

**Files:**
- Modify: `widgets/productos-interactivos/productos-interactivos.html`
- Modify: `widgets/productos-interactivos/productos-interactivos.js`
- Test: `tests/productos-interactivos-mobile.static.test.ps1`

- [ ] **Step 1: Add the mobile flow container after the desktop board**

Use the existing content as the source and add an empty semantic mount plus sticky status:

```html
<div class="mobile-continuous-flow" id="mobile-continuous-flow" aria-label="Productos Grupak"></div>
<nav class="mobile-scroll-status" aria-label="Navegación de productos">
    <button class="mobile-index-link" type="button" data-scroll-target="mobile-products-index">Productos</button>
    <span id="mobile-continuous-section">Introducción</span>
    <span class="mobile-continuous-track" aria-hidden="true">
        <span id="mobile-continuous-progress"></span>
    </span>
</nav>
```

- [ ] **Step 2: Build the section registry in JavaScript**

Inside `initWidget()` define:

```javascript
const mobileContinuousSections = [
    { id: "mobile-intro", label: "Introducción", selectors: ["#intro-pane"] },
    { id: "mobile-products-index", label: "Productos", selectors: ["#overview-pane"] },
    { id: "mobile-papel", label: "Papel", selectors: ["#pane-papel"] },
    { id: "mobile-lamina", label: "Lámina", selectors: ["#pane-laminas", "#pane-laminas-specs"] },
    { id: "mobile-cajas", label: "Cajas", selectors: ["#pane-cajas"] },
    { id: "mobile-grabados", label: "Grabados", selectors: ["#pane-grabados"] },
    { id: "mobile-energia", label: "Energía", selectors: ["#pane-energia"] }
];
```

- [ ] **Step 3: Clone source content into stable mobile sections**

Add `buildMobileContinuousFlow()`:

```javascript
function buildMobileContinuousFlow() {
    const flow = root.querySelector("#mobile-continuous-flow");
    if (!flow || flow.childElementCount) return;

    mobileContinuousSections.forEach(section => {
        const wrapper = document.createElement("section");
        wrapper.id = section.id;
        wrapper.className = "mobile-flow-section";
        wrapper.dataset.mobileSection = section.label.toLowerCase();

        section.selectors.forEach(selector => {
            const source = board.querySelector(selector);
            if (source) wrapper.appendChild(source.cloneNode(true));
        });
        flow.appendChild(wrapper);
    });
}
```

- [ ] **Step 4: Convert overview buttons and sticky action to anchors**

Add:

```javascript
const mobileSlideTargets = { 2: "mobile-papel", 4: "mobile-lamina", 5: "mobile-cajas", 8: "mobile-grabados" };

root.addEventListener("click", event => {
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    const trigger = event.target.closest("[data-target-slide], [data-scroll-target]");
    if (!trigger) return;
    const targetId = trigger.dataset.scrollTarget || mobileSlideTargets[Number(trigger.dataset.targetSlide)];
    const target = targetId && root.querySelector(`#${targetId}`);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
});
```

- [ ] **Step 5: Observe sections and update orientation**

Add `initMobileContinuousObserver()`:

```javascript
function initMobileContinuousObserver() {
    const label = root.querySelector("#mobile-continuous-section");
    const progress = root.querySelector("#mobile-continuous-progress");
    const sections = Array.from(root.querySelectorAll(".mobile-flow-section"));
    if (!label || !progress || !sections.length) return;

    const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = sections.indexOf(visible.target);
        label.textContent = mobileContinuousSections[index].label;
        progress.style.transform = `scaleX(${(index + 1) / sections.length})`;
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.2, 0.5] });

    sections.forEach(section => observer.observe(section));
}
```

- [ ] **Step 6: Initialize after the existing HTML has loaded**

```javascript
buildMobileContinuousFlow();
initMobileContinuousObserver();
```

- [ ] **Step 7: Run the contract**

Expected: remaining failures relate only to CSS continuous-flow rules.

### Task 3: Build the continuous mobile layout and desktop-gray hero

**Files:**
- Modify: `widgets/productos-interactivos/productos-interactivos.css`
- Test: `tests/productos-interactivos-mobile.static.test.ps1`

- [ ] **Step 1: Keep the mount hidden outside mobile**

```css
#gpk-products-widget .mobile-continuous-flow,
#gpk-products-widget .mobile-scroll-status {
    display: none;
}
```

- [ ] **Step 2: Add the final mobile continuous layer**

Append after every legacy mobile rule:

```css
/* MOBILE CONTINUOUS FLOW - FINAL LAYER */
@media (max-width: 768px) {
    #gpk-products-widget {
        --mobile-desktop-grey: #d9d9d9;
        background: var(--mobile-desktop-grey) !important;
        overflow-x: clip !important;
    }

    #gpk-products-widget .products-scroll-tracker,
    #gpk-products-widget .products-viewport,
    #gpk-products-widget #products-board {
        display: none !important;
    }

    #gpk-products-widget .mobile-continuous-flow {
        display: block !important;
        width: 100%;
        background: var(--mobile-desktop-grey);
    }

    #gpk-products-widget .mobile-flow-section {
        display: block;
        width: 100%;
        padding: 42px clamp(16px, 5vw, 22px);
        scroll-margin-top: 18px;
        border-bottom: 1px solid rgba(70, 79, 71, 0.18);
    }

    #gpk-products-widget .mobile-flow-section:first-child {
        padding-top: max(34px, env(safe-area-inset-top));
        background: var(--mobile-desktop-grey);
    }

    #gpk-products-widget .mobile-flow-section .details-pane,
    #gpk-products-widget .mobile-flow-section .products-intro-pane,
    #gpk-products-widget .mobile-flow-section .products-overview-pane {
        position: static !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
        opacity: 1 !important;
        transform: none !important;
    }

    #gpk-products-widget .products-nav-footer {
        display: none !important;
    }
}
```

- [ ] **Step 3: Style the sticky status**

```css
@media (max-width: 768px) {
    #gpk-products-widget .mobile-scroll-status {
        position: sticky;
        bottom: 0;
        z-index: 8;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 14px;
        align-items: center;
        min-height: 66px;
        padding: 9px 16px calc(9px + env(safe-area-inset-bottom));
        border-top: 1px solid rgba(70, 79, 71, 0.2);
        background: rgba(217, 217, 217, 0.94);
        backdrop-filter: blur(14px);
    }

    #gpk-products-widget .mobile-index-link {
        min-height: 44px;
        padding: 0 14px;
        border: 1px solid #5f9d2f;
        border-radius: 999px;
        background: transparent;
        color: #31501f;
        font-weight: 700;
    }

    #gpk-products-widget .mobile-continuous-track {
        grid-column: 2;
        height: 3px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(49, 80, 31, 0.18);
    }

    #gpk-products-widget #mobile-continuous-progress {
        display: block;
        width: 100%;
        height: 100%;
        transform: scaleX(0.142857);
        transform-origin: left;
        background: #5f9d2f;
    }
}
```

- [ ] **Step 4: Normalize cloned mode content**

Append the explicit normal-flow contract:

```css
@media (max-width: 768px) {
    #gpk-products-widget .mobile-continuous-flow .papel-intro-content,
    #gpk-products-widget .mobile-continuous-flow .papel-grid-content,
    #gpk-products-widget .mobile-continuous-flow .laminas-intro-content,
    #gpk-products-widget .mobile-continuous-flow .laminas-spec-group,
    #gpk-products-widget .mobile-continuous-flow .cajas-intro-content,
    #gpk-products-widget .mobile-continuous-flow .cajas-convencionales-content,
    #gpk-products-widget .mobile-continuous-flow .cajas-digital-content,
    #gpk-products-widget .mobile-continuous-flow .grabados-green-card,
    #gpk-products-widget .mobile-continuous-flow .energia-row {
        position: static !important;
        display: grid !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        opacity: 1 !important;
        transform: none !important;
    }

    #gpk-products-widget .mobile-continuous-flow .papel-products-grid,
    #gpk-products-widget .mobile-continuous-flow .laminas-specs-container,
    #gpk-products-widget .mobile-continuous-flow .grabados-cards-grid-new,
    #gpk-products-widget .mobile-continuous-flow .energia-rows {
        display: grid !important;
        grid-template-columns: 1fr !important;
        grid-auto-rows: max-content !important;
        gap: 16px !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
    }

    #gpk-products-widget .mobile-continuous-flow .product-card,
    #gpk-products-widget .mobile-continuous-flow .energia-row {
        height: max-content !important;
        overflow: visible !important;
    }
}
```

- [ ] **Step 5: Run the contract and verify GREEN**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests/productos-interactivos-mobile.static.test.ps1
git diff --check
```

Expected: `Productos Interactivos mobile contract: PASS` and no whitespace errors.

### Task 4: Browser verification, compilation, and local handoff

**Files:**
- Modify: `changelogs/2026-07-31.md`
- Generate: embeds and previews through `compile_widgets.py`

- [ ] **Step 1: Compile**

```powershell
python compile_widgets.py
```

Expected: both embeds and both previews compile successfully.

- [ ] **Step 2: Verify mobile structure at 390 × 844**

Confirm in the browser:

```text
hero background matches #d9d9d9
all seven category sections are present
no previous/next arrows are visible
page scrollHeight exceeds viewport height
document horizontal overflow equals 0
sticky action is at least 44px high
console has zero errors
```

- [ ] **Step 3: Verify anchor behavior**

Click Papel, Lámina, Cajas, and Grabados from the index and verify each target's
top approaches the viewport top. Click “Productos” from the sticky bar and
verify the index returns into view.

- [ ] **Step 4: Verify responsive boundaries**

Repeat structural checks at 320 × 568, 375 × 667, 430 × 932, and 768 × 1024.

- [ ] **Step 5: Verify desktop isolation**

At 1440 × 1000 confirm:

```text
.mobile-continuous-flow display is none
.mobile-scroll-status display is none
#products-board remains visible and scaled
desktop arrows and mode navigation remain functional
```

- [ ] **Step 6: Add changelog entry**

```markdown
## Productos Interactivos (`widgets/productos-interactivos`)
- **Mobile / UX**: Reemplazada la navegación por flechas con scroll vertical continuo.
- **Mobile / Navigation**: Añadidos índice con anclas, categoría activa y progreso sticky.
- **Mobile / Visual**: Alineado el hero con el fondo gris de la versión de escritorio.
- **Build**: Recompilados embeds y previews para revisión local.
```

- [ ] **Step 7: Run final verification**

```powershell
powershell -ExecutionPolicy Bypass -File tests/productos-interactivos-mobile.static.test.ps1
python compile_widgets.py
git diff --check
```

Expected: contract PASS, compilation success, and no whitespace errors.

- [ ] **Step 8: Hand off local URL**

Keep the local server running and provide:

```text
http://127.0.0.1:8026/preview-productos-interactivos.html?continuous=1
```

Do not push or deploy until the user approves the screen-by-screen review.
