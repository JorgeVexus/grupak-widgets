# Grabados Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt mode 10 of Productos Secciones to the approved 390 px Grabados Figma layout with four clean mobile images and alternating scroll reveals, without changing desktop.

**Architecture:** Add one mobile-only stylesheet rooted at the widget, mode 10, and `ps-mobile-grabados-v1`. Extend the existing adapter with one setup function that decorates the cloned mode-10 elements for one-shot IntersectionObserver reveals; retain the existing desktop mode 10–13 sequence unchanged.

**Tech Stack:** Vanilla CSS and JavaScript, Node.js built-in test runner, IntersectionObserver, local HTTP preview, in-app browser responsive inspection.

---

## File map

- Create `widgets/productos-secciones/productos-secciones-mobile-grabados.css`: all mode-10 mobile layout and reveal states.
- Modify `widgets/productos-secciones/productos-secciones.js`: load the sheet, add the mobile class, enable natural height, and initialize the observer.
- Modify `widgets/productos-secciones/productos-secciones.contract.test.js`: contracts for isolation, source-image reuse, desktop-background removal, animation, and accessibility.
- Modify `widgets/productos-secciones/preview.html`: advance the cache key from version 26 to 27.

### Task 1: Wire an isolated mode-10 mobile surface

**Files:**
- Create: `widgets/productos-secciones/productos-secciones-mobile-grabados.css`
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Write failing contracts for the sheet, class, and height**

Load the future sheet beside the other mobile fixtures:

```js
const mobileGrabadosPath = path.join(dir, "productos-secciones-mobile-grabados.css");
const mobileGrabados = fs.existsSync(mobileGrabadosPath)
    ? fs.readFileSync(mobileGrabadosPath, "utf8")
    : "";
```

Append:

```js
test("Grabados móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-grabados-styles/);
    assert.match(js, /productos-secciones-mobile-grabados\.css/);
});

test("el modo 10 recibe una clase móvil exclusiva", () => {
    assert.match(js, /if \(entry\.mode === 10\) screen\.classList\.add\("ps-mobile-grabados-v1"\)/);
});

test("Grabados se suma a los modos móviles con altura automática", () => {
    assert.match(js, /const adaptedMobileModes = new Set\(\["0", "1", "2", "3", "4", "5", "7", "8", "9", "10"\]\)/);
});

test("el CSS de Grabados está encapsulado en modo 10", () => {
    assert.match(mobileGrabados, /@media \(max-width: 767px\)/);
    assert.doesNotMatch(mobileGrabados, /@media[^\{]*(?:768|1024|480|440|390|375|360|320)/);
    const selectors = mobileGrabados.match(/#gpk-ps-widget[^\{]+(?=\{)/g) || [];
    assert.ok(selectors.length > 0);
    selectors.forEach(selector => {
        assert.match(selector, /\.ps-screen\[data-mode="10"\]\.ps-mobile-grabados-v1/);
    });
});
```

Update the two existing exact `adaptedMobileModes` assertions to include `"10"`.

- [ ] **Step 2: Run the contracts and verify the expected red state**

Run:

```powershell
node --test widgets/productos-secciones/productos-secciones.contract.test.js
```

Expected: the four Grabados contracts and the updated exact mode-set contracts fail because production still ends at mode 9.

- [ ] **Step 3: Implement the minimum isolation wiring**

Add the stylesheet tuple after Cajas:

```js
["gpk-ps-mobile-grabados-styles", "productos-secciones-mobile-grabados.css"]
```

Add the class inside `buildFlow`:

```js
if (entry.mode === 10) screen.classList.add("ps-mobile-grabados-v1");
```

Replace the mode set with:

```js
const adaptedMobileModes = new Set(["0", "1", "2", "3", "4", "5", "7", "8", "9", "10"]);
```

Create the sheet:

```css
@media (max-width: 767px) {
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 {
    overflow: hidden;
  }
}
```

- [ ] **Step 4: Run tests until the complete suite is green**

Run the Node command again. Expected: all contracts pass.

- [ ] **Step 5: Commit the reversible wiring checkpoint**

```powershell
git add widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-grabados.css widgets/productos-secciones/productos-secciones.contract.test.js
git commit -m "feat: scaffold grabados mobile section"
```

### Task 2: Reproduce the Figma layout with clean image elements

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones-mobile-grabados.css`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`

- [ ] **Step 1: Write failing contracts for the four images and removed desktop surfaces**

Append:

