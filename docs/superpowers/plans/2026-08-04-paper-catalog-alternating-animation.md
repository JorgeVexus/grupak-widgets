# Paper Catalog Alternating Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animar las cuatro tarjetas del catálogo móvil alternando entradas de izquierda y derecha a 70 px.

**Architecture:** El cambio se limita a selectores `data-index` dentro del ámbito móvil existente del modo 3. No se añade JavaScript; `mode-3` sigue controlando el estado final y el bloque de movimiento reducido elimina la transformación.

**Tech Stack:** CSS, Node.js `node:test` y navegador local.

---

### Task 1: Contrato rojo de direcciones alternadas

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Test: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Añadir el contrato exacto**

```js
test("el catálogo móvil alterna entradas laterales de 70px", () => {
    assert.match(mobilePaper, /data-index="1"[^\{]*\{[^}]*transform:\s*translateX\(-70px\)/s);
    assert.match(mobilePaper, /data-index="2"[^\{]*\{[^}]*transform:\s*translateX\(70px\)/s);
    assert.match(mobilePaper, /data-index="3"[^\{]*\{[^}]*transform:\s*translateX\(-70px\)/s);
    assert.match(mobilePaper, /data-index="4"[^\{]*\{[^}]*transform:\s*translateX\(70px\)/s);
    assert.match(mobilePaper, /\.products-board\.mode-3 \.product-card\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translateX\(0\)/s);
});
```

- [ ] **Step 2: Ejecutar y confirmar un fallo nuevo**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 23 pruebas pasan y el contrato nuevo falla porque las tarjetas todavía usan `translateY(32px)`.

### Task 2: Implementar las cuatro entradas

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-paper.css`

- [ ] **Step 1: Sustituir el estado vertical genérico**

En `.product-card`, conservar dimensiones y añadir duración explícita:

```css
transition: opacity 650ms cubic-bezier(0.25, 1, 0.5, 1),
            transform 650ms cubic-bezier(0.25, 1, 0.5, 1);
```

Eliminar `transform: translateY(32px);` de esa regla.

- [ ] **Step 2: Añadir estados iniciales alternados antes del estado final**

```css
#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card[data-index="1"],
#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card[data-index="3"] {
    opacity: 0;
    transform: translateX(-70px);
}

#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card[data-index="2"],
#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card[data-index="4"] {
    opacity: 0;
    transform: translateX(70px);
}
```

- [ ] **Step 3: Ajustar el estado final**

```css
#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .products-board.mode-3 .product-card {
    opacity: 1;
    transform: translateX(0);
}
```

- [ ] **Step 4: Ejecutar la suite**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 24 pruebas pasan, 0 fallos.

### Task 3: Verificación visual y checkpoint

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-paper.css`

- [ ] **Step 1: Revisar 390 y 320 px**

URL: `http://127.0.0.1:8027/widgets/productos-secciones/preview.html?v=21`

Confirmar orden izquierda → derecha → izquierda → derecha, estado final alineado y ausencia de desbordamiento horizontal.

- [ ] **Step 2: Confirmar movimiento reducido y desktop**

Verificar que la regla combinada de `prefers-reduced-motion` mantiene `transform: none`, y que a 1280 px las tarjetas conservan la animación desktop del vendor.

- [ ] **Step 3: Ejecutar verificación fresca**

Run: `node --test "widgets/productos-secciones/productos-secciones.contract.test.js"`

Expected: 24 aprobadas, 0 fallos.

Run: `git diff --check`

Expected: sin errores.

- [ ] **Step 4: Guardar checkpoint reversible**

```bash
git add widgets/productos-secciones/productos-secciones.contract.test.js widgets/productos-secciones/productos-secciones-mobile-paper.css
git commit -m "feat: alternate paper catalog card entrances"
```

- [ ] **Step 5: Entregar preview sin integrar**

Entregar la URL local. No integrar a `main` ni hacer push sin aprobación explícita.
