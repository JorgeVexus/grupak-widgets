# Plan Maestro de Traducción Webflow (i18n) & Widgets Grupak

Este documento define la arquitectura, metodología, glosario industrial bilingüe y hoja de ruta para la traducción integral del sitio de Grupak al inglés, comenzando por la página `/en/home` y sus widgets interactivos correspondientes.

---

## 1. Arquitectura Técnica y Estrategia de Localización

### 1.1 Estructura en Webflow
- **Estructura de Directorios**: En Webflow, las páginas en inglés se organizan bajo el folder `/en/` (por ejemplo, `/en/home` con `page_id: 6ac1419097510b06fe31d159`).
- **Elementos Estáticos en Canvas**: Títulos, subtítulos, bloques de texto, métricas de Hero y KPIs se traducen directamente mediante las herramientas de MCP de Webflow (`data_element_tool: set_text`, `data_element_settings_tool`).
- **Instancias de Componentes**: Los componentes reutilizables (`navbar`, `Heading H5`, `testimonial-card`, `Footer-contact`, `unete`) cuentan con propiedades (*Component Props*). En `/en/home`, se aplican overrides a nivel de instancia sin alterar la versión en español del sitio principal.
- **Metadatos SEO & OpenGraph**: Se actualizan el `title` y `description` de la página `/en/home` a través de `data_pages_tool: update_page_settings`.

### 1.2 Solución para Widgets Embebidos (`data-lang="en"`)
Los widgets interactivos de Grupak (`productos-secciones`, `productos-menu`, `lo-que-nos-impulsa`, `locations-map`, `linea-tiempo`, etc.) son cargados mediante componentes `HtmlEmbed` apuntando a scripts CDN en Vercel (`https://grupak-widgets.vercel.app/...`).

Dado que Webflow no traduce el contenido inyectado por scripts externos, se implementa el contrato de idioma estandarizado:

#### A. Contenedor HTML Embed en Webflow:
```html
<!-- Para productos-secciones -->
<div id="gpk-ps-widget-root" data-lang="en"></div>
<script src="https://grupak-widgets.vercel.app/widgets/productos-secciones/productos-secciones.js?v=seccion-reveal-16" defer></script>

<!-- Para productos-menu -->
<div id="gpk-products-menu-root" data-lang="en"></div>
<script src="https://grupak-widgets.vercel.app/widgets/productos-menu/productos-menu.js"></script>
```

#### B. Lógica de Detección en el Script del Widget:
```javascript
const container = document.getElementById("gpk-ps-widget-root");
// Detección: 1) data-lang del contenedor, 2) fallback por URL path (/en/)
const lang = (
    (container && container.getAttribute("data-lang")) ||
    (container && container.dataset && container.dataset.lang) ||
    (window.location.pathname.startsWith("/en") ? "en" : "es")
).toLowerCase();
```

#### C. Carga de Contenido Según Idioma:
- Si `lang === 'en'`, el widget solicita la plantilla o diccionario en inglés (p. ej. `productos-menu-en.html` o `productos-interactivos-en.html`), manteniendo intactas las animaciones CSS, responsive design y controladores de interacción.
- Si `lang === 'es'` (o no se especifica), se mantiene el comportamiento predeterminado en español.

---

## 2. Glosario Profesional y Neutral (Industria Papelera & Empaque B2B)

Para asegurar una traducción natural, ejecutiva e internacional (evitando traducciones literales de máquina):

| Término en Español | Traducción Profesional (EN) | Justificación de Contexto Industrial |
| :--- | :--- | :--- |
| **Cuidamos más que productos** | *Protecting more than just products* | Tono corporativo de protección y cuidado integral |
| **Integración vertical** | *Vertical Integration* | Término estándar B2B para control de cadena de suministro |
| **Lámina / Láminas de cartón** | *Corrugated Sheets* | Término técnico papelero internacional (no "foils" ni "plates") |
| **Papel liner y medium** | *Linerboard and Medium* | Grados estándar de la industria papelera corrugada |
| **Cajas y Empaques** | *Corrugated Packaging & Boxes* | Precisión comercial e industrial |
| **Grabados** | *Printing Plates / Flexographic Tooling* | Matrices y clichés para impresión flexográfica de cajas |
| **Abastecedoras de fibra** | *Fiber Recovery Centers / Collection Facilities* | Centros de acopio y clasificación de cartón reciclado |
| **Capacidad industrial** | *Industrial Manufacturing Capacity* | Denota escala operativa de plantas |
| **Sustentabilidad** | *Sustainability & Circular Economy* | Vocabulario ESG internacional |
| **Nuestra gente** | *Our People* | Estándar de cultura organizacional corporativa |
| **Saber más / Conoce más** | *Learn More* | Llamado a la acción conciso y estándar |
| **Cotizar productos** | *Request a Quote* | Call-To-Action comercial estándar B2B |
| **Quiero ser proveedor** | *Become a Supplier* | Sección de cadena de suministro y compras |
| **Dudas generales** | *General Inquiries* | Atención y soporte corporativo |

