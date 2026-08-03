# Slider de certificaciones — diseño aprobado

## Objetivo

Crear un widget incrustable de certificaciones basado en el nodo de Figma `2419:50653`. El widget mostrará seis cards y permitirá recorrerlas únicamente mediante navegación manual. Debe integrarse con el patrón existente del repositorio: archivos HTML, CSS y JavaScript independientes, sin framework ni dependencias externas.

## Alcance

- Seis cards: ISO 22716, PETA, RSPO, Ocean Bound Plastic, Huella de carbono y Cumplimiento Regulatorio.
- Se usarán las cinco imágenes disponibles en `widgets/slider certificaciones new/Images`.
- La card de Cumplimiento Regulatorio reutilizará provisionalmente `carbonfree-certified.png`, igual que la referencia de Figma.
- No habrá autoplay ni loop infinito.
- No se modificarán otros widgets ni estilos globales.

## Arquitectura

El widget vivirá en `widgets/slider certificaciones new/` y tendrá tres piezas:

- `slider-certificaciones.html`: estructura semántica del carrusel y contenido de las seis cards.
- `slider-certificaciones.css`: diseño aislado mediante clases con prefijo propio, layout responsive y estados de interacción.
- `slider-certificaciones.js`: cargador incrustable, resolución de rutas locales/remotas y controlador del carrusel.

El JavaScript podrá inicializar tanto el HTML ya presente como un contenedor raíz de integración. La inicialización será idempotente para evitar listeners duplicados si el script se carga más de una vez.

## Diseño visual

Las cards conservarán la composición de Figma: superficie blanca, sombra suave, bloque superior azul translúcido, logotipo centrado, encabezado con título sans serif, divisor vertical, subtítulo serif en cursiva y descripción inferior en azul grisáceo.

En desktop se mostrarán tres cards completas dentro del viewport del slider. Las cards tendrán el mismo ancho y altura dentro de cada fila visible, pero usarán altura flexible para que el texto no se corte. En tablet se mostrarán dos cards y en móvil una. Los espaciados y tamaños tipográficos se reducirán con valores fluidos sin alterar la jerarquía visual.

## Interacción

- Flechas anterior y siguiente visibles junto al carrusel.
- Cada acción avanzará una card, manteniendo 3, 2 o 1 cards visibles según el viewport.
- Swipe táctil y drag horizontal con umbral para evitar cambios accidentales.
- Navegación por teclado mediante flechas izquierda y derecha cuando el carrusel tiene foco.
- Las flechas se deshabilitarán al alcanzar el inicio o el final.
- El carrusel no avanzará automáticamente y no regresará circularmente al inicio.
- Las transiciones usarán `transform` y respetarán `prefers-reduced-motion`.

## Responsive

- Desktop, desde 1024 px: 3 cards visibles.
- Tablet, de 640 px a 1023 px: 2 cards visibles.
- Móvil, hasta 639 px: 1 card visible.
- El cálculo se actualizará al cambiar el tamaño de la ventana y ajustará el índice si queda fuera del rango válido.
- No habrá overflow horizontal de la página; solamente se ocultará el excedente dentro del viewport del carrusel.

## Accesibilidad

El carrusel tendrá nombre accesible, región anunciable para el estado, controles `button` con etiquetas descriptivas y estados `disabled` reales. Cada imagen tendrá texto alternativo correspondiente a su certificación. Las cards fuera del viewport no se expondrán como contenido interactivo. El foco será visible y el widget funcionará sin puntero.

## Manejo de errores

Si falla la carga del HTML remoto, el widget registrará un error con un prefijo identificable sin afectar la página anfitriona. Si una imagen no carga, la card conservará su espacio y mostrará el nombre de la certificación como respaldo visual. Si faltan nodos requeridos, la inicialización terminará de forma segura.

## Verificación

Se validará la estructura mediante una prueba de contrato y se probará visualmente en anchos representativos de desktop, tablet y móvil. También se comprobarán límites de navegación, resize, teclado, swipe, ausencia de autoplay, foco visible y modo de movimiento reducido.
