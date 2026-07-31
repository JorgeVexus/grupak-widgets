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

## Refinamiento visual aprobado: hero y categorías

Este refinamiento sustituye únicamente las decisiones visuales móviles que se
contradigan con los puntos siguientes. La arquitectura de scroll continuo y la
experiencia de escritorio permanecen sin cambios.

### Hero móvil

- Solo el hero utilizará fondo carbón `#383838`; las secciones posteriores
  conservarán su fondo claro.
- La información será idéntica a la del hero de escritorio y mostrará sus cuatro
  KPIs: `3 Plantas`, `6 Abastecedoras`, `Fundada en 1957 / 69 Años` y
  `100% Fibra reciclada biodegradable`.
- Los indicadores `+300,000 toneladas de papel reciclado` y `+234,000 toneladas
  de cartón corrugado` no formarán parte del hero móvil.
- Los cuatro KPIs se organizarán en una cuadrícula móvil 2 × 2, con contraste y
  lectura suficientes sobre el fondo oscuro.

### Índice “Nuestros productos”

- Cada categoría será una card vertical sin elementos superpuestos.
- Título y descripción ocuparán una zona de texto independiente; la imagen tendrá
  su propia zona centrada y el botón se ubicará al final.
- Los botones tendrán ancho ajustado al contenido, altura táctil mínima de 44 px y
  no competirán con la imagen.

### Cards de Papel

- Habrá separación visible entre los textos introductorios y la primera card
  ClassicPak, conservada también entre cards sucesivas.
- La etiqueta “Este papel se usa para” se centrará verticalmente dentro de su pill.
- Imagen, título, descripción, pill y texto de uso permanecerán en flujo normal,
  sin posiciones absolutas ni solapes.

### Láminas de cartón corrugado

- El título “Amplia gama de resistencias” permanecerá íntegramente dentro de su card.
- El bloque de texto tendrá ancho suficiente y no compartirá fila estrecha con las
  imágenes.
- Las dos imágenes se mostrarán más grandes, en una fila horizontal debajo de la
  card de texto, manteniendo su relación de aspecto.

### Verificación adicional

- Revisar hero, índice, Papel y Láminas en 320, 375, 390, 430 y 768 px.
- Confirmar que ningún texto, imagen, botón o pill se superpone o sale de su card.
- Confirmar por comparación visual y reglas CSS que el escritorio no cambia.

## Refinamiento visual aprobado: Láminas, Cajas y Energía

### Láminas técnicas

- Las especificaciones “Ancho de la corrugadora” y “Opciones de corrugado y
  anchos de papel” serán bloques independientes en flujo normal.
- Cada bloque mostrará primero su card de texto y después su imagen, con 24 px de
  separación antes del siguiente bloque.
- Se eliminarán en móvil alturas, transformaciones y posiciones absolutas
  heredadas que permitan a una imagen invadir otra card.

### Cajas

- Cada imagen permanecerá asociada visualmente a su card de texto.
- Habrá 28 px de separación vertical entre una pareja texto/imagen y la siguiente.
- Ninguna imagen usará márgenes negativos ni posiciones absolutas en el flujo móvil.

### Energía

- Se reutilizarán las tres imágenes presentes en escritorio: eficiencia energética,
  impacto ambiental y suministro confiable.
- Cada fila será un bloque editorial con imagen panorámica arriba y texto debajo.
- Los tres bloques usarán separadores ligeros y espacio vertical, evitando nuevas
  cards pesadas y manteniendo la lectura continua.

### Verificación adicional de estos bloques

- Confirmar que las imágenes de Láminas no intersectan las cards adyacentes.
- Confirmar al menos 28 px entre grupos visuales de Cajas.
- Confirmar que Energía muestra tres imágenes con proporción preservada y texto
  inmediatamente relacionado debajo.
