# Productos secciones Desktop-Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar la variante móvil actual de `productos-secciones` y mostrar el lienzo desktop de 1850 × 1030 escalado proporcionalmente en todos los viewports.

**Architecture:** El widget conservará un solo DOM visual y un solo sistema de geometría. JavaScript calculará una escala por ancho disponible; CSS mantendrá siempre las dimensiones y posiciones desktop, sin breakpoints de reflow ni navegación móvil.

**Tech Stack:** HTML, CSS, JavaScript vanilla, Node.js `node:test` para pruebas contractuales y navegador local para verificación visual.

---

## Estructura de archivos

- Crear `widgets/productos-secciones/productos-secciones.contract.test.js`: contrato automatizado que impide reintroducir navegación y breakpoints móviles y valida la fórmula de escala.
- Modificar `widgets/productos-secciones/productos-secciones.html`: conservar solo el contenedor del flujo desktop y la navegación lateral.
- Modificar `widgets/productos-secciones/productos-secciones.js`: retirar inicialización/código móvil y dejar un escalado independiente del breakpoint.
- Modificar `widgets/productos-secciones/productos-secciones.css`: conservar el armazón, navegación lateral, reveal y reglas de accesibilidad; borrar barra y reflow móvil.
- Modificar `widgets/productos-secciones/productos-secciones-vendor.css`: eliminar todos los bloques `@media` basados en ancho que crean layouts tablet/móvil, preservando estilos desktop y `prefers-reduced-motion` no condicionado por ancho.

### Task 1: Crear el contrato desktop-only

**Files:**
- Create: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Escribir la prueba que inicialmente falla**

Crear una prueba con `node:test` que lea los cuatro archivos del widget y compruebe:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const dir = __dirname;
const read = name => fs.readFileSync(path.join(dir, name), "utf8");
const html = read("productos-secciones.html");
const css = read("productos-secciones.css");
const vendor = read("productos-secciones-vendor.css");
const js = read("productos-secciones.js");

test("el widget no contiene navegación móvil", () => {
  assert.doesNotMatch(html, /ps-mobile-(?:bar|nav)/);
  assert.doesNotMatch(js, /setupMobileBar|ps-mobile-(?:bar|nav)/);
  assert.doesNotMatch(css, /ps-mobile-(?:bar|nav)/);
});

test("no existen breakpoints de layout por ancho", () => {
  const widthMedia = /@media\s*\([^)]*(?:max|min)-width/;
  assert.doesNotMatch(css, widthMedia);
  assert.doesNotMatch(vendor, widthMedia);
});

test("los nodos móviles heredados permanecen ocultos", () => {
  assert.match(css, /\.mobile-only\s*\{[^}]*display:\s*none\s*!important/s);
  assert.match(css, /\.desktop-only\s*\{[^}]*display:\s*block\s*!important/s);
});

test("el escalado usa siempre el lienzo 1850 por 1030", () => {
  assert.match(js, /Math\.min\(width\s*\/\s*1850,\s*1\)/);
  assert.match(js, /1030\s*\*\s*scale/);
  assert.doesNotMatch(js, /width\s*[<>]=?\s*(?:768|1024)|matchMedia\([^)]*(?:max|min)-width/);
});
```

- [ ] **Step 2: Ejecutar la prueba y confirmar el estado rojo**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: FAIL en navegación móvil y breakpoints por ancho; la prueba de fórmula de escala puede pasar.

- [ ] **Step 3: Guardar el contrato sin incluir archivos ajenos**

```powershell
git add -- "widgets/productos-secciones/productos-secciones.contract.test.js"
git commit -m "test: define desktop-only products contract"
```

### Task 2: Retirar DOM y comportamiento móvil

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.html:13-45`
- Modify: `widgets/productos-secciones/productos-secciones.js:13-14,88,114-120,193-217,417-488`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Simplificar el HTML**

Dejar dentro de `#gpk-ps-widget` únicamente la navegación lateral existente y el flujo:

```html
<div id="gpk-ps-widget">
    <nav class="ps-side-nav" aria-label="Navegación de productos">
        <ul id="ps-side-nav-list"></ul>
    </nav>
    <div id="ps-flow-desktop" class="ps-flow-desktop"></div>
</div>
```

Conservar fuera del widget los mismos `<link>` y `<script>` existentes; retirar por completo `.ps-mobile-bar` y `#ps-mobile-nav-sheet`.

- [ ] **Step 2: Retirar inicialización móvil de JavaScript**

En `build`, dejar esta secuencia exacta:

```js
buildFlow(root, source);
resolveAssetURLs(root);
scaleDesktopBoards(root);
setupReveal(root);
setupSideNav(root);
window.addEventListener("resize", () => scaleDesktopBoards(root));
```

