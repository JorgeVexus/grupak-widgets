(function() {
    "use strict";

    const baseURL = "https://grupak-widgets.vercel.app/widgets/productos-menu";

    // 1. Inject CSS stylesheet dynamically if not already present
    if (!document.getElementById("gpk-menu-styles")) {
        const link = document.createElement("link");
        link.id = "gpk-menu-styles";
        link.rel = "stylesheet";
        link.href = `${baseURL}/productos-menu.css`;
        document.head.appendChild(link);
    }

    // 2. Fetch and inject HTML markup
    const container = document.getElementById("gpk-products-menu-root");
    if (container) {
        fetch(`${baseURL}/productos-menu.html`)
            .then(res => {
                if (!res.ok) throw new Error("Error loading products menu HTML");
                return res.text();
            })
            .then(html => {
                container.innerHTML = html;
                initMenu();
            })
            .catch(err => console.error("Error loading products menu:", err));
    }

    function initMenu() {
        const root = document.querySelector(".gpk-products-section");
        if (!root) return;

        const items = root.querySelectorAll('.gpk-product-item');

        // Map product names to target slide indices in productos-interactivos
        const slideMap = {
            "papel": 5,
            "cajas": 2,
            "lamina": 7,
            "grabados": 8,
            "energia": 9
        };

        items.forEach(item => {
            const product = item.getAttribute('data-product');
            const targetSlide = slideMap[product];

            // Click handler
            item.addEventListener('click', (e) => {
                const saberMasBtn = e.target.closest('.gpk-saber-mas');
                
                // En pantallas medianas y móviles, manejamos la expansión estilo acordeón
                if (window.innerWidth <= 1024) {
                    if (saberMasBtn) {
                        e.preventDefault();
                        if (window.gpkGoToProductsSlide) {
                            window.gpkGoToProductsSlide(targetSlide);
                        }
                    } else {
                        // Alternamos el estado activo del acordeón
                        const isActive = item.classList.contains('gpk-active');
                        items.forEach(el => el.classList.remove('gpk-active'));
                        if (!isActive) {
                            item.classList.add('gpk-active');
                        }
                    }
                } else {
                    // En escritorio, un clic en cualquier parte del item (o el link) navega directamente
                    e.preventDefault();
                    if (window.gpkGoToProductsSlide) {
                        window.gpkGoToProductsSlide(targetSlide);
                    }
                }
            });
        });

        // Limpieza de clases al cambiar tamaño a desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                items.forEach(el => el.classList.remove('gpk-active'));
            }
        });
    }
})();
