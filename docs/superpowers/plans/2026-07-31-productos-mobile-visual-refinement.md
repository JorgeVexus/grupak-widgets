# Productos Mobile Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the approved mobile hero, product index, Papel cards, and Láminas composition without changing the desktop widget.

**Architecture:** Keep the existing continuous mobile flow and desktop board. Add the desktop hero KPI data to the cloned mobile hero through a dedicated mobile-only block, then append one final `max-width: 768px` CSS refinement layer scoped to `.mobile-continuous-flow` so legacy mode styles cannot position or overlap these elements.

**Tech Stack:** Scoped HTML, vanilla CSS, vanilla JavaScript cloning, PowerShell contract tests, Python embed compiler, in-app browser responsive testing.

---

## File map

- `widgets/productos-interactivos/productos-interactivos.html`: add the four desktop-equivalent KPIs to the mobile intro source.
- `widgets/productos-interactivos/productos-interactivos.css`: add the final mobile-only hero, index, Papel, and Láminas layout rules.
- `tests/productos-interactivos-mobile.static.test.ps1`: assert KPI parity, dark hero, compact controls, and normal-flow layouts.
- Generated embeds/previews: regenerate only through `python compile_widgets.py`.

### Task 1: Add failing contracts for the approved visual refinement

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`

- [ ] **Step 1: Add assertions for four KPI values and mobile-only styling**

```powershell
Assert-Match $html 'class="mobile-hero-kpis"' "Missing mobile hero KPI parity block"
Assert-Match $html '>3<' "Missing Plantas KPI"
Assert-Match $html '>6<' "Missing Abastecedoras KPI"
Assert-Match $html '>1957<' "Missing founding-year KPI"
Assert-Match $html '>100%<' "Missing recycled-fiber KPI"
Assert-Match $css '--mobile-hero-background:\s*#383838' "Mobile hero must use #383838"
Assert-Match $css 'MOBILE VISUAL REFINEMENT - FINAL LAYER' "Missing final visual refinement layer"
Assert-Match $css 'grid-template-areas:\s*"copy"\s*"media"\s*"action"' "Product cards must use non-overlapping rows"
Assert-Match $css 'grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)' "Lamina images must form a horizontal row"
```

- [ ] **Step 2: Run the contract and verify RED**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File tests\productos-interactivos-mobile.static.test.ps1
```

Expected: FAIL with `Missing mobile hero KPI parity block`.

### Task 2: Restore desktop KPI parity in the mobile hero

**Files:**
- Modify: `widgets/productos-interactivos/productos-interactivos.html`
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Replace the production KPI grid in the intro pane**

Use a `.mobile-hero-kpis` grid containing the exact desktop values and labels:

```html
<div class="mobile-hero-kpis" aria-label="Datos de Grupak">
    <article class="mobile-hero-kpi"><strong>3</strong><span>Plantas</span><small>Donde fabricamos desde el papel hasta cajas de cartón corrugado</small></article>
    <article class="mobile-hero-kpi"><strong>6</strong><span>Abastecedoras</span><small>De fibra — cartón corrugado reciclado o desechado</small></article>
    <article class="mobile-hero-kpi"><small>Fundada en</small><strong>1957</strong><span>69 Años</span><small>En el mercado de papel y cartón corrugado</small></article>
    <article class="mobile-hero-kpi"><strong>100%</strong><span>Fibra reciclada</span><small>Biodegradable</small></article>
</div>
```

- [ ] **Step 2: Scope the dark surface to the first mobile section**

```css
@media (max-width: 768px) {
    #gpk-products-widget { --mobile-hero-background: #383838; }
    #gpk-products-widget #mobile-intro { background: var(--mobile-hero-background) !important; color: #f7f7f3 !important; }
    #gpk-products-widget #mobile-intro h1,
    #gpk-products-widget #mobile-intro p { color: #f7f7f3 !important; }
    #gpk-products-widget .mobile-hero-kpis { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    #gpk-products-widget .mobile-hero-kpi { display: grid; align-content: center; min-height: 132px; padding: 14px; border: 1px solid rgba(255,255,255,.16); }
}
```

- [ ] **Step 3: Run the contract and verify the KPI assertions pass**

Run the PowerShell contract; expected remaining failures relate only to category layouts.

### Task 3: Rebuild product-index cards in normal flow

**Files:**
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add a deterministic three-row card layout**

