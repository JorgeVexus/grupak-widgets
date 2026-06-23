(function() {
    "use strict";

    // ==================== DEBUG LOGGER ====================
    function log(...args) {
        console.log("[NavbarAutoHide]", ...args);
    }

    // ==================== STYLES ====================
    function injectStyles() {
        if (document.getElementById("gpk-nav-autohide-styles")) {
            log("Estilos ya inyectados, skip.");
            return;
        }

        const style = document.createElement("style");
        style.id = "gpk-nav-autohide-styles";
        style.textContent = `
            .gpk-nav-autohide-enabled {
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                z-index: 99999 !important;
            }
            .gpk-nav-autohide-enabled.gpk-nav-hidden {
                transform: translateY(-110%) !important;
            }
        `;
        document.head.appendChild(style);
        log("Estilos inyectados con !important para forzar aplicación.");
    }

    // ==================== SCROLL LOGIC ====================
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const navbar = document.querySelector(".Navbar-Logo-Left");
        if (!navbar) {
            log("Navbar NO encontrado en este tick.");
            ticking = false;
            return;
        }

        const currentScrollY = window.scrollY;

        if (currentScrollY <= 0) {
            navbar.classList.remove("gpk-nav-hidden");
            log("ScrollY <= 0 -> SHOW navbar");
        } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
            navbar.classList.add("gpk-nav-hidden");
            log("Scroll hacia ABAJO + >80px -> HIDE navbar");
        } else if (currentScrollY < lastScrollY) {
            navbar.classList.remove("gpk-nav-hidden");
            log("Scroll hacia ARRIBA -> SHOW navbar");
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }

    // ==================== INIT ====================
    function init() {
        injectStyles();

        // Wait a tick para que Webflow termine de renderizar Symbols
        setTimeout(() => {
            const navbar = document.querySelector(".Navbar-Logo-Left");
            
            if (!navbar) {
                log("ERROR: No se encontró el navbar con clase .Navbar-Logo-Left.");
                log("Elementos W-NAV detectados:", document.querySelectorAll(".w-nav").length);
                log("Todos los elementos Navbar:", document.querySelectorAll("nav").length);
                
                // Intentar fallback: buscar algún nav con w-nav clase
                const fallbackNav = document.querySelector(".w-nav") || document.querySelector("nav[role='navigation']");
                if (fallbackNav) {
                    log("USANDO FALLBACK: aplicando autohide a elemento w-nav/nav encontrado.");
                    applyNavbarHiding(fallbackNav);
                    return;
                }
                return;
            }

            log("Navbar encontrado:", navbar);
            applyNavbarHiding(navbar);
        }, 200);
    }

    function applyNavbarHiding(navbar) {
        if (!navbar) return;

        navbar.classList.add("gpk-nav-autohide-enabled");

        if (window.scrollY <= 0) {
            navbar.classList.remove("gpk-nav-hidden");
        } else if (window.scrollY > 80) {
            navbar.classList.add("gpk-nav-hidden");
        }

        log("Navbar preparado. scrollY actual:", window.scrollY, "hidden:", navbar.classList.contains("gpk-nav-hidden"));

        window.addEventListener("scroll", onScroll, { passive: true });
        log("Listener de scroll agregado.");
    }

    // ==================== BOOTSTRAP ====================
    log("Script cargado. Document ready state:", document.readyState);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Si carga asincrónico o después de Symbol renderizado, usar MutationObserver como respaldo
    const observer = new MutationObserver((mutations) => {
        const navbar = document.querySelector(".Navbar-Logo-Left");
        if (navbar && !navbar.classList.contains("gpk-nav-autohide-enabled")) {
            log("Navbar detectado tardíamente por MutationObserver, inicializando...");
            applyNavbarHiding(navbar);
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
})();
