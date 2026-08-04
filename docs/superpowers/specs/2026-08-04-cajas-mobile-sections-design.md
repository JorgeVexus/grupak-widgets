# Adaptación móvil de Cajas y empaques

## Objetivo

Adaptar a móvil las secciones 7, 8 y 9 del widget `productos-secciones` con base en los nodos Figma `2274:29909`, `2274:29943` y `2274:29972`. Desktop y las secciones móviles 1 a 6 deben permanecer sin cambios.

## Arquitectura y aislamiento

- Reutilizar el HTML, los textos y las imágenes existentes dentro de `#pane-cajas`.
- Crear una hoja móvil independiente para Cajas y empaques.
- Encapsular todas las reglas bajo `@media (max-width: 767px)` y clases exclusivas de los modos 7, 8 y 9.
- Añadir únicamente estos modos al conjunto de secciones móviles con altura automática.
- Instalar un observador individual compartido para los elementos revelables de las tres secciones.
- No modificar la hoja del proveedor, el CSS desktop ni las hojas móviles anteriores.

## Sección 7: introducción de Cajas y empaques

El modo 7 tendrá este flujo vertical:

1. Imagen de caja abierta centrada.
2. Título “Cajas y empaques”.
3. Tarjeta “Soluciones Convencionales”, construida con el contenido de la columna izquierda existente.
4. Tarjeta “Impresión Digital”, construida con el contenido de la columna derecha existente.

El modo ocultará los contenidos de detalle convencional y digital. La imagen, el título y cada tarjeta se revelarán individualmente al alcanzar 20% de visibilidad, después de 150 ms, con desplazamiento vertical de 32 px durante 650 ms.

## Sección 8: Cajas y empaques convencionales

El modo 8 tendrá este orden:

1. Imagen existente `Cajas y empaques 1.webp`.
2. Título “Cajas y empaques convencionales”.
3. Línea verde corta.
4. Primer párrafo sobre cajas ranuradas y cajas suajadas.
5. Tarjeta verde clara “Ideales para”, construida con el segundo párrafo.

La imagen entrará desde la izquierda y el bloque principal desde la derecha, con 70 px de recorrido. La tarjeta “Ideales para” entrará desde abajo con 32 px. Todos usarán 650 ms y se activarán individualmente durante el scroll.

El modo ocultará la introducción general y el contenido de impresión digital. Los saltos `.desktop-only` se ocultarán solamente en móvil para permitir ajuste natural del texto.

## Sección 9: Impresión digital

El modo 9 tendrá este orden:

1. Imagen existente `Cajas y empaques 2-1.webp` con los exhibidores impresos.
2. Título “Cajas, empaques, exhibidores en Impresión digital”.
3. Línea verde corta.
4. Primer párrafo descriptivo.
5. Tarjeta blanca “Tecnología Single Pass”, construida con el segundo párrafo existente.

La imagen entrará desde la izquierda, el contenido principal desde la derecha y la tarjeta desde abajo. Se usarán 70 px para entradas laterales, 32 px para la entrada vertical, 650 ms de duración y activación individual al 20% de visibilidad después de 150 ms.

El modo ocultará la introducción general y el detalle convencional.

## Responsive, movimiento y compatibilidad

- Las tres secciones usarán una columna, altura automática y espaciado fluido entre 320 y 440 px.
- Cada elemento se animará una sola vez y se retirará del observador al intersectar.
- Si `IntersectionObserver` no existe, todos los elementos se mostrarán inmediatamente.
- Con `prefers-reduced-motion: reduce`, todos los elementos se mostrarán sin transición, desplazamiento ni espera.
- Las entradas laterales quedarán contenidas por el overflow de cada sección y no producirán desplazamiento horizontal del documento.

## Verificación

- Contratos de carga de la hoja móvil, clases exclusivas y altura automática limitada a los modos 0 a 9 adaptados, excluyendo el modo 6 inexistente y manteniendo 7, 8 y 9.
- Contratos de visibilidad: cada modo muestra solamente su contenido correspondiente.
- Contratos de reutilización de las tres imágenes y de los bloques de texto existentes.
- Contratos del observador: umbral 0.2, espera de 150 ms, una sola reproducción y estados accesibles.
- Medición en 440, 390, 375, 360 y 320 px sin overflow horizontal y con continuidad exacta entre modos 7, 8 y 9.
- Suite completa, validación de sintaxis y `git diff --check`.
- Confirmar que las hojas desktop y móviles 1 a 6 permanecen intactas.
