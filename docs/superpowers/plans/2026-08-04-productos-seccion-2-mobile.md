# Productos sección 2 Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adaptar exclusivamente la sección Productos `data-mode="1"` al frame móvil de Figma `2274:29860`, conservando sus cuatro productos y la entrada escalonada sin alterar desktop ni la sección 1.

**Architecture:** Una nueva hoja CSS controla únicamente `.ps-screen[data-mode="1"].ps-mobile-overview-v1` debajo de 768 px. JavaScript carga esa hoja, marca solo el modo 1 y permite altura automática para los modos móviles ya adaptados; el DOM, vendor y fuente permanecen intactos.

**Tech Stack:** HTML/CSS/JavaScript vanilla, Node.js `node:test`, navegador local y Figma como referencia visual.

---

## Estructura de archivos

- Crear `widgets/productos-secciones/productos-secciones-mobile-overview.css`: layout, tarjetas y movimiento reducido de la sección 2 móvil.
- Modificar `widgets/productos-secciones/productos-secciones.js`: cargar la hoja, añadir la clase solo al modo 1 y extender la altura automática móvil.
- Modificar `widgets/productos-secciones/productos-secciones.contract.test.js`: contratos de carga, encapsulación, DOM reutilizado y protección de sección 1/desktop.
- Modificar `widgets/productos-secciones/preview.html`: avanzar la versión de caché al final.
- No modificar `widgets/productos-secciones/productos-secciones-mobile-intro.css`.
- No modificar `widgets/productos-secciones/productos-secciones-vendor.css` ni archivos de `widgets/productos-interactivos`.

### Task 1: Contratos inicialmente rojos

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Leer la futura hoja sin impedir el estado rojo**

```js
const mobileOverviewPath = path.join(dir, "productos-secciones-mobile-overview.css");
const mobileOverview = fs.existsSync(mobileOverviewPath)
    ? fs.readFileSync(mobileOverviewPath, "utf8")
    : "";
```

- [ ] **Step 2: Añadir contratos de carga, clase, altura y encapsulación**

```js
test("la sección 2 móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-overview-styles/);
    assert.match(js, /productos-secciones-mobile-overview\.css/);
});

test("solo el modo 1 recibe la clase móvil de productos", () => {
    assert.match(js, /if \(entry\.mode === 1\) screen\.classList\.add\("ps-mobile-overview-v1"\)/);
    assert.doesNotMatch(js, /entry\.mode !== 1[^\n]*ps-mobile-overview-v1/);
});

test("las dos secciones adaptadas usan altura automática solo en móvil", () => {
    assert.match(js, /const isAdaptedMobile = \["0", "1"\]\.includes\(entryMode\)[\s\S]*window\.matchMedia\("\(max-width: 767px\)"\)\.matches/);
    assert.match(js, /screen\.style\.height = isAdaptedMobile[\s\S]*\? "auto"/);
});

test("el CSS de sección 2 está encapsulado en modo 1", () => {
    assert.match(mobileOverview, /@media \(max-width: 767px\)/);
    assert.doesNotMatch(mobileOverview, /@media[^\{]*(?:768|1024|480|440|390|375|360|320)/);
    const selectors = mobileOverview.match(/#gpk-ps-widget[^\{]+(?=\{)/g) || [];
    assert.ok(selectors.length > 0);
    selectors.forEach(selector => {
        assert.match(selector, /\.ps-screen\[data-mode="1"\]\.ps-mobile-overview-v1/);
    });
});

test("la sección 2 reutiliza cuatro columnas e imágenes móviles", () => {
    assert.match(mobileOverview, /\.overview-grid-new/);
    assert.match(mobileOverview, /\.overview-col-new/);
    assert.match(mobileOverview, /\.overview-mobile-img/);
    assert.match(mobileOverview, /#pillars-container/);
    assert.equal((html.match(/class="overview-col-new"/g) || []).length, 0);
    assert.equal((fs.readFileSync(path.join(dir, "../productos-interactivos/productos-interactivos.html"), "utf8").match(/class="overview-col-new"/g) || []).length, 4);
});
```

- [ ] **Step 3: Ejecutar y confirmar cinco fallos nuevos**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: las 12 pruebas actuales pasan y las cinco nuevas fallan porque la hoja, la clase y la altura extendida aún no existen.

