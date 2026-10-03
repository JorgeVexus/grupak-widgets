# Productos sección 1 Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adaptar exclusivamente la primera sección de Productos al frame móvil de Figma `2274:29819`, conservando los cuatro productos como capas animadas y dejando desktop y las demás secciones intactas.

**Architecture:** Una hoja CSS nueva y reversible controla únicamente `.ps-screen[data-mode="0"].ps-mobile-intro-v1` bajo `max-width: 767px`. JavaScript carga esa hoja, marca solo el modo 0 y cede su altura a CSS en móvil; el vendor y el widget fuente no se modifican.

**Tech Stack:** HTML/CSS/JavaScript vanilla, Node.js `node:test`, navegador local y Figma como referencia visual.

---

## Estructura de archivos

- Crear `widgets/productos-secciones/productos-secciones-mobile-intro.css`: layout, composición, animación y KPIs móviles de modo 0.
- Modificar `widgets/productos-secciones/productos-secciones.js`: cargar la hoja aislada, añadir `ps-mobile-intro-v1` solo al modo 0 y permitir altura automática móvil.
- Modificar `widgets/productos-secciones/productos-secciones.contract.test.js`: contratos de aislamiento, breakpoint, carga y protección desktop.
- Modificar `widgets/productos-secciones/preview.html`: actualizar únicamente la versión de caché al final.
- No modificar `widgets/productos-secciones/productos-secciones-vendor.css`.
- No modificar ningún archivo dentro de `widgets/productos-interactivos`.

### Task 1: Contratos de aislamiento móvil

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Escribir pruebas inicialmente rojas**

Añadir la lectura opcional del archivo nuevo y estos contratos:

```js
const mobileIntroPath = path.join(dir, "productos-secciones-mobile-intro.css");
const mobileIntro = fs.existsSync(mobileIntroPath)
    ? fs.readFileSync(mobileIntroPath, "utf8")
    : "";

test("la adaptación móvil se carga como hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-intro-styles/);
    assert.match(js, /productos-secciones-mobile-intro\.css/);
});

test("solo el modo 0 recibe la adaptación móvil", () => {
    assert.match(js, /if \(entry\.mode === 0\) screen\.classList\.add\("ps-mobile-intro-v1"\)/);
    assert.doesNotMatch(js, /entry\.mode !== 0[^\n]*ps-mobile-intro-v1/);
});

test("el CSS móvil está encapsulado y usa un solo breakpoint", () => {
    assert.match(mobileIntro, /@media \(max-width: 767px\)/);
    assert.doesNotMatch(mobileIntro, /@media[^\{]*(?:768|1024|480|390|375|360|320)/);
    const unsafeSelectors = mobileIntro
        .split("{")
        .map(block => block.split("}").pop().trim())
        .filter(selector => selector.startsWith("#gpk-ps-widget"))
        .filter(selector => !selector.includes('.ps-screen[data-mode="0"].ps-mobile-intro-v1'));
    assert.deepEqual(unsafeSelectors, []);
});

test("solo el modo 0 cede su altura al CSS móvil", () => {
    assert.match(js, /const isMobileIntro = entryMode === "0" && window\.matchMedia\("\(max-width: 767px\)"\)\.matches/);
    assert.match(js, /screen\.style\.height = isMobileIntro \? "auto" : `\$\{Math\.round\(1030 \* scale\)\}px`/);
});

test("la composición conserva cuatro productos independientes", () => {
    ["p-rollo", "p-lamina", "p-caja", "p-grabados"].forEach(id => {
        assert.match(mobileIntro, new RegExp(`#${id}\\s*\\{`));
    });
    assert.match(mobileIntro, /ps-pillars-play/);
});
```

- [ ] **Step 2: Ejecutar y observar el estado rojo**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: las cinco pruebas nuevas fallan porque la hoja, la clase y el control de altura aún no existen; las siete pruebas anteriores pasan.

### Task 2: Integración reversible de la capa móvil

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js:22-31,136-145,190-207`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Cargar la hoja móvil después de las hojas existentes**

Reemplazar la matriz de hojas por:

```js
const assetVersion = "seccion-reveal-19";
[
    ["gpk-ps-vendor-styles", "productos-secciones-vendor.css"],
    ["gpk-ps-styles", "productos-secciones.css"],
    ["gpk-ps-mobile-intro-styles", "productos-secciones-mobile-intro.css"]
].forEach(([id, file]) => {
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `${selfBaseURL}/${file}?v=${assetVersion}`;
    document.head.appendChild(link);
});
```

- [ ] **Step 2: Marcar únicamente la pantalla 0**

