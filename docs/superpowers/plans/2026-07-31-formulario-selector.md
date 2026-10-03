# Formulario Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present three Grupak-branded choices before showing any form, then keep the selector visible and compact while the selected form is open.

**Architecture:** Keep the existing `contacto`, `proveedor`, and `trabajo` identifiers and submission logic. Change the current tab strip into descriptive cards, remove the initial active state from markup, and let the existing `selectTab` function activate a panel while adding a compact selector state to the widget.

**Tech Stack:** Semantic HTML, vanilla CSS, vanilla JavaScript, Node.js built-in test runner.

---

## File map

- Create `widgets/formulario/formulario.contract.test.js`: static contract tests for initial markup, labels, styling hooks, and activation behavior.
- Modify `widgets/formulario/formulario.html`: add selector heading/supporting copy, card descriptions, and remove the default active form.
- Modify `widgets/formulario/formulario.css`: implement the three-card Grupak layout, compact selected state, responsive stacking, focus states, and reduced motion.
- Modify `widgets/formulario/formulario.js`: activate the compact selector state after a valid selection and scroll user-triggered choices to the selected panel.
- Modify `changelogs/2026-07-31.md`: record the user-facing navigation change and QA result.

### Task 1: Lock the selector contract with failing tests

**Files:**
- Create: `widgets/formulario/formulario.contract.test.js`

- [ ] **Step 1: Write the failing contract tests**

```js
"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var test = require("node:test");

var directory = __dirname;
var html = fs.readFileSync(path.join(directory, "formulario.html"), "utf8");
var styles = fs.readFileSync(path.join(directory, "formulario.css"), "utf8");
var script = fs.readFileSync(path.join(directory, "formulario.js"), "utf8");

test("starts with three choices and no active form", function () {
    assert.match(html, /¿Qué deseas hacer\?/);
    assert.equal((html.match(/class="gpk-form-tab"/g) || []).length, 3);
    assert.doesNotMatch(html, /gpk-form-tab is-active/);
    assert.doesNotMatch(html, /gpk-form-panel is-active/);
});

test("uses the approved labels and descriptions", function () {
    assert.match(html, />Solicitar cotización</);
    assert.match(html, /Productos y soluciones/);
    assert.match(html, /Registro comercial/);
    assert.match(html, /Talento y vacantes/);
});

test("defines selected, responsive, focus and reduced-motion states", function () {
    assert.match(styles, /\.gpk-form-tabs\.has-selection/);
    assert.match(styles, /\.gpk-form-tab:focus-visible/);
    assert.match(styles, /@media \(max-width: 719px\)[\s\S]*grid-template-columns: 1fr/);
    assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("compacts only after a valid selection and scrolls to the panel", function () {
    assert.match(script, /if \(!found\) return false;[\s\S]*classList\.add\("has-selection"\)/);
    assert.match(script, /activePanel\.scrollIntoView\(\{ behavior: "smooth", block: "start" \}\)/);
});
```

- [ ] **Step 2: Run the tests and confirm the new contract fails**

Run: `node --test widgets/formulario/formulario.contract.test.js`

Expected: FAIL because the initial markup still marks “Contacto” and its panel active, and the new card hooks do not exist.

- [ ] **Step 3: Commit the failing tests**

```powershell
git add widgets/formulario/formulario.contract.test.js
git commit -m "test: define form selector contract"
```

### Task 2: Add the initial three-card selector markup

**Files:**
- Modify: `widgets/formulario/formulario.html:2-9`
- Test: `widgets/formulario/formulario.contract.test.js`

- [ ] **Step 1: Replace the current tab header and remove default active classes**

Use this structure while leaving all form fields unchanged:

