(function () {
    "use strict";

    var productionBaseURL = "https://grupak-widgets.vercel.app/widgets/navbar-menu";
    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";
    var baseURL = isLocalhost ? "widgets/navbar-menu" : productionBaseURL;
    var assetVersion = "20260812-sustentabilidad-order";
    var logoURL = isLocalhost
        ? "widgets/productos-interactivos/logoGrupak.svg"
        : "https://grupak-widgets.vercel.app/widgets/productos-interactivos/logoGrupak.svg";

    ensureStyles();
    mountWidget();

    function ensureStyles() {
        if (document.getElementById("gpk-navbar-menu-styles")) return;
        var link = document.createElement("link");
        link.id = "gpk-navbar-menu-styles";
        link.rel = "stylesheet";
        link.href = baseURL + "/navbar-menu.css?v=" + assetVersion;
        document.head.appendChild(link);
    }

    function mountWidget() {
        var root =
            document.getElementById("gpk-navbar-menu-root") ||
            document.getElementById("grupak-navbar-menu-root");

        var theme = root
            ? (root.getAttribute("data-gpk-theme") || root.getAttribute("data-gpk-variant") || root.getAttribute("data-gpk-nav-mode"))
            : null;

        if (root) {
            fetch(baseURL + "/navbar-menu.html?v=" + assetVersion)
                .then(function (res) {
                    if (!res.ok) throw new Error("Error loading navbar menu HTML");
                    return res.text();
                })
                .then(function (html) {
                    root.innerHTML = html;
                    var navbar = root.querySelector("#gpk-navbar-menu");
                    if (navbar && theme) {
                        navbar.setAttribute("data-gpk-theme", theme);
                    }
                    initNavbar(navbar);
                })
                .catch(function (err) {
                    console.error("[gpk-navbar-menu]", err);
                });
            return;
        }

        var navbar = document.getElementById("gpk-navbar-menu");
        if (navbar && theme) {
            navbar.setAttribute("data-gpk-theme", theme);
        }
        initNavbar(navbar);
    }

    function initNavbar(navbar) {
        if (!navbar || navbar.dataset.gpkReady === "true") return;
        navbar.dataset.gpkReady = "true";

        var logo = navbar.querySelector("[data-gpk-logo]");
        if (logo && !logo.getAttribute("src")) {
            logo.src = logoURL;
        }

        bindMobileMenu(navbar);
        bindProductLinks(navbar);
        bindFormLinks(navbar);
        bindAutoHide(navbar);
        highlightCurrentLink(navbar);
    }

    function highlightCurrentLink(navbar) {
        var currentPath = window.location.pathname;
        if (currentPath === "/" || currentPath === "/index.html") {
            currentPath = "/";
        }

        var links = navbar.querySelectorAll(".gpk-navbar-menu__link");
        links.forEach(function (link) {
            var href = link.getAttribute("href");
            if (!href) return;

            if (href.startsWith("#")) return;

            var parser = document.createElement("a");
            parser.href = href;

            var linkPath = parser.pathname;
            if (linkPath === "/" || linkPath === "/index.html") {
                linkPath = "/";
            }

            if (linkPath !== "/" && currentPath.indexOf(linkPath) !== -1) {
                link.classList.add("is-active");
            } else if (linkPath === "/" && currentPath === "/") {
                link.classList.add("is-active");
            }
        });
    }

    function bindMobileMenu(navbar) {
        var toggle = navbar.querySelector("[data-gpk-menu-toggle]");
        var panel = navbar.querySelector("[data-gpk-menu-panel]");
        var dropdownItems = navbar.querySelectorAll(".gpk-navbar-menu__item");
        if (!toggle || !panel) return;

        function setOpen(open) {
            navbar.classList.toggle("is-mobile-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        }

        toggle.addEventListener("click", function () {
            setOpen(!navbar.classList.contains("is-mobile-open"));
        });

        dropdownItems.forEach(function (item) {
            var link = item.querySelector(".gpk-navbar-menu__link");
            var dropdown = item.querySelector(".gpk-navbar-menu__dropdown");
            if (!link || !dropdown) return;

            link.addEventListener("click", function (event) {
                if (window.innerWidth > 1100) return;
                var isAction = link.hasAttribute("data-gpk-action");
                var isOpen = item.classList.contains("is-open");

                if (!isAction && !isOpen) {
                    event.preventDefault();
                    dropdownItems.forEach(function (other) {
                        if (other !== item) other.classList.remove("is-open");
                    });
                    item.classList.add("is-open");
                }
            });
        });

        panel.addEventListener("click", function (event) {
            var clickedLink = event.target.closest("a");
            if (!clickedLink) return;
            var opensDropdown = clickedLink.closest(".gpk-navbar-menu__item") && !clickedLink.hasAttribute("data-gpk-action");
            var isCard = clickedLink.classList.contains("gpk-navbar-menu__card");
            if (!opensDropdown || isCard) {
                setOpen(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                setOpen(false);
                dropdownItems.forEach(function (item) {
                    item.classList.remove("is-open");
                });
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 1100) {
                setOpen(false);
                dropdownItems.forEach(function (item) {
                    item.classList.remove("is-open");
                });
            }
        });
    }

    function bindProductLinks(navbar) {
        navbar.querySelectorAll('[data-gpk-action="product"]').forEach(function (link) {
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
            console.warn("[gpk-navbar-menu] Could not store pending product slide", err);
        }

        var productsWidget = document.getElementById("gpk-products-widget") || document.getElementById("gpk-products-widget-root");
        if (productsWidget) {
            productsWidget.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        window.location.href = "https://grupak.webflow.io/#productos";
    }

    function bindFormLinks(navbar) {
        navbar.querySelectorAll('[data-gpk-action="form"]').forEach(function (link) {
            link.addEventListener("click", function (event) {
                var targetTab = link.getAttribute("data-gpk-form") || "contacto";
                if (typeof window.gpkOpenFormulario === "function") {
                    event.preventDefault();
                    window.gpkOpenFormulario(targetTab);
                }
            });
        });
    }

    function bindAutoHide(navbar) {
        var lastScrollY = window.scrollY;
        var ticking = false;

        function updateNavbar() {
            var currentScrollY = window.scrollY;

            if (currentScrollY <= 0) {
                navbar.classList.remove("gpk-nav-hidden");
                navbar.classList.remove("gpk-nav-bg-white");
            } else if (navbar.classList.contains("is-mobile-open")) {
                navbar.classList.remove("gpk-nav-hidden");
                navbar.classList.add("gpk-nav-bg-white");
            } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
                navbar.classList.add("gpk-nav-hidden");
                navbar.classList.remove("gpk-nav-bg-white");
            } else if (currentScrollY < lastScrollY) {
                navbar.classList.remove("gpk-nav-hidden");
                navbar.classList.add("gpk-nav-bg-white");
            }

            lastScrollY = currentScrollY;
            ticking = false;
        }

        function onScroll() {
            if (ticking) return;
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }

        updateNavbar();
        window.addEventListener("scroll", onScroll, { passive: true });
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
