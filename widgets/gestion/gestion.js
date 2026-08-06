(function () {
    "use strict";

    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";

    var baseURL = isLocalhost
        ? "/widgets/gestion"
        : "https://grupak-widgets.vercel.app/widgets/gestion";

    if (!document.getElementById("gpk-gestion-styles")) {
        var link = document.createElement("link");
        link.id = "gpk-gestion-styles";
        link.rel = "stylesheet";
        link.href = isLocalhost
            ? "widgets/gestion/gestion.css"
            : baseURL + "/gestion.css";
        document.head.appendChild(link);
    }

    function start() {
        var root =
            document.getElementById("gpk-gestion-widget-root") ||
            document.getElementById("grupak-gestion-root");

        if (root) {
            fetch(
                isLocalhost
                    ? "widgets/gestion/gestion.html"
                    : baseURL + "/gestion.html"
            )
                .then(function (res) {
                    if (!res.ok) throw new Error("Error loading Gestion widget HTML");
                    return res.text();
                })
                .then(function (html) {
                    root.innerHTML = html;
                    resolveImages(root);
                    initGestionWidget();
                })
                .catch(function (err) {
                    console.error("[gpk-gestion]", err);
                });
        } else if (document.getElementById("gpk-gestion-widget")) {
            resolveImages(document.getElementById("gpk-gestion-widget"));
            initGestionWidget();
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
                    ? "widgets/gestion/" + cleanSrc
                    : baseURL.replace(/\/$/, "") + "/" + cleanSrc;
            }
        });

        container.querySelectorAll("[style*='background-image']").forEach(function (el) {
            var style = el.getAttribute("style") || "";
            var match = style.match(/url\(['"]?([^'"]+)['"]?\)/i);
            if (match && match[1]) {
                var bgUrl = match[1];
                if (bgUrl.indexOf("http") !== 0 && bgUrl.indexOf("data:") !== 0) {
                    var cleanBg = bgUrl.charAt(0) === "/" ? bgUrl.slice(1) : bgUrl;
                    var resolvedBg = isLocalhost
                        ? "widgets/gestion/" + cleanBg
                        : baseURL.replace(/\/$/, "") + "/" + cleanBg;
                    el.style.backgroundImage = "url('" + resolvedBg + "')";
                }
            }
        });
    }

    function initGestionWidget() {
        var root = document.getElementById("gpk-gestion-widget");
        if (!root || root.dataset.gestionReady === "true") return;
        root.dataset.gestionReady = "true";

        var slider = root.querySelector("[data-gestion-slider]");
        var viewport = root.querySelector(".gpk-gestion-viewport");
        var track = root.querySelector(".gpk-gestion-track");
        var slides = Array.prototype.slice.call(root.querySelectorAll(".gpk-gestion-slide"));
        var prev = root.querySelector("[data-gestion-prev]");
        var next = root.querySelector("[data-gestion-next]");
        var dotsWrap = root.querySelector("[data-gestion-dots]");

        if (!slider || !viewport || !track || slides.length === 0) return;

        var index = 0;
        var perView = 1;
        var maxIndex = 0;
        var step = 0;
        var dots = [];
        var startX = 0;
        var currentX = 0;
        var dragging = false;
        var dragOffset = 0;
        var autoTimer = null;
        var hasMeasured = false;

        function getPerView() {
            return window.matchMedia("(min-width: 1026px)").matches ? 2 : 1;
        }

        function measure() {
            perView = getPerView();
            maxIndex = Math.max(0, slides.length - perView);
            if (!hasMeasured) {
                index = 0;
                hasMeasured = true;
            }
            index = Math.min(index, maxIndex);
            var first = slides[0];
            var styles = window.getComputedStyle(track);
            var gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
            step = first.getBoundingClientRect().width + gap;
            buildDots();
            update(false);
        }

        function buildDots() {
            if (!dotsWrap) return;
            var count = maxIndex + 1;
            if (dots.length === count) return;
            dotsWrap.innerHTML = "";
            dots = [];
            for (var i = 0; i < count; i += 1) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.className = "gpk-gestion-dot";
                dot.setAttribute("aria-label", "Ir al grupo de slides " + (i + 1));
                dot.dataset.index = String(i);
                dot.addEventListener("click", function (event) {
                    goTo(parseInt(event.currentTarget.dataset.index, 10));
                    pauseAuto();
                });
                dotsWrap.appendChild(dot);
                dots.push(dot);
            }
        }

        function update(animate) {
            if (!animate) {
                track.style.transition = "none";
                window.requestAnimationFrame(function () {
                    track.style.transition = "";
                });
            }

            track.style.transform = "translate3d(" + ((index * step * -1) + dragOffset) + "px, 0, 0)";

            if (prev) prev.disabled = index === 0;
            if (next) next.disabled = index === maxIndex;
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
                dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
            });
        }

        function goTo(nextIndex) {
            index = Math.max(0, Math.min(maxIndex, nextIndex));
            dragOffset = 0;
            update(true);
        }

        function goNext() {
            goTo(index >= maxIndex ? 0 : index + 1);
        }

        function pauseAuto() {
            if (autoTimer) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                goTo(index - 1);
                pauseAuto();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                goTo(index + 1);
                pauseAuto();
            });
        }

        viewport.addEventListener("pointerdown", function (event) {
            if (event.target.closest("a, button, input, select, textarea")) return;
            dragging = true;
            startX = event.clientX;
            currentX = startX;
            viewport.classList.add("is-dragging");
            viewport.setPointerCapture(event.pointerId);
            pauseAuto();
        });

        viewport.addEventListener("pointermove", function (event) {
            if (!dragging) return;
            currentX = event.clientX;
            dragOffset = currentX - startX;
            if ((index === 0 && dragOffset > 0) || (index === maxIndex && dragOffset < 0)) {
                dragOffset *= 0.28;
            }
            update(true);
        });

        function endDrag(event) {
            if (!dragging) return;
            dragging = false;
            viewport.classList.remove("is-dragging");
            if (viewport.hasPointerCapture(event.pointerId)) {
                viewport.releasePointerCapture(event.pointerId);
            }

            var threshold = Math.max(48, step * 0.18);
            if (dragOffset < -threshold) {
                goTo(index + 1);
            } else if (dragOffset > threshold) {
                goTo(index - 1);
            } else {
                dragOffset = 0;
                update(true);
            }
        }

        viewport.addEventListener("pointerup", endDrag);
        viewport.addEventListener("pointercancel", endDrag);

        root.addEventListener("keydown", function (event) {
            if (event.key === "ArrowLeft") {
                goTo(index - 1);
                pauseAuto();
            }
            if (event.key === "ArrowRight") {
                goTo(index + 1);
                pauseAuto();
            }
        });

        window.addEventListener("resize", measure);
        measure();
    }

})();