```html
<div class="gpk-form-chooser">
    <p class="gpk-form-eyebrow">Formularios Grupak</p>
    <h2 class="gpk-form-heading">¿Qué deseas hacer?</h2>
    <p class="gpk-form-helper">Selecciona una opción para mostrar el formulario correspondiente.</p>

    <div class="gpk-form-tabs" role="tablist" aria-label="Formularios Grupak">
        <button type="button" class="gpk-form-tab" data-gpk-tab="contacto" role="tab" aria-selected="false">
            <span class="gpk-form-tab-title">Solicitar cotización</span>
            <span class="gpk-form-tab-desc">Productos y soluciones</span>
            <span class="gpk-form-tab-arrow" aria-hidden="true">→</span>
        </button>
        <button type="button" class="gpk-form-tab" data-gpk-tab="proveedor" role="tab" aria-selected="false">
            <span class="gpk-form-tab-title">Quiero ser proveedor</span>
            <span class="gpk-form-tab-desc">Registro comercial</span>
            <span class="gpk-form-tab-arrow" aria-hidden="true">→</span>
        </button>
        <button type="button" class="gpk-form-tab" data-gpk-tab="trabajo" role="tab" aria-selected="false">
            <span class="gpk-form-tab-title">Quiero trabajar en Grupak</span>
            <span class="gpk-form-tab-desc">Talento y vacantes</span>
            <span class="gpk-form-tab-arrow" aria-hidden="true">→</span>
        </button>
    </div>
</div>

<form class="gpk-form-panel" data-gpk-panel="contacto" data-gpk-form="contacto" role="tabpanel">
```

- [ ] **Step 2: Run the focused contract tests**

Run: `node --test widgets/formulario/formulario.contract.test.js`

Expected: markup tests PASS; CSS and activation tests remain FAIL.

- [ ] **Step 3: Commit the semantic markup**

```powershell
git add widgets/formulario/formulario.html widgets/formulario/formulario.contract.test.js
git commit -m "feat: add initial form choices"
```

### Task 3: Style the selector with Grupak colors and responsive states

**Files:**
- Modify: `widgets/formulario/formulario.css:20-87`
- Test: `widgets/formulario/formulario.contract.test.js`

- [ ] **Step 1: Replace the old tab-strip rules with card rules**

Implement these behaviors using the existing CSS variables:

```css
.gpk-form-chooser {
    padding: 42px 48px 46px;
    background: var(--gpk-form-field);
    border-bottom: 1px dashed var(--gpk-form-line);
}

.gpk-form-eyebrow,
.gpk-form-heading,
.gpk-form-helper {
    text-align: left;
}

.gpk-form-eyebrow {
    margin: 0 0 8px;
    color: var(--gpk-form-green-dark);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
}

.gpk-form-heading {
    margin: 0;
    color: var(--gpk-form-ink);
    font: 700 28px/1.2 var(--gpk-form-font-title);
}

.gpk-form-helper {
    margin: 8px 0 24px;
    color: var(--gpk-form-muted);
    font-size: 14px;
}

.gpk-form-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
}

.gpk-form-tab {
    min-width: 0;
    min-height: 142px;
    padding: 22px;
    border: 1px solid var(--gpk-form-line);
    border-radius: 12px;
    background: var(--gpk-form-white);
    color: var(--gpk-form-ink);
    cursor: pointer;
    text-align: left;
    transition: transform 220ms ease, border-color 220ms ease, background-color 220ms ease, color 220ms ease;
}

.gpk-form-tab:hover {
    border-color: var(--gpk-form-green);
    transform: translateY(-2px);
}

.gpk-form-tab:active {
    transform: translateY(0) scale(.98);
}

.gpk-form-tab:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--gpk-form-green) 35%, transparent);
    outline-offset: 3px;
}

.gpk-form-tab.is-active {
    border-color: var(--gpk-form-green);
    background: var(--gpk-form-green);
    color: var(--gpk-form-white);
}

.gpk-form-tab-title,
.gpk-form-tab-desc,
.gpk-form-tab-arrow {
    display: block;
}

.gpk-form-tab-title { font-size: 17px; font-weight: 700; }
.gpk-form-tab-desc { margin-top: 8px; font-size: 13px; opacity: .78; }
.gpk-form-tab-arrow { margin-top: 18px; font-size: 20px; }

.gpk-form-tabs.has-selection .gpk-form-tab {
    min-height: 94px;
    padding: 16px 18px;
}

.gpk-form-tabs.has-selection .gpk-form-tab-desc,
.gpk-form-tabs.has-selection .gpk-form-tab-arrow {
    display: none;
}
```

