# Energy Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt mode 14 of Productos Secciones to the approved 390 px Energy Figma layout using the three clean mobile images and alternating scroll reveals, without changing desktop.

**Architecture:** Add one mobile-only stylesheet rooted at the widget, mode 14, and `ps-mobile-energia-v1`. Extend the existing vanilla-JavaScript adapter with mobile-only copy preparation and a one-shot IntersectionObserver; preserve the source HTML and all desktop styling.

**Tech Stack:** Vanilla HTML, CSS and JavaScript; Node.js built-in test runner; IntersectionObserver; local HTTP preview; in-app browser responsive inspection.

---

## File map

- Create `widgets/productos-secciones/productos-secciones-mobile-energia.css`: all mode-14 mobile layout and reveal states.
- Modify `widgets/productos-secciones/productos-secciones.js`: load the sheet, add the mobile class, enable natural height, prepare Figma copy, and initialize reveals.
- Modify `widgets/productos-secciones/productos-secciones.contract.test.js`: contracts for isolation, image reuse, copy, layout, animation, and accessibility.
- Modify `widgets/productos-secciones/preview.html`: advance the cache key from version 27 to 28.

### Task 1: Wire an isolated mode-14 mobile surface

**Files:**
- Create: `widgets/productos-secciones/productos-secciones-mobile-energia.css`
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Write failing contracts for the sheet, class, and natural height**

Add the future sheet fixture beside `mobileGrabados`:

```js
const mobileEnergiaPath = path.join(dir, "productos-secciones-mobile-energia.css");
const mobileEnergia = fs.existsSync(mobileEnergiaPath)
    ? fs.readFileSync(mobileEnergiaPath, "utf8")
    : "";
```

Append:

```js
test("Energía móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-energia-styles/);
    assert.match(js, /productos-secciones-mobile-energia\.css/);
});

test("el modo 14 recibe una clase móvil exclusiva", () => {
    assert.match(js, /if \(entry\.mode === 14\) screen\.classList\.add\("ps-mobile-energia-v1"\)/);
});

test("Energía se suma a los modos móviles con altura automática", () => {
    assert.match(js, /const adaptedMobileModes = new Set\(\["0", "1", "2", "3", "4", "5", "7", "8", "9", "10", "14"\]\)/);
});

test("el CSS de Energía está encapsulado en modo 14", () => {
    assert.match(mobileEnergia, /@media \(max-width: 767px\)/);
    assert.doesNotMatch(mobileEnergia, /@media[^\{]*(?:768|1024|480|440|390|375|360|320)/);
    const selectors = mobileEnergia.match(/#gpk-ps-widget[^\{]+(?=\{)/g) || [];
    assert.ok(selectors.length > 0);
    selectors.forEach(selector => {
        assert.match(selector, /\.ps-screen\[data-mode="14"\]\.ps-mobile-energia-v1/);
    });
});
```

Update every existing exact `adaptedMobileModes` assertion to include `"14"`.

- [ ] **Step 2: Run the contracts and verify the expected red state**

Run:

```powershell
node --test widgets/productos-secciones/productos-secciones.contract.test.js
```

Expected: the new Energy contracts and the exact mode-set assertions fail because production still ends at mode 10.

- [ ] **Step 3: Implement the minimum isolation wiring**

Add the stylesheet tuple after Grabados:

```js
["gpk-ps-mobile-energia-styles", "productos-secciones-mobile-energia.css"]
```

Add the class inside `buildFlow`:

```js
if (entry.mode === 14) screen.classList.add("ps-mobile-energia-v1");
```

Replace the adapted mode set with:

```js
const adaptedMobileModes = new Set(["0", "1", "2", "3", "4", "5", "7", "8", "9", "10", "14"]);
```

Create the sheet:

```css
@media (max-width: 767px) {
  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 {
    overflow: hidden;
  }
}
```

- [ ] **Step 4: Run the complete suite and verify it is green**

Run the Node command again. Expected: all contracts pass.

- [ ] **Step 5: Commit the reversible wiring checkpoint**