```css
@media (max-width: 768px) {
    #gpk-products-widget #mobile-products-index .overview-col-new {
        display: grid !important;
        grid-template-areas: "copy" "media" "action" !important;
        grid-template-columns: 1fr !important;
        grid-template-rows: auto minmax(112px, auto) auto !important;
        gap: 14px !important;
        padding: 20px !important;
    }
    #gpk-products-widget #mobile-products-index .overview-col-title,
    #gpk-products-widget #mobile-products-index .overview-col-desc { grid-area: copy; position: static !important; }
    #gpk-products-widget #mobile-products-index .overview-mobile-img { grid-area: media; position: static !important; width: min(46%, 150px) !important; justify-self: center; }
    #gpk-products-widget #mobile-products-index .overview-col-btn { grid-area: action; width: max-content !important; min-width: 124px; min-height: 44px; justify-self: start; }
}
```

- [ ] **Step 2: Run the contract and verify product-card assertions pass**

Expected: only Papel and Láminas assertions remain.

### Task 4: Normalize Papel spacing and use-label alignment

**Files:**
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add spacing before and between cards**

```css
@media (max-width: 768px) {
    #gpk-products-widget #mobile-papel .papel-products-grid { margin-top: 28px !important; gap: 20px !important; }
    #gpk-products-widget #mobile-papel .product-card { display: grid !important; gap: 12px !important; padding: 16px !important; }
    #gpk-products-widget #mobile-papel .uses-label { display: flex !important; align-items: center !important; min-height: 34px !important; padding: 7px 12px !important; line-height: 1.15 !important; }
}
```

- [ ] **Step 2: Verify at 320 and 390 px that the first card does not touch the intro copy**

Expected: at least 28 px between the last intro block and ClassicPak; pill text is vertically centered.

### Task 5: Recompose Láminas text and media

**Files:**
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Stack text above a two-image row**

```css
@media (max-width: 768px) {
    #gpk-products-widget #mobile-lamina .laminas-spec-group.spec-group-1 { display: grid !important; grid-template-columns: 1fr !important; gap: 16px !important; }
    #gpk-products-widget #mobile-lamina .spec-text-box { width: 100% !important; min-width: 0 !important; }
    #gpk-products-widget #mobile-lamina .spec-image-box { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 12px !important; width: 100% !important; }
    #gpk-products-widget #mobile-lamina .spec-frame-wrapper { width: 100% !important; min-height: 150px !important; }
    #gpk-products-widget #mobile-lamina .spec-img { width: 100% !important; height: 100% !important; object-fit: contain !important; }
}
```

- [ ] **Step 2: Verify the title stays inside the card and both images share one row**

Expected: no clipping, overlap, or horizontal overflow at all agreed widths.

### Task 6: Compile and verify mobile and desktop

**Files:**
- Generate: embeds and previews through `compile_widgets.py`

- [ ] **Step 1: Run final automated checks**

```powershell
powershell -ExecutionPolicy Bypass -File tests\productos-interactivos-mobile.static.test.ps1
git diff --check
python compile_widgets.py
```

Expected: contract PASS, no whitespace errors, and all embeds/previews compiled.

- [ ] **Step 2: Inspect 320, 375, 390, 430, and 768 px in the local browser**

Confirm the four KPIs, compact product buttons, card containment, Papel spacing, centered pills, horizontal Láminas images, and zero horizontal overflow.

- [ ] **Step 3: Inspect 1440 px desktop**

Confirm `.mobile-continuous-flow` remains hidden and the existing desktop board is unchanged.

- [ ] **Step 4: Hand off the cache-busted local preview**

Provide `http://127.0.0.1:8026/preview-productos-interactivos.html?continuous=9` and do not push or deploy before user approval.

### Task 7: Separate Láminas technical media from adjacent cards

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add a failing normal-flow contract**

```powershell
Assert-Match $css '(?s)#mobile-lamina \.laminas-spec-group\s*\{[^}]*grid-template-columns:\s*1fr' "Lamina specification must stack text and image"
Assert-Match $css '(?s)#mobile-lamina \.spec-image-box\s*\{[^}]*position:\s*static' "Lamina technical image must stay in flow"
Assert-Match $css '(?s)#mobile-lamina \.laminas-spec-group\s*\{[^}]*margin-bottom:\s*24px' "Lamina specification groups need separation"
```

- [ ] **Step 2: Run the contract and verify RED**

Expected: FAIL with `Lamina specification must stack text and image`.

- [ ] **Step 3: Stack each technical group**

```css
@media (max-width: 768px) {
    #gpk-products-widget #mobile-lamina .laminas-spec-group {
        position: static !important;
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 16px !important;
        margin: 0 0 24px !important;
    }
    #gpk-products-widget #mobile-lamina .spec-text-box,
    #gpk-products-widget #mobile-lamina .spec-image-box,
    #gpk-products-widget #mobile-lamina .spec-frame-wrapper {
        position: static !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        transform: none !important;
    }
    #gpk-products-widget #mobile-lamina .spec-img {
        position: static !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        max-height: 320px !important;
        object-fit: cover !important;
        transform: none !important;
    }
}
```

