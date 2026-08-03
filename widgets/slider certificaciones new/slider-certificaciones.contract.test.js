const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');

const htmlPath = path.join(__dirname, 'slider-certificaciones.html');

async function loadMarkup() {
  return readFile(htmlPath, 'utf8');
}

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
