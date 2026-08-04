# Productos secciones 3 y 4 Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adaptar los modos 2 y 3 de Papel a sus frames móviles de Figma, conservando sus secuencias y protegiendo desktop y las secciones 1–2.

**Architecture:** Una hoja `productos-secciones-mobile-paper.css` contiene dos ámbitos independientes para los clones de `#pane-papel`: intro en modo 2 y catálogo en modo 3. JavaScript carga la hoja, asigna una clase exacta por modo y extiende la altura automática móvil solo a los modos 0–3.

**Tech Stack:** HTML/CSS/JavaScript vanilla, Node.js `node:test`, navegador local y Figma como referencia visual.

---

## Archivos

- Crear `widgets/productos-secciones/productos-secciones-mobile-paper.css`.
- Modificar `widgets/productos-secciones/productos-secciones.js`.
- Modificar `widgets/productos-secciones/productos-secciones.contract.test.js`.
- Modificar `widgets/productos-secciones/preview.html` al finalizar.
- No modificar las hojas `productos-secciones-mobile-intro.css`, `productos-secciones-mobile-overview.css` o `productos-secciones-vendor.css`.
- No modificar archivos dentro de `widgets/productos-interactivos`.

### Task 1: Contratos rojos para Papel móvil

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Leer la futura hoja de forma opcional**

```js
const mobilePaperPath = path.join(dir, "productos-secciones-mobile-paper.css");
const mobilePaper = fs.existsSync(mobilePaperPath)
    ? fs.readFileSync(mobilePaperPath, "utf8")
    : "";
const sourceHtml = fs.readFileSync(
    path.join(dir, "../productos-interactivos/productos-interactivos.html"),
    "utf8"
);
```

Reutilizar `sourceHtml` en la prueba existente de sección 2 y eliminar su declaración local duplicada.

- [ ] **Step 2: Añadir contratos de carga, clases y altura**

```js
test("Papel móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-paper-styles/);
    assert.match(js, /productos-secciones-mobile-paper\.css/);
});

test("los modos 2 y 3 reciben clases móviles diferentes", () => {
    assert.match(js, /if \(entry\.mode === 2\) screen\.classList\.add\("ps-mobile-paper-intro-v1"\)/);
    assert.match(js, /if \(entry\.mode === 3\) screen\.classList\.add\("ps-mobile-paper-catalog-v1"\)/);
});

test("solo los modos adaptados 0 a 3 usan altura automática móvil", () => {
    assert.match(js, /const adaptedMobileModes = new Set\(\["0", "1", "2", "3"\]\)/);
    assert.match(js, /const isAdaptedMobile = adaptedMobileModes\.has\(entryMode\)[\s\S]*window\.matchMedia\("\(max-width: 767px\)"\)\.matches/);
});
```

- [ ] **Step 3: Añadir contratos de encapsulación y DOM reutilizado**

```js
test("el CSS de Papel está encapsulado en los modos 2 y 3", () => {
    assert.match(mobilePaper, /@media \(max-width: 767px\)/);
    assert.doesNotMatch(mobilePaper, /@media[^\{]*(?:768|1024|480|440|390|375|360|320)/);
    const selectors = mobilePaper.match(/#gpk-ps-widget[^\{]+(?=\{)/g) || [];
    assert.ok(selectors.length > 0);
    selectors.forEach(selector => {
        assert.match(selector, /\.ps-screen\[data-mode="(?:2|3)"\]\.ps-mobile-paper-(?:intro|catalog)-v1/);
    });
});

test("Papel móvil reutiliza cuatro textos y cuatro tarjetas", () => {
    assert.equal((sourceHtml.match(/class="papel-text-block [^"]+"/g) || []).length, 4);
    assert.equal((sourceHtml.match(/class="product-card fade-in-up"/g) || []).length, 4);
    assert.match(mobilePaper, /\.papel-text-block/);
    assert.match(mobilePaper, /\.product-card/);
});

test("cada modo de Papel oculta el contenido hermano", () => {
    assert.match(mobilePaper, /data-mode="2"[^\{]+#papel-grid-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobilePaper, /data-mode="3"[^\{]+#papel-intro-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
});
```

- [ ] **Step 4: Ejecutar el estado rojo**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: las 17 pruebas actuales pasan y las seis nuevas fallan.