```js
test("Grabados móvil reutiliza las cuatro imágenes preparadas", () => {
    ["mov 01.png", "mov 02.png", "mov 03.png", "mov 04.png"].forEach(file => {
        assert.match(sourceHtml, new RegExp(file.replace(".", "\\.")));
    });
    assert.match(mobileGrabados, /\.grabados-service-image/);
    assert.match(mobileGrabados, /width:\s*100%/);
    assert.match(mobileGrabados, /height:\s*auto/);
});

test("Grabados móvil elimina fondos y posiciones desktop", () => {
    assert.match(mobileGrabados, /\.grabados-green-card[^\{]*\{[^}]*background-image:\s*none\s*!important/s);
    assert.match(mobileGrabados, /\.grabados-green-card[^\{]*\{[^}]*background-color:\s*transparent\s*!important/s);
    assert.match(mobileGrabados, /\.products-board::before[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileGrabados, /\.grabados-chat-icon[^\{]*\{[^}]*display:\s*none\s*!important/s);
});

test("Grabados móvil conserva título, introducción y cuatro servicios", () => {
    assert.equal((sourceHtml.match(/class="grabados-green-card"/g) || []).length, 4);
    assert.match(mobileGrabados, /\.grabados-left-content/);
    assert.match(mobileGrabados, /\.grabados-cards-grid-new/);
    assert.match(mobileGrabados, /\.grabados-card-title/);
    assert.match(mobileGrabados, /\.grabados-card-desc/);
});
```

- [ ] **Step 2: Run tests and confirm the three layout contracts fail**

Run the Node command. Expected: three failures caused by the intentionally minimal stylesheet.

- [ ] **Step 3: Implement the complete one-column mobile layout**

Replace the sheet with this scoped structure; every selector remains under the one media query and repeats the complete mode root:

```css
@media (max-width: 767px) {
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 {
    overflow: hidden;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .products-board,
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 #pane-grabados {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    transform: none !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .products-board::before,
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-chat-icon {
    display: none !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 #pane-grabados {
    display: block !important;
    padding: clamp(32px, 8vw, 40px) clamp(18px, 5.5vw, 24px) clamp(56px, 15vw, 72px) !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-left-content,
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-cards-grid-new,
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-green-card,
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-card-text-wrapper {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    height: auto !important;
    transform: none !important;
    box-sizing: border-box !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-main-title {
    margin: 0 !important;
    color: #27352b !important;
    font-size: clamp(30px, 8.5vw, 38px) !important;
    line-height: 1.04 !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-intro-text {
    margin-top: 18px !important;
    font-size: clamp(15px, 4.1vw, 17px) !important;
    line-height: 1.45 !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-cards-grid-new {
    display: flex !important;
    flex-direction: column;
    gap: clamp(30px, 8vw, 42px);
    margin-top: clamp(28px, 8vw, 40px) !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-green-card {
    display: flex !important;
    flex-direction: column;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background-color: transparent !important;
    background-image: none !important;
    box-shadow: none !important;
    opacity: 1 !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-service-image.mobile-only {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 0 14px !important;
    object-fit: cover;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-card-title {
    margin: 0 !important;
    color: #569b2f !important;
    font-size: clamp(17px, 4.8vw, 21px) !important;
    line-height: 1.2 !important;
    text-transform: none !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-card-desc {
    margin: 8px 0 0 !important;
    color: #4f5651 !important;
    font-size: clamp(14px, 3.9vw, 16px) !important;
    line-height: 1.45 !important;
  }
}
```

- [ ] **Step 4: Run the suite and `git diff --check`**

Expected: every contract passes and the diff check prints no errors.

- [ ] **Step 5: Commit the layout checkpoint**

```powershell
git add widgets/productos-secciones/productos-secciones-mobile-grabados.css widgets/productos-secciones/productos-secciones.contract.test.js
git commit -m "feat: adapt grabados section for mobile"
```

### Task 3: Add one-shot alternating reveals and verify responsive behavior

**Files:**
- Modify: `widgets/productos-secciones/productos-secciones.js`
- Modify: `widgets/productos-secciones/productos-secciones-mobile-grabados.css`
- Modify: `widgets/productos-secciones/productos-secciones.contract.test.js`
- Modify: `widgets/productos-secciones/preview.html`

- [ ] **Step 1: Write failing observer and direction contracts**

Append:

