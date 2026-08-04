# Productos sección 1: adaptación móvil aislada

## Objetivo

Adaptar únicamente la primera sección del widget `productos-secciones` al frame móvil de Figma `2274:29819`, con fidelidad visual en el ancho de referencia y comportamiento fluido en pantallas más pequeñas. La adaptación conservará la secuencia animada de los cuatro productos y no modificará el diseño desktop ni las demás secciones.

Referencia: `https://www.figma.com/design/oOOTfGtb6xh9jFKBoj3Ikb/Grupak?node-id=2274-29819&m=dev`

## Alcance visual

La sección móvil incluirá, en este orden:

1. Título con los mismos énfasis verdes del Figma.
2. Descripción introductoria.
3. Composición visual de los cuatro productos: rollo de papel, láminas, caja y grabados.
4. Bloque de indicadores de producción que continúa debajo de la composición.

El navbar móvil visible en el frame de Figma queda expresamente fuera del alcance porque Webflow ya proporciona el navbar de la página.

El fondo, espacios, tamaños, pesos tipográficos, interlineado, proporciones y alineaciones se tomarán del frame de Figma. La composición se calibrará primero en el ancho del frame de referencia y después se validará en 390, 375, 360 y 320 px.

## Aislamiento

La adaptación se limitará a la pantalla `.ps-screen[data-mode="0"]`. JavaScript añadirá a esa pantalla una clase estable, `ps-mobile-intro-v1`, al construir el flujo.

Los estilos nuevos vivirán en un archivo independiente:

`widgets/productos-secciones/productos-secciones-mobile-intro.css`

El archivo principal lo cargará después del CSS vendor y del CSS estructural. Todas las reglas de la adaptación comenzarán con:

`#gpk-ps-widget .ps-screen[data-mode="0"].ps-mobile-intro-v1`

No se añadirán reglas móviles de sección 1 a `productos-secciones-vendor.css`. Ningún selector nuevo podrá apuntar globalmente a `.products-board`, `.ps-screen`, `.products-intro-pane`, `.pillar-wrapper` u otras secciones sin el prefijo anterior.

La reversión completa consistirá en retirar la inclusión del archivo CSS móvil, la clase `ps-mobile-intro-v1` y su inicialización específica. No requerirá reconstruir desktop ni restaurar estilos vendor.

## Breakpoint y protección de desktop

La capa móvil se activará exclusivamente con `@media (max-width: 767px)`. Desde 768 px en adelante se conservará exactamente el lienzo desktop actual, incluido su centrado, gutter gris, navegación lateral, animaciones y escala.

En móvil, solo la pantalla de modo 0 dejará de representarse como un lienzo desktop escalado. Su contenedor usará altura automática y flujo controlado. Las otras diez pantallas continuarán mostrando temporalmente el lienzo desktop escalado hasta recibir sus propios diseños Figma.

El cálculo global de escala no se eliminará. Para el modo 0, JavaScript permitirá que CSS controle la altura móvil sin aplicar el alto escalado de `1030 × escala`; para todos los demás modos y para cualquier ancho desde 768 px se conservará el comportamiento actual.

## Estructura de contenido

Se reutilizarán los nodos clonados del contenido desktop. No se duplicarán títulos, textos, KPIs ni imágenes en un segundo árbol móvil.

Dentro del modo 0:

- `.products-intro-pane` contendrá el título, la descripción y los KPIs existentes.
- `#pillars-container` conservará los cuatro `.pillar-wrapper` originales.
- CSS Grid y flujo normal resolverán la estructura de texto y KPIs.
- La composición de productos usará un contenedor proporcional con `position: relative` solo en su interior.
- Cada producto usará posiciones y dimensiones porcentuales, no coordenadas absolutas ligadas a un único ancho de teléfono.

El HTML fuente `widgets/productos-interactivos/productos-interactivos.html` no se modificará.

## Composición y respuesta a pantallas pequeñas

La composición tendrá una relación de aspecto estable derivada del Figma. Las cuatro capas se posicionarán con porcentajes respecto al contenedor:

- El rollo será el ancla izquierda.
- Las láminas ocuparán el centro posterior.
- La caja quedará en primer plano hacia la derecha.
- Los grabados cerrarán la composición en el extremo inferior derecho.