Eliminar completas las funciones `setupIntroVideo` y `setupMobileBar`. Actualizar comentarios para describir un único lienzo desktop escalado; `navGroups` queda dedicado a navegación lateral y API pública.

- [ ] **Step 3: Confirmar que el contrato avanza**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: la prueba de navegación móvil deja de fallar en HTML/JS; todavía falla por CSS y breakpoints.

- [ ] **Step 4: Guardar el cambio estructural**

```powershell
git add -- "widgets/productos-secciones/productos-secciones.html" "widgets/productos-secciones/productos-secciones.js"
git commit -m "refactor: remove products mobile structure"
```

### Task 3: Eliminar CSS móvil y fijar la geometría escalable

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.css:1-378`
- Modify: `widgets/productos-secciones/productos-secciones-vendor.css:1-10358`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Limpiar el CSS del armazón**

Eliminar reglas `.ps-mobile-*` y cualquier `@media` basado en ancho. Mantener estas reglas base sin breakpoint:

```css
#gpk-ps-widget .ps-flow-desktop {
    width: 100%;
    overflow: hidden;
}

#gpk-ps-widget .ps-screen {
    position: relative;
    width: 100%;
    overflow: hidden;
}

#gpk-ps-widget .ps-screen .products-board.ps-board-clone {
    position: absolute;
    top: 0;
    left: 0;
    width: 1850px;
    height: 1030px;
    transform: scale(var(--board-scale, 1));
    transform-origin: top left;
}

#gpk-ps-widget .mobile-only,
#gpk-ps-widget .mobile-only-graphic,
#gpk-ps-widget .mobile-continuous-flow,
#gpk-ps-widget .mobile-scroll-status {
    display: none !important;
}

#gpk-ps-widget .desktop-only {
    display: block !important;
}
```

Conservar la navegación lateral, sus estados activos, las reglas de reveal y el bloque global `@media (prefers-reduced-motion: reduce)`.

- [ ] **Step 2: Limpiar el CSS vendor**

Eliminar cada bloque `@media` cuya condición contenga `max-width` o `min-width`, incluyendo condiciones combinadas con altura o movimiento. No eliminar estilos desktop fuera de esos bloques ni reglas globales de reducción de movimiento. Confirmar balance de llaves después de la limpieza.

- [ ] **Step 3: Ejecutar el contrato completo**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 4 tests PASS, 0 FAIL.

- [ ] **Step 4: Buscar residuos móviles y errores CSS obvios**

Run: `rg -n "ps-mobile|@media.*(?:max|min)-width|setupMobileBar|setupIntroVideo" "widgets/productos-secciones"`

Expected: sin coincidencias en HTML/CSS/JS; solo se admite el nombre de una aserción dentro del archivo de prueba.

Run: `git diff --check -- "widgets/productos-secciones"`

Expected: sin errores.

- [ ] **Step 5: Guardar la limpieza CSS**

```powershell
git add -- "widgets/productos-secciones/productos-secciones.css" "widgets/productos-secciones/productos-secciones-vendor.css"
git commit -m "style: keep products desktop layout at every width"
```

### Task 4: Verificación visual y de regresión

**Files:**
- Verify: `widgets/productos-secciones/productos-secciones.html`
- Verify: `widgets/productos-secciones/productos-secciones.css`
- Verify: `widgets/productos-secciones/productos-secciones-vendor.css`
- Verify: `widgets/productos-secciones/productos-secciones.js`

- [ ] **Step 1: Servir el workspace y abrir el widget**

Run: `python -m http.server 8026 --bind 127.0.0.1`

Abrir `http://127.0.0.1:8026/widgets/productos-secciones/productos-secciones.html`.

- [ ] **Step 2: Revisar desktop**

En un viewport cercano a 1850 px, confirmar navegación lateral, orden de las 11 pantallas, clases `mode-N`, animaciones y ausencia de cambios visuales respecto a la base.

- [ ] **Step 3: Revisar 768, 430 y 375 px**

En cada ancho confirmar: mismo layout desktop completo, escala proporcional, sin barra inferior, sin video/contenido móvil, sin reflow, sin scroll horizontal y sin solapamiento vertical entre `.ps-screen`.

- [ ] **Step 4: Ejecutar verificación final**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 4 tests PASS, 0 FAIL.

Run: `git diff --check`

Expected: sin errores.

- [ ] **Step 5: Revisar alcance**

Run: `git status --short`

Expected: solo los archivos de `widgets/productos-secciones` previstos; cualquier cambio preexistente o ajeno permanece sin modificar.