### Task 2: Integración JavaScript mínima

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js`

- [ ] **Step 1: Cargar la nueva hoja y avanzar caché**

```js
const assetVersion = "seccion-reveal-21";
[
    ["gpk-ps-vendor-styles", "productos-secciones-vendor.css"],
    ["gpk-ps-styles", "productos-secciones.css"],
    ["gpk-ps-mobile-intro-styles", "productos-secciones-mobile-intro.css"],
    ["gpk-ps-mobile-overview-styles", "productos-secciones-mobile-overview.css"],
    ["gpk-ps-mobile-paper-styles", "productos-secciones-mobile-paper.css"]
].forEach(([id, file]) => {
```

- [ ] **Step 2: Asignar clases exactas**

```js
if (entry.mode === 0) screen.classList.add("ps-mobile-intro-v1");
if (entry.mode === 1) screen.classList.add("ps-mobile-overview-v1");
if (entry.mode === 2) screen.classList.add("ps-mobile-paper-intro-v1");
if (entry.mode === 3) screen.classList.add("ps-mobile-paper-catalog-v1");
```

- [ ] **Step 3: Extender altura automática mediante un Set explícito**

Antes de iterar pantallas:

```js
const adaptedMobileModes = new Set(["0", "1", "2", "3"]);
```

Dentro del bucle:

```js
const entryMode = screen.dataset.mode;
const isAdaptedMobile = adaptedMobileModes.has(entryMode)
    && window.matchMedia("(max-width: 767px)").matches;
```

- [ ] **Step 4: Ejecutar contratos**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: carga, clases y altura pasan; las pruebas dependientes del CSS permanecen rojas.

### Task 3: Base compartida y sección 3

**Files:**
- Create: `widgets/productos-secciones/productos-secciones-mobile-paper.css`

- [ ] **Step 1: Crear base de altura automática para ambos modos**

```css
@media (max-width: 767px) {
    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 {
        height: auto !important;
        min-height: 0;
        overflow: hidden;
        background: #f7f8f6;
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .products-board.ps-board-clone,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .products-board.ps-board-clone {
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

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 #pane-papel,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 #pane-papel {
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
        min-height: 0;
        opacity: 1;
        transform: none;
        pointer-events: auto;
        background: #f7f8f6;
    }
```

- [ ] **Step 2: Crear flujo móvil del modo 2**

```css
    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 #pane-papel {
        padding: clamp(34px, 9vw, 48px) clamp(18px, 5vw, 24px) clamp(44px, 11vw, 60px);
        display: flex;
        flex-direction: column;
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 #papel-grid-content {
        display: none !important;
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-shared-title {
        position: relative;
        inset: auto;
        order: 1;
        margin: 0;
        transform: none;
        font-size: clamp(30px, 8.5vw, 40px);
        line-height: 1.05;
        text-align: left;
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-title-green-line {
        width: 42px;
        margin: 8px 0 0;
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-hero-image {
        position: relative;
        inset: auto;
        order: 2;
        width: 100%;
        height: clamp(220px, 66vw, 310px);
        margin: clamp(22px, 6vw, 32px) 0;
        opacity: 1;
        transform: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-main-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform: rotate(-90deg);
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 #papel-intro-content,
    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-text-blocks {
        position: relative;
        inset: auto;
        order: 3;
        width: 100%;
        height: auto;
        opacity: 1;
        transform: none;
        pointer-events: auto;
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-text-block {
        position: relative;
        inset: auto;
        width: 100%;
        margin: 0 0 clamp(22px, 6vw, 30px);
        text-align: left;
    }

    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-text-block p {
        margin: 0;
        font-size: clamp(13px, 3.7vw, 16px);
        line-height: 1.48;
        text-align: left;
    }
```

- [ ] **Step 3: Ejecutar contratos parciales**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: falta únicamente el ocultamiento de intro en modo 3 y las reglas de tarjetas.

### Task 4: Sección 4 y animaciones

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-paper.css`

- [ ] **Step 1: Crear flujo móvil del catálogo**

```css
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 #pane-papel {
        padding: clamp(34px, 9vw, 48px) clamp(18px, 5vw, 24px) clamp(48px, 12vw, 64px);
        display: flex;
        flex-direction: column;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 #papel-intro-content,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .papel-hero-image {
        display: none !important;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .papel-shared-title {
        position: relative;
        inset: auto;
        margin: 0 0 clamp(28px, 8vw, 40px);
        transform: none;
        font-size: clamp(30px, 8.5vw, 40px);
        line-height: 1.05;
        text-align: left;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .papel-title-green-line {
        width: 42px;
        margin: 8px 0 0;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 #papel-grid-content,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .papel-products-grid {
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
        margin: 0;
        display: grid;
        grid-template-columns: 1fr;
        gap: clamp(34px, 9vw, 48px);
        opacity: 1;
        transform: none;
        pointer-events: auto;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card {
        width: 100%;
        margin: 0 !important;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        transform: translateY(32px);
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .products-board.mode-3 .product-card {
        opacity: 1;
        transform: translateY(0);
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-image {
        width: 100%;
        height: clamp(190px, 58vw, 270px);
        flex: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-info {
        width: 100%;
    }
```

- [ ] **Step 2: Ajustar tipografía y stagger del catálogo**

```css
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-name {
        font-size: clamp(22px, 6.2vw, 28px);
        line-height: 1.08;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-subtitle,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-desc,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .uses-text {
        font-size: clamp(13px, 3.6vw, 16px);
        line-height: 1.45;
    }

    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .products-board.mode-3 .product-card[data-index="1"] { transition-delay: 0.10s; }
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .products-board.mode-3 .product-card[data-index="2"] { transition-delay: 0.18s; }
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .products-board.mode-3 .product-card[data-index="3"] { transition-delay: 0.26s; }
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .products-board.mode-3 .product-card[data-index="4"] { transition-delay: 0.34s; }
}
```

- [ ] **Step 3: Añadir movimiento reducido**

```css
@media (max-width: 767px) and (prefers-reduced-motion: reduce) {
    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-shared-title,
    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-hero-image,
    #gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1 .papel-text-block,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .papel-shared-title,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .uses-bubble,
    #gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .uses-text {
        opacity: 1;
        transform: none;
        transition: none !important;
    }
}
```

- [ ] **Step 4: Ejecutar suite y sintaxis**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 23 pruebas pasan, 0 fallos.

Run: `node --check "widgets/productos-secciones/productos-secciones.js"`

Expected: exit 0.

### Task 5: Calibración visual conjunta

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-paper.css`

- [ ] **Step 1: Abrir referencias y preview**

Sección 3: `https://www.figma.com/design/oOOTfGtb6xh9jFKBoj3Ikb/Grupak?node-id=2277-25932&m=dev`

Sección 4: `https://www.figma.com/design/oOOTfGtb6xh9jFKBoj3Ikb/Grupak?node-id=2277-25965&m=dev`

Preview: `http://127.0.0.1:8027/widgets/productos-secciones/preview.html?v=21`

- [ ] **Step 2: Ajustar solo tokens de la hoja nueva**

Calibrar `padding`, `gap`, valores `clamp()`, alturas de imagen y anchos de lectura. No modificar el DOM, las hojas anteriores, vendor ni reglas desktop.

- [ ] **Step 3: Medir 440, 390, 375, 360 y 320 px**

```js
({
  viewport: document.documentElement.clientWidth,
  mode2Height: document.querySelector('.ps-screen[data-mode="2"]').getBoundingClientRect().height,
  mode3Height: document.querySelector('.ps-screen[data-mode="3"]').getBoundingClientRect().height,
  mode4Top: document.querySelector('.ps-screen[data-mode="4"]').getBoundingClientRect().top,
  overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  textBlocks: document.querySelectorAll('.ps-screen[data-mode="2"] .papel-text-block').length,
  productCards: document.querySelectorAll('.ps-screen[data-mode="3"] .product-card').length
})
```

Expected: sin overflow, cuatro textos, cuatro tarjetas, alturas positivas y modo 4 después del borde inferior del modo 3.

- [ ] **Step 4: Verificar regresión y desktop**

Confirmar que las hojas móviles de modos 0 y 1 no tienen diff contra `73a0405`. En 1440 y 1900 px confirmar imágenes, posiciones, alturas escaladas y navegación sin cambios.

### Task 6: Caché, verificación y checkpoint

**Files:**
- Modify: `widgets/productos-secciones/preview.html`

- [ ] **Step 1: Actualizar preview**

```html
<script src="/widgets/productos-secciones/productos-secciones.js?v=seccion-reveal-21"></script>
```

- [ ] **Step 2: Ejecutar verificación fresca**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 23 aprobadas, 0 fallos.

Run: `node --check "widgets/productos-secciones/productos-secciones.js"`

Expected: exit 0.

Run: `git diff --check`

Expected: sin errores.

Run: `git status --short`

Expected: preview, test, JavaScript y la hoja móvil de Papel aparecen modificados o creados.

- [ ] **Step 3: Guardar commit reversible**

```bash
git add widgets/productos-secciones/preview.html widgets/productos-secciones/productos-secciones.contract.test.js widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-paper.css
git commit -m "feat: adapt paper sections for mobile"
```

- [ ] **Step 4: Entregar preview antes de integrar**

Entregar `http://127.0.0.1:8027/widgets/productos-secciones/preview.html?v=21`. No integrar a `main` ni hacer push sin aprobación explícita.
