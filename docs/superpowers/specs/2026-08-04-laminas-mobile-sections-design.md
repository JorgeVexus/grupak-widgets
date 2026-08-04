# Adaptación móvil de las secciones de Láminas

## Objetivo

Adaptar a móvil las secciones 5 y 6 del widget `productos-secciones` con base en los nodos Figma `2277:26050` y `2277:26089`, conservando sin cambios la composición desktop y las secciones móviles 1 a 4.

## Arquitectura y aislamiento

- Reutilizar el HTML, textos e imágenes existentes de `productos-interactivos`.
- Crear una hoja de estilos móvil independiente para Láminas.
- Aplicar los estilos únicamente bajo `@media (max-width: 767px)` y mediante clases exclusivas en los modos 4 y 5.
- Añadir los modos 4 y 5 al conjunto de secciones móviles con altura automática.
- Instalar un observador individual para los elementos revelables de ambas secciones solamente en móvil.
- No modificar las reglas desktop del proveedor ni los estilos móviles de Introducción, Productos o Papel.

## Sección 5: introducción de Láminas

La pantalla móvil del modo 4 tendrá este orden:

1. Título “Láminas de cartón corrugado”, alineado a la izquierda.
2. Primer bloque descriptivo en tarjeta blanca.
3. Segundo bloque descriptivo en tarjeta verde clara.
4. Primera ilustración de tipos de corrugado.
5. Segunda ilustración de tipos de corrugado.

La composición usará una sola columna, altura automática, espaciado fluido y anchos seguros entre 320 y 440 px. Los elementos se revelarán individualmente al alcanzar 20% de visibilidad, después de 150 ms, con una transición vertical de 32 px durante 650 ms.

## Sección 6: especificaciones de Láminas

El modo 5 móvil mostrará en una sola columna:

1. Título “Láminas de cartón corrugado”.
2. Tarjeta “Ancho de la corrugadora”, con fotografía, encabezado verde, cifra “283 cm” y descripción.
3. Tarjeta “Opciones de corrugado y anchos de papel”, con fotografía, encabezado verde y descripción.

Ambas tarjetas tendrán imagen superior, contenido inferior, bordes suaves y dimensiones fluidas. La primera entrará desde la izquierda y la segunda desde la derecha, con 70 px de desplazamiento, 650 ms de duración y activación individual al 20% de visibilidad después de 150 ms.

La secuencia temporizada `mode-5` a `mode-6` continuará disponible para desktop. En móvil, el CSS presentará ambos grupos de especificaciones dentro del mismo flujo vertical y el revelado dependerá del observador individual, no del temporizador global.

## Movimiento reducido y compatibilidad

- Cada elemento se animará una sola vez y se retirará del observador al intersectar.
- Si `IntersectionObserver` no está disponible, todos los elementos se mostrarán inmediatamente.
- Con `prefers-reduced-motion: reduce`, los elementos se mostrarán inmediatamente sin desplazamiento, transición ni espera.
- Las transformaciones iniciales no deberán producir desbordamiento horizontal del documento.

## Verificación

- Contratos para confirmar la carga de la hoja móvil independiente, las clases de los modos 4 y 5 y la altura automática limitada a móvil.
- Contratos para confirmar la reutilización de los dos textos, dos ilustraciones y dos grupos de especificaciones existentes.
- Contratos para comprobar umbral 0.2, espera de 150 ms, clase de revelado y direcciones alternadas.
- Medición en 440, 390, 375, 360 y 320 px sin desbordamiento horizontal.
- Suite completa del widget y `git diff --check`.
- Comparación del CSS desktop antes y después para confirmar que permanece intacto.