Después de asignar `screen.dataset.label`, añadir:

```js
if (entry.mode === 0) screen.classList.add("ps-mobile-intro-v1");
```

- [ ] **Step 3: Ceder la altura solo en móvil y modo 0**

Dentro de `scaleDesktopBoards`, sustituir la asignación de altura por:

```js
const entryMode = screen.dataset.mode;
const isMobileIntro = entryMode === "0"
    && window.matchMedia("(max-width: 767px)").matches;
board.style.setProperty("--board-scale", scale);
screen.style.height = isMobileIntro
    ? "auto"
    : `${Math.round(1030 * scale)}px`;
```

- [ ] **Step 4: Ejecutar el contrato**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: carga, clase y altura pasan; las pruebas de CSS todavía fallan.

### Task 3: Layout móvil aislado del modo 0

**Files:**
- Create: `widgets/productos-secciones/productos-secciones-mobile-intro.css`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Crear la hoja con un único breakpoint y prefijo**

Crear el archivo con esta estructura completa inicial:

```css
@media (max-width: 767px) {
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 {
        height: auto !important;
        min-height: 0;
        overflow: hidden;
        background: var(--color-grey-light, #d9d9d9);
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .products-board.ps-board-clone {
        position: relative;
        inset: auto;
        left: auto;
        width: 100%;
        height: auto;
        min-height: 0;
        transform: none;
        overflow: visible;
        background: var(--color-grey-light, #d9d9d9);
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .products-intro-pane {
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
        padding: clamp(30px, 8vw, 42px) clamp(18px, 5vw, 24px) clamp(36px, 10vw, 52px);
        display: flex;
        flex-direction: column;
        gap: 0;
        opacity: 1;
        transform: none;
        pointer-events: auto;
        background: #f7f8f6;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .intro-title-new {
        order: 1;
        max-width: 13ch;
        margin: 0;
        font-size: clamp(26px, 7.2vw, 34px);
        line-height: 1.08;
        letter-spacing: -0.025em;
        color: #6e6e6e;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .intro-title-new .text-green {
        font-size: inherit;
        line-height: inherit;
        color: var(--color-green, #5f9d2f);
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .intro-title-new > .desktop-only,
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .intro-title-new br.desktop-only,
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .intro-mobile-img-container,
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .mobile-hero-kpis {
        display: none !important;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .intro-mobile-desc {
        order: 2;
        display: block !important;
        margin: clamp(18px, 5vw, 24px) 0 0;
        max-width: 44ch;
        font-size: clamp(11px, 3vw, 14px);
        line-height: 1.45;
        color: #6e6e6e;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 #pillars-container {
        order: 3;
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
        aspect-ratio: 1.72 / 1;
        margin: clamp(22px, 6vw, 32px) 0 clamp(18px, 5vw, 26px);
        z-index: 1;
        overflow: visible;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 #pillars-container .pillar-wrapper {
        position: absolute;
        display: block;
        margin: 0;
        opacity: 1;
        pointer-events: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 #pillars-container .pillar-inner {
        width: 100%;
        height: 100%;
        transform: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 #p-rollo {
        left: 1%; top: 0; width: 29%; height: 72%; z-index: 10;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 #p-lamina {
        left: 20%; top: 21%; width: 42%; height: 63%; z-index: 20;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 #p-caja {
        left: 48%; top: 38%; width: 38%; height: 52%; z-index: 30;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 #p-grabados {
        left: 75%; top: 64%; width: 25%; height: 28%; z-index: 40;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .pillar-label,
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .cajas-stacked-group {
        display: none !important;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .intro-kpis-grid-new {
        order: 4;
        display: grid;
        grid-template-columns: 1fr;
        gap: clamp(28px, 8vw, 40px);
        align-items: start;
        margin: 0;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .kpi-item-new {
        width: 100%;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .kpi-number-new {
        margin: 0 0 4px;
        font-size: clamp(34px, 10vw, 46px);
        line-height: 1;
        color: #6e6e6e;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .kpi-line-new {
        width: min(100%, 190px);
        margin: 5px 0 8px;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .kpi-label-top,
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .kpi-label-bottom {
        font-size: clamp(12px, 3.4vw, 16px);
    }
}
```

- [ ] **Step 2: Ejecutar el contrato completo**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: todas las pruebas pasan.

- [ ] **Step 3: Verificar sintaxis y alcance**

Run: `node --check "widgets/productos-secciones/productos-secciones.js"`

Expected: exit 0.

Run: `git diff --check`

Expected: sin errores.

Run: `git diff --name-only`

