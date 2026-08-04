# Paper Catalog Per-Card Scroll Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revelar individualmente los cuatro Paks de la sección 4 móvil cuando cada tarjeta alcance 20% de visibilidad, después de 150 ms.

**Architecture:** Añadir una función pequeña de inicialización en el script existente que observe únicamente las tarjetas del catálogo móvil y les asigne una clase final una sola vez. El CSS móvil deja de depender del estado global `mode-3` para mostrar las tarjetas y responde a esa clase específica; desktop continúa fuera del breakpoint.

**Tech Stack:** JavaScript nativo, `IntersectionObserver`, CSS responsive y pruebas contractuales con `node:test`.

---

### Task 1: Contrato del revelado individual

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Escribir la prueba que falla**

Agregar:

```js
test("cada Pak móvil se revela individualmente al entrar en pantalla", () => {
    assert.match(js, /function setupMobilePaperCatalogReveal\(root\)/);
    assert.match(js, /window\.matchMedia\("\(max-width: 767px\)"\)\.matches/);
    assert.match(js, /threshold:\s*0\.2/);
    assert.match(js, /window\.setTimeout\(\(\) => \{\s*card\.classList\.add\("ps-card-revealed"\)/s);
    assert.match(js, /},\s*150\)/);
    assert.match(js, /observer\.unobserve\(card\)/);
    assert.match(mobilePaper, /\.product-card\.ps-card-revealed\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translateX\(0\)/s);
    assert.doesNotMatch(mobilePaper, /\.products-board\.mode-3 \.product-card\s*\{[^}]*opacity:\s*1/s);
});
```

- [ ] **Step 2: Ejecutar la prueba para comprobar el estado rojo**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: FAIL en `cada Pak móvil se revela individualmente al entrar en pantalla` porque la función y la clase todavía no existen.

### Task 2: Observador móvil por tarjeta

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js:118-123`
- Modify: `widgets/productos-secciones/productos-secciones.js` antes de `goToMode`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Conectar el inicializador**

Después de `setupReveal(root);`, agregar:

```js
setupMobilePaperCatalogReveal(root);
```

- [ ] **Step 2: Implementar el observador aislado**

Agregar antes de `goToMode`:

```js
function setupMobilePaperCatalogReveal(root) {
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const cards = Array.from(root.querySelectorAll(
        '.ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card'
    ));
    if (!cards.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
        cards.forEach(card => card.classList.add("ps-card-revealed"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            observer.unobserve(card);
            window.setTimeout(() => {
                card.classList.add("ps-card-revealed");
            }, 150);
        });
    }, { threshold: 0.2 });

    cards.forEach(card => observer.observe(card));
}
```

- [ ] **Step 3: Ejecutar la prueba y confirmar que todavía falla solo por CSS**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: FAIL en el selector `.product-card.ps-card-revealed`, ya que el CSS aún conserva el selector global.

### Task 3: Estado visual de revelado y limpieza de retrasos globales

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-paper.css:178-214`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Cambiar el estado final a la clase individual**

Reemplazar:

```css
#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .products-board.mode-3 .product-card {
    opacity: 1;
    transform: translateX(0);
}
```

por:

```css
#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card.ps-card-revealed {
    opacity: 1;
    transform: translateX(0);
}
```

- [ ] **Step 2: Eliminar los cuatro `transition-delay` por índice**

Eliminar las reglas de `0.10s`, `0.18s`, `0.26s` y `0.34s`. La espera de 150 ms ahora ocurre al intersectar cada tarjeta y no cuando se activa toda la sección.

- [ ] **Step 3: Ejecutar la suite completa**

Run: `node --test --test-reporter=spec widgets/productos-secciones/productos-secciones.contract.test.js`

Expected: 25 tests, 25 pass, 0 fail.

- [ ] **Step 4: Revisar formato y alcance**

Run: `git diff --check`

Expected: exit code 0. Confirmar en el diff que solo cambian el test contractual, el JavaScript del widget y el CSS móvil de Papel.

- [ ] **Step 5: Crear checkpoint**

```bash
git add widgets/productos-secciones/productos-secciones.contract.test.js widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-paper.css
git commit -m "fix: reveal mobile paper cards during scroll"
```