- [ ] **Step 2: Replace the mobile tab rules and add reduced-motion support**

```css
@media (max-width: 719px) {
    .gpk-form-chooser { padding: 30px 18px 32px; }
    .gpk-form-heading { font-size: 24px; }
    .gpk-form-tabs { grid-template-columns: 1fr; gap: 10px; }
    .gpk-form-tab { min-height: 104px; padding: 18px; }
    .gpk-form-tabs.has-selection .gpk-form-tab { min-height: 64px; }
}

@media (prefers-reduced-motion: reduce) {
    .gpk-form-tab { transition: none; }
    .gpk-form-tab:hover,
    .gpk-form-tab:active { transform: none; }
}
```

- [ ] **Step 3: Run the focused contract tests**

Run: `node --test widgets/formulario/formulario.contract.test.js`

Expected: markup and CSS tests PASS; activation test remains FAIL.

- [ ] **Step 4: Commit the card presentation**

```powershell
git add widgets/formulario/formulario.css widgets/formulario/formulario.contract.test.js
git commit -m "style: apply Grupak form choice cards"
```

### Task 4: Activate and compact the selected form

**Files:**
- Modify: `widgets/formulario/formulario.js:154-187`
- Test: `widgets/formulario/formulario.contract.test.js`

- [ ] **Step 1: Make user clicks request scrolling**

```js
tab.addEventListener("click", function () {
    var target = tab.getAttribute("data-gpk-tab");
    selectTab(widget, target, true);
});
```

- [ ] **Step 2: Compact only after a valid target and scroll to its panel**

After the `if (!found) return false;` guard, add the selected state and retain the existing panel toggle:

```js
var tabsContainer = widget.querySelector(".gpk-form-tabs");
if (tabsContainer) tabsContainer.classList.add("has-selection");

var activePanel = null;
panels.forEach(function (panel) {
    var active = panel.getAttribute("data-gpk-panel") === target;
    panel.classList.toggle("is-active", active);
    if (active) activePanel = panel;
});

if (shouldScroll && activePanel) {
    activePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}
```

- [ ] **Step 3: Run all widget contract tests**

Run: `node --test widgets/formulario/formulario.contract.test.js widgets/chat-flotante/chat-flotante.contract.test.js`

Expected: all tests PASS.

- [ ] **Step 4: Commit interaction behavior**

```powershell
git add widgets/formulario/formulario.js widgets/formulario/formulario.contract.test.js
git commit -m "feat: reveal selected form on demand"
```

### Task 5: Document and visually verify the completed flow

**Files:**
- Modify: `changelogs/2026-07-31.md`

- [ ] **Step 1: Add the changelog entries**

Under `## Formulario Widget`, add:

```markdown
- **UX / Navigation**: Reemplazado el formulario abierto por defecto con un selector inicial de tres tarjetas para cotización, proveeduría y bolsa de trabajo.
- **Content**: Renombrada la opción visible “Contacto” a “Solicitar cotización”.
- **Responsive / Accessibility**: Añadidos estados activo, hover, foco, movimiento reducido y apilado móvil para el selector.
- **QA**: Añadidas y validadas pruebas de contrato para el estado inicial, contenido, diseño y activación del formulario.
```

- [ ] **Step 2: Start a local static server and inspect desktop and mobile**

Run: `python -m http.server 8026 --bind 127.0.0.1`

Open: `http://127.0.0.1:8026/widgets/formulario/formulario.html`

Expected: no form is visible initially; each card reveals only its matching form; the cards remain visible and compact; all three stack at 719px and below.

- [ ] **Step 3: Run final automated verification**

Run: `node --test widgets/formulario/formulario.contract.test.js widgets/chat-flotante/chat-flotante.contract.test.js`

Expected: all tests PASS with zero failures.

- [ ] **Step 4: Check the diff and commit documentation**

```powershell
git diff --check
git add changelogs/2026-07-31.md
git commit -m "docs: record form selector update"
```
