(function () {
    "use strict";

    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";

    var baseURL = isLocalhost
        ? "/widgets/comunidad"
        : "https://grupak-widgets.vercel.app/widgets/comunidad";
    var internalBuild = "20260907-snap-v1";

    if (!document.getElementById("gpk-comunidad-styles")) {
        var link = document.createElement("link");
        link.id = "gpk-comunidad-styles";
        link.rel = "stylesheet";
        link.href = isLocalhost
            ? "widgets/comunidad/comunidad.css?v=" + internalBuild
            : baseURL + "/comunidad.css?v=" + internalBuild;
        document.head.appendChild(link);
    }

    function start() {
        var root =
            document.getElementById("gpk-comunidad-widget-root") ||
            document.getElementById("grupak-comunidad-root");

        if (root) {
            fetch(
                isLocalhost
                    ? "widgets/comunidad/comunidad.html?v=" + internalBuild
                    : baseURL + "/comunidad.html?v=" + internalBuild
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
        var currentState = -1;
        var stateCount = 4;
        var mobileQuery = window.matchMedia("(max-width: 1025px)");
        var mobileRevealObserver = null;

        if (!board) return;

        var isNavigating = false;
        var navigatingTimer = null;
        var lastStepTime = 0;
        var wheelAccumulator = 0;
        var lastKeyTime = 0;

        function setNavigating(duration) {
            duration = duration || 400;
            isNavigating = true;
            clearTimeout(navigatingTimer);
            navigatingTimer = setTimeout(function () {
                isNavigating = false;
            }, duration);
        }

        function scaleBoard() {
            if (mobileQuery.matches) {
                board.style.removeProperty("--com-scale");
                return;
            }

            var scale = Math.min(window.innerWidth / 2200, window.innerHeight / 900);
            board.style.setProperty("--com-scale", Math.max(scale, 0.48).toFixed(4));
        }

        function applyState(state) {
            if (state === currentState) return;
            currentState = state;

            widget.className = widget.className.replace(/\bcom-state-\d+\b/g, "").trim();
            widget.classList.add("com-state-" + state);
            widget.setAttribute("data-com-state", String(state));
            scaleBoard();
        }

        // ── Direct navigation with instant scroll positioning & lock ──────────
        function goToState(targetState) {
            if (mobileQuery.matches) return;
            if (targetState < 0 || targetState >= stateCount) return;

            applyState(targetState);

            lastStepTime = performance.now();
            setNavigating(400);

            var rect = widget.getBoundingClientRect();
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var widgetTop = rect.top + scrollTop;
            var scrollHeight = rect.height - window.innerHeight;

            if (scrollHeight <= 0) return;

            var targetProgress = targetState / (stateCount - 1);
            var targetScrollY = Math.round(widgetTop + targetProgress * scrollHeight);

            window.scrollTo(0, targetScrollY);
        }

        // ── Scroll handler (for manual page scroll / scrollbar dragging) ───
        function handleScroll() {
            if (mobileQuery.matches) {
                applyState(stateCount - 1);
                return;
            }
            if (!widget || isNavigating) return;

            var rect = widget.getBoundingClientRect();
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var widgetTop = rect.top + scrollTop;
            var scrollHeight = rect.height - window.innerHeight;

            if (scrollHeight <= 0) return;
            if (scrollTop < widgetTop - 10 || scrollTop > widgetTop + scrollHeight + 10) return;

            var relativeScroll = scrollTop - widgetTop;
            var progress = Math.max(0, Math.min(1, relativeScroll / scrollHeight));
            var targetState = Math.min(Math.round(progress * (stateCount - 1)), stateCount - 1);
            if (targetState !== currentState) {
                applyState(targetState);
            }
        }

        // ── Gesture Wheel Stepper ──────────────────────────────────────────
        function handleWheel(e) {
            if (mobileQuery.matches) return;

            var rect = widget.getBoundingClientRect();
            var isPinned = rect.top <= 30 && rect.bottom >= window.innerHeight - 30;
            if (!isPinned) return;

            var delta = e.deltaY;
            if (Math.abs(delta) < 0.5) return;

            var now = performance.now();

            // Si estamos en transición activa o absorbiendo inercia del paso anterior, no permitir escapes prematuros
            if (isNavigating || (now - lastStepTime < 400)) {
                e.preventDefault();
                wheelAccumulator = 0;
                return;
            }

            // Escape en extremos: SOLO si el usuario YA estaba reposando en el extremo (no durante la llegada)
            if (currentState === 0 && delta < 0) return;
            if (currentState === stateCount - 1 && delta > 0) return;

            // Evitar scroll nativo mientras navegamos dentro del widget
            e.preventDefault();

            var isMouseWheel = e.deltaMode !== 0 || Math.abs(delta) >= 50;
            var cooldown = isMouseWheel ? 260 : 380;

            if (now - lastStepTime < cooldown) {
                wheelAccumulator = 0;
                return;
            }

            if (!isMouseWheel && Math.abs(delta) < 14) {
                wheelAccumulator = 0;
                return;
            }

            if (isMouseWheel) {
                lastStepTime = now;
                wheelAccumulator = 0;
                var step = delta > 0 ? 1 : -1;
                goToState(currentState + step);
                return;
            }

            wheelAccumulator += delta;
            var TRACKPAD_THRESHOLD = 30;

            if (Math.abs(wheelAccumulator) >= TRACKPAD_THRESHOLD) {
                var step = wheelAccumulator > 0 ? 1 : -1;
                wheelAccumulator = 0;
                lastStepTime = now;
                goToState(currentState + step);
            }
        }

        // ── Keyboard arrow navigation ──────────────────────────────────────
        function handleKeyDown(e) {
            if (mobileQuery.matches) return;

            var rect = widget.getBoundingClientRect();
            var isVisible = (rect.top < window.innerHeight && rect.bottom > 0);
            if (!isVisible) return;

            if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "ArrowRight") {
                var isPinned = rect.top <= 30 && rect.bottom >= window.innerHeight - 30;
                if (!isPinned) return;

                var now = performance.now();
                if (now - lastKeyTime < 240) {
                    e.preventDefault();
                    return;
                }
                lastKeyTime = now;

                if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    if (currentState > 0) {
                        e.preventDefault();
                        goToState(currentState - 1);
                    }
                } else {
                    if (currentState < stateCount - 1) {
                        e.preventDefault();
                        goToState(currentState + 1);
                    }
                }
            }
        }

        // ── Panel header click delegation ──────────────────────────────────
        widget.querySelectorAll(".com-panel").forEach(function (panel) {
            var panelIndex = Number(panel.getAttribute("data-panel"));
            var header = panel.querySelector("h3");
            if (header && panelIndex) {
                header.addEventListener("click", function () {
                    goToState(panelIndex);
                });
            }
        });

        // ── Mobile accordion reveal ────────────────────────────────────────
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

        // ── Attach event listeners ─────────────────────────────────────────
        widget.addEventListener("wheel", handleWheel, { passive: false });
        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize, { passive: true });

        // Initial setup
        applyState(0);
        scaleBoard();
        setupMobileReveal();
        handleScroll();
    }
})();
