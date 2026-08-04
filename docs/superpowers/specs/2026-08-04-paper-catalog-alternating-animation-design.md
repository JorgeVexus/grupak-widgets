# Catálogo de Papel: animación lateral alternada

## Objetivo

Hacer más dinámica la aparición de las cuatro tarjetas del catálogo de Papel en celular sin modificar su layout, contenido, sección 3 o desktop.

## Alcance

El cambio se aplicará únicamente dentro de `@media (max-width: 767px)` y del selector `#gpk-ps-widget .ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1` en `productos-secciones-mobile-paper.css`.

## Comportamiento

- ClassicPak N (`data-index="1"`) iniciará 70 px a la izquierda.
- UltraPak H (`data-index="2"`) iniciará 70 px a la derecha.
- FortePak R (`data-index="3"`) iniciará 70 px a la izquierda.
- AgricoPak A (`data-index="4"`) iniciará 70 px a la derecha.
- Todas comenzarán con opacidad 0.
- Al activarse `mode-3`, cada tarjeta terminará en `translateX(0)` y opacidad 1.
- La transición durará 650 ms con la curva existente y conservará los retrasos 0.10, 0.18, 0.26 y 0.34 segundos.
- La secuencia se reiniciará mediante el mecanismo existente cuando la pantalla vuelva a entrar en el viewport.

## Accesibilidad y protección

Con `prefers-reduced-motion: reduce`, las cuatro tarjetas aparecerán inmediatamente con opacidad 1 y sin transformación. Los selectores permanecerán encapsulados en modo 3 móvil; no se añadirá JavaScript ni se modificarán otras hojas.

## Verificación

Los contratos comprobarán las cuatro direcciones, la distancia de 70 px, el estado final y el bloque de movimiento reducido. La revisión visual confirmará la alternancia en 390 y 320 px, ausencia de desbordamiento horizontal y continuidad con la siguiente sección.