Expected: solo el test, JavaScript y el CSS móvil nuevo; vendor y `productos-interactivos` no aparecen.

### Task 4: Conservar y calibrar la secuencia animada

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-intro.css`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Añadir reglas móviles para la secuencia existente**

Dentro del mismo `@media`, añadir reglas encapsuladas que mantengan el contorno y el relleno en la misma geometría:

```css
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .pillar-contour-img,
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .pillar-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform: none;
        transform-origin: center;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .products-board.mode-0 .pillar-contour-img {
        opacity: 0;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .products-board.mode-0.ps-pillars-play .pillar-contour-img {
        animation-name: gpkPillarContourInOut;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .products-board.mode-0 .pillar-img {
        clip-path: inset(100% 0 0 0);
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .products-board.mode-0.ps-pillars-play .pillar-img {
        animation-name: gpkPillarFillIn;
    }

```

Fuera del breakpoint principal, añadir directamente el bloque combinado de movimiento reducido:

```css
@media (max-width: 767px) and (prefers-reduced-motion: reduce) {
    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .pillar-contour-img {
        display: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1 .pillar-img {
        opacity: 1;
        clip-path: none;
        animation: none !important;
    }
}
```

- [ ] **Step 2: Ejecutar pruebas después de la animación**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: todas las pruebas pasan y los cuatro IDs siguen presentes.

### Task 5: Calibración visual contra Figma

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-intro.css`
- Verify: `widgets/productos-secciones/preview.html`

- [ ] **Step 1: Abrir referencia y preview en paralelo**

Referencia: `https://www.figma.com/design/oOOTfGtb6xh9jFKBoj3Ikb/Grupak?node-id=2274-29819&m=dev`

Preview: `http://127.0.0.1:8026/widgets/productos-secciones/preview.html?v=19`

- [ ] **Step 2: Medir el ancho real del frame y calibrar variables**

Usar la captura del frame para ajustar únicamente estos valores del CSS móvil:

```css
font-size: clamp(26px, 7.2vw, 34px);
padding: clamp(30px, 8vw, 42px) clamp(18px, 5vw, 24px) clamp(36px, 10vw, 52px);
aspect-ratio: 1.72 / 1;
```

Y los porcentajes `left`, `top`, `width`, `height` de los cuatro IDs. No cambiar selectores, DOM, breakpoint ni estilos desktop durante la calibración.

- [ ] **Step 3: Verificar geometría en 440, 390, 375, 360 y 320 px**

En una sola evaluación por viewport registrar:

```js
({
  viewport: document.documentElement.clientWidth,
  mode0Height: document.querySelector('.ps-screen[data-mode="0"]').getBoundingClientRect().height,
  mode1Top: document.querySelector('.ps-screen[data-mode="1"]').getBoundingClientRect().top,
  horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  mobileClassCount: document.querySelectorAll('.ps-mobile-intro-v1').length,
  pillarCount: document.querySelectorAll('.ps-screen[data-mode="0"] .pillar-wrapper').length
})
```

Expected en cada ancho: `horizontalOverflow: false`, `mobileClassCount: 1`, `pillarCount: 4`, altura positiva y modo 1 comenzando después del borde inferior del modo 0.

- [ ] **Step 4: Verificar desktop en 1440 y 1900 px**

Comparar captura y métricas con la versión publicada `seccion-reveal-18`. Confirmar centrado, gutter, navegación y lienzo 1850 × 1030 escalado sin cambios.

- [ ] **Step 5: Revisar animación y movimiento reducido**

Confirmar visualmente rollo → lámina → caja → grabados, estado final idéntico a la composición del Figma y composición completa inmediata con `prefers-reduced-motion`.

### Task 6: Versión de caché y verificación final

**Files:**
- Modify: `widgets/productos-secciones/preview.html:17`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Actualizar preview a la versión 19**

```html
<script src="/widgets/productos-secciones/productos-secciones.js?v=seccion-reveal-19"></script>
```

- [ ] **Step 2: Ejecutar verificación fresca**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: todas las pruebas pasan, 0 fallos.

Run: `node --check "widgets/productos-secciones/productos-secciones.js"`

Expected: exit 0.

Run: `git diff --check`

Expected: sin errores.

Run: `git status --short`

Expected: solo `preview.html`, el test, JavaScript y el CSS móvil nuevo aparecen modificados o creados.

- [ ] **Step 3: Presentar resultado local antes de publicar**

Entregar `http://127.0.0.1:8026/widgets/productos-secciones/preview.html?v=19` para aprobación. No hacer push hasta recibir confirmación explícita del usuario.