### Task 8: Pair Cajas text and media with consistent spacing

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add a failing spacing contract**

```powershell
Assert-Match $css '(?s)#mobile-cajas \.cajas-convencionales-content\s*\{[^}]*gap:\s*28px' "Conventional Cajas media needs separation"
Assert-Match $css '(?s)#mobile-cajas \.digital-content-wrapper\s*\{[^}]*gap:\s*28px' "Digital Cajas media needs separation"
```

- [ ] **Step 2: Run the contract and verify RED**

Expected: FAIL with `Conventional Cajas media needs separation`.

- [ ] **Step 3: Normalize both text/image pairs**

```css
@media (max-width: 768px) {
    #gpk-products-widget #mobile-cajas .cajas-convencionales-content,
    #gpk-products-widget #mobile-cajas .digital-content-wrapper {
        position: static !important;
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 28px !important;
        margin-bottom: 28px !important;
    }
    #gpk-products-widget #mobile-cajas .cajas-image-container,
    #gpk-products-widget #mobile-cajas .cajas-text-container,
    #gpk-products-widget #mobile-cajas .digital-text-content,
    #gpk-products-widget #mobile-cajas .digital-image-container {
        position: static !important;
        width: 100% !important;
        margin: 0 !important;
        transform: none !important;
    }
}
```

### Task 9: Reveal and integrate the three Energía images

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add a failing three-image contract**

```powershell
Assert-Match $html 'energia-eficiencia\.webp' "Missing efficiency image"
Assert-Match $html 'energia-impacto\.webp' "Missing impact image"
Assert-Match $html 'energia-suministro\.webp' "Missing supply image"
Assert-Match $css '(?s)#mobile-energia \.energia-mobile-image-container\s*\{[^}]*display:\s*block' "Energy images must be visible"
```

- [ ] **Step 2: Run the contract and verify RED**

Expected: FAIL with `Energy images must be visible`.

- [ ] **Step 3: Build editorial image/text rows**

```css
@media (max-width: 768px) {
    #gpk-products-widget #mobile-energia .energia-row {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 16px !important;
        padding: 0 0 28px !important;
        border-bottom: 1px solid rgba(68, 75, 69, .18) !important;
    }
    #gpk-products-widget #mobile-energia .energia-mobile-image-container {
        position: static !important;
        display: block !important;
        width: 100% !important;
        aspect-ratio: 16 / 9 !important;
        overflow: hidden !important;
    }
    #gpk-products-widget #mobile-energia .energia-mobile-image {
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
    }
}
```

### Task 10: Compile and verify the media-flow refinement

**Files:**
- Generate: embeds and previews through `compile_widgets.py`

- [ ] **Step 1: Run automated verification**

```powershell
powershell -ExecutionPolicy Bypass -File tests\productos-interactivos-mobile.static.test.ps1
git diff --check
python compile_widgets.py
```

- [ ] **Step 2: Verify at 320, 390, 430, and 768 px**

Confirm zero intersections between Láminas images and adjacent cards, 28 px Cajas gaps, three visible Energía images, preserved aspect ratios, and zero horizontal overflow.

- [ ] **Step 3: Verify desktop isolation at 1440 px**

Confirm the mobile flow is hidden and the desktop board remains visible.

- [ ] **Step 4: Hand off local preview**

Provide `http://127.0.0.1:8026/preview-productos-interactivos.html?continuous=10` without push or deployment.

### Task 11: Apply final mobile spacing and image scale

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add failing value contracts**

```powershell
Assert-Match $css '(?s)#mobile-cajas \.digital-content-wrapper\s*\{[^}]*gap:\s*44px' "Digital Cajas needs 44px media separation"
Assert-Match $css '(?s)#mobile-products-index \.overview-mobile-img\s*\{[^}]*max-width:\s*180px' "Overview images need the approved scale"
Assert-Match $css '(?s)#mobile-products-index \.overview-mobile-img\s*\{[^}]*height:\s*148px' "Overview image zone needs the approved height"
Assert-Match $css '(?s)#mobile-intro \.intro-mobile-desc\s*\{[^}]*padding:\s*18px 20px' "Hero copy card needs lateral padding"
```

- [ ] **Step 2: Run the contract and verify RED**

Expected: FAIL with `Digital Cajas needs 44px media separation`.

- [ ] **Step 3: Add the final mobile-only overrides**

