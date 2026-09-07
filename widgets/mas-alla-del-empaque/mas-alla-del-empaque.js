(function() {
    "use strict";

    // Detect environment (Localhost vs Production Vercel)
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseURL = isLocalhost 
        ? "/widgets/mas-alla-del-empaque" 
        : "https://grupak-widgets.vercel.app/widgets/mas-alla-del-empaque";
    const internalBuild = "20260907-snap-v1";

    // 1. Inject CSS stylesheet dynamically if not already present
    if (!document.getElementById("gpk-mas-alla-styles")) {
        const link = document.createElement("link");
        link.id = "gpk-mas-alla-styles";
        link.rel = "stylesheet";
        link.href = isLocalhost 
            ? `widgets/mas-alla-del-empaque/mas-alla-del-empaque.css?v=${internalBuild}` 
            : `${baseURL}/mas-alla-del-empaque.css?v=${internalBuild}`;
        document.head.appendChild(link);
    }

    // 2. Fetch and inject HTML markup if root container exists
    const container = document.getElementById("gpk-mas-alla-widget-root");
    if (container) {
        fetch(isLocalhost 
            ? `widgets/mas-alla-del-empaque/mas-alla-del-empaque.html?v=${internalBuild}` 
            : `${baseURL}/mas-alla-del-empaque.html?v=${internalBuild}`)
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
        const itemsContainer = widget.querySelector(".mas-alla-items-container");

        const TOTAL = items.length; // 4
        let currentIndex = -1;
        let dots = null;

        // Navigation state lock & gesture control
        let isNavigating = false;
        let navigatingTimer = null;
        let lastStepTime = 0;
        let wheelAccumulator = 0;
        let lastKeyTime = 0;

        function setNavigating(duration = 350) {
            isNavigating = true;
            clearTimeout(navigatingTimer);
            navigatingTimer = setTimeout(() => {
                isNavigating = false;
            }, duration);
        }

        // ── Detect mobile ──────────────────────────────────────────────────
        function isMobile() {
            return window.innerWidth <= 1025;
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
                dot.addEventListener("click", () => goToIndex(i));
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

        // ── Direct navigation with instant scroll positioning & lock ──────────
        function goToIndex(index) {
            if (index < 0 || index >= TOTAL) return;

            updateActiveState(index);

            if (!spacer) return;
            setNavigating(350);

            const spacerRect = spacer.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const spacerTop = spacerRect.top + scrollTop;
            const spacerHeight = spacer.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollableRange = spacerHeight - viewportHeight;

            if (scrollableRange <= 0) return;

            // Target the midpoint of the index's range
            const targetProgress = (index + 0.5) / TOTAL;
            const targetScrollY = Math.round(spacerTop + targetProgress * scrollableRange);

            window.scrollTo(0, targetScrollY);
        }

        // ── Update active state (images + items + dots) ──────────
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

            // 3. Dots (mobile only)
            updateDots(index);
        }

        // ── Scroll handler (for manual page scroll / scrollbar dragging) ───
        function handleScroll() {
            if (!spacer || isNavigating) return;
            const rect = spacer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollProgress = -rect.top / (rect.height - viewportHeight);
            const progress = Math.max(0, Math.min(1, scrollProgress));
            const index = Math.min(Math.floor(progress * TOTAL), TOTAL - 1);
            updateActiveState(index);
        }

        // ── Gesture Wheel Stepper ──────────────────────────────────────────
        function handleWheel(e) {
            if (isMobile()) return;

            const rect = widget.getBoundingClientRect();
            const isPinned = rect.top <= 4 && rect.bottom >= window.innerHeight - 4;
            if (!isPinned) return;

            const delta = e.deltaY;
            if (Math.abs(delta) < 0.5) return;

            // Escape en extremos superior (0) e inferior (TOTAL - 1) para permitir scroll continuo de la página
            if (currentIndex === 0 && delta < 0) return;
            if (currentIndex === TOTAL - 1 && delta > 0) return;

            // Evitar scroll nativo mientras navegamos dentro del widget
            e.preventDefault();

            const now = performance.now();
            const isMouseWheel = e.deltaMode !== 0 || Math.abs(delta) >= 50;
            const cooldown = isMouseWheel ? 260 : 380;

            // Si estamos dentro de la ventana de enfriamiento del paso anterior
            if (now - lastStepTime < cooldown) {
                wheelAccumulator = 0;
                return;
            }

            // En trackpads, ignorar micro-inercia residual de baja intensidad (< 14px)
            if (!isMouseWheel && Math.abs(delta) < 14) {
                wheelAccumulator = 0;
                return;
            }

            // En mouse convencional, 1 sola muesca (notch) avanza de inmediato al siguiente paso
            if (isMouseWheel) {
                lastStepTime = now;
                wheelAccumulator = 0;
                const step = delta > 0 ? 1 : -1;
                goToIndex(currentIndex + step);
                return;
            }

            // Para trackpad / touchpad continuo, acumular delta con umbral suave
            wheelAccumulator += delta;
            const TRACKPAD_THRESHOLD = 30;

            if (Math.abs(wheelAccumulator) >= TRACKPAD_THRESHOLD) {
                const step = wheelAccumulator > 0 ? 1 : -1;
                wheelAccumulator = 0;
                lastStepTime = now;
                goToIndex(currentIndex + step);
            }
        }

        // ── Keyboard arrow navigation ──────────────────────────────────────
        function handleKeyDown(e) {
            const rect = widget.getBoundingClientRect();
            const isVisible = (rect.top < window.innerHeight && rect.bottom > 0);
            if (!isVisible) return;

            if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "ArrowRight") {
                const isPinned = rect.top <= 4 && rect.bottom >= window.innerHeight - 4;
                if (!isPinned) return;

                const now = performance.now();
                if (now - lastKeyTime < 240) {
                    e.preventDefault();
                    return;
                }
                lastKeyTime = now;

                if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    if (currentIndex > 0) {
                        e.preventDefault();
                        goToIndex(currentIndex - 1);
                    }
                } else {
                    if (currentIndex < TOTAL - 1) {
                        e.preventDefault();
                        goToIndex(currentIndex + 1);
                    }
                }
            }
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
                goToIndex(currentIndex + 1);
            } else if (deltaX > 0 && currentIndex > 0) {
                // Swipe right → prev
                goToIndex(currentIndex - 1);
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

        // ── Attach event listeners ─────────────────────────────────────────
        widget.addEventListener("wheel", handleWheel, { passive: false });
        if (wrapper && wrapper !== widget) {
            wrapper.addEventListener("wheel", handleWheel, { passive: false });
        }
        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener("scroll", handleScroll, { passive: true });

        // Initial setup
        setupMobile();
        handleScroll();
    }
})();
