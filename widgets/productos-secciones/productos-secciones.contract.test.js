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