El contenedor tendrá un ancho máximo correspondiente al frame de referencia y `width: 100%` dentro del padding móvil. Al reducirse el viewport, todos los productos conservarán su relación y solapamiento. No se usarán anchos fijos que provoquen scroll horizontal.

En 320 px se permitirá reducir tipografía, gaps y padding mediante variables fluidas con `clamp()`, pero no cambiar el orden del contenido ni convertir la composición en carrusel, columnas o imágenes distintas.

## Animación

La composición final se verá como una sola imagen, pero seguirá formada por cuatro productos independientes.

La secuencia será:

1. Aparece el contorno del rollo y se revela su imagen.
2. Aparece el contorno de las láminas y se revela su imagen.
3. Aparece el contorno de la caja y se revela su imagen.
4. Aparece el contorno de los grabados y se revela su imagen.

La animación reutilizará las clases e imágenes actuales, adaptando únicamente posiciones, escalas, orígenes y tiempos para móvil. El estado final deberá coincidir con la composición de Figma sin saltos de geometría entre el último fotograma animado y el reposo.

La secuencia se iniciará cuando la sección entre al viewport, mantendrá el comportamiento de repetición existente al salir y volver a entrar, y respetará `prefers-reduced-motion`. Con movimiento reducido, se mostrará inmediatamente la composición final completa.

## KPIs

Los indicadores existentes se reutilizarán. La implementación móvil ajustará grid, tipografía, líneas verdes, unidades y espaciado para coincidir con el Figma sin alterar los valores ni el contenido.

La sección podrá extenderse verticalmente cuando el ancho sea menor; no se recortarán KPIs ni se impondrá una altura fija que provoque superposición con la segunda sección.

## Contratos y pruebas

Se ampliará `productos-secciones.contract.test.js` para verificar:

1. El CSS móvil nuevo existe y se carga después de los estilos actuales.
2. Todos sus selectores de layout están limitados al modo 0 y a `ps-mobile-intro-v1`.
3. El único breakpoint de esta adaptación es `max-width: 767px`.
4. Desktop conserva las reglas actuales de escala, centrado, gutter y navegación.
5. Ninguna pantalla distinta del modo 0 recibe la clase móvil.
6. Los cuatro pilares permanecen como nodos independientes y conservan la secuencia de animación.
7. El modo 0 usa altura automática solo en móvil y las demás pantallas conservan su alto escalado.

La verificación en navegador cubrirá:

- Comparación visual con Figma en el ancho de referencia.
- Viewports de 390, 375, 360 y 320 px.
- Desktop en 1440 y 1900 px.
- Orden del contenido, proporciones, animación y estado final.
- Ausencia de scroll horizontal, recortes y solapamientos.
- Continuidad correcta entre la sección 1 y la sección 2.
- Navegación lateral limitada al widget.
- Cero errores de consola.

## Archivos previstos

- Crear `widgets/productos-secciones/productos-secciones-mobile-intro.css`.
- Modificar `widgets/productos-secciones/productos-secciones.js` para cargar la hoja, marcar el modo 0 y permitir altura móvil automática solo en esa pantalla.
- Modificar `widgets/productos-secciones/productos-secciones.contract.test.js` para proteger aislamiento y desktop.
- Modificar `widgets/productos-secciones/preview.html` únicamente para actualizar la versión de caché cuando se publique.

No se modificará `productos-secciones-vendor.css`, `productos-interactivos.html`, los widgets de navbar o footer ni ninguna sección distinta del modo 0.

## Criterios de aceptación

1. En móvil, la sección 1 coincide visualmente con el frame de Figma, excluyendo el navbar.
2. Los cuatro productos forman la composición del Figma y se animan individualmente en secuencia.
3. La adaptación funciona entre 320 y 767 px sin scroll horizontal ni elementos encimados.
4. Los KPIs aparecen completos debajo de la composición.
5. La sección 2 comienza después de la altura real de la sección 1.
6. Desde 768 px, desktop permanece visual y funcionalmente idéntico a la versión publicada anterior.
7. Las demás secciones móviles permanecen sin adaptación y no heredan reglas de la sección 1.
8. La adaptación puede revertirse sin editar el CSS vendor ni reconstruir desktop.
