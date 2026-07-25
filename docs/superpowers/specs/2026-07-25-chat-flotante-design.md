# Chat flotante Grupak

## Objetivo

Implementar el chat flotante del nodo Figma `113:1103` como un prototipo visual
interactivo. En esta fase ninguna opcion final navega, llama ni abre servicios
externos; los destinos se conectaran cuando el equipo los confirme.

## Integracion

El widget vivira en `widgets/chat-flotante/` con archivos HTML, CSS y JavaScript
independientes. Un script embebible montara el componente en
`#gpk-floating-chat-root`, siguiendo el patron de los widgets existentes y usando
rutas locales en previews y rutas de Vercel en produccion.

El widget utilizara nombres de clase con prefijo `gpk-chat-`, estilos encapsulados
y una capa flotante fija en la esquina inferior derecha. No modificara estilos
globales ni bloqueara el scroll de la pagina.

## Estados

1. Cerrado: muestra solamente el boton verde con icono de conversacion.
2. Saludo: panel compacto con encabezado de Valeria y mensaje inicial.
3. Menu principal: saludo, acciones para cotizar, asesor e informacion.
4. Contacto: opciones visuales de WhatsApp y telefono.
5. Productos: papel, cajas y empaques, lamina de carton corrugado y grabados.
6. Informacion: historia, sustentabilidad, noticias y contacto.

El boton abre el saludo y permite avanzar al menu principal. Cada opcion de primer
nivel abre su subvista correspondiente. El control Volver regresa al menu
principal y el control de cerrar colapsa todo el widget.

Las opciones finales seran botones con `type="button"` y no tendran efectos
externos.

## Diseno visual

Se conservaran la paleta verde de Grupak, el encabezado en gradacion verde, avatar
de Valeria, panel blanco, mensajes en gris claro, filas de accion con iconos
verdes y el remate inferior "Estamos aqui para ayudarte".

En desktop el panel tendra dimensiones cercanas a las del Figma y permanecera
alineado sobre el boton flotante. En celular utilizara el ancho disponible con
margenes de seguridad, una altura maxima basada en `dvh` y scroll interno solo si
el contenido no cabe.

Las transiciones usaran exclusivamente `transform` y `opacity`, con una entrada
breve de escala y desplazamiento. `prefers-reduced-motion` desactivara el
movimiento no esencial.

## Accesibilidad

- Boton flotante y controles con nombres accesibles.
- `aria-expanded` y `aria-hidden` sincronizados con el estado.
- Cierre con la tecla Escape.
- Foco visible y retorno del foco al boton al cerrar.
- Orden de tabulacion natural y sin trampas de foco.

## Verificacion

- Comparacion visual con el nodo Figma en desktop.
- Pruebas en 390, 768, 1024, 1366 y 1920 pixeles.
- Apertura, cierre, Volver y cambio de las tres subvisualizaciones.
- Sin navegacion externa al pulsar opciones finales.
- Sin desbordamiento horizontal ni contenido fuera de pantalla.
- Sin errores de consola y con carga correcta de todos los recursos.
