# Revelado individual del catálogo de Papel en móvil

## Objetivo

Hacer visible la entrada alternada de los cuatro Paks mientras el usuario recorre la sección 4 en celular. Cada tarjeta debe comenzar su animación al entrar individualmente al área visible, en vez de animarse junto con toda la sección.

## Alcance

- Aplicar únicamente a `.ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1` en anchos de hasta 767 px.
- Mantener intactos desktop, las secciones 1 a 3 y las secciones todavía no adaptadas.
- Conservar la dirección actual: tarjetas 1 y 3 desde la izquierda; tarjetas 2 y 4 desde la derecha.
- Conservar 70 px de desplazamiento, 650 ms de duración y la curva actual.

## Comportamiento

- Un `IntersectionObserver` exclusivo del catálogo observará cada `.product-card` por separado.
- La tarjeta se revelará cuando alcance aproximadamente 20% de visibilidad (`threshold: 0.2`).
- Al intersectar, esperará 150 ms y recibirá una clase de revelado propia.
- Cada tarjeta se animará una sola vez; después será retirada del observador.
- El estado final será `opacity: 1` y `translateX(0)`.
- Se eliminarán los retrasos globales por índice, porque actualmente empiezan antes de que las tarjetas inferiores sean visibles.

## Compatibilidad y accesibilidad

- Si `IntersectionObserver` no existe, todas las tarjetas se mostrarán inmediatamente.
- Con `prefers-reduced-motion: reduce`, las tarjetas se mostrarán inmediatamente, sin transición ni espera.
- El observador se instalará solamente cuando el viewport corresponda a móvil. El CSS seguirá encapsulado en el breakpoint y la clase de la sección 4.

## Verificación

- Prueba contractual para confirmar el observador, el umbral, el retraso y la clase de revelado.
- Comprobar que las cuatro direcciones alternadas continúan presentes.
- Ejecutar la suite completa del widget y `git diff --check`.
- Confirmar que desktop no recibe la nueva clase ni cambios de estilo.
