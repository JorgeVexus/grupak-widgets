/**
 * Grupak — Ciclo de Vida Widget
 * Scroll-driven animation matching the Figma 15-state sequence.
 */
(function () {
    "use strict";

    /* ── Environment detection ── */
    const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    const baseURL = isLocalhost
        ? "/widgets/ciclo-de-vida"
        : "https://grupak-widgets.vercel.app/widgets/ciclo-de-vida";

    /* ── 1. Inject CSS ── */
    if (!document.getElementById("gpk-ciclo-styles")) {
        const link = document.createElement("link");
        link.id   = "gpk-ciclo-styles";
        link.rel  = "stylesheet";
        link.href = isLocalhost
            ? "widgets/ciclo-de-vida/ciclo-de-vida.css?v=" + new Date().getTime()
            : `${baseURL}/ciclo-de-vida.css`;
        document.head.appendChild(link);
    }

    /* ── 2. Fetch & inject HTML or init directly ── */
    const root =
        document.getElementById("gpk-ciclo-widget-root") ||
        document.getElementById("gpk-ciclo-vida-widget-root") ||
        document.getElementById("grupak-ciclo-vida-root");
    if (root) {
        fetch(
            isLocalhost
                ? "widgets/ciclo-de-vida/ciclo-de-vida.html"
                : `${baseURL}/ciclo-de-vida.html`
        )
            .then(function (res) {
                if (!res.ok) throw new Error("Error loading Ciclo de Vida widget HTML");
                return res.text();
            })
            .then(function (html) {
                root.innerHTML = html;
                resolveImages(root);
                initWidget();
            })
            .catch(function (err) {
                console.error("[gpk-ciclo]", err);
            });
    } else if (document.getElementById("gpk-ciclo-widget")) {
        resolveImages(document.getElementById("gpk-ciclo-widget"));
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
                ? "widgets/ciclo-de-vida/" + cleanSrc
                : baseURL.replace(/\/$/, "") + "/" + cleanSrc;
        });
    }

    /* ── Widget logic ── */
    function initWidget() {
        var widget = document.getElementById("gpk-ciclo-widget");
        if (!widget) return;

        var board = document.getElementById("lifecycle-board");
        var prevBtn = document.getElementById("prev-btn");
        var nextBtn = document.getElementById("next-btn");
        var currentIndicator = document.getElementById("current-slide");
        var stepCards = widget.querySelectorAll(".step-card");
        var lines = widget.querySelectorAll(".connecting-line");
        var wheelOverlay = document.getElementById("wheel-overlay");
        var spacer = widget.querySelector(".lifecycle-scroll-spacer");

        var currentSlide = 0; // 0 to 14
        const totalSlides = 15;
        var currentState = -1;

        // --- Donut Sector Generator for Interactive Wheel ---
        function getDonutSectorPath(cx, cy, rOut, rIn, startAngleDegree, endAngleDegree) {
            const startRad = (startAngleDegree * Math.PI) / 180;
            const endRad = (endAngleDegree * Math.PI) / 180;
            
            const x1_out = cx + rOut * Math.cos(startRad);
            const y1_out = cy + rOut * Math.sin(startRad);
            const x2_out = cx + rOut * Math.cos(endRad);
            const y2_out = cy + rOut * Math.sin(endRad);
            
            const x1_in = cx + rIn * Math.cos(startRad);
            const y1_in = cy + rIn * Math.sin(startRad);
            const x2_in = cx + rIn * Math.cos(endRad);
            const y2_in = cy + rIn * Math.sin(endRad);
            
            const largeArcFlag = endAngleDegree - startAngleDegree <= 180 ? 0 : 1;
            
            return `M ${x1_out} ${y1_out} 
                    A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2_out} ${y2_out} 
                    L ${x2_in} ${y2_in} 
                    A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x1_in} ${y1_in} 
                    Z`;
        }

        function buildInteractiveWheelSectors() {
            if (!wheelOverlay) return;
            const cx = 327.5, cy = 327.5;
            const rOut = 327.5;
            const rIn = 110;

            // Angle bounds for the 6 segments in degrees (matches static wheel layout)
            const angles = [
                { start: 270, end: 330, step: 1 },
                { start: 330, end: 390, step: 2 },
                { start: 30,  end: 90,  step: 3 },
                { start: 90,  end: 150, step: 4 },
                { start: 150, end: 210, step: 5 },
                { start: 210, end: 270, step: 6 }
            ];

            wheelOverlay.innerHTML = "";

            angles.forEach(item => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const d = getDonutSectorPath(cx, cy, rOut, rIn, item.start, item.end);
                path.setAttribute("d", d);
                path.setAttribute("class", "wheel-sector");
                path.setAttribute("data-step", item.step);
                
                path.addEventListener("click", (e) => {
                    e.stopPropagation();
                    // Navigate to corresponding state (Step 1 -> State 7, Step 2 -> State 8, etc.)
                    goToSlide(item.step + 6);
                });
                
                wheelOverlay.appendChild(path);
            });
        }

        // --- Viewport Auto-scaling Logic ---
        function scaleBoard() {
            if (!board) return;
            if (window.innerWidth <= 768) {
                board.style.transform = "none";
                return;
            }

            const scaleX = window.innerWidth / 1850;
            const scaleY = window.innerHeight / 1080;
            const scale = Math.min(scaleX, scaleY, 1);
            board.style.transform = `scale(${scale})`;
        }

        // --- Slide Transitions Controller ───
        function goToSlide(index) {
            if (index < 0 || index >= totalSlides) return;

            if (window.innerWidth <= 768) {
                // Mobile behavior: scroll to corresponding element
                if (index === 0) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                } else if (index < 7) {
                    // Title/Badge/Intro columns
                    window.scrollTo({ top: 0, behavior: "smooth" });
                } else if (index === 14) {
                    const stats = document.getElementById("stats-container");
                    if (stats) stats.scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                    const stepNum = index - 6; // 1 to 6
                    const card = widget.querySelector(`.step-card[data-step="${stepNum}"]`);
                    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                return;
            }

            // Desktop behavior: scroll page to correct scroll-tracker offset
            const rect = spacer.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const trackerTop = rect.top + scrollTop;
            const scrollHeight = rect.height - window.innerHeight;

            const targetProgress = (index + 0.5) / totalSlides;
            const targetScrollY = trackerTop + targetProgress * scrollHeight;

            window.scrollTo({
                top: targetScrollY,
                behavior: "smooth"
            });
        }

        function handleScroll() {
            if (window.innerWidth <= 768) return;

            var rect = spacer.getBoundingClientRect();
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var trackerTop = rect.top + scrollTop;
            var scrollHeight = rect.height - window.innerHeight;

            var relativeScroll = scrollTop - trackerTop;
            var progress = relativeScroll / scrollHeight;
            progress = Math.max(0, Math.min(1, progress));

            var targetSlide = progressToState(progress);
            
            if (targetSlide !== currentSlide) {
                currentSlide = targetSlide;
                updateUI();
            }
        }

        function progressToState(p) {
            if (p < 0.05) return 0;   // Logo
            if (p < 0.12) return 1;   // Badge
            if (p < 0.19) return 2;   // Badge + Title
            if (p < 0.26) return 3;   // Col 1
            if (p < 0.33) return 4;   // Col 2
            if (p < 0.40) return 5;   // Col 3
            if (p < 0.47) return 6;   // Wheel
            if (p < 0.54) return 7;   // Step 1
            if (p < 0.61) return 8;   // Step 2
            if (p < 0.68) return 9;   // Step 3
            if (p < 0.75) return 10;  // Step 4
            if (p < 0.82) return 11;  // Step 5
            if (p < 0.89) return 12;  // Step 6
            if (p < 0.95) return 13;  // All steps grey
            return 14;                // Shift up + stats green
        }

        function updateUI() {
            if (currentSlide === currentState) return;
            currentState = currentSlide;

            // 1. Update board state class
            widget.className = widget.className
                .replace(/\blifecycle-state-\d+\b/g, "")
                .trim();
            widget.classList.add("lifecycle-state-" + currentSlide);

            // 2. Manage step cards active states (only in desktop)
            if (window.innerWidth > 768) {
                stepCards.forEach(card => {
                    const stepNum = parseInt(card.getAttribute("data-step"));
                    const mappedStep = currentSlide - 6; // State 7 -> Step 1, State 8 -> Step 2, etc.
                    card.classList.toggle("active", stepNum === mappedStep);
                });
            }

            // 3. Highlight corresponding sectors on the interactive SVG overlay
            const sectors = wheelOverlay.querySelectorAll(".wheel-sector");
            sectors.forEach(sec => {
                const stepNum = parseInt(sec.getAttribute("data-step"));
                const mappedStep = currentSlide - 6;
                sec.classList.toggle("active", stepNum === mappedStep);
            });

            // 4. Update index indicators & buttons
            if (currentIndicator) {
                currentIndicator.innerText = currentSlide + 1;
            }
            if (prevBtn) {
                prevBtn.disabled = currentSlide === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = currentSlide === totalSlides - 1;
            }
        }

        // --- Setup Mobile Animations ---
        let mobileObserver;
        let mobileActiveObserver;

        function setupMobileAnimations() {
            disconnectMobileObservers();

            if (!window.IntersectionObserver) {
                stepCards.forEach(card => {
                    card.classList.add("in-view");
                    card.classList.add("active");
                });
                return;
            }

            // 1. Fade-in entrance observer
            mobileObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                    }
                });
            }, {
                root: null,
                rootMargin: "0px 0px -10% 0px",
                threshold: 0.1
            });

            stepCards.forEach(card => {
                card.classList.remove("in-view");
                mobileObserver.observe(card);
            });

            // 2. Active highlighting observer
            mobileActiveObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const stepNum = parseInt(entry.target.getAttribute("data-step"));
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                        
                        // Sync SVG sectors
                        const sectors = wheelOverlay.querySelectorAll(".wheel-sector");
                        sectors.forEach(sec => {
                            const secStep = parseInt(sec.getAttribute("data-step"));
                            sec.classList.toggle("active", secStep === stepNum);
                        });
                    } else {
                        entry.target.classList.remove("active");
                    }
                });
            }, {
                root: null,
                rootMargin: "-35% 0px -35% 0px",
                threshold: 0
            });

            stepCards.forEach(card => {
                mobileActiveObserver.observe(card);
            });
        }

        function disconnectMobileObservers() {
            if (mobileObserver) {
                mobileObserver.disconnect();
                mobileObserver = null;
            }
            if (mobileActiveObserver) {
                mobileActiveObserver.disconnect();
                mobileActiveObserver = null;
            }
        }

        // --- Setup Event Listeners ---
        function setupEvents() {
            if (prevBtn) {
                prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));
            }

            // Step card click navigation
            stepCards.forEach(card => {
                const stepNum = parseInt(card.getAttribute("data-step"));
                card.addEventListener("click", () => {
                    goToSlide(stepNum + 6);
                });
            });

            // Keyboard navigation when visible
            document.addEventListener("keydown", (e) => {
                if (window.innerWidth <= 768) return;
                
                const rect = spacer.getBoundingClientRect();
                const isVisible = (rect.top < window.innerHeight && rect.bottom > 0);
                if (!isVisible) return;

                if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    goToSlide(currentSlide - 1);
                } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    goToSlide(currentSlide + 1);
                }
            });

            // Resize hooks
            let isMobile = window.innerWidth <= 768;
            window.addEventListener("resize", () => {
                const wasMobile = isMobile;
                isMobile = window.innerWidth <= 768;

                scaleBoard();
                updateUI();

                if (isMobile && !wasMobile) {
                    setupMobileAnimations();
                    window.removeEventListener("scroll", handleScroll);
                } else if (!isMobile && wasMobile) {
                    disconnectMobileObservers();
                    window.addEventListener("scroll", handleScroll, { passive: true });
                    
                    stepCards.forEach(card => {
                        card.classList.remove("in-view");
                        card.classList.remove("active");
                    });
                }
            });

            // Initial scroll event binding
            if (window.innerWidth <= 768) {
                setupMobileAnimations();
            } else {
                window.addEventListener("scroll", handleScroll, { passive: true });
            }
        }

        // --- Initialize ---
        function init() {
            buildInteractiveWheelSectors();
            scaleBoard();
            setupEvents();
            
            if (window.innerWidth > 768) {
                handleScroll();
            }
            
            setTimeout(updateUI, 100);
        }

        init();
    }
})();
