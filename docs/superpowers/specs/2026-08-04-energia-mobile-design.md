# Adaptación móvil de Energía

## Objetivo

Adaptar exclusivamente el modo 14 del widget `productos-secciones` al diseño móvil del nodo Figma `2277:26192`. La versión desktop, las secciones móviles ya adaptadas y la integración pendiente con `main` deben permanecer sin cambios.

## Arquitectura y aislamiento

- Reutilizar el contenido existente de `#pane-energia`, sus tres filas y las imágenes móviles ya incluidas en el HTML fuente.
- Crear una hoja independiente `productos-secciones-mobile-energia.css`.
- Encapsular las reglas bajo `@media (max-width: 767px)`, `#gpk-ps-widget`, el modo 14 y una clase exclusiva `ps-mobile-energia-v1`.
- Añadir únicamente el modo 14 al conjunto de secciones adaptadas con altura automática.
- Preparar la copia móvil y el observador de entrada desde JavaScript sólo cuando el viewport sea móvil.
- No modificar el HTML fuente, la hoja del proveedor, las reglas desktop ni las hojas móviles anteriores.

## Composición móvil

El modo 14 tendrá fondo `#f9fafb`, padding horizontal de 20 px en el frame Figma de 390 px y una sola columna con este orden:

1. Título “Energía” en verde `#5f9d2f`, 28 px y peso fuerte.
2. Caja introductoria blanca con borde `#e5e7eb`, radio de 12 px y padding de 16 px.
3. Tres tarjetas blancas con borde y radio de 12 px, separadas por 12 px.

La introducción conservará el texto del Figma y resaltará en negrita:

- “energía eléctrica eficiente”;
- “planta de cogeneración de energía”;
- “energía eléctrica y energía térmica”.

Cada tarjeta usará un layout horizontal con padding de 12 px, gap de 12 px y una imagen limpia de 80 × 80 px con `object-fit: cover` y radio de 8 px:

1. `energia-eficiencia.webp` — “Mayor eficiencia energética”.
2. `energia-impacto.webp` — “Menor impacto ambiental”.
3. `energia-suministro.webp` — “Suministro confiable”.

Las descripciones móviles serán las del Figma. Desktop conservará las descripciones extensas actuales.

## Eliminación de residuos desktop

Dentro del modo móvil se anularán explícitamente:

- Las posiciones absolutas, dimensiones fijas y desplazamientos diagonales de `.energia-header`, `.energia-rows` y `.energia-row`.
- Los fondos compuestos asignados a cada fila desktop.
- El canvas fijo de 1850 × 1030 y sus transformaciones para este modo únicamente.
- Los saltos `<br class="desktop-only">` y la navegación lateral desktop.

Las filas móviles serán tarjetas de flujo normal. Las imágenes se mostrarán mediante los `<img>` existentes; no se recortarán imágenes desde los fondos desktop ni se descargarán duplicados de Figma.

## Movimiento

- El título aparecerá desde abajo con 32 px de recorrido.
- La introducción aparecerá desde abajo con 32 px de recorrido.
- Las tarjetas entrarán individualmente al hacer scroll:
  - Tarjeta 1: desde la izquierda.
  - Tarjeta 2: desde la derecha.
  - Tarjeta 3: desde la izquierda.
- Las entradas laterales tendrán 70 px de recorrido, 650 ms de duración, umbral de intersección de 0.2 y espera de 150 ms después de intersectar.
- Cada elemento se retirará del observador al activarse y se reproducirá una sola vez.
- Sin `IntersectionObserver`, los elementos se mostrarán inmediatamente.
- Con `prefers-reduced-motion: reduce`, se mostrarán sin transición, desplazamiento ni espera.

## Responsive y compatibilidad

- El layout se validará entre 320 y 440 px sin overflow horizontal.
- Los espacios laterales se adaptarán con `clamp()` sin superar los 20 px del frame de 390 px.
- La imagen permanecerá en 80 × 80 px cuando haya espacio suficiente y podrá reducirse de forma controlada en 320 px para proteger el texto.
- Los títulos y descripciones no se truncarán.
- La navegación lateral permanecerá oculta en móvil y conservará su comportamiento actual en desktop.
- El caché del preview y los assets se actualizará de `seccion-reveal-27` a `seccion-reveal-28`.

## Verificación

- Contrato de carga de la hoja móvil independiente.
- Contrato de clase exclusiva para modo 14 y altura automática móvil.
- Contrato de encapsulamiento de todos los selectores nuevos.
- Contrato de reutilización de las tres imágenes móviles existentes.
- Contrato de copia móvil y de preservación del contenido desktop.
- Contratos de animación: 32 px vertical, alternancia lateral de 70 px, 650 ms, umbral 0.2, espera de 150 ms, `unobserve` y movimiento reducido.
- Suite completa del widget y `git diff --check`.
- Revisión visual en 440, 390, 375, 360 y 320 px.
- Revisión desktop a 1440 px confirmando canvas, fondos, posiciones, textos e imágenes originales.

## Reversibilidad

La adaptación se implementará en commits separados para especificación, plan y código verificado. La rama `codex/productos-mobile-section-1` y su worktree se conservarán sin integrar a `main` hasta finalizar todas las secciones móviles.
