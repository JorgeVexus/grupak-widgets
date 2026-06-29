(function () {
    "use strict";

    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";

    var baseURL = isLocalhost
        ? "/widgets/comunidad"
        : "https://grupak-widgets.vercel.app/widgets/comunidad";

    if (!document.getElementById("gpk-comunidad-styles")) {
        var link = document.createElement("link");
        link.id = "gpk-comunidad-styles";
        link.rel = "stylesheet";
        link.href = isLocalhost
            ? "widgets/comunidad/comunidad.css"
            : baseURL + "/comunidad.css";
        document.head.appendChild(link);
    }

    function start() {
        var root =
            document.getElementById("gpk-comunidad-widget-root") ||
            document.getElementById("grupak-comunidad-root");

        if (root) {
            fetch(
                isLocalhost
                    ? "widgets/comunidad/comunidad.html"
                    : baseURL + "/comunidad.html"
            )
                .then(function (res) {
                    if (!res.ok) throw new Error("Error loading Comunidad widget HTML");
                    return res.text();
                })
                .then(function (html) {
                    root.innerHTML = html;
                    resolveImages(root);
                    initWidget();
                })
                .catch(function (err) {
                    console.error("[gpk-comunidad]", err);
                });
        } else if (document.getElementById("gpk-comunidad-widget")) {
            resolveImages(document.getElementById("gpk-comunidad-widget"));
            initWidget();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

    function resolveImages(container) {
        if (!container) return;

        container.querySelectorAll("img").forEach(function (img) {
            var src = img.getAttribute("src");
            if (!src) return;

            if (src.indexOf("http") !== 0 && src.indexOf("data:") !== 0) {
                var cleanSrc = src.charAt(0) === "/" ? src.slice(1) : src;
                img.src = isLocalhost
                    ? "widgets/comunidad/" + cleanSrc
                    : baseURL.replace(/\/$/, "") + "/" + cleanSrc;
            }

            img.addEventListener("error", function () {
                var figure = img.closest(".com-photo");
                if (figure) figure.classList.add("is-missing");
            });
        });
    }

    function initWidget() {
        var widget = document.getElementById("gpk-comunidad-widget");
        if (!widget) return;

        var board = widget.querySelector(".com-board");
        var spacer = widget.querySelector(".com-scroll-spacer");
        var currentState = -1;
        var stateCount = 5;
        var mobileQuery = window.matchMedia("(max-width: 900px)");
        var mobileRevealObserver = null;

        if (!board || !spacer) return;

        function scaleBoard() {
            if (mobileQuery.matches) {
                board.style.removeProperty("--com-scale");
                return;
            }

            var scale = Math.min(window.innerWidth / 1768.5, window.innerHeight / 959);
            board.style.setProperty("--com-scale", Math.max(scale, 0.48).toFixed(4));
        }

        function progressToState(progress) {
            return Math.min(Math.floor(progress * stateCount), stateCount - 1);
        }

        function applyState(state) {
            if (state === currentState) return;
            currentState = state;

            widget.className = widget.className.replace(/\bcom-state-\d+\b/g, "").trim();
            widget.classList.add("com-state-" + state);
            widget.setAttribute("data-com-state", String(state));
            scaleBoard();
        }

        function handleScroll() {
            if (mobileQuery.matches) {
                applyState(stateCount - 1);
                return;
            }

            var rect = spacer.getBoundingClientRect();
            var vh = window.innerHeight;
            var distance = Math.max(rect.height - vh, 1);
            var progress = Math.max(0, Math.min(1, -rect.top / distance));
            applyState(progressToState(progress));
        }

        function setupMobileReveal() {
            if (mobileRevealObserver) {
                mobileRevealObserver.disconnect();
                mobileRevealObserver = null;
            }

            widget.classList.toggle("com-mobile-ready", mobileQuery.matches);

            if (!mobileQuery.matches || !("IntersectionObserver" in window)) {
                widget.querySelectorAll(".com-mobile-in").forEach(function (node) {
                    node.classList.remove("com-mobile-in");
                });
                return;
            }

            var revealItems = Array.prototype.slice.call(
                widget.querySelectorAll(".com-media, .com-heading, .com-panel")
            );

            mobileRevealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("com-mobile-in");
                        mobileRevealObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: "0px 0px -12% 0px",
                threshold: 0.16
            });

            revealItems.forEach(function (item, index) {
                item.style.transitionDelay = Math.min(index * 90, 360) + "ms";
                mobileRevealObserver.observe(item);
            });
        }

        function handleResize() {
            scaleBoard();
            handleScroll();
            setupMobileReveal();
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    window.addEventListener("scroll", handleScroll, { passive: true });
                    window.addEventListener("resize", handleResize, { passive: true });
                    handleScroll();
                    scaleBoard();
                    setupMobileReveal();
                } else {
                    window.removeEventListener("scroll", handleScroll);
                    window.removeEventListener("resize", handleResize);
                }
            });
        }, { threshold: 0 });

        observer.observe(widget);
        applyState(0);
        scaleBoard();
        setupMobileReveal();
    }
})();
