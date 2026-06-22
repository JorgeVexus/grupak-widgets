(function() {
    "use strict";

    const baseURL = "https://grupak-widgets.vercel.app/widgets/productos-interactivos";

    // 1. Inject CSS stylesheet dynamically if not already present
    if (!document.getElementById("gpk-products-styles")) {
        const link = document.createElement("link");
        link.id = "gpk-products-styles";
        link.rel = "stylesheet";
        link.href = `${baseURL}/productos-interactivos.css`;
        document.head.appendChild(link);
    }

    // 2. Fetch and inject HTML markup
    const container = document.getElementById("gpk-products-widget-root");
    if (container) {
        fetch(`${baseURL}/productos-interactivos.html`)
            .then(res => {
                if (!res.ok) throw new Error("Error loading products widget HTML");
                return res.text();
            })
            .then(html => {
                container.innerHTML = html;
                // Initialize widget logic after HTML is successfully injected into the DOM
                initWidget();
            })
            .catch(err => console.error("Error loading products widget:", err));
    }

    // Encapsulated widget logic
    function initWidget() {
        // --- State Management ---
        let currentSlide = 0; 
        const totalSlides = 10;
        let isAnimating = false;

        // Scoped DOM Elements to prevent clashes
        const root = document.getElementById("gpk-products-widget");
        if (!root) return;

        const board = root.querySelector("#products-board");
        const tracker = root.querySelector(".products-scroll-tracker");
        const prevBtn = root.querySelector("#p-prev-btn");
        const nextBtn = root.querySelector("#p-next-btn");
        const dotsContainer = root.querySelector("#footer-dots");

        // --- Dot Indicators Builder ---
        function buildDots() {
            dotsContainer.innerHTML = "";
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement("div");
                dot.className = `dot-indicator ${i === 0 ? "active" : ""}`;
                dot.setAttribute("data-slide", i);
                dot.addEventListener("click", () => {
                    goToSlide(i);
                });
                dotsContainer.appendChild(dot);
            }
        }

        // --- Viewport Scaling Logic ---
        function scaleBoard() {
            if (window.innerWidth <= 1024) {
                board.style.transform = "none";
                return;
            }

            const scaleX = window.innerWidth / 1850;
            const scaleY = window.innerHeight / 1030;
            const scale = Math.min(scaleX, scaleY, 1);
            board.style.setProperty('--board-scale', scale);
        }

        // --- Slide Controller ---
        function goToSlide(index) {
            if (index < 0 || index >= totalSlides) return;

            // Desktop scroll management
            const rect = tracker.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const trackerTop = rect.top + scrollTop;
            const scrollHeight = rect.height - window.innerHeight;

            const targetProgress = (index + 0.5) / totalSlides;
            const targetScrollY = trackerTop + targetProgress * scrollHeight;

            currentSlide = index; // Update immediately for responsive UI
            updateUI();

            window.scrollTo({
                top: targetScrollY,
                behavior: "smooth"
            });
        }

        function handleScroll() {
            const rect = tracker.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const trackerTop = rect.top + scrollTop;
            const scrollHeight = rect.height - window.innerHeight;

            const relativeScroll = scrollTop - trackerTop;
            let progress = relativeScroll / scrollHeight;
            progress = Math.max(0, Math.min(1, progress));

            const targetSlide = Math.min(Math.floor(progress * totalSlides), totalSlides - 1);

            if (targetSlide !== currentSlide) {
                currentSlide = targetSlide;
                updateUI();
            }
        }

        function updateUI() {
            // 1. Set mode class on board
            board.className = `products-board mode-${currentSlide}`;

            // 2. Highlight dot indicators
            const dots = dotsContainer.querySelectorAll(".dot-indicator");
            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === currentSlide);
            });

            // 3. Manage active states on floating pillars
            const pillars = root.querySelectorAll(".pillar-wrapper");
            pillars.forEach(p => {
                const pillarType = p.getAttribute("data-pillar");
                let isActive = false;
                
                if (currentSlide === 0 || currentSlide === 1) {
                    isActive = true;
                } else if (pillarType === "caja" && (currentSlide === 2 || currentSlide === 3 || currentSlide === 4)) {
                    isActive = true;
                } else if (pillarType === "rollo" && (currentSlide === 5 || currentSlide === 6)) {
                    isActive = true;
                } else if (pillarType === "grabados" && currentSlide === 7) {
                    isActive = true;
                }

                p.classList.toggle("active-menu-pillar", isActive);
            });

            // Disable arrows if boundary reached
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide === totalSlides - 1;

            // 4. Manage papel text block color animation (Mode 5)
            if (currentSlide === 5) {
                activatePaperTextBlocks(root);
            } else {
                // Remove active class when leaving mode 5
                const textBlocks = root.querySelectorAll(".papel-text-block");
                textBlocks.forEach(block => block.classList.remove("active"));
            }
        }

        // --- Papel text block color animation (Mode 5) ---
        let papelAnimationTimeouts = [];
        function activatePaperTextBlocks(root) {
            // Clear any existing timeouts
            papelAnimationTimeouts.forEach(t => clearTimeout(t));
            papelAnimationTimeouts = [];

            const textBlocks = root.querySelectorAll(".papel-text-block");
            const order = [
                { selector: ".papel-text-block.tl", delay: 400 },
                { selector: ".papel-text-block.bl", delay: 1200 },
                { selector: ".papel-text-block.tr", delay: 2000 },
                { selector: ".papel-text-block.br", delay: 2800 }
            ];

            order.forEach((item, index) => {
                const block = root.querySelector(item.selector);
                if (block) {
                    const timeout = setTimeout(() => {
                        // Remove active from all
                        textBlocks.forEach(b => b.classList.remove("active"));
                        // Add active to current
                        block.classList.add("active");
                    }, item.delay);
                    papelAnimationTimeouts.push(timeout);
                }
            });
        }

        // --- Setup Events ---
        function setupEvents() {
            prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
            nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));

            root.querySelectorAll(".overview-col-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const target = parseInt(btn.getAttribute("data-target-slide"));
                    goToSlide(target);
                });
            });

            document.addEventListener("keydown", (e) => {
                if (window.innerWidth <= 1024) return;
                
                const rect = root.getBoundingClientRect();
                const isVisible = (rect.top < window.innerHeight && rect.bottom > 0);
                if (!isVisible) return;

                if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    goToSlide(currentSlide - 1);
                } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    goToSlide(currentSlide + 1);
                }
            });

            window.addEventListener("resize", () => {
                scaleBoard();
                updateUI();
            });

            window.addEventListener("scroll", handleScroll, { passive: true });
        }

        // --- Initialize ---
        function init() {
            buildDots();
            scaleBoard();
            setupEvents();

            handleScroll();
            setTimeout(updateUI, 100);
        }

        init();
    }
})();