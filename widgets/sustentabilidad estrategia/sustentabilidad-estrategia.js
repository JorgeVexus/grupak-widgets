/**
 * Grupak — Estrategia de Sustentabilidad Widget
 * Scroll-driven animation following the same pattern as mas-alla-del-empaque.
 *
 * States (driven by scroll progress 0 → 1):
 *   0 : Blank white  (0   – 0.20)
 *   1 : Frame 1 centered (green arc)                (0.20 – 0.45)
 *   2 : Frame 2 centered (green + blue circles)     (0.45 – 0.68)
 *   3 : Frame 3 centered (all three circles)        (0.68 – 0.86)
 *   4 : Final layout — text left, diagram right     (0.86 – 1.00)
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

    /* ── 1. Inject CSS ── */
    if (!document.getElementById("gpk-sust-styles")) {
        const link = document.createElement("link");
        link.id   = "gpk-sust-styles";
        link.rel  = "stylesheet";
        link.href = isLocalhost
            ? "widgets/sustentabilidad estrategia/sustentabilidad-estrategia.css"
            : `${baseURL}/sustentabilidad-estrategia.css`;
        document.head.appendChild(link);
    }

    /* ── 2. Fetch & inject HTML or init directly ── */
    const root = document.getElementById("gpk-sust-widget-root");
    if (root) {
        fetch(
            isLocalhost
                ? "widgets/sustentabilidad estrategia/sustentabilidad-estrategia.html"
                : `${baseURL}/sustentabilidad-estrategia.html`
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

        var frames  = widget.querySelectorAll(".sust-frame");
        var spacer  = widget.querySelector(".sust-scroll-spacer");
        var mobileQuery = window.matchMedia("(max-width: 900px)");
        var mobileRevealObserver = null;

        if (!spacer) return;   // mobile / embed — static layout, skip scroll logic

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

            frames.forEach(function (frame, idx) {
                frame.classList.toggle("active", idx === 2);
            });

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

        /* Frame index for each state:
         *   state 0 → no frame (-1)
         *   state 1 → frame 0 (green arc)
         *   state 2 → frame 1 (two circles)
         *   state 3 → frame 2 (all circles)
         *   state 4 → frame 2 (all circles, different layout)
         */
        function stateToFrameIndex(state) {
            if (state === 0) return -1;
            return Math.min(state - 1, 2);
        }

        function applyState(state) {
            if (state === currentState) return;
            currentState = state;

            /* Replace state class */
            widget.className = widget.className
                .replace(/\bsust-state-\d+\b/g, "")
                .trim();
            widget.classList.add("sust-state-" + state);

            /* Crossfade frames */
            var fi = stateToFrameIndex(state);
            frames.forEach(function (frame, idx) {
                frame.classList.toggle("active", idx === fi);
            });
        }

        function handleScroll() {
            if (mobileQuery.matches) {
                applyState(4);
                return;
            }

            var rect    = spacer.getBoundingClientRect();
            var vh      = window.innerHeight;
            /* scrollable distance = spacer.height − vh */
            var raw     = -rect.top / (rect.height - vh);
            var progress = Math.max(0, Math.min(1, raw));
            applyState(progressToState(progress));
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
