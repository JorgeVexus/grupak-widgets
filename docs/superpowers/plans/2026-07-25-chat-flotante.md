# Chat flotante Grupak Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el chat flotante de Grupak como prototipo visual interactivo fiel al nodo Figma `113:1103`, sin destinos externos activos.

**Architecture:** El widget seguira el patron embebible del repositorio: un cargador JavaScript resuelve rutas locales o de produccion, inyecta CSS y monta HTML dentro de un root conocido. Un controlador de estado pequeno alternara las vistas declarativas del panel y mantendra sincronizados visibilidad, foco y atributos ARIA.

**Tech Stack:** HTML semantico, CSS responsivo, JavaScript vanilla, servidor HTTP local y pruebas DOM mediante Playwright.

---

### Task 1: Crear el contrato embebible y el preview

**Files:**
- Create: `widgets/chat-flotante/chat-flotante.js`
- Create: `widgets/chat-flotante/chat-flotante.html`
- Create: `preview-chat-flotante.html`

- [ ] **Step 1: Crear una prueba de humo fallida**

Abrir `http://127.0.0.1:8026/preview-chat-flotante.html` y comprobar:

```js
({
  root: Boolean(document.querySelector("#gpk-floating-chat-root")),
  launcher: Boolean(document.querySelector("[data-gpk-chat-launcher]"))
})
```

Resultado esperado antes de implementar: la pagina responde `404` o `launcher` es `false`.

- [ ] **Step 2: Crear el preview y el cargador**

El preview debe declarar:

```html
<div id="gpk-floating-chat-root"></div>
<script src="./widgets/chat-flotante/chat-flotante.js"></script>
```

El cargador debe detectar `localhost`, `127.0.0.1` y `file:`, resolver
`widgets/chat-flotante` localmente y
`https://grupak-widgets.vercel.app/widgets/chat-flotante` en produccion.

- [ ] **Step 3: Crear el HTML base**

Incluir un `<aside>` con panel inicialmente oculto, encabezado de Valeria, region
de contenido, pie de ayuda y boton flotante. Usar atributos `data-gpk-chat-*`
estables para que JavaScript no dependa de la estructura visual.

- [ ] **Step 4: Repetir la prueba de humo**

Resultado esperado: `root` y `launcher` son `true`, sin errores de consola.

### Task 2: Implementar apariencia y responsive

**Files:**
- Create: `widgets/chat-flotante/chat-flotante.css`

- [ ] **Step 1: Capturar la referencia visual**

Usar el screenshot del nodo Figma `113:1103` como referencia para color, jerarquia,
dimensiones, bordes y espaciados.

- [ ] **Step 2: Implementar la superficie flotante**

Crear un panel fijo de aproximadamente `320px`, encabezado verde, superficie
blanca, filas con borde tenue y boton flotante de `52px`. Usar prefijo
`.gpk-chat-` en todas las clases.

- [ ] **Step 3: Implementar estados visuales y movimiento**

La apertura debe animar `opacity` y `transform`; el cambio de vistas debe usar una
transicion breve sin animar dimensiones. Agregar estados `:hover`, `:focus-visible`
y `:active`.

- [ ] **Step 4: Implementar responsive**

En anchos menores a `576px`, limitar el panel a:

```css
width: min(320px, calc(100vw - 32px));
max-height: calc(100dvh - 112px);
overflow: auto;
```

Mantener separaciones de seguridad de `16px` y agregar
`@media (prefers-reduced-motion: reduce)`.

### Task 3: Implementar navegacion interna y accesibilidad

**Files:**
- Modify: `widgets/chat-flotante/chat-flotante.js`
- Modify: `widgets/chat-flotante/chat-flotante.html`

- [ ] **Step 1: Definir el estado**

Usar exclusivamente estos valores:

```js
const views = ["greeting", "main", "contact", "products", "information"];
let currentView = "greeting";
let isOpen = false;
```

- [ ] **Step 2: Conectar controles**

El launcher alterna apertura/cierre; el saludo avanza a `main`; las tres acciones
principales abren `contact`, `products` o `information`; Volver regresa a `main`;
Escape cierra.

- [ ] **Step 3: Mantener las opciones finales inertes**

Renderizarlas como `<button type="button">` sin navegación. Cada una conservara
un `data-action` descriptivo para conectar destinos posteriormente.

- [ ] **Step 4: Sincronizar accesibilidad**

Actualizar `aria-expanded`, `aria-hidden`, `hidden` y el texto accesible del
launcher. Al abrir, enfocar el boton de cierre; al cerrar, devolver foco al
launcher.

### Task 4: Verificar el widget completo

**Files:**
- Test: `preview-chat-flotante.html`

- [ ] **Step 1: Validar sintaxis y formato**

Run:

```powershell
node --check widgets/chat-flotante/chat-flotante.js
git diff --check
```

Expected: ambos comandos terminan con codigo `0`.

- [ ] **Step 2: Probar estados**

Con Playwright, verificar que existen cinco vistas, que solo una esta visible, que
abrir/cerrar y Volver funcionan y que las opciones finales no cambian la URL.

- [ ] **Step 3: Probar breakpoints**

Medir en `390`, `768`, `1024`, `1366` y `1920` pixeles. En todos los casos:

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

El panel debe quedar completamente dentro del viewport.

- [ ] **Step 4: Inspeccion visual**

Tomar screenshots en `390x844` y `1366x900`, comparar con Figma y corregir
alineacion, escala tipografica o colisiones antes de cerrar.

- [ ] **Step 5: Confirmar recursos**

Solicitar localmente HTML, CSS y JavaScript y comprobar respuesta `200` con tipos
MIME correctos.