```js
test("Grabados móvil revela cada bloque una sola vez", () => {
    assert.match(js, /function setupMobileGrabadosReveal\(root\)/);
    assert.match(js, /threshold:\s*0\.2/);
    assert.match(js, /},\s*150\)/);
    assert.match(js, /observer\.unobserve\(element\)/);
    assert.match(js, /element\.classList\.add\("ps-grabados-revealed"\)/);
    assert.match(js, /prefers-reduced-motion: reduce/);
});

test("Grabados alterna sus cuatro entradas laterales", () => {
    assert.match(mobileGrabados, /data-index="1"[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileGrabados, /data-index="2"[^\{]*\{[^}]*translateX\(70px\)/s);
    assert.match(mobileGrabados, /data-index="3"[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileGrabados, /data-index="4"[^\{]*\{[^}]*translateX\(70px\)/s);
    assert.match(mobileGrabados, /\[data-ps-grabados-reveal\]\.ps-grabados-revealed/);
});
```

- [ ] **Step 2: Run tests and verify both contracts fail**

Expected: two failures for the missing setup function and reveal CSS.

- [ ] **Step 3: Implement the observer and element decoration**

Call `setupMobileGrabadosReveal(root);` after `setupMobileCajasReveal(root);` and add:

```js
function setupMobileGrabadosReveal(root) {
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const screen = root.querySelector('.ps-screen[data-mode="10"].ps-mobile-grabados-v1');
    if (!screen) return;

    [
        screen.querySelector(".grabados-main-title"),
        screen.querySelector(".grabados-intro-text"),
        ...screen.querySelectorAll(".grabados-green-card")
    ].filter(Boolean).forEach(element => element.dataset.psGrabadosReveal = "1");

    const elements = Array.from(screen.querySelectorAll("[data-ps-grabados-reveal]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
        elements.forEach(element => element.classList.add("ps-grabados-revealed"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            observer.unobserve(element);
            window.setTimeout(() => {
                element.classList.add("ps-grabados-revealed");
            }, 150);
        });
    }, { threshold: 0.2 });

    elements.forEach(element => observer.observe(element));
}
```

- [ ] **Step 4: Add scoped reveal and reduced-motion states**

Append inside the 767 px media query:

```css
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 [data-ps-grabados-reveal] {
    opacity: 0 !important;
    transition: opacity 650ms ease, transform 650ms cubic-bezier(.22, 1, .36, 1) !important;
    will-change: opacity, transform;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-main-title[data-ps-grabados-reveal],
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-intro-text[data-ps-grabados-reveal] {
    transform: translateY(32px) !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-green-card[data-index="1"],
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-green-card[data-index="3"] {
    transform: translateX(-70px) !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-green-card[data-index="2"],
  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 .grabados-green-card[data-index="4"] {
    transform: translateX(70px) !important;
  }

  #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 [data-ps-grabados-reveal].ps-grabados-revealed {
    opacity: 1 !important;
    transform: translate(0, 0) !important;
  }

  @media (prefers-reduced-motion: reduce) {
    #gpk-ps-widget .ps-screen[data-mode="10"].ps-mobile-grabados-v1 [data-ps-grabados-reveal] {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }
```

- [ ] **Step 5: Advance cache keys and run fresh automated verification**

Change `assetVersion` to `seccion-reveal-27` and the preview script query to the same value. Run:

```powershell
node --test widgets/productos-secciones/productos-secciones.contract.test.js
git diff --check
```

Expected: the full suite passes with zero failures and the diff check is clean.

- [ ] **Step 6: Verify the local preview visually**

Open `http://127.0.0.1:8027/widgets/productos-secciones/preview.html?v=27`. At 440, 390, 375, 360, and 320 px verify:

- the four clean images appear in source order;
- no green desktop backgrounds remain;
- titles and descriptions match the Figma hierarchy;
- cards finish at transform matrix translation zero;
- document scroll width equals client width;
- the last service clears the bottom navigation.

At 1440 px verify the mobile sheet is inactive, `.grabados-green-card` still has its production background image, and the existing mode 10–13 timed sequence remains present in JavaScript.

- [ ] **Step 7: Commit the verified animation checkpoint**

```powershell
git add widgets/productos-secciones/productos-secciones.js widgets/productos-secciones/productos-secciones-mobile-grabados.css widgets/productos-secciones/productos-secciones.contract.test.js widgets/productos-secciones/preview.html
git commit -m "feat: animate grabados mobile services"
```

## Final review checklist

- Node `2277:26164` maps to the single mode-10 mobile section.
- All four `mov` images are visible as `<img>` elements; desktop background imagery is not used in mobile.
- Every new CSS selector includes widget, mode 10, and `ps-mobile-grabados-v1`.
- Only the 767 px breakpoint exists; `clamp()` covers 320–440 px.
- The existing desktop grabados sequence and source HTML remain unchanged.
- Reveals use the approved directions, 70/32 px distances, 650 ms duration, 150 ms wait, 0.2 threshold, one-shot unobserve, and reduced-motion fallback.
- Work remains on `codex/productos-mobile-section-1` until all mobile sections are complete.
