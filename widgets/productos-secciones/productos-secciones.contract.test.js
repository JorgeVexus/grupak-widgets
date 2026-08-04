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
const mobileIntroPath = path.join(dir, "productos-secciones-mobile-intro.css");
const mobileIntro = fs.existsSync(mobileIntroPath)
    ? fs.readFileSync(mobileIntroPath, "utf8")
    : "";
const mobileOverviewPath = path.join(dir, "productos-secciones-mobile-overview.css");
const mobileOverview = fs.existsSync(mobileOverviewPath)
    ? fs.readFileSync(mobileOverviewPath, "utf8")
    : "";
const mobilePaperPath = path.join(dir, "productos-secciones-mobile-paper.css");
const mobilePaper = fs.existsSync(mobilePaperPath)
    ? fs.readFileSync(mobilePaperPath, "utf8")
    : "";
const sourceHtml = fs.readFileSync(
    path.join(dir, "../productos-interactivos/productos-interactivos.html"),
    "utf8"
);

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
    assert.match(js, /Math\.min\(usableWidth\s*\/\s*1850,\s*1\)/);
    assert.match(js, /1030\s*\*\s*scale/);
});

test("cada lienzo desktop queda centrado horizontalmente", () => {
    assert.match(css, /\.products-board\.ps-board-clone\s*\{[^}]*left:\s*50%/s);
    assert.match(css, /\.products-board\.ps-board-clone\s*\{[^}]*transform:\s*translateX\(-50%\)\s*scale\(var\(--board-scale,\s*1\)\)/s);
    assert.match(css, /\.products-board\.ps-board-clone\s*\{[^}]*transform-origin:\s*top center/s);
});

test("desktop reserva una franja gris para la navegación lateral", () => {
    assert.match(js, /const desktopGutter = width >= 1025 \? 96 : 0/);
    assert.match(js, /const usableWidth = Math\.max\(width - desktopGutter, 0\)/);
});

test("la navegación lateral solo aparece mientras el widget está visible", () => {
    assert.match(css, /\.ps-side-nav\s*\{[^}]*visibility:\s*hidden[^}]*pointer-events:\s*none/s);
    assert.match(css, /\.ps-nav-visible\s+\.ps-side-nav\s*\{[^}]*visibility:\s*visible[^}]*pointer-events:\s*auto/s);
    assert.match(js, /function setupSideNavVisibility\(root\)/);
    assert.match(js, /root\.classList\.toggle\("ps-nav-visible",\s*entry\.isIntersecting\)/);
});

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
    const widgetSelectors = mobileIntro.match(/#gpk-ps-widget[^\{]+(?=\{)/g) || [];
    assert.ok(widgetSelectors.length > 0);
    widgetSelectors.forEach(selector => {
        assert.match(selector, /\.ps-screen\[data-mode="0"\]\.ps-mobile-intro-v1/);
    });
});

test("las secciones no adaptadas y desktop conservan la altura del lienzo", () => {
    assert.match(js, /screen\.style\.height = isAdaptedMobile[\s\S]*\? "auto"[\s\S]*: `\$\{Math\.round\(1030 \* scale\)\}px`/);
});

test("la composición conserva cuatro productos independientes", () => {
    ["p-rollo", "p-lamina", "p-caja", "p-grabados"].forEach(id => {
        assert.match(mobileIntro, new RegExp(`#${id}\\s*\\{`));
    });
    assert.match(mobileIntro, /ps-pillars-play/);
});

test("la sección 2 móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-overview-styles/);
    assert.match(js, /productos-secciones-mobile-overview\.css/);
});

test("solo el modo 1 recibe la clase móvil de productos", () => {
    assert.match(js, /if \(entry\.mode === 1\) screen\.classList\.add\("ps-mobile-overview-v1"\)/);
    assert.doesNotMatch(js, /entry\.mode !== 1[^\n]*ps-mobile-overview-v1/);
});

test("las secciones adaptadas usan altura automática solo en móvil", () => {
    assert.match(js, /const isAdaptedMobile = adaptedMobileModes\.has\(entryMode\)[\s\S]*window\.matchMedia\("\(max-width: 767px\)"\)\.matches/);
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
    assert.equal((sourceHtml.match(/class="overview-col-new"/g) || []).length, 4);
});

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
