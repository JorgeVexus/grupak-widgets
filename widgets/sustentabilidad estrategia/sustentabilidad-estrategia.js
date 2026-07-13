/**
 * Grupak — Estrategia de Sustentabilidad Widget
 * Scroll-driven animation.
 *
 * Layout states (drive title/text/diagram position via CSS classes):
 *   0 : Blank white, big centered logo               (0    – 0.20)
 *   1-3 : Logo shrunk + docked, circles orbit in      (0.20 – 0.86)
 *   4 : Final layout — text left, diagram right       (0.86 – 1.00)
 *
 * Independently of the layout state, the logo scale and each circle's
 * rotation/scale/opacity are driven continuously (scrubbed 1:1 with scroll)
 * so the circles visibly swing in around the fixed logo pivot:
 *   - logo shrinks from full size down to its resting scale over 0 – 0.20
 *   - green circle swings in, rotating left (CCW)      0.20 – 0.45
 *   - blue circle swings in, rotating left (CCW)        0.45 – 0.68
 *   - orange circle swings in, rotating right (CW)      0.68 – 0.86
 */
(function () {
    "use strict";

    /* ── Environment detection ── */
    const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    const baseURL = isLocalhost
        ? "/widgets/sustentabilidad estrategia"
        : "https://grupak-widgets.vercel.app/widgets/sustentabilidad%20estrategia";

    var assetVersion = "20260713-sust-2";

    /* ── 1. Inject CSS ── */
    if (!document.getElementById("gpk-sust-styles")) {
        const link = document.createElement("link");
        link.id   = "gpk-sust-styles";
        link.rel  = "stylesheet";
        link.href = isLocalhost
            ? "widgets/sustentabilidad estrategia/sustentabilidad-estrategia.css?v=" + assetVersion
            : `${baseURL}/sustentabilidad-estrategia.css?v=` + assetVersion;
        document.head.appendChild(link);
    }

    /* ── 2. Fetch & inject HTML or init directly ── */
    const root = document.getElementById("gpk-sust-widget-root");
    if (root) {
        fetch(
            isLocalhost
                ? "widgets/sustentabilidad estrategia/sustentabilidad-estrategia.html?v=" + assetVersion
                : `${baseURL}/sustentabilidad-estrategia.html?v=` + assetVersion
        )
            .then(function (res) {
                if (!res.ok) throw new Error("Error loading Sustentabilidad widget HTML");
                return res.text();
            })
            .then(function (html) {
                root.innerHTML = html;
                resolveImages(root);
                initWidget();
            })
            .catch(function (err) {
                console.error("[gpk-sust]", err);
            });
    } else if (document.getElementById("gpk-sust-widget")) {
        resolveImages(document.getElementById("gpk-sust-widget"));
        initWidget();
    }

    /* ── Image URL resolver ── */
    function resolveImages(root) {
        if (!root) return;
        root.querySelectorAll("img").forEach(function (img) {
            var src = img.getAttribute("src");
            if (!src || src.startsWith("http") || src.startsWith("data:")) return;
            var cleanSrc = src.startsWith("/") ? src.slice(1) : src;
            img.src = isLocalhost
                ? "widgets/sustentabilidad estrategia/" + cleanSrc
                : baseURL.replace(/\/$/, "") + "/" + cleanSrc;
        });
    }

    /* ── Widget logic ── */
    function initWidget() {
        var widget = document.getElementById("gpk-sust-widget");
        if (!widget) return;

        var logoWrap = widget.querySelector(".sust-logo-wrap");
        var circleGreen  = widget.querySelector('.sust-circle[data-circle="green"]');
        var circleBlue   = widget.querySelector('.sust-circle[data-circle="blue"]');
        var circleOrange = widget.querySelector('.sust-circle[data-circle="orange"]');
        var spacer  = widget.querySelector(".sust-scroll-spacer");
        var mobileQuery = window.matchMedia("(max-width: 900px)");
        var mobileRevealObserver = null;

        if (!spacer) return;   // mobile / embed — static layout, skip scroll logic

        /* Scroll-progress sub-ranges for the pivot-orbit entrance animation */
        var LOGO_SHRINK_END = 0.20;
        var GREEN_RANGE  = [0.20, 0.45];
        var BLUE_RANGE   = [0.45, 0.68];
        var ORANGE_RANGE = [0.68, 0.86];
        var LOGO_REST_SCALE = 0.45;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function subProgress(p, range) {
            var start = range[0], end = range[1];
            if (end <= start) return p >= end ? 1 : 0;
            return Math.max(0, Math.min(1, (p - start) / (end - start)));
        }

        /* direction: "left" = rotates in counter-clockwise, "right" = rotates in clockwise */
        function applyCircle(el, p, direction) {
            if (!el) return;
            var eased = easeOutCubic(p);
            var startAngle = direction === "right" ? 180 : -180;
            var angle = startAngle * (1 - eased);
            var scale = 0.05 + 0.95 * eased;
            var opacity = Math.max(0, Math.min(1, p / 0.3));
            el.style.transform = "rotate(" + angle.toFixed(2) + "deg) scale(" + scale.toFixed(4) + ")";
            el.style.opacity = String(opacity);
        }

        function applyLogoScale(p) {
            if (!logoWrap) return;
            var t = Math.max(0, Math.min(1, p / LOGO_SHRINK_END));
            var eased = easeOutCubic(t);
            var scale = 1 - (1 - LOGO_REST_SCALE) * eased;
            logoWrap.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(4) + ")";
        }

        function applyOrbit(progress) {
            applyLogoScale(progress);
            applyCircle(circleGreen, subProgress(progress, GREEN_RANGE), "left");
            applyCircle(circleBlue, subProgress(progress, BLUE_RANGE), "left");
            applyCircle(circleOrange, subProgress(progress, ORANGE_RANGE), "right");
        }

        var currentState = -1;

        function getMobileRevealItems() {
            return Array.prototype.slice.call(widget.querySelectorAll(
                ".sust-title-block, .sust-diagram-area, .sust-para, .sust-com"
            ));
        }

        function teardownMobileReveal() {
            if (mobileRevealObserver) {
                mobileRevealObserver.disconnect();
                mobileRevealObserver = null;
            }

            widget.classList.remove("sust-mobile-ready");
            getMobileRevealItems().forEach(function (item) {
                item.classList.remove("sust-mobile-in");
                item.style.transitionDelay = "";
            });
        }

        function setupMobileReveal() {
            if (!mobileQuery.matches) {
                teardownMobileReveal();
                return;
            }

            if (mobileRevealObserver) return;

            var items = getMobileRevealItems();
            widget.classList.add("sust-mobile-ready");

            if (!window.IntersectionObserver) {
                items.forEach(function (item) {
                    item.classList.add("sust-mobile-in");
                });
                return;
            }

            mobileRevealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("sust-mobile-in");
                        mobileRevealObserver.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                rootMargin: "0px 0px -8% 0px",
                threshold: 0.12
            });

            items.forEach(function (item, index) {
                item.style.transitionDelay = Math.min(index * 35, 180) + "ms";
                mobileRevealObserver.observe(item);
            });
        }

        /* Map scroll progress (0-1) to a state (0-4) */
        function progressToState(p) {
            if (p < 0.20) return 0;
            if (p < 0.45) return 1;
            if (p < 0.68) return 2;
            if (p < 0.86) return 3;
            return 4;
        }

        function applyState(state) {
            if (state === currentState) return;
            currentState = state;

            /* Replace state class */
            widget.className = widget.className
                .replace(/\bsust-state-\d+\b/g, "")
                .trim();
            widget.classList.add("sust-state-" + state);
        }

        function handleScroll() {
            if (mobileQuery.matches) {
                applyState(4);
                if (logoWrap) {
                    logoWrap.style.transform = "translate(-50%, -50%) scale(" + LOGO_REST_SCALE + ")";
                }
                return;
            }

            var rect    = spacer.getBoundingClientRect();
            var vh      = window.innerHeight;
            /* scrollable distance = spacer.height − vh */
            var raw     = -rect.top / (rect.height - vh);
            var progress = Math.max(0, Math.min(1, raw));
            applyState(progressToState(progress));
            applyOrbit(progress);
        }

        /* Only listen while the widget is in the viewport */
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    window.addEventListener("scroll", handleScroll, { passive: true });
                    window.addEventListener("resize", setupMobileReveal, { passive: true });
                    handleScroll(); // sync on enter
                    setupMobileReveal();
                } else {
                    window.removeEventListener("scroll", handleScroll);
                    window.removeEventListener("resize", setupMobileReveal);
                }
            });
        }, { threshold: 0.05 });

        io.observe(widget);
        setupMobileReveal();
    }
})();
