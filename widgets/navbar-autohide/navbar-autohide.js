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
            .gpk-nav-autohide-enabled,
            .navbar-logo-left.gpk-nav-autohide-enabled,
            .w-nav.gpk-nav-autohide-enabled,
            nav.gpk-nav-autohide-enabled {
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, box-shadow 0.3s ease !important;
                will-change: transform;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                z-index: 99999 !important;
                background-color: transparent !important;
                box-shadow: none !important;
            }
            .gpk-nav-autohide-enabled .nav-link,
            .gpk-nav-autohide-enabled .w-nav-link {
                transition: color 0.3s ease !important;
            }
            .gpk-nav-autohide-enabled.gpk-nav-hidden,
            .navbar-logo-left.gpk-nav-autohide-enabled.gpk-nav-hidden,
            .w-nav.gpk-nav-autohide-enabled.gpk-nav-hidden,
            nav.gpk-nav-autohide-enabled.gpk-nav-hidden {
                transform: translateY(-110%) !important;
            }
            .gpk-nav-autohide-enabled.gpk-nav-bg-white,
            .navbar-logo-left.gpk-nav-autohide-enabled.gpk-nav-bg-white,
            .w-nav.gpk-nav-autohide-enabled.gpk-nav-bg-white,
            nav.gpk-nav-autohide-enabled.gpk-nav-bg-white {
                background-color: #ffffff !important;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) !important;
            }
            .gpk-nav-autohide-enabled.gpk-nav-bg-white .nav-link,
            .gpk-nav-autohide-enabled.gpk-nav-bg-white .w-nav-link {
                color: #062819 !important;
            }
        `;
        document.head.appendChild(style);
        log("Estilos inyectados con alta especificidad e !important.");
    }

    // ==================== SCROLL LOGIC ====================
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const navbar = document.querySelector(".navbar-logo-left");
        if (!navbar) {
            log("Navbar NO encontrado en este tick.");
            ticking = false;
            return;
        }

        const currentScrollY = window.scrollY;

        if (currentScrollY <= 0) {
            navbar.classList.remove("gpk-nav-hidden");
            navbar.classList.remove("gpk-nav-bg-white");
            log("ScrollY <= 0 -> SHOW navbar + transparent bg");
        } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
            navbar.classList.add("gpk-nav-hidden");
            navbar.classList.remove("gpk-nav-bg-white");
            log("Scroll hacia ABAJO + >80px -> HIDE navbar + quitar bg");
        } else if (currentScrollY < lastScrollY) {
            navbar.classList.remove("gpk-nav-hidden");
            navbar.classList.add("gpk-nav-bg-white");
            log("Scroll hacia ARRIBA -> SHOW navbar + bg white");
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

    function applyNavbarHiding(navbar) {
        if (!navbar) {
            log.apply(null, ["Navbar vacío, no se puede aplicar autohide."]);
            return;
        }

        if (navbar.classList.contains("gpk-nav-autohide-enabled")) {
            log("Navbar ya tiene gpk-nav-autohide-enabled, no se vuelve a aplicar.");
            return;
        }

        navbar.classList.add("gpk-nav-autohide-enabled");

        if (window.scrollY <= 0) {
            navbar.classList.remove("gpk-nav-hidden");
            navbar.classList.remove("gpk-nav-bg-white");
        } else if (window.scrollY > 80) {
            navbar.classList.add("gpk-nav-hidden");
            navbar.classList.remove("gpk-nav-bg-white");
        } else {
            // Entre 0 y 80px: visible y transparente
            navbar.classList.remove("gpk-nav-hidden");
            navbar.classList.remove("gpk-nav-bg-white");
        }

        log("Navbar preparado. scrollY actual:", window.scrollY, "hidden:", navbar.classList.contains("gpk-nav-hidden"), "bg-white:", navbar.classList.contains("gpk-nav-bg-white"));

        window.addEventListener("scroll", onScroll, { passive: true });
        log("Listener de scroll agregado.");
    }

    // ==================== INIT ====================
    function init() {
        injectStyles();

        setTimeout(() => {
            const navbar = document.querySelector(".navbar-logo-left");

            if (!navbar) {
                log("ERROR: No se encontró el navbar con clase .navbar-logo-left.");

                const fixedNav = document.querySelector("nav[style*='position: fixed'], nav[style*='position:fixed']");
                if (fixedNav) {
                    log("USANDO FALLBACK: nav con position fixed detectado por style inline.");
                    applyNavbarHiding(fixedNav);
                    return;
                }

                const fallbackNav = document.querySelector(".w-nav");
                if (fallbackNav) {
                    log("USANDO FALLBACK: aplicando autohide a .w-nav");
                    applyNavbarHiding(fallbackNav);
                    return;
                }

                const navs = document.querySelectorAll("nav");
                if (navs.length) {
                    log("USANDO FALLBACK: seleccionando primer <nav> detectado.");
                    applyNavbarHiding(navs[0]);
                    return;
                }

                log("No hay fallback posible, no se encontró navbar.");
                return;
            }

            log("Navbar encontrado en kebab-case:", navbar);
            applyNavbarHiding(navbar);
        }, 250);
    }

    // ==================== BOOTSTRAP ====================
    log("Script cargado. Document ready state:", document.readyState);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    const observer = new MutationObserver((mutations) => {
        const navbar = document.querySelector(".navbar-logo-left");
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