```powershell
git add widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-energia.css widgets/productos-secciones/productos-secciones.contract.test.js
git commit -m "feat: scaffold energia mobile section"
```

### Task 2: Reproduce the Figma layout with the existing clean images

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-energia.css`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Write failing layout and asset contracts**

Append:

```js
test("Energía móvil reutiliza las tres imágenes preparadas", () => {
    ["energia-eficiencia.webp", "energia-impacto.webp", "energia-suministro.webp"].forEach(file => {
        assert.match(sourceHtml, new RegExp(file.replace(".", "\\.")));
    });
    assert.match(mobileEnergia, /\.energia-mobile-image-container/);
    assert.match(mobileEnergia, /\.energia-mobile-image/);
    assert.match(mobileEnergia, /width:\s*80px/);
    assert.match(mobileEnergia, /height:\s*80px/);
});

test("Energía móvil elimina posiciones y fondos compuestos desktop", () => {
    assert.match(mobileEnergia, /\.energia-row[^\{]*\{[^}]*position:\s*relative\s*!important/s);
    assert.match(mobileEnergia, /\.energia-row[^\{]*\{[^}]*background-image:\s*none\s*!important/s);
    assert.match(mobileEnergia, /\.products-board::before[^\{]*\{[^}]*display:\s*none\s*!important/s);
});

test("Energía móvil reproduce las superficies del Figma", () => {
    assert.match(mobileEnergia, /#f9fafb/i);
    assert.match(mobileEnergia, /#5f9d2f/i);
    assert.match(mobileEnergia, /#e5e7eb/i);
    assert.match(mobileEnergia, /border-radius:\s*12px/);
    assert.match(mobileEnergia, /grid-template-columns:\s*80px minmax\(0, 1fr\)/);
});
```

- [ ] **Step 2: Run tests and confirm the three layout contracts fail**

Run the Node command. Expected: three failures caused by the intentionally minimal stylesheet.

- [ ] **Step 3: Implement the complete mobile layout**

Replace the sheet with the following scoped CSS. Repeat the complete mode root in every selector so no rule can leak into other modes:

```css
@media (max-width: 767px) {
  #gpk-ps-widget:has(.ps-screen[data-mode="14"].ps-mobile-energia-v1) .ps-side-nav {
    display: none !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 {
    overflow: hidden;
    background: #f9fafb;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .products-board,
  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 #pane-energia {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    transform: none !important;
    box-sizing: border-box !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .products-board::before {
    display: none !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 #pane-energia {
    display: flex !important;
    flex-direction: column;
    gap: 28px;
    padding: 24px clamp(16px, 5.13vw, 20px) 100px !important;
    overflow: hidden !important;
    opacity: 1 !important;
    background: #f9fafb !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-header {
    position: relative !important;
    inset: auto !important;
    display: flex !important;
    flex-direction: column;
    gap: 28px;
    width: 100% !important;
    height: auto !important;
    text-align: left !important;
    transform: none !important;
    opacity: 1 !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-main-title {
    margin: 0 !important;
    color: #5f9d2f !important;
    font-size: 28px !important;
    line-height: 1.2 !important;
    font-weight: 700 !important;
    text-align: left !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-intro-text {
    margin: 0 !important;
    padding: 16px !important;
    color: #6e6e6e !important;
    font-size: 18px !important;
    line-height: 20px !important;
    text-align: left !important;
    background: #fff !important;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-sizing: border-box;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-intro-text strong {
    color: #6e6e6e !important;
    font-weight: 700 !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-rows {
    position: relative !important;
    inset: auto !important;
    display: flex !important;
    flex-direction: column;
    gap: 12px;
    width: 100% !important;
    height: auto !important;
    pointer-events: auto !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-row {
    position: relative !important;
    inset: auto !important;
    display: grid !important;
    grid-template-columns: 80px minmax(0, 1fr);
    align-items: center;
    gap: 12px;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 12px !important;
    background-color: #fff !important;
    background-image: none !important;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-sizing: border-box;
    opacity: 1 !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-mobile-image-container {
    position: relative !important;
    inset: auto !important;
    display: block !important;
    width: 80px !important;
    height: 80px !important;
    overflow: hidden;
    border-radius: 8px;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-mobile-image {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 8px;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-row-content {
    width: 100% !important;
    max-width: none !important;
    padding: 0 !important;
    text-align: left;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-row h3 {
    margin: 0 0 4px !important;
    color: #5f9d2f !important;
    font-size: 15px !important;
    line-height: 1.2 !important;
    font-weight: 700 !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-row p {
    margin: 0 !important;
    color: #6e6e6e !important;
    font-size: 12px !important;
    line-height: 16px !important;
  }
}
```

- [ ] **Step 4: Run the suite and `git diff --check`**

Expected: all contracts pass and the diff check prints no errors.

- [ ] **Step 5: Commit the layout checkpoint**

```powershell
git add widgets/productos-secciones/productos-secciones-mobile-energia.css widgets/productos-secciones/productos-secciones.contract.test.js
git commit -m "feat: adapt energia section for mobile"
```

### Task 3: Apply the exact mobile copy without changing desktop

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Write a failing contract for the Figma copy**

Append:

```js
test("Energía móvil usa la copia del Figma sin alterar el HTML fuente", () => {
    assert.match(js, /function prepareMobileEnergiaContent\(root\)/);
    assert.match(js, /Alcanzamos hasta un 80% de rendimiento energético/);
    assert.match(js, /reducimos emisiones y mejoramos nuestra huella de carbono industrial/);
    assert.match(js, /asegurando continuidad operativa total en planta/);
    assert.match(sourceHtml, /centrales térmicas convencionales/);
    assert.match(sourceHtml, /fabricación de papel y empaques/);
});
```

- [ ] **Step 2: Run tests and verify the new contract fails**

Expected: one failure for the missing preparation function and mobile strings.

- [ ] **Step 3: Implement mobile-only copy preparation**

Call `prepareMobileEnergiaContent(root);` after `prepareMobileGrabadosContent(root);` and add:

```js
function prepareMobileEnergiaContent(root) {
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const screen = root.querySelector('.ps-screen[data-mode="14"].ps-mobile-energia-v1');
    if (!screen) return;

    const descriptions = [
        "Alcanzamos hasta un 80% de rendimiento energético mediante nuestra tecnología de cogeneración simultánea.",
        "Al aprovechar mejor el combustible, reducimos emisiones y mejoramos nuestra huella de carbono industrial.",
        "Generamos parte importante de la energía que utilizamos, asegurando continuidad operativa total en planta."
    ];

    screen.querySelectorAll(".energia-row").forEach((row, index) => {
        const paragraph = row.querySelector(".energia-row-content p");
        if (paragraph && descriptions[index]) paragraph.textContent = descriptions[index];
    });
}
```

- [ ] **Step 4: Run tests and commit the copy checkpoint**

Expected: the complete suite passes.

```powershell
git add widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones.contract.test.js
git commit -m "feat: match energia mobile copy"
```

### Task 4: Add one-shot alternating reveals and verify responsive behavior

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Modify: `widgets/productos-secciones/productos-secciones-mobile-energia.css`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Modify: `widgets/productos-secciones/preview.html`

- [ ] **Step 1: Write failing observer and direction contracts**

Append:

```js
test("Energía móvil revela cada bloque una sola vez", () => {
    assert.match(js, /function setupMobileEnergiaReveal\(root\)/);
    assert.match(js, /threshold:\s*0\.2/);
    assert.match(js, /},\s*150\)/);
    assert.match(js, /observer\.unobserve\(element\)/);
    assert.match(js, /element\.classList\.add\("ps-energia-revealed"\)/);
});

test("Energía alterna sus tres entradas laterales", () => {
    assert.match(mobileEnergia, /data-index="1"[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileEnergia, /data-index="2"[^\{]*\{[^}]*translateX\(70px\)/s);
    assert.match(mobileEnergia, /data-index="3"[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileEnergia, /\[data-ps-energia-reveal\]\.ps-energia-revealed/);
    assert.match(mobileEnergia, /prefers-reduced-motion:\s*reduce/);
});
```

- [ ] **Step 2: Run tests and verify both contracts fail**

Expected: two failures for the missing setup function and reveal CSS.

- [ ] **Step 3: Implement the observer and element decoration**

Call `setupMobileEnergiaReveal(root);` after `setupMobileGrabadosReveal(root);` and add:

```js
function setupMobileEnergiaReveal(root) {
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const screen = root.querySelector('.ps-screen[data-mode="14"].ps-mobile-energia-v1');
    if (!screen) return;

    [
        screen.querySelector(".energia-main-title"),
        screen.querySelector(".energia-intro-text"),
        ...screen.querySelectorAll(".energia-row")
    ].filter(Boolean).forEach(element => element.dataset.psEnergiaReveal = "1");

    const elements = Array.from(screen.querySelectorAll("[data-ps-energia-reveal]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
        elements.forEach(element => element.classList.add("ps-energia-revealed"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            observer.unobserve(element);
            window.setTimeout(() => {
                element.classList.add("ps-energia-revealed");
            }, 150);
        });
    }, { threshold: 0.2 });

    elements.forEach(element => observer.observe(element));
}
```

- [ ] **Step 4: Add scoped reveal and reduced-motion states**

Append inside the 767 px media query:

```css
  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 [data-ps-energia-reveal] {
    opacity: 0 !important;
    transition: opacity 650ms ease, transform 650ms cubic-bezier(.22, 1, .36, 1) !important;
    will-change: opacity, transform;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-main-title[data-ps-energia-reveal],
  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-intro-text[data-ps-energia-reveal] {
    transform: translateY(32px) !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-row[data-index="1"],
  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-row[data-index="3"] {
    transform: translateX(-70px) !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 .energia-row[data-index="2"] {
    transform: translateX(70px) !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 [data-ps-energia-reveal].ps-energia-revealed {
    opacity: 1 !important;
    transform: translate(0, 0) !important;
  }

  @media (prefers-reduced-motion: reduce) {
    #gpk-ps-widget .ps-screen[data-mode="14"].ps-mobile-energia-v1 [data-ps-energia-reveal] {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }
```

- [ ] **Step 5: Advance cache keys and run fresh automated verification**

Change `assetVersion` to `seccion-reveal-28` and the preview script query to the same value. Run:

```powershell
node --test widgets/productos-secciones/productos-secciones.contract.test.js
git diff --check
```

Expected: the full suite passes with zero failures and the diff check is clean.

- [ ] **Step 6: Verify the local preview visually**

Open `http://127.0.0.1:8027/widgets/productos-secciones/preview.html?v=28`. At 440, 390, 375, 360, and 320 px verify:

- the three clean images appear in source order at approximately 80 × 80 px;
- the intro and cards match the white surfaces, borders, radii, colors and spacing from Figma;
- the mobile copy matches the Figma and is not truncated;
- each revealed element finishes at transform matrix translation zero;
- the lateral navigation is hidden;
- document scroll width equals client width.

At 1440 px verify the mobile sheet is inactive, the three `.energia-row` elements retain their production background images and diagonal absolute positions, the mobile `<img>` elements are hidden, and the original long descriptions remain present.

- [ ] **Step 7: Commit the verified animation checkpoint**

```powershell
git add widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-energia.css widgets/productos-secciones/productos-secciones.contract.test.js widgets/productos-secciones/preview.html
git commit -m "feat: animate energia mobile benefits"
```

## Final review checklist

- Node `2277:26192` maps only to the mode-14 mobile section.
- The three existing Energy WebP images render as `<img>` elements; desktop composite backgrounds are not used in mobile.
- Every new CSS selector includes widget, mode 14, and `ps-mobile-energia-v1`.
- Only the 767 px breakpoint exists; `clamp()` protects 320–440 px.
- Source HTML and desktop Energy layout remain unchanged.
- Reveals use the approved directions, 70/32 px distances, 650 ms duration, 150 ms wait, 0.2 threshold, one-shot unobserve, and reduced-motion fallback.
- Work remains on `codex/productos-mobile-section-1` until all mobile sections are complete.
