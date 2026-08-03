# Productos secciones: base temporal desktop-only

## Objetivo

Eliminar del widget `productos-secciones` todos los diseños, reacomodos y controles exclusivos de celular y tablet. Mientras se reciben los diseños Figma de cada sección, todos los anchos de pantalla deben mostrar la composición desktop existente, reducida proporcionalmente cuando no quepa en el viewport.

## Alcance

El cambio se limita a:

- `widgets/productos-secciones/productos-secciones.html`
- `widgets/productos-secciones/productos-secciones.css`
- `widgets/productos-secciones/productos-secciones-vendor.css`
- `widgets/productos-secciones/productos-secciones.js`

No se modificará el widget fuente `productos-interactivos`, sus recursos ni el diseño visual desktop aprobado.

## Arquitectura elegida

El widget tendrá un único árbol visual y un único modelo de layout: el lienzo desktop fijo de 1850 × 1030 por sección. Cada `.products-board` conservará esas dimensiones y se escalará con un factor común calculado a partir del ancho disponible, con un máximo de 1.

La altura contenedora de cada `.ps-screen` será `1030 × escala`. Así, el espacio ocupado por el elemento transformado coincidirá con su representación visual y ninguna sección podrá encimarse con la siguiente.

No habrá un breakpoint que cambie flex, grid, posiciones, dimensiones, orden de contenido o visibilidad para construir una versión móvil. En pantallas angostas únicamente cambiará la escala del mismo lienzo desktop.

## Eliminaciones

Se retirarán:

- La barra inferior móvil y su hoja de navegación rápida del HTML.
- La función JavaScript que crea y sincroniza esa navegación móvil.
- La inicialización y preparación del video exclusivo de la introducción móvil.
- Los breakpoints de `productos-secciones.css` que convierten el lienzo desktop en flujo vertical o alteran su composición.
- Los bloques responsive de `productos-secciones-vendor.css` que apuntan a elementos `mobile-*`, `mobile-only`, `mobile-flow-*` o que reordenan el contenido desktop para tablet/celular.
- Las reglas temporales, comentarios y selectores que solo existan para sostener el layout móvil anterior.

Los nodos móviles heredados que permanezcan dentro del contenido clonado se mantendrán ocultos en todos los anchos. Los elementos desktop se mantendrán visibles según las reglas originales de cada modo.

## Comportamiento preservado

Se conservarán sin cambios funcionales:

- La navegación lateral desktop.
- El orden de las secciones y los destinos de navegación.
- Las clases `mode-N`, animaciones y secuencias de Papel, Lámina, Cajas, Grabados y Energía.
- La carga y resolución de imágenes desktop.
- La reproducción de animaciones al entrar y salir de cada sección.
- Colores, tipografía, tamaños internos, posiciones y proporciones del lienzo desktop.
- El respeto a `prefers-reduced-motion`.

## Escalado y redimensionamiento

Al cargar y al cambiar el tamaño de la ventana, JavaScript calculará:

`escala = min(ancho disponible / 1850, 1)`

La escala se aplicará al lienzo desde la esquina superior izquierda. La pantalla contenedora usará el alto escalado correspondiente. El cálculo no distinguirá entre desktop, tablet o celular y no activará ninguna variante de layout.

## Criterios de aceptación

1. En desktop, el widget conserva la composición, animaciones y navegación lateral actuales.
2. En tablet y celular se ve la misma composición desktop completa, reducida proporcionalmente.
3. Ningún elemento cambia de columna, orden o posición relativa por el ancho del viewport.
4. No aparece barra inferior, hoja de navegación, video móvil ni contenido alternativo móvil.
5. Las secciones no se enciman y su separación corresponde a la altura visual escalada.
6. No aparece scroll horizontal provocado por un lienzo sin escalar.
7. No existen duplicados visibles del mismo contenido.
8. Los archivos y estilos de `productos-interactivos` permanecen intactos.

## Verificación

Se revisará el widget en un ancho desktop representativo y en varios anchos angostos, incluyendo aproximadamente 768 px, 430 px y 375 px. La revisión comprobará la geometría de cada `.ps-screen`, la ausencia de elementos móviles visibles, el orden de secciones, la navegación lateral en desktop, las animaciones principales y la inexistencia de desbordamiento horizontal o solapamientos.

También se inspeccionarán los cambios para confirmar que no se incluyeron modificaciones ajenas al widget ni archivos existentes del usuario.

## Estrategia para futuras adaptaciones Figma

Esta limpieza crea una línea base estable. Cada futura adaptación móvil se añadirá por sección, partiendo del lienzo desktop y del Figma correspondiente, sin recuperar la capa responsive eliminada ni introducir un flujo móvil global antes de que todas las decisiones visuales estén definidas.
