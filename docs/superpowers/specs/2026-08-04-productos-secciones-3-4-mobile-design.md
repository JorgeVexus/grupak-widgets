# Productos secciones 3 y 4: diseño móvil de Papel

## Objetivo

Adaptar exclusivamente las pantallas `data-mode="2"` y `data-mode="3"` del widget Productos a los frames móviles de Figma `2277:25932` y `2277:25965`. La adaptación debe responder entre 320 y 440 px, conservar las animaciones aprobadas y mantener intactos desktop y los modos móviles 0 y 1.

## Arquitectura

Ambas pantallas reutilizan clones independientes del DOM existente `#pane-papel`, por lo que compartirán una hoja enfocada: `productos-secciones-mobile-paper.css`. JavaScript añadirá `ps-mobile-paper-intro-v1` únicamente al modo 2 y `ps-mobile-paper-catalog-v1` únicamente al modo 3. La función de escalado permitirá altura automática en móvil para los modos 0, 1, 2 y 3; los demás conservarán el lienzo desktop escalado.

Todos los selectores de la hoja nueva comenzarán con uno de estos límites:

- `#gpk-ps-widget .ps-screen[data-mode="2"].ps-mobile-paper-intro-v1`
- `#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1`

Las reglas estarán bajo `@media (max-width: 767px)`, salvo el bloque combinado de movimiento reducido. No se modificarán las hojas móviles existentes, `productos-secciones-vendor.css` ni archivos de `productos-interactivos`.

## Sección 3: introducción de Papel

- `#pane-papel` y `#papel-intro-content` pasarán de coordenadas absolutas a un flujo móvil de altura automática.
- `#papel-grid-content` permanecerá oculto en este modo.
- Se reutilizarán `.papel-shared-title`, `.papel-hero-image` y los cuatro `.papel-text-block` existentes.
- El rollo conservará su imagen original, sin duplicar recursos ni reemplazarla por una composición plana.
- Los cuatro textos se presentarán en el orden TL, BL, TR y BR que ya controla JavaScript.
- La secuencia mantendrá el estado activo verde de cada bloque y terminará con BR activo.
- Tamaños, espacios y ancho de lectura usarán `clamp()` y porcentajes, sin breakpoints adicionales.

## Sección 4: catálogo de Papel

- `#pane-papel` y `#papel-grid-content` usarán flujo móvil y altura automática.
- `#papel-intro-content` y `.papel-hero-image` se ocultarán únicamente en el modo 3 móvil cuando no formen parte del frame.
- Se reutilizarán las cuatro `.product-card`: ClassicPak N, UltraPak H, FortePak R y AgricoPak A.
- Cada tarjeta conservará su imagen, nombre, subtítulo, descripción y bloque de usos.
- `.papel-products-grid` se convertirá en una lista vertical siguiendo el frame de Figma, sin márgenes laterales heredados de las tarjetas 3 y 4.
- Las tarjetas aparecerán escalonadamente en su orden de DOM; las burbujas y textos de uso conservarán su entrada posterior.

## Movimiento y accesibilidad

El modo 2 conservará la secuencia título → rollo → TL → BL → TR → BR. El modo 3 conservará la transición al catálogo y la entrada ClassicPak → UltraPak → FortePak → AgricoPak.

Con `prefers-reduced-motion: reduce`, todos los elementos correspondientes al modo visible aparecerán directamente en su posición y estado final, sin retardos ni transformaciones.

## Integración y reversibilidad

- La nueva hoja se cargará después de las adaptaciones móviles de introducción y overview.
- La versión de activos avanzará una sola vez para invalidar caché.
- Cada pantalla tendrá su propia clase, condición de altura y prefijo CSS.
- Eliminar la hoja nueva, ambas clases y los modos 2/3 de la lista de altura automática restaura el comportamiento anterior.
- El trabajo permanecerá en la rama `codex/productos-mobile-section-1` hasta recibir autorización de integración.

## Contratos y verificación

Las pruebas automatizadas comprobarán:

- carga independiente de `productos-secciones-mobile-paper.css`;
- asignación exacta de una clase a cada modo;
- encapsulación de todos los selectores en modo 2 o modo 3;
- altura automática móvil limitada a los modos 0–3;
- cuatro bloques de texto y cuatro tarjetas reutilizados desde el DOM fuente;
- ocultamiento cruzado de intro y catálogo en el modo incorrecto;
- preservación sin cambios de las hojas móviles de modos 0 y 1.

La revisión visual cubrirá 440, 390, 375, 360 y 320 px. En cada ancho se comprobarán ausencia de desbordamiento horizontal, orden completo del contenido, cuatro elementos por sección y continuidad exacta con la pantalla siguiente. Desktop se verificará a 1440 y 1900 px para confirmar que conserva geometría, navegación, animaciones y lienzo escalado.
