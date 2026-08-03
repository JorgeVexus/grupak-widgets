const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const htmlPath = path.join(__dirname, 'slider-certificaciones.html');
const cssPath = path.join(__dirname, 'slider-certificaciones.css');
const jsPath = path.join(__dirname, 'slider-certificaciones.js');
const previewPath = path.join(__dirname, 'preview.html');

async function loadMarkup() {
  return readFile(htmlPath, 'utf8');
}

async function loadStyles() {
  return readFile(cssPath, 'utf8');
}

async function loadController() {
  return readFile(jsPath, 'utf8');
}

test('provides a responsive standalone preview without duplicating production markup', async () => {
  assert.equal(existsSync(previewPath), true, 'preview.html must exist');
  const preview = await readFile(previewPath, 'utf8');

  assert.match(preview, /^<!doctype html>/i);
  assert.match(preview, /<html\b[^>]*lang=["']es["']/i);
  assert.match(preview, /<meta\b[^>]*charset=["']utf-8["']/i);
  assert.match(preview, /<meta\b[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width[^"']*initial-scale=1[^"']*["']/i);
  assert.match(preview, /<div\b[^>]*id=["']gpk-slider-certificaciones-widget-root["'][^>]*><\/div>/i);
  assert.match(preview, /<script\b[^>]*src=["']\.\/slider-certificaciones\.js["'][^>]*><\/script>/i);
  assert.match(preview, /padding:\s*clamp\(/i);
  assert.doesNotMatch(preview, /\bgpk-cert-widget\b/i);
});

function createControllerFixture(js) {
  class Target {
    constructor() { this.listeners = new Map(); }
    addEventListener(type, listener) {
      const listeners = this.listeners.get(type) || [];
      listeners.push(listener);
      this.listeners.set(type, listeners);
    }
    removeEventListener(type, listener) {
      this.listeners.set(type, (this.listeners.get(type) || []).filter((item) => item !== listener));
    }
    emit(type, values = {}) {
      const event = { type, preventDefault() {}, ...values };
      (this.listeners.get(type) || []).slice().forEach((listener) => listener(event));
    }
  }
  class Element extends Target {
    constructor() {
      super();
      this.dataset = {};
      this.attributes = {};
      this.children = [];
      this.style = { values: {}, setProperty: (key, value) => { this.style.values[key] = value; } };
      this.classList = { add: (value) => { this.missingClass = value; } };
    }
    setAttribute(key, value) { this.attributes[key] = value; }
    removeAttribute(key) { delete this.attributes[key]; }
    getAttribute(key) { return this.attributes[key]; }
    getBoundingClientRect() { return { width: 100 }; }
  }
  const windowTarget = new Target();
  const observers = [];
  const widgets = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
    trigger() { this.callback(); }
  }
  Object.assign(windowTarget, {
    getComputedStyle(element) {
      return element.isWidget
        ? { getPropertyValue: () => String(element.visible || 1) }
        : { columnGap: '20px', gap: '20px' };
    },
    ResizeObserver: Observer,
    MutationObserver: Observer,
  });
  const document = {
    currentScript: { src: 'https://example.test/widgets/slider%20certificaciones%20new/slider-certificaciones.js' },
    baseURI: 'https://example.test/',
    documentElement: { contains: (node) => node.connected },
    querySelectorAll: () => widgets.filter((widget) => widget.connected),
  };
  const context = {
    URL,
    console: { error() {} },
    document,
    location: { protocol: 'https:', hostname: 'example.test', origin: 'https://example.test' },
    module: { exports: {} },
    window: windowTarget,
  };
  vm.runInNewContext(js, context);

  function widgetFixture({ complete = true } = {}) {
    const widget = new Element();
    widget.isWidget = true;
    widget.visible = 2;
    widget.connected = true;
    const viewport = new Element();
    viewport.captureCalls = [];
    viewport.setPointerCapture = (id) => viewport.captureCalls.push(id);
    const track = new Element();
    const articles = Array.from({ length: 4 }, () => new Element());
    track.children = articles.map((article) => {
      const slide = new Element();
      slide.querySelector = (selector) => selector === '.gpk-cert-card' ? article : null;
      return slide;
    });
    track.querySelectorAll = (selector) => selector === '.gpk-cert-card' ? articles : [];
    const previous = new Element();
    const next = new Element();
    const status = new Element();
    status.textContent = 'initial';
    const image = new Element();
    image.attributes.src = 'Images/iso.png';
    const nodes = complete ? {
      '.gpk-cert-viewport': viewport,
      '.gpk-cert-track': track,
      '.gpk-cert-prev': previous,
      '.gpk-cert-next': next,
      '.gpk-cert-status': status,
    } : {};
    widget.querySelector = (selector) => nodes[selector] || null;
    widget.querySelectorAll = (selector) => selector === 'img[src]' ? [image] : [];
    widgets.push(widget);
    return { widget, viewport, track, articles, previous, next, status, image };
  }
  return { api: context.module.exports, observers, widgetFixture, windowTarget };
}

test('executes navigation, pointer, resize, and clean reinsertion behavior', async () => {
  const fixture = createControllerFixture(await loadController());
  assert.equal(typeof fixture.api.initWidget, 'function');
  const malformed = fixture.widgetFixture({ complete: false });
  fixture.api.initWidget(malformed.widget);
  assert.equal(malformed.widget.dataset.gpkCertInitialized, undefined);

  const view = fixture.widgetFixture();
  fixture.api.initWidget(view.widget);
  assert.deepEqual(
    view.articles.map((article) => article.attributes['aria-hidden']),
    ['false', 'false', 'true', 'true'],
  );
  assert.match(view.image.src, /Images\/iso\.png$/);
  view.image.emit('error');
  assert.equal(view.image.missingClass, 'is-missing');
  assert.equal(view.next.disabled, false);
  view.next.emit('click');
  assert.equal(view.widget.style.values['--gpk-cert-offset'], '-120px');
  assert.deepEqual(
    view.articles.map((article) => article.attributes['aria-hidden']),
    ['true', 'false', 'false', 'true'],
  );
  view.viewport.emit('keydown', { key: 'ArrowRight' });
  assert.equal(view.widget.style.values['--gpk-cert-offset'], '-240px');
  view.viewport.emit('pointerdown', { pointerId: 8, isPrimary: false, button: 0, clientX: 100 });
  view.viewport.emit('pointerdown', { pointerId: 9, isPrimary: true, button: 1, clientX: 100 });
  assert.equal(view.viewport.captureCalls.length, 0);
  view.viewport.emit('pointerdown', { pointerId: 1, isPrimary: true, button: 0, clientX: 100 });
  view.viewport.emit('pointerup', { pointerId: 2, isPrimary: true, clientX: 0 });
  assert.equal(view.widget.style.values['--gpk-cert-offset'], '-240px');
  view.previous.emit('click');
  view.viewport.emit('pointerdown', { pointerId: 1, isPrimary: true, button: 0, clientX: 100 });
  view.viewport.emit('pointerup', { pointerId: 1, isPrimary: true, clientX: 50 });
  assert.equal(view.widget.style.values['--gpk-cert-offset'], '-120px');
  view.viewport.setPointerCapture = undefined;
  view.viewport.emit('pointerdown', { pointerId: 3, isPrimary: true, button: 0, clientX: 100 });
  view.viewport.emit('pointerup', { pointerId: 3, isPrimary: true, clientX: 0 });
  assert.equal(view.widget.style.values['--gpk-cert-offset'], '-240px');

  view.widget.visible = 3;
  fixture.observers.find((observer) => !observer.disconnected).trigger();
  assert.equal(view.widget.style.values['--gpk-cert-offset'], '-120px');
  const globalObserver = fixture.api.observeWidgets();
  view.widget.connected = false;
  fixture.observers.filter((observer) => !observer.disconnected).forEach((observer) => observer.trigger());
  assert.equal(view.widget.dataset.gpkCertInitialized, undefined);
  const clicksBefore = (view.next.listeners.get('click') || []).length;
  assert.equal(clicksBefore, 0);
  view.widget.connected = true;
  globalObserver.trigger();
  assert.equal((view.next.listeners.get('click') || []).length, 1);
});

test('loads the certifications embed once from local or Vercel assets', async () => {
  const js = await loadController();

  assert.match(js, /^\(function\s*\([^)]*\)\s*{[\s\S]*?['"]use strict['"];?/);
  assert.match(js, /location\.protocol\s*===\s*['"]file:['"]|localhost|127\.0\.0\.1/);
  assert.match(js, /slider%20certificaciones%20new/);
  assert.match(js, /slider-certificaciones\.css/);
  assert.match(js, /slider-certificaciones\.html/);
  assert.match(js, /gpk-slider-certificaciones-widget-root/);
  assert.match(js, /querySelectorAll\(['"]\.gpk-cert-widget['"]\)/);
  assert.match(js, /dataset\.gpkCertInitialized/);
  assert.match(js, /new URL\([^\n]+baseURL/);
  assert.match(js, /classList\.add\(['"]is-missing['"]\)/);
  assert.match(js, /console\.error\(['"]\[Grupack Certifications\]/);
});

test('resolves localhost from the site root and file assets beside the current script', async () => {
  const js = await loadController();
  const source = js.match(/function resolveBaseURL\(protocol, hostname, origin, scriptSource\)\s*{[\s\S]*?\n  }/)?.[0];

  assert.ok(source, 'a pure URL resolver must be available for runtime verification');
  const resolveBaseURL = vm.runInNewContext(`(${source})`, { URL });
  assert.equal(
    resolveBaseURL('http:', 'localhost', 'http://localhost:8026', ''),
    'http://localhost:8026/widgets/slider%20certificaciones%20new/',
  );
  assert.equal(
    resolveBaseURL('file:', '', 'null', 'file:///C:/site/widgets/slider%20certificaciones%20new/slider-certificaciones.js'),
    'file:///C:/site/widgets/slider%20certificaciones%20new/',
  );
  assert.equal(
    resolveBaseURL('https:', 'example.com', 'https://example.com', ''),
    'https://grupak-widgets.vercel.app/widgets/slider%20certificaciones%20new/',
  );
  assert.match(js, /['"]\/widgets\/slider%20certificaciones%20new['"]/);
  assert.match(js, /document\.currentScript/);
  assert.match(js, /currentScript[\s\S]*?\.src/);
  assert.match(js, /new URL\(['"]\.['"],\s*scriptSource\)/);
  assert.doesNotMatch(js, /isLocal\s*\?\s*WIDGET_PATH/);
});

test('marks only valid widgets ready and tolerates optional pointer capture', async () => {
  const js = await loadController();
  const validation = js.indexOf('if (!viewport || !track || !previous || !next || !slides.length');
  const marker = js.indexOf('widget.dataset.gpkCertInitialized = "true"');

  assert.ok(validation >= 0, 'required markup validation must exist');
  assert.ok(marker > validation, 'ready marker must follow required markup validation');
  assert.match(js, /typeof viewport\.setPointerCapture\s*===\s*['"]function['"]/);
  assert.match(js, /Math\.abs\(distance\)\s*>\s*50/);
  assert.doesNotMatch(js, /Math\.abs\(distance\)\s*>=\s*50/);
});

test('implements bounded, accessible, manual carousel interactions without timers', async () => {
  const js = await loadController();
  const css = await loadStyles();

  assert.match(js, /--gpk-cert-visible/);
  assert.match(js, /--gpk-cert-offset/);
  assert.match(js, /getBoundingClientRect\(\)\.width/);
  assert.match(js, /columnGap|\.gap/);
  assert.match(js, /Math\.min[\s\S]*Math\.max|Math\.max[\s\S]*Math\.min/);
  assert.match(js, /aria-hidden/);
  assert.match(js, /\.disabled\s*=/);
  assert.match(js, /ArrowLeft/);
  assert.match(js, /ArrowRight/);
  assert.match(js, /pointerdown/);
  assert.match(js, /pointerup/);
  assert.match(js, /pointercancel/);
  assert.match(js, /setPointerCapture/);
  assert.match(js, /50/);
  assert.match(js, /ResizeObserver/);
  assert.match(js, /addEventListener\(['"]resize['"]/);
  assert.match(js, /removeEventListener\(['"]resize['"]/);
  assert.doesNotMatch(js, /\bset(?:Interval|Timeout)\s*\(/);
  assert.doesNotMatch(js, /\bautoplay\b/i);
  assert.doesNotMatch(js, /\bloop\b/i);
  assert.match(css, /\.gpk-cert-viewport\s*{[\s\S]*?touch-action:\s*pan-y\s*;/i);
});

test('styles the responsive carousel to the approved visual contract', async () => {
  const css = await loadStyles();

  assert.match(css, /\.gpk-cert-widget\s*{[\s\S]*?--gpk-cert-visible:\s*3\s*;/i);
  assert.match(css, /\.gpk-cert-widget\s*{[\s\S]*?--gpk-cert-gap:\s*clamp\(16px,\s*1\.8vw,\s*35px\)\s*;/i);
  assert.match(css, /\.gpk-cert-widget\s*{[\s\S]*?color:\s*#506d85\s*;/i);
  assert.match(css, /\.gpk-cert-media\s*{[\s\S]*?background:\s*rgba\(72,\s*169,\s*197,\s*\.1\)\s*;[\s\S]*?aspect-ratio:\s*568\s*\/\s*434\s*;/i);
  assert.match(css, /\.gpk-cert-card\s*{[\s\S]*?background:\s*#fff(?:fff)?\s*;[\s\S]*?box-shadow:\s*4px\s+5px\s+14\.4px\s+rgba\(0,\s*0,\s*0,\s*\.1\)\s*;/i);
  assert.match(css, /\.gpk-cert-track\s*{[\s\S]*?transform:\s*translate3d\(var\(--gpk-cert-offset,\s*0px\),\s*0,\s*0\)\s*;[\s\S]*?transition:\s*transform\s+520ms\s+cubic-bezier\(/i);
  assert.match(css, /\.gpk-cert-widget\s*{[\s\S]*?--gpk-cert-gap-adjustment:\s*clamp\(10\.6667px,\s*1\.2vw,\s*23\.3333px\)\s*;/i);
  assert.match(css, /\.gpk-cert-track\s*>\s*li\s*{[\s\S]*?flex:\s*0\s+0\s+calc\(33\.333333%\s*-\s*var\(--gpk-cert-gap-adjustment\)\)\s*;/i);
  assert.match(css, /@media\s*\(max-width:\s*1023px\)[\s\S]*?\.gpk-cert-widget\s*{[\s\S]*?--gpk-cert-visible:\s*2\s*;[\s\S]*?--gpk-cert-gap-adjustment:\s*clamp\(8px,\s*\.9vw,\s*17\.5px\)\s*;[\s\S]*?\.gpk-cert-track\s*>\s*li\s*{[\s\S]*?flex-basis:\s*calc\(50%\s*-\s*var\(--gpk-cert-gap-adjustment\)\)\s*;/i);
  assert.match(css, /@media\s*\(max-width:\s*639px\)[\s\S]*?\.gpk-cert-widget\s*{[\s\S]*?--gpk-cert-visible:\s*1\s*;[\s\S]*?\.gpk-cert-track\s*>\s*li\s*{[\s\S]*?flex-basis:\s*100%\s*;/i);
  assert.doesNotMatch(css, /calc\([^;]*(?:\*|\s\/\s)[^;]*\)/i);
  assert.doesNotMatch(css, /will-change\s*:/i);
});

test('styles image modifiers, accessible controls, and reduced motion', async () => {
  const css = await loadStyles();
  const html = await loadMarkup();

  assert.match(css, /\.gpk-cert-card--iso\s+\.gpk-cert-media\s+img\s*{[\s\S]*?width:\s*44\.0141%\s*;[\s\S]*?height:\s*auto\s*;/i);
  assert.match(css, /\.gpk-cert-card--peta\s+\.gpk-cert-media\s+img\s*{[\s\S]*?width:\s*52\.9930%\s*;[\s\S]*?height:\s*auto\s*;/i);
  assert.match(css, /\.gpk-cert-card--rspo\s+\.gpk-cert-media\s+img\s*{[\s\S]*?width:\s*56\.8662%\s*;[\s\S]*?height:\s*auto\s*;/i);
  assert.match(css, /\.gpk-cert-card--ocean\s+\.gpk-cert-media\s+img\s*{[\s\S]*?width:\s*56\.8662%\s*;[\s\S]*?height:\s*auto\s*;/i);
  assert.match(css, /\.gpk-cert-card--carbon\s+\.gpk-cert-media\s+img\s*{[\s\S]*?width:\s*85\.7394%\s*;[\s\S]*?height:\s*auto\s*;/i);
  assert.doesNotMatch(css, /\.gpk-cert-card--(?:iso|peta|rspo|ocean|carbon)[^{]*{[^}]*height:\s*\d+(?:\.\d+)?px/i);
  assert.equal((html.match(/\bgpk-cert-card--carbon\b/g) || []).length, 2);
  assert.doesNotMatch(css, /nth-child\([^)]*\)[^{]*\.gpk-cert-media/i);
  assert.match(css, /\.gpk-cert-(?:prev|next):focus-visible\s*{[\s\S]*?outline:/i);
  assert.match(css, /\.gpk-cert-(?:prev|next):disabled\s*{[\s\S]*?cursor:\s*not-allowed\s*;/i);
  assert.match(css, /\.gpk-cert-status\s*{[\s\S]*?clip:\s*rect\(0\s+0\s+0\s+0\)\s*;/i);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.gpk-cert-track\s*{[\s\S]*?transition:\s*none\s*;/i);
  assert.doesNotMatch(css, /(^|[},]\s*)(?:html|body|\*|h[1-6]|p|img|button|ol|li)(?:\s|,|\{|:)/im);
});

test('renders the six certification cards in the approved order', async () => {
  const html = await loadMarkup();
  const cards = [...html.matchAll(/<article\b[^>]*class="[^"]*\bgpk-cert-card\b[^"]*"[^>]*>([\s\S]*?)<\/article>/gi)];
  const expectedTitles = [
    'ISO 22716',
    'PETA',
    'RSPO',
    'Ocean Bound Plastic',
    'Huella de carbono',
    'Cumplimiento Regulatorio',
  ];

  assert.equal(cards.length, 6);
  assert.deepEqual(
    cards.map((card) => card[1].match(/<h2[^>]*>([^<]+)<\/h2>/i)?.[1].trim()),
    expectedTitles,
  );
  cards.forEach((card) => {
    assert.match(card[1], /class="[^"]*\bgpk-cert-media\b/);
    assert.match(card[1], /<img\b[^>]*alt="[^"]+"/i);
    assert.match(card[1], /class="[^"]*\bgpk-cert-image-fallback\b/);
    assert.match(card[1], /class="[^"]*\bgpk-cert-body\b/);
    assert.match(card[1], /class="[^"]*\bgpk-cert-header\b/);
    assert.match(card[1], /class="[^"]*\bgpk-cert-divider\b/);
    assert.match(card[1], /class="[^"]*\bgpk-cert-tagline\b/);
    assert.match(card[1], /class="[^"]*\bgpk-cert-copy\b/);
  });
});

test('uses the approved local image mapping', async () => {
  const html = await loadMarkup();
  const sources = [...html.matchAll(/<img\b[^>]*src="([^"]+)"/gi)].map((match) => match[1]);

  assert.deepEqual(sources, [
    'Images/iso.png',
    'Images/peta.png',
    'Images/RSPO.png',
    'Images/ocean bound.png',
    'Images/carbonfree-certified.png',
    'Images/carbonfree-certified.png',
  ]);
  assert.equal(sources.filter((source) => source === 'Images/carbonfree-certified.png').length, 2);
  sources.forEach((source) => {
    const assetPath = path.resolve(path.dirname(htmlPath), source);
    assert.equal(existsSync(assetPath), true, `Expected local image asset to exist: ${assetPath}`);
  });
});

test('preserves the exact approved Figma copy and paragraph breaks', async () => {
  const html = await loadMarkup();
  const copy = [...html.matchAll(/<p class="gpk-cert-copy">([\s\S]*?)<\/p>/gi)].map((match) => match[1].trim());

  assert.deepEqual(copy, [
    'Operamos bajo certificación ISO 22716, lo que garantiza que nuestros procesos de fabricación de cosméticos cumplen con estándares internacionales de calidad, seguridad y control.',
    'Para los hoteles, esto significa ofrecer amenidades confiables, consistentes y seguras en cada habitación. Para el huésped, representa una experiencia de cuidado personal alineada con estándares globales, generando confianza y satisfacción durante su estancia.',
    'Contamos con certificación de PETA que respalda que nuestros productos no son testeados en animales, alineándonos con estándares éticos de la industria.',
    'Para hoteles, esto facilita cumplir con expectativas de huéspedes cada vez más informados y exigentes. Para el huésped, refuerza una experiencia alineada con valores de respeto y responsabilidad, fortaleciendo la percepción positiva de la marca hotelera.',
    'Contamos con certificación RSPO, lo que nos permite desarrollar productos utilizando aceite de palma proveniente de fuentes responsables. Esta certificación aplica a formulaciones específicas bajo requerimiento del cliente.',
    'Esto permite a los hoteles integrar productos alineados con políticas de sostenibilidad y responsabilidad ambiental. Para el huésped, representa una elección más consciente, cada vez más valorada en la experiencia de marca de las propiedades.',
    'Nuestros envases tipo tubo están fabricados con plástico Ocean Bound, proveniente de residuos recolectados antes de llegar al océano, contribuyendo a la reducción de contaminación marina.',
    'Esto permite a los hoteles reducir su impacto ambiental a través de acciones concretas en sus amenidades. Para el huésped, cada producto representa una contribución tangible hacia el cuidado del planeta, integrando sostenibilidad en su experiencia diaria.',
    'En 2025 compensamos 292 toneladas de CO² como parte de nuestro compromiso ambiental, como un primero paso dentro de una estrategia continua de reducción y mitigación de impacto.',
    'Para los hoteles, esto suma valor en su objetivo ESG y reportes de sostenibilidad. Para el huésped, refuerza la percepción de una estancia en una propiedad comprometida con el medio ambiente y el futuro del planeta',
    'Nuestras instalaciones y productos están registrados conforme a la regulación de la U.S Food and Drug Administration, lo que nos permite operar con cumplimiento en el mercado estadounidense.',
    'Para hoteles y cadenas internacionales, esto representa confianza y seguridad en la selección de proveedores. Para el huésped, garantiza que los productos cumplen con normativas estrictas de calidad y seguridad.',
  ]);
});

test('exposes the carousel accessibility contract and real controls', async () => {
  const html = await loadMarkup();

  assert.match(html, /class="[^"]*\bgpk-cert-widget\b[^"]*"[^>]*role="region"[^>]*aria-roledescription="carrusel"[^>]*aria-label="Certificaciones"/i);
  assert.match(html, /class="[^"]*\bgpk-cert-viewport\b[^"]*"[^>]*tabindex="0"/i);
  assert.match(html, /<ol\b[^>]*class="[^"]*\bgpk-cert-track\b/i);
  assert.match(html, /<button\b[^>]*class="[^"]*\bgpk-cert-prev\b[^"]*"[^>]*aria-label="Ver certificación anterior"[^>]*>[\s\S]*?<svg\b[\s\S]*?<\/button>/i);
  assert.match(html, /<button\b[^>]*class="[^"]*\bgpk-cert-next\b[^"]*"[^>]*aria-label="Ver siguiente certificación"[^>]*>[\s\S]*?<svg\b[\s\S]*?<\/button>/i);
  assert.match(html, /class="[^"]*\bgpk-cert-status\b[^"]*"[^>]*aria-live="polite"/i);
  assert.doesNotMatch(html, /autoplay/i);
});
