(function() {
    "use strict";

    // Detect environment (Localhost vs Production Vercel)
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseURL = isLocalhost 
        ? "/widgets/mas-alla-del-empaque" 
        : "https://grupak-widgets.vercel.app/widgets/mas-alla-del-empaque";

    // 1. Inject CSS stylesheet dynamically if not already present
    if (!document.getElementById("gpk-mas-alla-styles")) {
        const link = document.createElement("link");
        link.id = "gpk-mas-alla-styles";
        link.rel = "stylesheet";
        link.href = isLocalhost ? "widgets/mas-alla-del-empaque/mas-alla-del-empaque.css" : `${baseURL}/mas-alla-del-empaque.css`;
        document.head.appendChild(link);
    }

    // 2. Fetch and inject HTML markup if root container exists
    const container = document.getElementById("gpk-mas-alla-widget-root");
    if (container) {
        fetch(isLocalhost ? "widgets/mas-alla-del-empaque/mas-alla-del-empaque.html" : `${baseURL}/mas-alla-del-empaque.html`)
            .then(res => {
                if (!res.ok) throw new Error("Error loading Mas Allá widget HTML");
                return res.text();
            })
            .then(html => {
                container.innerHTML = html;
                resolveRelativeImages(container);
                initWidget();
            })
            .catch(err => console.error("Error loading Mas Allá widget:", err));
    } else if (document.getElementById("gpk-mas-alla-widget")) {
        resolveRelativeImages(document.getElementById("gpk-mas-alla-widget"));
        initWidget();
    }

    // Dynamically prepend baseURL to relative image sources inside the widget HTML
    function resolveRelativeImages(root) {
        if (!root) return;
        const imgs = root.querySelectorAll("img");
        imgs.forEach(img => {
            const src = img.getAttribute("src");
            if (src && !src.startsWith("http") && !src.startsWith("data:")) {
                const cleanBase = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
                const cleanSrc = src.startsWith("/") ? src.slice(1) : src;
                if (isLocalhost) {
                    img.src = `widgets/mas-alla-del-empaque/${cleanSrc}`;
                } else {
                    img.src = `${cleanBase}/${cleanSrc}`;
                }
            }
        });
    }

    function initWidget() {
        const widget = document.getElementById("gpk-mas-alla-widget");
        if (!widget) return;

        const images = widget.querySelectorAll(".mas-alla-slide-img");
        const items = widget.querySelectorAll(".mas-alla-item");
        const spacer = widget.querySelector(".mas-alla-scroll-spacer");
        const wrapper = widget.querySelector(".mas-alla-sticky-wrapper");
        const divider = widget.querySelector("#gpk-mas-alla-divider");
        const itemsContainer = widget.querySelector(".mas-alla-items-container");

        const TOTAL = items.length; // 4
        let currentIndex = -1;
        let dots = null;

        // ── Detect mobile ──────────────────────────────────────────────────
        function isMobile() {
            return window.innerWidth <= 768;
        }

        // ── Dots navigation ────────────────────────────────────────────────
        function createDots() {
            // Remove any existing dots
            const existing = widget.querySelector(".mas-alla-dots");
            if (existing) existing.remove();

            const dotsContainer = document.createElement("div");
            dotsContainer.className = "mas-alla-dots";
            dotsContainer.setAttribute("aria-label", "Navegación de diapositivas");

            for (let i = 0; i < TOTAL; i++) {
                const dot = document.createElement("button");
                dot.className = "mas-alla-dot" + (i === 0 ? " active" : "");
                dot.setAttribute("aria-label", `Ir al punto ${i + 1}`);
                dot.addEventListener("click", () => scrollToIndex(i));
                dotsContainer.appendChild(dot);
            }

            // Insert dots after items container
            itemsContainer.insertAdjacentElement("afterend", dotsContainer);
            return dotsContainer.querySelectorAll(".mas-alla-dot");
        }

        function updateDots(index) {
            if (!dots) return;
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });
        }

        // ── Scroll to a specific index (for swipe & dot tap) ──────────────
        function scrollToIndex(index) {
            if (!spacer) return;
            const spacerRect = spacer.getBoundingClientRect();
            const spacerTop = window.scrollY + spacerRect.top;
            const spacerHeight = spacer.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollableRange = spacerHeight - viewportHeight;

            if (scrollableRange <= 0) return;

            // Target the midpoint of the index's range
            const targetProgress = (index + 0.5) / TOTAL;
            const targetScrollY = spacerTop + targetProgress * scrollableRange;

            window.scrollTo({ top: targetScrollY, behavior: "smooth" });
        }

        // ── Update active state (images + items + divider + dots) ──────────
        function updateActiveState(index) {
            if (index === currentIndex) return;
            currentIndex = index;

            // 1. Image crossfade
            images.forEach((img, idx) => {
                img.classList.toggle("active", idx === index);
            });

            // 2. Item state classes
            items.forEach((item, idx) => {
                item.classList.remove("gpk-active", "gpk-inactive", "gpk-hidden");
                if (idx === index) {
                    item.classList.add("gpk-active");
                } else if (idx < index) {
                    item.classList.add("gpk-inactive");
                } else {
                    item.classList.add("gpk-hidden");
                }
            });

            // 3. Divider position (desktop only)
            if (divider) {
                divider.className = "mas-alla-divider";
                divider.classList.add(`state-${index}`);
            }

            // 4. Dots (mobile only)
            updateDots(index);
        }

        // ── Scroll handler ─────────────────────────────────────────────────
        function handleScroll() {
            if (!spacer) return;
            const rect = spacer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollProgress = -rect.top / (rect.height - viewportHeight);
            const progress = Math.max(0, Math.min(1, scrollProgress));
            const index = Math.min(Math.floor(progress * TOTAL), TOTAL - 1);
            updateActiveState(index);
        }

        // ── Touch / Swipe (mobile) ─────────────────────────────────────────
        let touchStartX = 0;
        let touchStartY = 0;
        const SWIPE_THRESHOLD = 40;

        widget.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        widget.addEventListener("touchend", (e) => {
            if (!isMobile()) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            const deltaY = e.changedTouches[0].clientY - touchStartY;

            // Ignore vertical swipes (likely scrolling)
            if (Math.abs(deltaY) > Math.abs(deltaX)) return;
            if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

            if (deltaX < 0 && currentIndex < TOTAL - 1) {
                // Swipe left → next
                scrollToIndex(currentIndex + 1);
            } else if (deltaX > 0 && currentIndex > 0) {
                // Swipe right → prev
                scrollToIndex(currentIndex - 1);
            }
        }, { passive: true });

        // ── Setup & responsive handling ────────────────────────────────────
        function setupMobile() {
            if (isMobile()) {
                dots = createDots();
                updateDots(Math.max(currentIndex, 0));
            } else {
                // Remove dots if resized to desktop
                const existing = widget.querySelector(".mas-alla-dots");
                if (existing) existing.remove();
                dots = null;
            }
        }

        // Debounced resize handler
        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setupMobile();
                handleScroll();
            }, 200);
        });

        // ── IntersectionObserver — only listen when widget is visible ──────
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener("scroll", handleScroll, { passive: true });
                    handleScroll(); // Initial sync
                } else {
                    window.removeEventListener("scroll", handleScroll);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(widget);

        // Initial setup
        setupMobile();
        handleScroll();
    }
})();
