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

## Cómo Incrustar en Webflow

Para añadir cualquiera de estos widgets en Webflow de manera asíncrona (evitando el límite de caracteres de Webflow y facilitando el mantenimiento):

1. Agrega un componente **HTML Embed** en el lienzo de Webflow donde desees colocar el widget.
2. Pega el código cargador correspondiente apuntando a la URL del despliegue (ej. Vercel):

### Ejemplo de Inyección para Productos Interactivos:

```html
<!-- Contenedor del Widget -->
<div id="gpk-products-widget-root"></div>

<!-- Enlace a los Estilos -->
<link rel="stylesheet" href="https://grupak-widgets.vercel.app/widgets/productos-interactivos/productos-interactivos.css">

<!-- Cargador dinámico -->
<script>
  fetch('https://grupak-widgets.vercel.app/widgets/productos-interactivos/productos-interactivos.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('gpk-products-widget-root').innerHTML = html;
      
      const script = document.createElement('script');
      script.src = 'https://grupak-widgets.vercel.app/widgets/productos-interactivos/productos-interactivos.js';
      script.defer = true;
      document.body.appendChild(script);
    });
</script>
```
