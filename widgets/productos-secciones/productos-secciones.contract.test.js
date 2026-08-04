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

test("solo el modo 0 cede su altura al CSS móvil", () => {
    assert.match(js, /const isMobileIntro = entryMode === "0"[\s\S]*window\.matchMedia\("\(max-width: 767px\)"\)\.matches/);
    assert.match(js, /screen\.style\.height = isMobileIntro[\s\S]*\? "auto"[\s\S]*: `\$\{Math\.round\(1030 \* scale\)\}px`/);
});

test("la composición conserva cuatro productos independientes", () => {
    ["p-rollo", "p-lamina", "p-caja", "p-grabados"].forEach(id => {
        assert.match(mobileIntro, new RegExp(`#${id}\\s*\\{`));
    });
    assert.match(mobileIntro, /ps-pillars-play/);
});