```css
@media (max-width: 768px) {
    #gpk-products-widget #mobile-cajas .digital-content-wrapper { gap: 44px !important; }
    #gpk-products-widget #mobile-products-index .overview-mobile-img {
        width: min(58%, 180px) !important;
        max-width: 180px !important;
        height: 148px !important;
    }
    #gpk-products-widget #mobile-intro .intro-mobile-desc { padding: 18px 20px !important; }
}
```

- [ ] **Step 4: Verify and compile**

```powershell
powershell -ExecutionPolicy Bypass -File tests\productos-interactivos-mobile.static.test.ps1
git diff --check
python compile_widgets.py
```

- [ ] **Step 5: Inspect 320, 390, 430, and 768 px and hand off**

Confirm 44 px between digital text and image, larger centered overview images, padded hero copy, no overlap, and zero horizontal overflow. Provide `http://127.0.0.1:8026/preview-productos-interactivos.html?continuous=11` without push.

### Task 12: Make all four mobile product anchors functional

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.js`

- [ ] **Step 1: Add failing navigation contracts**

```powershell
Assert-Match $js 'link\.addEventListener\("click"' "Mobile overview anchors need explicit navigation"
Assert-Match $js 'scrollToMobileTarget\(targetId\)' "Mobile overview anchors must use the section scroller"
```

- [ ] **Step 2: Run the contract and verify RED**

Expected: FAIL with `Mobile overview anchors need explicit navigation`.

- [ ] **Step 3: Attach explicit behavior while creating each anchor**

```javascript
link.addEventListener("click", event => {
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    event.preventDefault();
    event.stopPropagation();
    scrollToMobileTarget(targetId);
});
```

- [ ] **Step 4: Verify all four destinations in the browser**

Click Papel, Lámina, Cajas, and Grabados and verify each destination approaches 18 px from the viewport top.

### Task 13: Isolate the sticky bar from Papel content

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add failing layer contracts**

```powershell
Assert-Match $css '(?s)\.mobile-scroll-status\s*\{[^}]*z-index:\s*100' "Sticky bar needs the top mobile layer"
Assert-Match $css '(?s)\.mobile-scroll-status\s*\{[^}]*isolation:\s*isolate' "Sticky bar needs an isolated stacking context"
Assert-Match $css '(?s)#mobile-papel\s*\{[^}]*padding-bottom:\s*100px' "Papel needs sticky-bar clearance"
```

- [ ] **Step 2: Run the contract and verify RED**

Expected: FAIL with `Sticky bar needs the top mobile layer`.

- [ ] **Step 3: Add final mobile layer protection**

```css
@media (max-width: 768px) {
    #gpk-products-widget .mobile-scroll-status {
        z-index: 100 !important;
        isolation: isolate !important;
        background: #d9d9d9 !important;
    }
    #gpk-products-widget #mobile-papel { padding-bottom: 100px !important; }
    #gpk-products-widget #mobile-papel .papel-main-image,
    #gpk-products-widget #mobile-papel .papel-text-block,
    #gpk-products-widget #mobile-papel .product-card { z-index: 0 !important; }
}
```

### Task 14: Compile and verify navigation and layering

**Files:**
- Generate: embeds and previews through `compile_widgets.py`

- [ ] **Step 1: Run automated verification**

```powershell
powershell -ExecutionPolicy Bypass -File tests\productos-interactivos-mobile.static.test.ps1
git diff --check
python compile_widgets.py
```

- [ ] **Step 2: Verify responsive behavior at 320, 390, 430, and 768 px**

Confirm all four jumps work, the bar remains visually above Papel, the bar background is opaque, and horizontal overflow remains zero.

- [ ] **Step 3: Verify desktop at 1440 px and hand off**

Confirm the desktop board remains visible, then provide `http://127.0.0.1:8026/preview-productos-interactivos.html?continuous=12` without push.

### Task 15: Restore the two production KPIs in slide 0

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.html`

- [ ] **Step 1: Replace hero-KPI assertions with separate hero and slide-0 contracts**

```powershell
Assert-Match $html 'class="intro-kpis-grid-new"' "Slide 0 production KPIs are missing"
Assert-Match $html '\+300,000' "Slide 0 paper-recycling KPI is missing"
Assert-Match $html '\+234,000' "Slide 0 corrugated-cardboard KPI is missing"
Assert-Match $html '(?s)gpk-hero-home.*?>3<.*?>6<.*?>1957<.*?>100%<' "Hero KPIs must remain unchanged"
```

- [ ] **Step 2: Run the contract and verify RED**

Expected: FAIL with `Slide 0 production KPIs are missing`.

- [ ] **Step 3: Restore the existing `.intro-kpis-grid-new` markup**

Add only the two approved `.kpi-item-new` entries with `+300,000` and `+234,000`; remove `.mobile-hero-kpis` from slide 0.

### Task 16: Mount and autoplay the real hero on mobile

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.js`
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add failing mobile-hero contracts**

