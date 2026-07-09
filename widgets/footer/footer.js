(function () {
    "use strict";

    var productionBaseURL = "https://grupak-widgets.vercel.app/widgets/footer";
    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";
    var baseURL = isLocalhost ? "widgets/footer" : productionBaseURL;
    var assetVersion = "20260709-footer-1";
    var logoURL = isLocalhost
        ? "widgets/productos-interactivos/logoGrupak.svg"
        : "https://grupak-widgets.vercel.app/widgets/productos-interactivos/logoGrupak.svg";

    ensureStyles();
    mountWidget();

    function ensureStyles() {
        if (document.getElementById("gpk-footer-styles")) return;
        var link = document.createElement("link");
        link.id = "gpk-footer-styles";
        link.rel = "stylesheet";
        link.href = baseURL + "/footer.css?v=" + assetVersion;
        document.head.appendChild(link);
    }

    function mountWidget() {
        var root = document.getElementById("gpk-footer-root");

        if (root) {
            fetch(baseURL + "/footer.html?v=" + assetVersion)
                .then(function (res) {
                    if (!res.ok) throw new Error("Error loading footer HTML");
                    return res.text();
                })
                .then(function (html) {
                    root.innerHTML = html;
                    initFooter(root.querySelector("#gpk-footer"));
                })
                .catch(function (err) {
                    console.error("[gpk-footer]", err);
                });
            return;
        }

        initFooter(document.getElementById("gpk-footer"));
    }

    function initFooter(footer) {
        if (!footer || footer.dataset.gpkReady === "true") return;
        footer.dataset.gpkReady = "true";

        var logo = footer.querySelector("[data-gpk-footer-logo]");
        if (logo && !logo.getAttribute("src")) {
            logo.src = logoURL;
        }

        bindProductLinks(footer);
        bindFormLinks(footer);
    }

    function bindProductLinks(footer) {
        footer.querySelectorAll('[data-gpk-action="product"]').forEach(function (link) {
            link.addEventListener("click", function (event) {
                var slide = parseInt(link.getAttribute("data-gpk-slide"), 10);
                if (Number.isNaN(slide)) return;

                event.preventDefault();
                goToProductSlide(slide);
            });
        });
    }

    function goToProductSlide(slide) {
        if (typeof window.gpkGoToProductsSlide === "function") {
            window.gpkGoToProductsSlide(slide);
            return;
        }

        try {
            window.sessionStorage.setItem("gpkPendingProductSlide", String(slide));
        } catch (err) {
            console.warn("[gpk-footer] Could not store pending product slide", err);
        }

        var productsWidget = document.getElementById("gpk-products-widget") || document.getElementById("gpk-products-widget-root");
        if (productsWidget) {
            productsWidget.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        window.location.href = "https://grupak.webflow.io/#productos";
    }

    function bindFormLinks(footer) {
        footer.querySelectorAll('[data-gpk-action="form"]').forEach(function (link) {
            link.addEventListener("click", function (event) {
                var targetTab = link.getAttribute("data-gpk-form") || "contacto";
                if (typeof window.gpkOpenFormulario === "function") {
                    event.preventDefault();
                    window.gpkOpenFormulario(targetTab);
                }
            });
        });
    }

    window.addEventListener("gpkProductsReady", function () {
        var pending = null;
        try {
            pending = window.sessionStorage.getItem("gpkPendingProductSlide");
            window.sessionStorage.removeItem("gpkPendingProductSlide");
        } catch (err) {
            pending = null;
        }

        if (pending !== null && typeof window.gpkGoToProductsSlide === "function") {
            window.gpkGoToProductsSlide(parseInt(pending, 10));
        }
    });
})();