---

## 3. Hoja de Ruta de Ejecución por Sesiones

### Sesión 1: `/en/home` y Widgets de Inicio (Completada con éxito)
1. **Paso 1.1**: Documentación del Plan Maestro (este archivo). [x]
2. **Paso 1.2**: Preparación de soporte `data-lang` en widgets locales de Home: [x]
   - `widgets/productos-menu`: Soporte `data-lang` + creación de `productos-menu-en.html` profesional.
   - `widgets/productos-interactivos`: Generación de `productos-interactivos-en.html` profesional y validado.
   - `widgets/productos-secciones`: Soporte de detección `data-lang` / fallback `/en/`, carga de HTML inglés, etiquetas de navegación desktop, y contenidos adaptativos mobile (cajas, grabados, energía).
3. **Paso 1.3**: Actualización de Embeds en Webflow `/en/home`: [x]
   - Configuración de atributos `data-lang="en"` en `gpk-ps-widget-root` (`e959b36a-ad3c-8a72-4051-752ce7f47ff9`).
   - Configuración de atributos `data-lang="en"` en `gpk-products-menu-root` (`342ad084-a23f-9982-5ce4-32717828f052`).
4. **Paso 1.4**: Traducción de Elementos Nativos en Webflow `/en/home`: [x]
   - Hero: Título, subtítulo y 4 tarjetas KPI (69 Years, 1957, Recovery Centers, Recycled fiber biodegradable, Plants).
   - Menú de productos interactivos en canvas: Títulos y descripciones (Paper, Corrugated Sheets, Packaging & Boxes, Tooling & Printing Plates, Energy, Learn more).
   - Sección "Sobre nosotros": Título, descripción y métricas históricas (+1800 employees, 5 plants, 6 recovery centers).
   - Pilares de valor: Vertical Integration, Industrial Capacity, Sustainability, Our People.
   - Sección de Testimonios: Citas de colaboradores y roles en inglés en las 6 instancias de `testimonial-card`.
   - Instancia `Footer-contact`: Traducción de props de títulos, textos y botones ("Connect with us", "Product Quotations", "Request a quote", "Talk to Valeria", "General Inquiries", "Suppliers", "Become a supplier", etc.).
   - Instancias `Heading H5`: Sobrescritas en inglés ("Vertical Integration", "Industrial Capacity", "Sustainability", "Our People").
5. **Paso 1.5**: Ajuste de Metadatos SEO de la página `/en/home`: [x]
   - Title: `Grupak | 100% Recycled Paper and Corrugated Packaging Solutions`
   - Description: `Mexican manufacturer of 100% recycled paper and corrugated packaging with 69 years of experience. Vertical integration, 3 paper & converting plants, +1800 employees.`

### Sesión 2: Componentes Globales (`navbar`, `footer`)
- Adaptación de enlaces de navegación en `navbar` para conmutar entre español (`/`) e inglés (`/en/home`).
- Traducción de enlaces legales y pie de página en el componente `footer`.

### Sesión 3: Páginas Interiores Secundarias
- `/en/quienes-somos` (+ widgets: `lo-que-nos-impulsa`, `linea-tiempo`, `locations-map`).
- `/en/sustentabilidad` (+ widgets: `ciclo-de-vida`, `medio-ambiente`).
- `/en/certificaciones` & `/en/contacto` (+ widget `formulario`).

---

## 4. Control de Cambios y Versionado de Widgets

| Widget | Archivo Clave | Versión Actual | Estado i18n |
| :--- | :--- | :--- | :--- |
| `productos-menu` | `productos-menu.js` | `20260822-energia-text` | **Completado** (Soporte `data-lang="en"` y fallback `/en/`) |
| `productos-secciones` | `productos-secciones.js` | `seccion-reveal-51` | **Completado** (Soporte `data-lang="en"`, fetch de `productos-interactivos-en.html`, desktop dot nav & mobile reflow) |
| `lo-que-nos-impulsa` | `lo-que-nos-impulsa.js` | `20261002-hero-no-title` | Planificado (Sesión 3) |
| `locations-map` | `locations-map.js` | - | Planificado (Sesión 3) |
| `ciclo-de-vida` | `ciclo-de-vida.js` | - | Planificado (Sesión 3) |
| `gestion` | `gestion.js` | - | Planificado (Sesión 3) |
| `formulario` | `formulario.js` | - | Planificado (Sesión 3) |
