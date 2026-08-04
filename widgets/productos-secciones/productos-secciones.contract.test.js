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
const mobileLaminasPath = path.join(dir, "productos-secciones-mobile-laminas.css");
const mobileLaminas = fs.existsSync(mobileLaminasPath)
    ? fs.readFileSync(mobileLaminasPath, "utf8")
    : "";
const mobileCajasPath = path.join(dir, "productos-secciones-mobile-cajas.css");
const mobileCajas = fs.existsSync(mobileCajasPath)
    ? fs.readFileSync(mobileCajasPath, "utf8")
    : "";
const mobileGrabadosPath = path.join(dir, "productos-secciones-mobile-grabados.css");
const mobileGrabados = fs.existsSync(mobileGrabadosPath)
    ? fs.readFileSync(mobileGrabadosPath, "utf8")
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

test("solo los modos adaptados 0 a 5 usan altura automática móvil", () => {
    assert.match(js, /const adaptedMobileModes = new Set\(\["0", "1", "2", "3", "4", "5", "7", "8", "9", "10"\]\)/);
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

test("el catálogo móvil alterna entradas laterales de 70px", () => {
    assert.match(mobilePaper, /data-index="1"[^\{]*\{[^}]*transform:\s*translateX\(-70px\)/s);
    assert.match(mobilePaper, /data-index="2"[^\{]*\{[^}]*transform:\s*translateX\(70px\)/s);
    assert.match(mobilePaper, /data-index="3"[^\{]*\{[^}]*transform:\s*translateX\(-70px\)/s);
    assert.match(mobilePaper, /data-index="4"[^\{]*\{[^}]*transform:\s*translateX\(70px\)/s);
    assert.match(mobilePaper, /\.product-card\.ps-card-revealed\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translateX\(0\)/s);
});

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

test("Láminas móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-laminas-styles/);
    assert.match(js, /productos-secciones-mobile-laminas\.css/);
});

test("los modos 4 y 5 reciben clases móviles diferentes", () => {
    assert.match(js, /if \(entry\.mode === 4\) screen\.classList\.add\("ps-mobile-laminas-intro-v1"\)/);
    assert.match(js, /if \(entry\.mode === 5\) screen\.classList\.add\("ps-mobile-laminas-specs-v1"\)/);
});

test("solo los modos adaptados 0 a 5 usan altura automática móvil", () => {
    assert.match(js, /const adaptedMobileModes = new Set\(\["0", "1", "2", "3", "4", "5", "7", "8", "9", "10"\]\)/);
});

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

test("Cajas móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-cajas-styles/);
    assert.match(js, /productos-secciones-mobile-cajas\.css/);
});

test("los modos 7, 8 y 9 reciben clases móviles diferentes", () => {
    assert.match(js, /if \(entry\.mode === 7\) screen\.classList\.add\("ps-mobile-cajas-intro-v1"\)/);
    assert.match(js, /if \(entry\.mode === 8\) screen\.classList\.add\("ps-mobile-cajas-conventional-v1"\)/);
    assert.match(js, /if \(entry\.mode === 9\) screen\.classList\.add\("ps-mobile-cajas-digital-v1"\)/);
});

test("el CSS de Cajas está encapsulado en los modos 7, 8 y 9", () => {
    assert.match(mobileCajas, /@media \(max-width: 767px\)/);
    assert.doesNotMatch(mobileCajas, /@media[^\{]*(?:768|1024|480|440|390|375|360|320)/);
    const selectors = mobileCajas.match(/#gpk-ps-widget[^\{]+(?=\{)/g) || [];
    assert.ok(selectors.length > 0);
    selectors.forEach(selector => {
        assert.match(selector, /\.ps-screen\[data-mode="(?:7|8|9)"\]\.ps-mobile-cajas-(?:intro|conventional|digital)-v1/);
    });
});

test("Cajas móvil reutiliza las imágenes y contenidos existentes", () => {
    assert.match(sourceHtml, /class="cajas-mobile-hero-img"/);
    assert.match(sourceHtml, /Cajas y empaques 1\.webp/);
    assert.match(sourceHtml, /Cajas y empaques 2-1\.webp/);
    assert.match(mobileCajas, /\.cajas-mobile-hero-img/);
    assert.match(mobileCajas, /\.cajas-main-image/);
    assert.match(mobileCajas, /\.digital-main-image/);
});

test("cada modo de Cajas oculta sus paneles hermanos", () => {
    assert.match(mobileCajas, /data-mode="7"[^\{]+#cajas-convencionales-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="7"[^\{]+#cajas-digital-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="8"[^\{]+#cajas-intro-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="8"[^\{]+#cajas-digital-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="9"[^\{]+#cajas-intro-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
    assert.match(mobileCajas, /data-mode="9"[^\{]+#cajas-convencionales-content[^\{]*\{[^}]*display:\s*none\s*!important/s);
});

test("las tarjetas informativas móviles tienen etiquetas propias", () => {
    assert.match(js, /Soluciones Convencionales/);
    assert.match(js, /Impresión Digital/);
    assert.match(js, /ps-cajas-card-label/);
    assert.match(js, /Tecnología Single Pass/);
    assert.match(mobileCajas, /\.ps-cajas-card-label/);
});

test("Cajas móvil revela elementos individuales una sola vez", () => {
    assert.match(js, /function setupMobileCajasReveal\(root\)/);
    assert.match(js, /threshold:\s*0\.2/);
    assert.match(js, /},\s*150\)/);
    assert.match(js, /observer\.unobserve\(element\)/);
    assert.match(js, /element\.classList\.add\("ps-cajas-revealed"\)/);
    assert.match(js, /prefers-reduced-motion: reduce/);
});

test("las entradas de Cajas respetan las direcciones aprobadas", () => {
    assert.match(mobileCajas, /data-mode="7"[^\{]+\[data-ps-cajas-reveal\][^\{]*\{[^}]*translateY\(32px\)/s);
    assert.match(mobileCajas, /data-mode="8"[^\{]+\.cajas-image-container[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileCajas, /data-mode="8"[^\{]+\.ps-cajas-main-copy[^\{]*\{[^}]*translateX\(70px\)/s);
    assert.match(mobileCajas, /data-mode="9"[^\{]+\.digital-image-container[^\{]*\{[^}]*translateX\(-70px\)/s);
    assert.match(mobileCajas, /data-mode="9"[^\{]+\.ps-cajas-main-copy[^\{]*\{[^}]*translateX\(70px\)/s);
    assert.match(mobileCajas, /\.ps-cajas-revealed\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translate\(0,\s*0\)/s);
});

test("el estado revelado supera la especificidad de las direcciones", () => {
    assert.match(mobileCajas, /\[data-ps-cajas-reveal\]\.ps-cajas-revealed/);
});

test("Cajas móvil elimina el fondo SVG fijo del lienzo desktop", () => {
    assert.match(mobileCajas, /\.products-board::before[^\{]*\{[^}]*display:\s*none\s*!important/s);
});

test("el texto digital no conserva el margen negativo desktop", () => {
    assert.match(mobileCajas, /\.digital-text-content[^\{]*\{[^}]*margin:\s*0\s*!important/s);
});

test("Grabados móvil carga una hoja independiente", () => {
    assert.match(js, /gpk-ps-mobile-grabados-styles/);
    assert.match(js, /productos-secciones-mobile-grabados\.css/);
});

test("el modo 10 recibe una clase móvil exclusiva", () => {
    assert.match(js, /if \(entry\.mode === 10\) screen\.classList\.add\("ps-mobile-grabados-v1"\)/);
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
