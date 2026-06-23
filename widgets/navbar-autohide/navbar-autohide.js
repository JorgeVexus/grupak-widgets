(function() {
    "use strict";

    function injectStyles() {
        if (document.getElementById("gpk-nav-autohide-styles")) return;

        const style = document.createElement("style");
        style.id = "gpk-nav-autohide-styles";
        style.textContent = `
            .gpk-nav-autohide-enabled {
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 99999;
            }
            .gpk-nav-autohide-enabled.gpk-nav-hidden {
                transform: translateY(-110%);
            }
        `;
        document.head.appendChild(style);
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const navbar = document.querySelector(".Navbar-Logo-Left");
        if (!navbar) return;

        const currentScrollY = window.scrollY;

        if (currentScrollY <= 0) {
            navbar.classList.remove("gpk-nav-hidden");
        } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
            navbar.classList.add("gpk-nav-hidden");
        } else if (currentScrollY < lastScrollY) {
            navbar.classList.remove("gpk-nav-hidden");
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

    function init() {
        injectStyles();

        const navbar = document.querySelector(".Navbar-Logo-Left");
        if (!navbar) return;

        navbar.classList.add("gpk-nav-autohide-enabled");

        if (window.scrollY <= 0) {
            navbar.classList.remove("gpk-nav-hidden");
        } else if (window.scrollY > 80) {
            navbar.classList.add("gpk-nav-hidden");
        }

        lastScrollY = window.scrollY;
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
