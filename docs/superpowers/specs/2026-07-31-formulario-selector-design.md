# Selector inicial del widget de formularios

## Objetivo

Evitar que el formulario de contacto se muestre automáticamente y reciba solicitudes que corresponden a proveeduría o bolsa de trabajo. El widget debe presentar primero tres rutas claramente diferenciadas y mostrar un formulario únicamente después de una selección explícita.

## Experiencia inicial

El widget inicia con el encabezado “¿Qué deseas hacer?” y tres tarjetas de acción:

1. “Solicitar cotización”, con el apoyo “Productos y soluciones”.
2. “Quiero ser proveedor”, con el apoyo “Registro comercial”.
3. “Quiero trabajar en Grupak”, con el apoyo “Talento y vacantes”.

Ningún formulario estará visible ni marcado como activo al cargar la página sin un destino explícito. “Contacto” se reemplaza por “Solicitar cotización” en la navegación del widget.

## Apariencia y comportamiento

Las tarjetas usan la paleta existente del formulario: verde principal `#5f9d2f`, verde oscuro `#4d8425`, blanco y los grises definidos en sus variables CSS. En escritorio forman una fila de tres columnas; en móvil se apilan verticalmente.

Al seleccionar una tarjeta:

- Se muestra únicamente el formulario correspondiente debajo del selector.
- Las tres tarjetas permanecen visibles y adoptan una presentación más compacta.
- La tarjeta activa queda resaltada en verde.
- La vista se desplaza suavemente hacia el formulario cuando la selección proviene de una interacción del usuario.
- El usuario puede cambiar de formulario seleccionando otra tarjeta.

Las transiciones usan `transform` y `opacity`, respetan `prefers-reduced-motion` y no bloquean la interacción.

## Accesibilidad

El selector conserva semántica de pestañas mediante `role="tablist"`, `role="tab"` y `role="tabpanel"`. En el estado inicial todas las tarjetas tienen `aria-selected="false"`; después de una selección solo la activa cambia a `true`. Los formularios inactivos permanecen ocultos y no participan en la navegación por teclado. Cada tarjeta incluye foco visible y respuesta para estados hover, activo y teclado.

## Compatibilidad

La API pública `window.gpkOpenFormulario(target)` seguirá abriendo el formulario solicitado. Los destinos actuales mediante `?gpkForm=...` y hashes reconocidos seguirán seleccionando el formulario correspondiente durante la carga; en esos casos se considera que existe una selección explícita y se muestra el panel directamente.

Los nombres internos `contacto`, `proveedor` y `trabajo` se conservan para no alterar envíos, integraciones ni enlaces existentes. Solo cambia la etiqueta visible de “Contacto” a “Solicitar cotización”.

## Manejo de estados y errores

Una selección desconocida no activa ningún formulario y mantiene el selector inicial visible. La validación, el envío, los mensajes de éxito o error y el estado dinámico de productos continúan funcionando como hasta ahora.

## Verificación

Se verificará:

- Carga inicial sin formulario visible.
- Selección y cambio entre los tres formularios.
- Etiqueta “Solicitar cotización”.
- Estado compacto y tarjeta activa después del primer clic.
- Navegación con teclado y atributos ARIA.
- Distribución en escritorio y apilado en móvil.
- Apertura mediante API pública, parámetros y hashes existentes.
- Ausencia de regresiones en los envíos y campos dinámicos.

## Alcance

Los cambios se limitan a `widgets/formulario/formulario.html`, `widgets/formulario/formulario.css`, `widgets/formulario/formulario.js`, pruebas relacionadas y el changelog del día. No se modifican los campos ni el destino de envío de los formularios.
