(function () {
    "use strict";

    var productionBaseURL = "https://grupak-widgets.vercel.app/widgets/navbar-menu";
    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";
    var baseURL = isLocalhost ? "widgets/navbar-menu" : productionBaseURL;
    var assetVersion = "20261012-lang-flags";
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

        var isEn = (
            (root && (root.getAttribute("data-lang") || (root.dataset && root.dataset.lang))) ||
            (window.location.pathname.startsWith("/en") ? "en" : "es")
        ).toLowerCase() === "en";

        var theme = root
            ? (root.getAttribute("data-gpk-theme") || root.getAttribute("data-gpk-variant") || root.getAttribute("data-gpk-nav-mode"))
            : null;

        var htmlFile = isEn ? "/navbar-menu-en.html" : "/navbar-menu.html";

        if (root) {
            fetch(baseURL + htmlFile + "?v=" + assetVersion)
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
        bindLangSwitch(navbar);
        highlightCurrentLink(navbar);
    }

    function bindLangSwitch(navbar) {
        var switchLink = navbar.querySelector(".gpk-navbar-menu__lang-switch");
        if (!switchLink) return;

        var rawPath = window.location.pathname.replace(/\/$/, "");
        if (!rawPath) rawPath = "/";

        var pageMapEsToEn = {
            "/": "/en/home",
            "/index.html": "/en/home",
            "/quienes-somos": "/en/about-us",
            "/sustentabilidad": "/en/sustainability",
            "/nuestra-gente": "/en/our-people",
            "/contacto": "/en/contact",
            "/certificaciones": "/en/certifications",
            "/noticias": "/en/news"
        };

        var pageMapEnToEs = {
            "/en/home": "/",
            "/en/about-us": "/quienes-somos",
            "/en/sustainability": "/sustentabilidad",
            "/en/our-people": "/nuestra-gente",
            "/en/contact": "/contacto",
            "/en/certifications": "/certificaciones",
            "/en/news": "/noticias",
            "/en": "/"
        };

        var root =
            document.getElementById("gpk-navbar-menu-root") ||
            document.getElementById("grupak-navbar-menu-root");

        var isEn = (
            (root && (root.getAttribute("data-lang") || (root.dataset && root.dataset.lang))) ||
            (window.location.pathname.startsWith("/en") ? "en" : "es")
        ).toLowerCase() === "en";

        var usFlagSvg = '<svg class="gpk-navbar-menu__flag" viewBox="0 0 20 14" width="18" height="12" aria-hidden="true"><clipPath id="gpk-flag-us-clip"><rect width="20" height="14" rx="2"/></clipPath><g clip-path="url(#gpk-flag-us-clip)"><rect width="20" height="14" fill="#B22234"/><path d="M0 1.08h20v1.08H0zm0 2.15h20v1.08H0zm0 2.15h20v1.08H0zm0 2.15h20v1.08H0zm0 2.16h20v1.08H0zm0 2.15h20v1.08H0z" fill="#FFFFFF"/><rect width="8" height="7.54" fill="#3C3B6E"/><g fill="#FFFFFF" transform="scale(0.8) translate(0.6, 0.5)"><circle cx="2" cy="1.6" r="0.6"/><circle cx="5" cy="1.6" r="0.6"/><circle cx="8" cy="1.6" r="0.6"/><circle cx="3.5" cy="3.2" r="0.6"/><circle cx="6.5" cy="3.2" r="0.6"/><circle cx="2" cy="4.8" r="0.6"/><circle cx="5" cy="4.8" r="0.6"/><circle cx="8" cy="4.8" r="0.6"/><circle cx="3.5" cy="6.4" r="0.6"/><circle cx="6.5" cy="6.4" r="0.6"/><circle cx="2" cy="8" r="0.6"/><circle cx="5" cy="8" r="0.6"/><circle cx="8" cy="8" r="0.6"/></g></g></svg>';

        var mxFlagSvg = '<svg class="gpk-navbar-menu__flag" viewBox="0 0 20 14" width="18" height="12" aria-hidden="true"><clipPath id="gpk-flag-mx-clip"><rect width="20" height="14" rx="2"/></clipPath><g clip-path="url(#gpk-flag-mx-clip)"><rect width="6.67" height="14" fill="#006847"/><rect x="6.67" width="6.66" height="14" fill="#FFFFFF"/><rect x="13.33" width="6.67" height="14" fill="#CE1126"/><path d="M10 4.2c-.4 0-.8.3-.9.7-.1.4.1.8.4 1-.2.2-.3.5-.2.8.2.4.6.7 1 .7.4 0 .7-.3.8-.7 0-.3-.1-.5-.3-.7.3-.2.4-.6.3-1-.1-.5-.6-.8-1.1-.8z" fill="#78481A"/><path d="M8.8 8.4c.3.5.7.9 1.2.9.5 0 .9-.4 1.2-.9-.4.2-.8.3-1.2.3-.4 0-.8-.1-1.2-.3z" fill="#006847"/><path d="M9.4 6.8c.2.2.4.3.6.3s.4-.1.6-.3c-.2.4-.4.6-.6.6s-.4-.2-.6-.6z" fill="#B38E3F"/></g></svg>';

        if (isEn) {
            var targetEs = pageMapEnToEs[rawPath] || "/";
            switchLink.setAttribute("href", targetEs);
            switchLink.setAttribute("title", "Español");
            switchLink.innerHTML = mxFlagSvg + '<span class="gpk-navbar-menu__lang-text">ES</span>';
        } else {
            var targetEn = pageMapEsToEn[rawPath] || "/en/home";
            switchLink.setAttribute("href", targetEn);
            switchLink.setAttribute("title", "English");
            switchLink.innerHTML = usFlagSvg + '<span class="gpk-navbar-menu__lang-text">EN</span>';
        }
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

        var root = document.getElementById("gpk-navbar-menu-root") || document.getElementById("grupak-navbar-menu-root");
        var isEn = (
            (root && (root.getAttribute("data-lang") || (root.dataset && root.dataset.lang))) ||
            (window.location.pathname.startsWith("/en") ? "en" : "es")
        ).toLowerCase() === "en";

        window.location.href = isEn ? "https://grupak.webflow.io/en/home#productos" : "https://grupak.webflow.io/#productos";
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
