# Productos sección 2: diseño móvil

## Objetivo

Adaptar exclusivamente la sección `data-mode="1"` del widget Productos al frame móvil de Figma `2274:29860`. La solución debe conservar la secuencia escalonada existente, responder correctamente entre 320 y 440 px y mantener sin cambios tanto desktop como la sección móvil 1 aprobada.

## Arquitectura

La adaptación reutilizará el DOM actual de `#overview-pane`. JavaScript añadirá la clase `ps-mobile-overview-v1` solamente a la pantalla cuyo modo sea `1` y permitirá que esa pantalla use altura automática debajo de 768 px.

Los estilos vivirán en una hoja nueva, `productos-secciones-mobile-overview.css`. Todos sus selectores comenzarán con `#gpk-ps-widget .ps-screen[data-mode="1"].ps-mobile-overview-v1` y estarán dentro de `@media (max-width: 767px)`, excepto la regla combinada equivalente para movimiento reducido. No se modificarán `productos-secciones-vendor.css` ni los archivos de `productos-interactivos`.

## Composición móvil

- La pantalla móvil tendrá flujo vertical y altura determinada por su contenido.
- El encabezado `Nuestros productos` conservará la jerarquía tipográfica y el verde del frame.
- `.overview-grid-new` dejará de usar las coordenadas del lienzo desktop y se convertirá en una lista vertical de cuatro productos.
- Cada `.overview-col-new` reutilizará su imagen `.overview-mobile-img`, título, descripción y botón existentes.
- El clon compartido de `#pillars-container` se ocultará únicamente dentro del modo 1 móvil para evitar duplicar las imágenes.
- Espaciado, tamaños y proporciones se expresarán con `clamp()` y porcentajes para mantener el diseño entre 320 y 440 px sin breakpoints adicionales.
- No se crearán nodos móviles duplicados ni contenido alternativo en JavaScript.

## Movimiento

La revelación seguirá usando `mode-1` y las cuatro columnas existentes. El encabezado aparecerá primero y después los productos en el orden Papel, Lámina, Cajas y empaques, Grabados. Los retrasos conservarán una progresión corta y legible en móvil.

Con `prefers-reduced-motion: reduce`, encabezado y productos aparecerán directamente en su estado final, sin desplazamientos ni retrasos.

## Integración y reversibilidad

- La hoja móvil de sección 1 permanecerá intacta.
- La nueva hoja se cargará después de la hoja móvil de sección 1.
- La versión de activos avanzará una sola vez para invalidar caché.
- Quitar la hoja nueva, la clase de modo 1 y la condición de altura devuelve la sección 2 a su estado anterior.
- El trabajo continuará en la rama aislada `codex/productos-mobile-section-1`; no se integrará a `main` ni se publicará sin aprobación.

## Contratos y verificación

Las pruebas automatizadas comprobarán:

- que la hoja nueva se carga de forma independiente;
- que solo `data-mode="1"` recibe `ps-mobile-overview-v1`;
- que todos los selectores están encapsulados en modo 1 y en el breakpoint móvil;
- que únicamente los modos 0 y 1 usan altura automática en móvil;
- que existen cuatro imágenes móviles y cuatro columnas reutilizadas;
- que las hojas vendor y la sección 1 no se modifican.

La revisión visual cubrirá 440, 390, 375, 360 y 320 px, comprobando ausencia de desbordamiento horizontal, cuatro productos completos, secuencia escalonada y continuidad exacta con la sección siguiente. Desktop se verificará a 1440 y 1900 px para confirmar que conserva su lienzo escalado, navegación y geometría existentes.
