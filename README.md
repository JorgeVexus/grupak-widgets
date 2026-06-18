# Grupack Widgets

Repositorio centralizado para los componentes y widgets interactivos incrustables de Grupack.

## Widgets Disponibles

### 1. Productos Interactivos (`/widgets/productos-interactivos`)
Widget interactivo responsivo de 10 secciones que detalla la cadena de valor de Grupack (Cajas, Láminas, Papel, Grabados, Energía).
- **Características**:
  - Animación de trazado de contornos secuencial (*staggered*) al cargar la pantalla de inicio.
  - Transición fluida de elementos compartidos entre diapositivas.
  - Adaptabilidad para dispositivos móviles con scroll nativo.
  - Animaciones fluidas al interactuar con el scroll.
- **Archivos**:
  - `productos-interactivos.html`
  - `productos-interactivos.css`
  - `productos-interactivos.js`

---

## Cómo Incrustar en Webflow (Integración Limpia con Script)

Para añadir este widget en Webflow de manera asíncrona y con código ultra limpio (evitando el límite de caracteres de Webflow y automatizando la carga de estilos):

1. Agrega un componente **HTML Embed** en Webflow en la posición deseada.
2. Pega el contenedor del widget y el script cargador que apunta a Vercel:

```html
<!-- Contenedor del Widget -->
<div id="gpk-products-widget-root"></div>

<!-- Cargador Autónomo del Widget -->
<script src="https://grupak-widgets.vercel.app/widgets/productos-interactivos/productos-interactivos.js" defer></script>
```

El script se encargará automáticamente de inyectar los estilos CSS correspondientes, descargar el HTML del widget e inicializar todas las interacciones dinámicas.
