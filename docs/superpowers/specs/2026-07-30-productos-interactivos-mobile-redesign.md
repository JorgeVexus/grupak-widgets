# Rediseño móvil de Productos Interactivos

## Objetivo

Reconstruir desde cero la experiencia del widget `productos-interactivos` para
viewports de hasta 768 px. El diseño, las dimensiones y el comportamiento de
escritorio no deben modificarse.

## Dirección aprobada

La interfaz seguirá una dirección editorial técnica: fondo neutro cálido,
tipografía clara, imágenes de producto amplias, verde Grupak como único acento,
divisiones por líneas y uso limitado de tarjetas. No se reutilizará la
composición móvil existente.

## Arquitectura responsive

- Desktop conservará sus reglas actuales fuera de las nuevas media queries.
- Mobile tendrá una capa CSS propia y explícita bajo
  `@media (max-width: 768px)`.
- Las 15 secciones existentes y sus índices se conservarán para no romper la
  lógica de navegación ni los enlaces directos desde “Nuestros productos”.
- Cada sección móvil tendrá altura basada en su contenido y scroll vertical
  natural. No usará alturas rígidas de pantalla para encajar contenido.
- El contenedor general usará unidades dinámicas únicamente para mínimos
  seguros y respetará `safe-area-inset-top` y `safe-area-inset-bottom`.

## Estructura móvil compartida

1. Encabezado compacto con categoría actual y progreso, por ejemplo
   `Papel · 03/15`.
2. Área visual principal con la imagen real del producto, sin marcos, sombras
   falsas ni recortes destructivos.
3. Bloque editorial con etiqueta, título, descripción y datos técnicos.
4. Navegación inferior fija dentro del widget:
   - botones circulares independientes de 44 × 44 px;
   - iconos SVG centrados;
   - anterior con contorno y siguiente con fondo verde;
   - barra de progreso en una columna central flexible;
   - estado deshabilitado perceptible;
   - respuesta táctil mediante escala, sin animar dimensiones.

## Adaptación del contenido

- La introducción se convertirá en una secuencia editorial con el mensaje de
  marca, imagen y KPIs legibles.
- “Nuestros productos” usará una galería horizontal con tarjetas de ancho
  controlado y `scroll-snap`; cada tarjeta conservará su salto a la sección
  correspondiente.
- Papel mostrará su introducción y después el portafolio en una lista o cuadrícula
  de una columna, evitando comprimir cuatro fichas en una sola pantalla.
- Láminas alternará imagen, explicación y especificaciones en bloques verticales.
- Cajas y empaques separará introducción, convencional y digital como pantallas
  consecutivas con la misma jerarquía.
- Grabados conservará sus cuatro servicios, organizados como lista editorial con
  imagen y texto completos.
- Energía mostrará sus tres líneas de acción en bloques verticales con imágenes
  responsivas.

## Interacción y accesibilidad

- El desplazamiento vertical dentro de una sección no cambiará accidentalmente
  de diapositiva.
- Los botones conservarán etiquetas accesibles y navegación por teclado.
- El foco será visible y los objetivos táctiles tendrán un mínimo de 44 px.
- Se respetará `prefers-reduced-motion`.
- Las animaciones usarán solo `transform` y `opacity`.
- El contenido nunca dependerá de hover.

## Compatibilidad y aislamiento

- Se validarán anchos de 320, 375, 390, 430 y 768 px.
- Se comprobarán alturas reducidas y el viewport dinámico de Safari móvil.
- Se verificará que no exista scroll horizontal.
- Se tomará una captura de escritorio antes y después para confirmar que no
  cambió su composición.
- Las reglas móviles previas que entren en conflicto se reemplazarán por una
  única capa final coherente, preservando cualquier cambio de usuario que no
  pertenezca al layout móvil sustituido.

## Verificación y entrega local

- Ejecutar pruebas de navegación para los 15 estados.
- Revisar visualmente las secciones representativas y los extremos de contenido.
- Ejecutar el compilador existente del repositorio.
- Generar o actualizar el preview local del widget.
- Servir el repositorio en localhost y entregar la URL de revisión sin publicar
  a producción.

## Criterios de aceptación

- Ninguna sección móvil presenta contenido cortado, superpuesto o fuera del
  viewport.
- Todos los controles mantienen forma, tamaño y alineación.
- Es posible leer el contenido completo mediante scroll natural.
- Los saltos de categoría, anterior y siguiente funcionan en las 15 secciones.
- La versión de escritorio es visual y funcionalmente idéntica a la anterior.
- La compilación final termina sin errores y puede revisarse en localhost.