```powershell
Assert-Match $js 'root\.insertBefore\(heroHome, tracker\)' "Mobile hero must mount before the scroll flow"
Assert-Match $css '--mobile-site-header-clearance:\s*88px' "Mobile hero needs live-menu clearance"
Assert-Match $css '(?s)MOBILE REAL HERO.*?\.gpk-hero-home\s*\{[^}]*position:\s*relative' "Mobile hero must stay in document flow"
Assert-Match $css '(?s)MOBILE REAL HERO.*?\.gpk-hero-home\s*\{[^}]*display:\s*flex' "Mobile hero must be visible"
```

- [ ] **Step 2: Run the contract and verify RED**

Expected: FAIL with `Mobile hero must mount before the scroll flow`.

- [ ] **Step 3: Insert the real hero before the tracker on mobile**

```javascript
if (heroHome && heroHome.parentElement !== root) {
    if (window.matchMedia("(max-width: 768px)").matches && tracker) {
        root.insertBefore(heroHome, tracker);
    } else {
        root.appendChild(heroHome);
    }
}
```

- [ ] **Step 4: Add the final mobile hero layer**

```css
/* MOBILE REAL HERO - FINAL LAYER */
@media (max-width: 768px) {
    #gpk-products-widget { --mobile-site-header-clearance: 88px; }
    #gpk-products-widget .gpk-hero-home {
        position: relative !important;
        inset: auto !important;
        display: flex !important;
        width: 100% !important;
        height: auto !important;
        min-height: 100svh !important;
        padding: calc(var(--mobile-site-header-clearance) + env(safe-area-inset-top)) 14px 40px !important;
    }
    #gpk-products-widget #mobile-intro { background: #d9d9d9 !important; color: #444b45 !important; }
}
```

- [ ] **Step 5: Verify video state**

Confirm the visible `.gpk-hero-home-video` has `autoplay`, `muted`, `loop`, `playsinline`, `paused === false`, and non-zero dimensions.

### Task 17: Compile and validate hero/slide separation

**Files:**
- Generate: embeds and previews through `compile_widgets.py`

- [ ] **Step 1: Run automated verification**

```powershell
powershell -ExecutionPolicy Bypass -File tests\productos-interactivos-mobile.static.test.ps1
git diff --check
python compile_widgets.py
```

- [ ] **Step 2: Verify mobile at 320, 390, 430, and 768 px**

Confirm order hero → slide 0 → products, four hero KPIs, two slide-0 KPIs, live video, menu clearance, and zero horizontal overflow.

- [ ] **Step 3: Verify desktop at 1440 px**

Confirm four hero KPIs remain unchanged and slide 0 shows only the two production KPIs in the existing horizontal design.

### Task 18: Lock the mobile hero KPIs to a 2×2 grid

**Files:**
- Modify: `tests/productos-interactivos-mobile.static.test.ps1`
- Modify: `widgets/productos-interactivos/productos-interactivos.css`

- [ ] **Step 1: Add a failing static contract**

Require the final mobile layer for `.mobile-hero-kpis` to use
`grid-template-columns: repeat(2, minmax(0, 1fr))`, and require explicit vertical
spacing between the video, description, and KPI grid.

- [ ] **Step 2: Run the contract and confirm RED**

Run `powershell -ExecutionPolicy Bypass -File tests\productos-interactivos-mobile.static.test.ps1`.
Expected: FAIL because the final mobile layer does not yet lock the KPI grid.

- [ ] **Step 3: Add the minimal mobile-only CSS**

In the final `@media (max-width: 768px)` layer, set the KPI container to a
two-column grid with a 10 px gap, give the description a bottom margin, and keep
each card at full width with sufficient minimum height and no overlap.

- [ ] **Step 4: Verify GREEN and compile**

Run the static contract, `git diff --check`, and `python compile_widgets.py`.
Expected: PASS, no whitespace errors, and both embeds/previews compiled.

- [ ] **Step 5: Verify responsive behavior**

At 320, 390, 430, and 768 px confirm four visible KPI cards, two columns,
zero overlap, zero horizontal overflow, and a playing video. At 1440 px confirm
the desktop hero and production KPI layout are unchanged.

- [ ] **Step 4: Hand off local preview**

Provide `http://127.0.0.1:8026/preview-productos-interactivos.html?continuous=13` without push.
