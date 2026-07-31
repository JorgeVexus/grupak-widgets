# Productos Interactivos: Scroll Continuo Móvil

## Objetivo

Sustituir únicamente en viewports de hasta 768 px la navegación por 15 estados
con flechas por una página vertical continua. La versión de escritorio y la
experiencia de tablet superior a 768 px deben permanecer sin cambios.

## Dirección visual

El hero móvil usará el mismo fondo gris `#d9d9d9` de escritorio. El texto
principal será gris oscuro y el verde Grupak se reservará para palabras clave,
progreso, enlaces y pequeños acentos. Las superficies blancas se usarán solo
cuando ayuden a separar contenido técnico; el fondo general conservará el gris
de marca.

## Arquitectura móvil

- El contenido móvil será un flujo vertical único dentro del widget.
- Las secciones dejarán de mostrarse u ocultarse mediante `mode-0` a `mode-14`
  en mobile. Ese contrato se conservará intacto para desktop.
- Cada bloque existente recibirá una identidad de sección estable para
  navegación y seguimiento: introducción, productos, papel, lámina, cajas,
  grabados y energía.
- Las variantes hoy distribuidas en varios modos se mostrarán consecutivamente
  dentro de su categoría y no duplicarán títulos innecesariamente.
- El documento, no un tablero de altura fija, administrará el scroll móvil.

## Hero e índice

- El hero móvil será la primera sección y utilizará el fondo gris de escritorio.
- Mantendrá el mensaje “Somos fabricantes mexicanos…” y sus KPIs de producción.
- “Nuestros productos” será el índice principal.
- Sus cuatro acciones harán scroll suave hacia Papel, Lámina, Cajas y Grabados.
- El desplazamiento respetará `prefers-reduced-motion` y una separación segura
  para la barra sticky.

## Navegación sticky

- Se eliminarán las flechas anterior y siguiente en mobile.
- Una barra inferior compacta mostrará la categoría visible y el progreso global.
- La barra incluirá una acción “Productos” para regresar al índice.
- La categoría activa se calculará con `IntersectionObserver`; no se usarán
  listeners continuos de scroll.
- La barra respetará `safe-area-inset-bottom`, objetivos táctiles de al menos
  44 px y estados de foco visibles.

## Contenido y accesibilidad

- Todo el contenido será alcanzable con scroll natural y sin contenedores
  anidados que capturen el gesto.
- Los encabezados conservarán una jerarquía semántica clara.
- Las imágenes mantendrán su relación de aspecto y no provocarán scroll
  horizontal.
- Los enlaces del índice tendrán destinos accesibles y foco programático seguro.
- La navegación sticky se ocultará cuando JavaScript no esté disponible; el
  contenido seguirá siendo completamente navegable.

## Implementación progresiva y revisión local

La primera entrega local incluirá:

1. Hero con paleta alineada a desktop.
2. Índice funcional con saltos de categoría.
3. Las categorías actuales concatenadas en scroll continuo.
4. Barra sticky con progreso y sección activa.
5. Compilación de los previews locales.

Después se revisarán visualmente, una por una, introducción, productos, papel,
lámina, cajas, grabados y energía. Los ajustes posteriores conservarán la
arquitectura de scroll aprobada.

## Verificación

- Validar anchos de 320, 375, 390, 430 y 768 px.
- Confirmar que no existen flechas visibles ni cambios de estado por scroll.
- Confirmar que todo el contenido está presente en el DOM y es alcanzable.
- Verificar los cuatro saltos del índice y el retorno desde la barra sticky.
- Comprobar categoría activa y progreso al recorrer el documento.
- Verificar ausencia de overflow horizontal y de errores de consola.
- Comparar desktop antes y después para confirmar que permanece intacto.
- Ejecutar el compilador y entregar una URL localhost sin publicar a producción.

## Criterios de aceptación

- El usuario recorre todo el widget con un solo scroll vertical continuo.
- Ninguna flecha es necesaria para descubrir contenido.
- El hero móvil coincide cromáticamente con el fondo gris de escritorio.
- La barra sticky orienta sin cubrir contenido.
- Los saltos del índice llegan a la categoría correcta.
- Desktop conserva diseño, dimensiones, animaciones y navegación existentes.
