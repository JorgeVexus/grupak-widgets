# Adaptación móvil de Grabados

## Objetivo

Adaptar el modo 10 del widget `productos-secciones` al diseño móvil Figma del nodo `2277:26164`. La versión desktop, la secuencia desktop de modos 10–13 y las secciones móviles anteriores deben permanecer sin cambios.

## Arquitectura y aislamiento

- Reutilizar el contenido existente de `#pane-grabados` y sus cuatro servicios.
- Crear una hoja móvil independiente para Grabados.
- Encapsular todas las reglas bajo `@media (max-width: 767px)`, `#gpk-ps-widget`, el modo 10 y una clase versionada exclusiva `ps-mobile-grabados-v1`.
- Añadir únicamente el modo 10 al conjunto de secciones móviles con altura automática.
- Instalar un observador móvil independiente para el título, la introducción y los cuatro servicios.
- No modificar el HTML fuente, la hoja del proveedor, las reglas desktop ni las hojas móviles anteriores.

## Composición móvil

El modo 10 tendrá una sola columna en este orden:

1. Título “Grabados”.
2. Dos párrafos introductorios existentes.
3. Servicio “Preprensa y adaptación de arte al empaque”.
4. Servicio “Color Management”.
5. Servicio “Montaje y ajuste de placas”.
6. Servicio “Retoque de imágenes y soporte técnico en planta”.

Cada servicio mostrará:

1. Su imagen móvil existente, respectivamente `mov 01.png`, `mov 02.png`, `mov 03.png` y `mov 04.png`.
2. Su título en verde.
3. Su descripción en gris oscuro.

Las imágenes se renderizarán como elementos `<img>` fluidos con ancho completo, altura automática y recorte controlado únicamente si la relación del asset lo requiere. No se reutilizarán visualmente los fondos desktop.

## Eliminación de residuos desktop

En el modo móvil se anularán de forma explícita:

- El `background-image` asignado por JavaScript a cada `.grabados-green-card`.
- El fondo verde, dimensiones absolutas, posiciones escalonadas y transformaciones desktop de las tarjetas.
- El fondo SVG fijo del lienzo desktop.
- El icono de chat heredado.

Cada `.grabados-green-card` será un contenedor transparente de flujo normal. Esta anulación sólo existirá dentro del selector móvil versionado.

## Movimiento

- El título y el bloque introductorio aparecerán individualmente desde abajo con un recorrido de 32 px.
- Los cuatro servicios aparecerán individualmente durante el scroll con entradas laterales alternadas:
  - Servicio 1: izquierda.
  - Servicio 2: derecha.
  - Servicio 3: izquierda.
  - Servicio 4: derecha.
- Las entradas laterales tendrán 70 px de recorrido.
- Todas las entradas tendrán 650 ms de duración, umbral de intersección de 0.2 y espera de 150 ms después de intersectar.
- Cada elemento se retirará del observador al activarse y se reproducirá una sola vez.
- Si `IntersectionObserver` no existe, todos los elementos se mostrarán inmediatamente.
- Con `prefers-reduced-motion: reduce`, todos los elementos se mostrarán sin transición, desplazamiento ni espera.

## Responsive y compatibilidad

- La sección tendrá altura automática y una sola columna entre 320 y 440 px.
- El espaciado horizontal y vertical será fluido mediante `clamp()` dentro del único breakpoint móvil.
- Las imágenes usarán `display: block`, `width: 100%` y `height: auto` para evitar espacios y deformaciones.
- Las entradas laterales quedarán contenidas por el overflow de la sección y no producirán desplazamiento horizontal del documento.
- La navegación lateral y la barra inferior conservarán el comportamiento actual del widget.

## Verificación

- Contrato de carga de la hoja móvil independiente.
- Contrato de clase exclusiva para modo 10 y altura automática móvil.
- Contrato de encapsulamiento: todos los selectores nuevos incluyen widget, modo y clase versionada.
- Contrato de reutilización de las cuatro imágenes móviles existentes.
- Contrato que exige `background-image: none` y fondo transparente para las tarjetas sólo en móvil.
- Contratos de animación: recorrido vertical de 32 px, alternancia lateral de 70 px, duración de 650 ms, umbral 0.2, espera de 150 ms, `unobserve` y movimiento reducido.
- Suite completa del widget y `git diff --check`.
- Verificación visual en 440, 390, 375, 360 y 320 px sin overflow horizontal.
- Verificación desktop a 1440 px confirmando que el modo 10 conserva posiciones, fondos y secuencia 10–13 originales.

## Reversibilidad

La adaptación se implementará en commits separados para contratos/aislamiento, layout y animación/verificación. La rama `codex/productos-mobile-section-1` y su worktree se conservarán sin integrar a `main` hasta finalizar todas las secciones móviles.
