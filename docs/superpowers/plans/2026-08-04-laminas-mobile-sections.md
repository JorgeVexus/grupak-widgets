# Láminas Mobile Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adaptar los modos 4 y 5 del widget a los dos diseños móviles de Láminas, con flujo vertical responsivo y revelado individual durante el scroll.

**Architecture:** Reutilizar el DOM clonado de `productos-interactivos`, asignar clases móviles exclusivas a los modos 4 y 5, y cargar una hoja CSS independiente encapsulada bajo 767 px. Un único inicializador móvil preparará la medida “283 cm” y observará los elementos marcados de ambas secciones sin modificar la secuencia desktop.

**Tech Stack:** JavaScript nativo, CSS responsive, `IntersectionObserver` y `node:test`.

---

### Task 1: Contratos y carga aislada

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Create: `widgets/productos-secciones/productos-secciones-mobile-laminas.css`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Agregar contratos en estado rojo**

Agregar estas pruebas:

```js
const mobileLaminasPath = path.join(dir, "productos-secciones-mobile-laminas.css");
const mobileLaminas = fs.existsSync(mobileLaminasPath)
    ? fs.readFileSync(mobileLaminasPath, "utf8")
    : "";

test("Láminas móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-laminas-styles/);
    assert.match(js, /productos-secciones-mobile-laminas\.css/);
});

test("los modos 4 y 5 reciben clases móviles diferentes", () => {
    assert.match(js, /if \(entry\.mode === 4\) screen\.classList\.add\("ps-mobile-laminas-intro-v1"\)/);
    assert.match(js, /if \(entry\.mode === 5\) screen\.classList\.add\("ps-mobile-laminas-specs-v1"\)/);
});

test("solo los modos adaptados 0 a 5 usan altura automática móvil", () => {
    assert.match(js, /const adaptedMobileModes = new Set\(\["0", "1", "2", "3", "4", "5"\]\)/);
});
```

- [ ] **Step 2: Ejecutar la suite y confirmar el estado rojo**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: FAIL en los tres contratos nuevos porque la hoja, las clases y los modos adaptados todavía no existen.

- [ ] **Step 3: Cargar la hoja y asignar las clases**

En la lista de estilos de `productos-secciones.js`, agregar:

```js
["gpk-ps-mobile-laminas-styles", "productos-secciones-mobile-laminas.css"]
```

En `buildFlow`, después de las clases de Papel, agregar:

```js
if (entry.mode === 4) screen.classList.add("ps-mobile-laminas-intro-v1");
if (entry.mode === 5) screen.classList.add("ps-mobile-laminas-specs-v1");
```

Cambiar el conjunto de altura automática a:

```js
const adaptedMobileModes = new Set(["0", "1", "2", "3", "4", "5"]);
```

Crear `productos-secciones-mobile-laminas.css` con el armazón encapsulado:

```css
@media (max-width: 767px) {
    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1,
    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 {
        height: auto !important;
        min-height: 0;
        overflow: hidden;
        background: #f7f8f6;
    }
}
```

- [ ] **Step 4: Ejecutar pruebas**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: los contratos de carga, clases y altura pasan.