### Task 2: Integración mínima en JavaScript

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Cargar la hoja después de la adaptación de sección 1**

```js
const assetVersion = "seccion-reveal-20";
[
    ["gpk-ps-vendor-styles", "productos-secciones-vendor.css"],
    ["gpk-ps-styles", "productos-secciones.css"],
    ["gpk-ps-mobile-intro-styles", "productos-secciones-mobile-intro.css"],
    ["gpk-ps-mobile-overview-styles", "productos-secciones-mobile-overview.css"]
].forEach(([id, file]) => {
```

- [ ] **Step 2: Marcar únicamente el modo 1**

Inmediatamente después de la clase de modo 0:

```js
if (entry.mode === 0) screen.classList.add("ps-mobile-intro-v1");
if (entry.mode === 1) screen.classList.add("ps-mobile-overview-v1");
```

- [ ] **Step 3: Extender la altura automática solo a los modos 0 y 1**

```js
const entryMode = screen.dataset.mode;
const isAdaptedMobile = ["0", "1"].includes(entryMode)
    && window.matchMedia("(max-width: 767px)").matches;
board.style.setProperty("--board-scale", scale);
screen.style.height = isAdaptedMobile
    ? "auto"
    : `${Math.round(1030 * scale)}px`;
```

- [ ] **Step 4: Ejecutar contratos**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: carga, clase y altura pasan; encapsulación y reglas visuales siguen rojas porque la hoja aún no existe.

### Task 3: Layout móvil aislado de sección 2

**Files:**
- Create: `widgets/productos-secciones/productos-secciones-mobile-overview.css`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Crear la base de pantalla y encabezado**

```css
@media (max-width: 767px) {
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 {
        height: auto !important;
        min-height: 0;
        overflow: hidden;
        background: #f7f8f6;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .products-board.ps-board-clone {
        position: relative;
        inset: auto;
        left: auto;
        width: 100%;
        height: auto;
        min-height: 0;
        transform: none;
        overflow: visible;
        background: #f7f8f6;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .products-overview-pane {
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
        padding: clamp(34px, 9vw, 48px) clamp(18px, 5vw, 24px) clamp(44px, 11vw, 60px);
        display: flex;
        flex-direction: column;
        align-items: stretch;
        opacity: 1;
        transform: none;
        pointer-events: auto;
        background: #f7f8f6;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-header {
        margin: 0 0 clamp(28px, 8vw, 40px);
        text-align: left;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-title-new {
        margin: 0;
        font-size: clamp(28px, 8vw, 38px);
        line-height: 1.05;
        letter-spacing: -0.025em;
        color: #6e6e6e;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 #pillars-container {
        display: none !important;
    }
```

- [ ] **Step 2: Convertir las cuatro columnas en tarjetas verticales**

Continuar el mismo `@media`:

```css
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-grid-new {
        position: relative;
        inset: auto;
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        gap: clamp(34px, 9vw, 48px);
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-col-new {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-mobile-img {
        display: block;
        width: 100%;
        height: auto;
        max-height: clamp(210px, 64vw, 300px);
        margin: 0 0 clamp(16px, 4vw, 22px);
        object-fit: contain;
        object-position: center;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-col-title {
        margin: 0 0 12px;
        padding: 0 0 10px;
        font-size: clamp(22px, 6.4vw, 30px);
        line-height: 1.08;
        text-align: left;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-col-title::after {
        left: 0;
        width: 38px;
        transform: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-col-desc {
        margin: 0 0 18px;
        display: block;
        max-width: 44ch;
        font-size: clamp(13px, 3.6vw, 16px);
        line-height: 1.45;
        text-align: left;
        -webkit-line-clamp: initial;
        overflow: visible;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-col-btn {
        min-width: 0;
        padding: 10px 22px;
        align-self: flex-start;
        font-size: clamp(13px, 3.4vw, 15px);
    }
}
```

- [ ] **Step 3: Ejecutar contratos y sintaxis**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 17 pruebas pasan, 0 fallos.

Run: `node --check "widgets/productos-secciones/productos-secciones.js"`

Expected: exit 0.

