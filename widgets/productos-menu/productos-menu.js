(function() {
    "use strict";

    const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";
    const baseURL = isLocalhost
        ? "widgets/productos-menu"
        : "https://grupak-widgets.vercel.app/widgets/productos-menu";
    const assetVersion = "20261110-energia-update";

    // 1. Inject CSS stylesheet dynamically if not already present
    if (!document.getElementById("gpk-menu-styles")) {
        const link = document.createElement("link");
        link.id = "gpk-menu-styles";
        link.rel = "stylesheet";
        link.href = `${baseURL}/productos-menu.css?v=${assetVersion}`;
        document.head.appendChild(link);
    }

    // 2. Fetch and inject HTML markup
    const container = document.getElementById("gpk-products-menu-root");
    if (container) {
        const lang = (
            container.getAttribute("data-lang") ||
            (container.dataset && container.dataset.lang) ||
            (window.location.pathname.startsWith("/en") ? "en" : "es")
        ).toLowerCase();

        const htmlFile = lang === "en" ? "productos-menu-en.html" : "productos-menu.html";

        fetch(`${baseURL}/${htmlFile}?v=${assetVersion}`)
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
            "papel": 2,
            "cajas": 7,
            "lamina": 4,
            "grabados": 10,
            "energia": 14
        };

        items.forEach(item => {
            const product = item.getAttribute('data-product');
            const targetSlide = slideMap[product];

            // Click handler
            item.addEventListener('click', (e) => {
                const saberMasBtn = e.target.closest('.gpk-saber-mas');
                
                // Si el clic es en "Saber más", navegamos a la sección correspondiente
                if (saberMasBtn) {
                    const navigate = window.gpkGoToProductsSection || window.gpkGoToProductsSlide;
                    if (navigate) {
                        e.preventDefault();
                        navigate(targetSlide);
                    }
                    return;
                }

                // Si hacen clic en el párrafo de descripción, evitamos colapsar accidentalmente
                if (e.target.closest('.gpk-product-description')) {
                    return;
                }

                // Clic en el enlace/título/item: despliega o colapsa la información
                e.preventDefault();
                const isActive = item.classList.contains('gpk-active');
                items.forEach(el => el.classList.remove('gpk-active'));
                if (!isActive) {
                    item.classList.add('gpk-active');
                }
            });

            // En desktop, al hacer hover sobre otro item se desactiva el anterior para evitar conflicto visual
            item.addEventListener('mouseenter', () => {
                if (window.innerWidth > 1024) {
                    items.forEach(el => {
                        if (el !== item) el.classList.remove('gpk-active');
                    });
                }
            });
        });

        // Cerrar item activo al hacer clic fuera del menú
        document.addEventListener('click', (e) => {
            if (!root.contains(e.target)) {
                items.forEach(el => el.classList.remove('gpk-active'));
            }
        });
    }
})();