### Task 2: Composición móvil de las secciones 5 y 6

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-laminas.css`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Agregar contratos de estructura y encapsulamiento**

```js
test("el CSS de Láminas está encapsulado en los modos 4 y 5", () => {
    assert.match(mobileLaminas, /@media \(max-width: 767px\)/);
    assert.doesNotMatch(mobileLaminas, /@media[^\{]*(?:768|1024|480|440|390|375|360|320)/);
    const selectors = mobileLaminas.match(/#gpk-ps-widget[^\{]+(?=\{)/g) || [];
    assert.ok(selectors.length > 0);
    selectors.forEach(selector => {
        assert.match(selector, /\.ps-screen\[data-mode="(?:4|5)"\]\.ps-mobile-laminas-(?:intro|specs)-v1/);
    });
});

test("Láminas móvil reutiliza textos, ilustraciones y especificaciones", () => {
    assert.equal((sourceHtml.match(/class="laminas-intro-(?:left|right)"/g) || []).length, 2);
    assert.equal((sourceHtml.match(/class="laminas-stack-container stack-[12]"/g) || []).length, 2);
    assert.equal((sourceHtml.match(/class="laminas-spec-group spec-group-[12]"/g) || []).length, 2);
    assert.match(mobileLaminas, /\.laminas-stack-container/);
    assert.match(mobileLaminas, /\.laminas-spec-group/);
});

test("cada modo de Láminas oculta el contenido hermano", () => {
    assert.match(mobileLaminas, /data-mode="4"[^\{]+#pane-laminas-specs[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileLaminas, /data-mode="5"[^\{]+#laminas-intro-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
});
```

- [ ] **Step 2: Ejecutar pruebas y confirmar que fallan**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: FAIL en los contratos de composición porque faltan las reglas completas.

- [ ] **Step 3: Implementar la composición móvil**

Completar la hoja con reglas equivalentes a este bloque:

```css
@media (max-width: 767px) {
    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .products-board.ps-board-clone,
    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .products-board.ps-board-clone,
    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 #pane-laminas,
    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 #pane-laminas-specs {
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
        min-height: 0;
        opacity: 1;
        transform: none;
        pointer-events: auto;
        overflow: visible;
        background: #f7f8f6;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 #pane-laminas-specs,
    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 #laminas-intro-content {
        display: none !important;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-intro-content,
    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .laminas-specs-container {
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
        padding: clamp(34px, 9vw, 48px) clamp(18px, 5vw, 24px) clamp(48px, 12vw, 64px);
        opacity: 1;
        transform: none;
        display: flex;
        flex-direction: column;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-main-title,
    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .laminas-main-title {
        margin: 0 0 clamp(26px, 7vw, 36px);
        font-size: clamp(30px, 8.5vw, 40px);
        line-height: 1.05;
        text-align: left;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-intro-text {
        display: grid;
        grid-template-columns: 1fr;
        gap: 18px;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-intro-left,
    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-intro-right {
        padding: clamp(16px, 4.5vw, 22px);
        border: 1px solid #e2e5df;
        border-radius: 12px;
        background: #fff;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-intro-right {
        background: #effaf1;
        border-color: #cfe8d1;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-intro-left p,
    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-intro-right p {
        margin: 0;
        font-size: clamp(13px, 3.65vw, 16px);
        line-height: 1.48;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-bottom-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: clamp(24px, 7vw, 34px);
        margin-top: clamp(28px, 8vw, 40px);
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-resistencia-box {
        display: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-stack-container {
        width: 100%;
        height: auto;
        opacity: 1;
        transform: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .laminas-stack-img {
        display: block;
        width: 100%;
        height: auto;
        max-height: none;
        object-fit: contain;
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .laminas-specs-stage-content {
        position: relative;
        width: 100%;
        height: auto;
        display: grid;
        grid-template-columns: 1fr;
        gap: clamp(22px, 6vw, 32px);
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .laminas-spec-group {
        position: relative;
        inset: auto;
        width: 100%;
        height: auto;
        display: flex;
        flex-direction: column;
        gap: 0;
        overflow: hidden;
        border: 1px solid #e2e5df;
        border-radius: 12px;
        background: #fff;
        opacity: 1;
        transform: none;
        pointer-events: auto;
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-image-box {
        order: 1;
        width: 100%;
        height: clamp(178px, 52vw, 240px);
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-frame-wrapper,
    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-img {
        width: 100%;
        height: 100%;
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-vector-frame {
        display: none;
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-img {
        object-fit: cover;
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-text-box {
        order: 2;
        width: 100%;
        padding: clamp(16px, 4.5vw, 22px);
        text-align: left;
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-title {
        margin: 0 0 8px;
        color: #5b9f31;
        font-size: clamp(18px, 5vw, 23px);
        line-height: 1.1;
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-desc {
        margin: 0;
        font-size: clamp(13px, 3.65vw, 16px);
        line-height: 1.45;
    }

    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .ps-laminas-measure {
        display: block;
        margin-bottom: 8px;
        color: #555;
        font-size: clamp(24px, 7vw, 32px);
        line-height: 1;
        font-weight: 700;
    }
}
```

- [ ] **Step 4: Ejecutar pruebas**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: todos los contratos de estructura pasan.

### Task 3: Revelado individual, accesibilidad y verificación

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Modify: `widgets/productos-secciones/productos-secciones-mobile-laminas.css`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Modify: `widgets/productos-secciones/preview.html`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Agregar el contrato del observador**

```js
test("Láminas móvil revela cada elemento durante el scroll", () => {
    assert.match(js, /function setupMobileLaminasReveal\(root\)/);
    assert.match(js, /threshold:\s*0\.2/);
    assert.match(js, /},\s*150\)/);
    assert.match(js, /observer\.unobserve\(element\)/);
    assert.match(js, /element\.classList\.add\("ps-laminas-revealed"\)/);
    assert.match(mobileLaminas, /data-mode="4"[^\{]+\[data-ps-laminas-reveal\][^\{]*\{[^}]*translateY\(32px\)/s);
    assert.match(mobileLaminas, /spec-group-1[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileLaminas, /spec-group-2[^\{]*\{[^}]*translateX\(70px\)/s);
    assert.match(mobileLaminas, /\.ps-laminas-revealed\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translate\(0,\s*0\)/s);
});
```

- [ ] **Step 2: Ejecutar pruebas y comprobar el estado rojo**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: FAIL porque todavía no existe el inicializador ni los estados animados.

- [ ] **Step 3: Implementar preparación y observador**

Invocar `setupMobileLaminasReveal(root);` después de `setupMobilePaperCatalogReveal(root);` y agregar:

```js
function setupMobileLaminasReveal(root) {
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const intro = root.querySelector('.ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1');
    const specs = root.querySelector('.ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1');
    if (!intro || !specs) return;

    [
        intro.querySelector(".laminas-main-title"),
        intro.querySelector(".laminas-intro-left"),
        intro.querySelector(".laminas-intro-right"),
        intro.querySelector(".stack-1"),
        intro.querySelector(".stack-2"),
        specs.querySelector(".laminas-main-title"),
        specs.querySelector(".spec-group-1"),
        specs.querySelector(".spec-group-2")
    ].filter(Boolean).forEach(element => element.dataset.psLaminasReveal = "1");

    const firstDescription = specs.querySelector(".spec-group-1 .spec-desc");
    if (firstDescription && !firstDescription.querySelector(".ps-laminas-measure")) {
        const description = firstDescription.textContent.trim().replace(/^283 cm,\s*/i, "");
        firstDescription.innerHTML = `<strong class="ps-laminas-measure">283 cm</strong>${description}`;
    }

    const elements = Array.from(root.querySelectorAll("[data-ps-laminas-reveal]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
        elements.forEach(element => element.classList.add("ps-laminas-revealed"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            observer.unobserve(element);
            window.setTimeout(() => {
                element.classList.add("ps-laminas-revealed");
            }, 150);
        });
    }, { threshold: 0.2 });

    elements.forEach(element => observer.observe(element));
}
```

- [ ] **Step 4: Añadir estados de animación y movimiento reducido**

Dentro del breakpoint móvil:

```css
#gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 [data-ps-laminas-reveal],
#gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 [data-ps-laminas-reveal] {
    opacity: 0;
    transition: opacity 650ms cubic-bezier(0.25, 1, 0.5, 1),
                transform 650ms cubic-bezier(0.25, 1, 0.5, 1);
}

#gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 [data-ps-laminas-reveal] {
    transform: translateY(32px);
}

#gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-group-1 {
    transform: translateX(-70px);
}

#gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .spec-group-2 {
    transform: translateX(70px);
}

#gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 .ps-laminas-revealed,
#gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 .ps-laminas-revealed {
    opacity: 1;
    transform: translate(0, 0);
}
```

Agregar:

```css
@media (max-width: 767px) and (prefers-reduced-motion: reduce) {
    #gpk-ps-widget .ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1 [data-ps-laminas-reveal],
    #gpk-ps-widget .ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1 [data-ps-laminas-reveal] {
        opacity: 1;
        transform: none;
        transition: none !important;
    }
}
```

- [ ] **Step 5: Actualizar versión de recursos**

Cambiar `assetVersion` y el query del script de preview de `seccion-reveal-22` a `seccion-reveal-23`.

- [ ] **Step 6: Ejecutar verificación completa**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: 32 tests, 32 pass, 0 fail.

Run: `git diff --check`

Expected: exit code 0.

Confirmar con mediciones del navegador en 440, 390, 375, 360 y 320 px:

```js
({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  introTexts: document.querySelectorAll('.ps-screen[data-mode="4"] .laminas-intro-text > div').length,
  introImages: document.querySelectorAll('.ps-screen[data-mode="4"] .laminas-stack-container').length,
  specCards: document.querySelectorAll('.ps-screen[data-mode="5"] .laminas-spec-group').length
})
```

Expected for every width: `overflow: 0`, `introTexts: 2`, `introImages: 2`, `specCards: 2`.

- [ ] **Step 7: Crear checkpoint**

```bash
git add widgets/productos-secciones/preview.html widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-laminas.css widgets/productos-secciones/productos-secciones.contract.test.js
git commit -m "feat: adapt laminas sections for mobile"
```