### Task 4: Movimiento escalonado y accesibilidad

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-overview.css`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Mantener el estado inicial y la secuencia existente**

Dentro del breakpoint principal añadir:

```css
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-header,
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-col-new {
        will-change: opacity, transform;
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .products-board.mode-1 .overview-header,
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .products-board.mode-1 .overview-col-new {
        opacity: 1;
        transform: translateY(0);
    }

    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .products-board.mode-1 .overview-col-new:nth-child(1) { transition-delay: 0.10s; }
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .products-board.mode-1 .overview-col-new:nth-child(2) { transition-delay: 0.18s; }
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .products-board.mode-1 .overview-col-new:nth-child(3) { transition-delay: 0.26s; }
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .products-board.mode-1 .overview-col-new:nth-child(4) { transition-delay: 0.34s; }
```

- [ ] **Step 2: Añadir movimiento reducido como media query combinada superior**

```css
@media (max-width: 767px) and (prefers-reduced-motion: reduce) {
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-header,
    #gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1 .overview-col-new {
        opacity: 1;
        transform: none;
        transition: none !important;
    }
}
```

- [ ] **Step 3: Ejecutar la suite completa**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 17 pruebas pasan, 0 fallos.

### Task 5: Calibración visual y protección responsive

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-overview.css`
- Verify: `widgets/productos-secciones/preview.html`

- [ ] **Step 1: Levantar la rama en el servidor aislado**

URL: `http://127.0.0.1:8027/widgets/productos-secciones/preview.html?v=20`

- [ ] **Step 2: Comparar con Figma y ajustar solo tokens móviles**

Referencia: `https://www.figma.com/design/oOOTfGtb6xh9jFKBoj3Ikb/Grupak?node-id=2274-29860&m=dev`

Ajustar únicamente `padding`, `gap`, los valores `clamp()` tipográficos y las dimensiones de `.overview-mobile-img`. No modificar DOM, selectores, breakpoint, sección 1 ni reglas desktop.

- [ ] **Step 3: Medir 440, 390, 375, 360 y 320 px**

```js
({
  viewport: document.documentElement.clientWidth,
  mode1Height: document.querySelector('.ps-screen[data-mode="1"]').getBoundingClientRect().height,
  mode2Top: document.querySelector('.ps-screen[data-mode="2"]').getBoundingClientRect().top,
  horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  overviewClassCount: document.querySelectorAll('.ps-mobile-overview-v1').length,
  overviewColumnCount: document.querySelectorAll('.ps-screen[data-mode="1"] .overview-col-new').length,
  visibleImageCount: [...document.querySelectorAll('.ps-screen[data-mode="1"] .overview-mobile-img')]
      .filter(img => getComputedStyle(img).display !== 'none').length
})
```

Expected: sin desbordamiento, una clase, cuatro columnas, cuatro imágenes visibles y modo 2 comenzando después del borde inferior del modo 1.

- [ ] **Step 4: Verificar regresión de sección 1**

En los mismos cinco anchos confirmar cuatro pilares, KPIs verticales, ausencia de overflow y geometría idéntica al commit `521f70e`.

- [ ] **Step 5: Verificar desktop 1440 y 1900 px**

Confirmar que los modos 0 y 1 conservan altura `Math.round(1030 * scale)`, el canvas permanece centrado y ninguna imagen `.overview-mobile-img` es visible.

### Task 6: Caché, verificación y checkpoint local

**Files:**
- Modify: `widgets/productos-secciones/preview.html`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Actualizar el preview**

```html
<script src="/widgets/productos-secciones/productos-secciones.js?v=seccion-reveal-20"></script>
```

- [ ] **Step 2: Ejecutar verificación fresca**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 17 pruebas, 17 aprobadas, 0 fallos.

Run: `node --check "widgets/productos-secciones/productos-secciones.js"`

Expected: exit 0.

Run: `git diff --check`

Expected: sin errores.

Run: `git status --short`

Expected: solo preview, test, JavaScript y la nueva hoja de sección 2 aparecen modificados o creados.

- [ ] **Step 3: Guardar checkpoint reversible**

```bash
git add widgets/productos-secciones/preview.html widgets/productos-secciones/productos-secciones.contract.test.js widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-overview.css
git commit -m "feat: adapt products overview for mobile"
```

- [ ] **Step 4: Presentar vista local antes de integrar**

Entregar `http://127.0.0.1:8027/widgets/productos-secciones/preview.html?v=20`. No integrar a `main` ni hacer push hasta recibir aprobación explícita.
