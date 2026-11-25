# Webflow: cambiar embeds de Vercel a Cloudflare Pages

Solo cambia el **host** del `src`. El `<div id="...-root">` de cada embed y el resto del snippet NO se tocan.

    Antes:   https://grupak-widgets.vercel.app/widgets/...
    Despues: https://grupak-widgets.pages.dev/widgets/...

Ejemplo (navbar):

```html
<div id="gpk-navbar-menu-root"></div>
<script src="https://grupak-widgets.pages.dev/widgets/navbar-menu/navbar-menu.js" defer></script>
```

Conserva tal cual cualquier `defer` o `?v=...` que ya tenga el embed en Webflow.

## Scripts de cada widget (nueva URL)

| Widget | Script |
|---|---|
| Chat flotante | https://grupak-widgets.pages.dev/widgets/chat-flotante/chat-flotante.js |
| Ciclo de vida | https://grupak-widgets.pages.dev/widgets/ciclo-de-vida/ciclo-de-vida.js |
| Comunidad | https://grupak-widgets.pages.dev/widgets/comunidad/comunidad.js |
| Footer | https://grupak-widgets.pages.dev/widgets/footer/footer.js |
| Formulario | https://grupak-widgets.pages.dev/widgets/formulario/formulario.js |
| Gestion | https://grupak-widgets.pages.dev/widgets/gestion/gestion.js |
| Linea de tiempo | https://grupak-widgets.pages.dev/widgets/linea-tiempo/linea-tiempo.js |
| Lo que nos impulsa | https://grupak-widgets.pages.dev/widgets/lo-que-nos-impulsa/lo-que-nos-impulsa.js |
| Mapa de ubicaciones | https://grupak-widgets.pages.dev/widgets/locations-map/locations-map.js |
| Mas alla del empaque | https://grupak-widgets.pages.dev/widgets/mas-alla-del-empaque/mas-alla-del-empaque.js |
| Medio ambiente | https://grupak-widgets.pages.dev/widgets/medio-ambiente/medio-ambiente.js |
| Medio ambiente (secciones) | https://grupak-widgets.pages.dev/widgets/medio-ambiente-secciones/medio-ambiente-secciones.js |
| Navbar autohide | https://grupak-widgets.pages.dev/widgets/navbar-autohide/navbar-autohide.js |
| Navbar menu (ES) | https://grupak-widgets.pages.dev/widgets/navbar-menu/navbar-menu.js |
| Navbar menu (EN) | https://grupak-widgets.pages.dev/widgets/navbar-menu/navbar-menu-en.js |
| Productos interactivos | https://grupak-widgets.pages.dev/widgets/productos-interactivos/productos-interactivos.js |
| Productos menu | https://grupak-widgets.pages.dev/widgets/productos-menu/productos-menu.js |
| Productos secciones | https://grupak-widgets.pages.dev/widgets/productos-secciones/productos-secciones.js |
| Slider certificaciones | https://grupak-widgets.pages.dev/widgets/slider%20certificaciones%20new/slider-certificaciones.js |
| Sustentabilidad estrategia | https://grupak-widgets.pages.dev/widgets/sustentabilidad%20estrategia/sustentabilidad-estrategia.js |

Donde Webflow use versiones en ingles de otros widgets, el archivo equivalente esta en la misma carpeta `widgets/<nombre>/`.

## Donde buscar en Webflow
1. Site settings -> Custom code (Head code y Footer code).
2. Cada pagina -> Page settings -> Custom code.
3. Elementos "Embed" dentro de cada pagina o Symbol/Component (el navbar y el footer suelen estar ahi).
4. Buscar con el Finder de Webflow el texto `vercel.app` para no dejar ninguno.

## Orden recomendado
1. Publicar en Webflow el cambio en UNA pagina de prueba (o en staging) y revisar que el widget carga y no hay errores CORS en consola.
2. Cambiar el resto, publicar.
3. Dejar Vercel activo unos dias como respaldo; despues apagarlo.
