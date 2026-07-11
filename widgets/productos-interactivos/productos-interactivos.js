(function() {
    "use strict";

    const productionBaseURL = "https://grupak-widgets.vercel.app/widgets/productos-interactivos";
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseURL = isLocalHost ? "/widgets/productos-interactivos" : productionBaseURL;

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
    } else {
        // Fallback for inlined embeds where HTML is already present in the DOM
        initWidget();
    }

    // Encapsulated widget logic
    function initWidget() {
        // --- State Management ---
        let currentSlide = 0; 
        const totalSlides = 10;
        let isAnimating = false;
        let isPreloading = false;
        let lastScrollProgress = 0;

        // Custom slide ranges to extend Slide 0 duration and smooth animations
        const slideRanges = [
            { start: 0.0, end: 0.18 },   // Slide 0 (extended)
            { start: 0.18, end: 0.271 },  // Slide 1
            { start: 0.271, end: 0.362 }, // Slide 2
            { start: 0.362, end: 0.453 }, // Slide 3
            { start: 0.453, end: 0.544 }, // Slide 4
            { start: 0.544, end: 0.635 }, // Slide 5
            { start: 0.635, end: 0.726 }, // Slide 6
            { start: 0.726, end: 0.817 }, // Slide 7
            { start: 0.817, end: 0.908 }, // Slide 8
            { start: 0.908, end: 1.0 }    // Slide 9
        ];

        function getSlideFromProgress(progress) {
            for (let i = 0; i < slideRanges.length; i++) {
                const r = slideRanges[i];
                if (progress >= r.start && progress < r.end) {
                    return i;
                }
            }
            return slideRanges.length - 1;
        }

        function getProgressForSlide(index) {
            if (index < 0 || index >= slideRanges.length) return 0.5;
            const r = slideRanges[index];
            if (index === 0) {
                // Ir a un punto donde las cajas ya estén reveladas y se pueda leer la info (e.g. 0.15)
                return 0.15;
            }
            return (r.start + r.end) / 2;
        }

        // Scoped DOM Elements to prevent clashes
        const root = document.getElementById("gpk-products-widget");
        if (!root) return;

                const board = root.querySelector("#products-board");
        const tracker = root.querySelector(".products-scroll-tracker");
        const prevBtn = root.querySelector("#p-prev-btn");
        const nextBtn = root.querySelector("#p-next-btn");
        const dotsContainer = root.querySelector("#footer-dots");
        const widgetProductionBaseURL = "https://grupak-widgets.vercel.app/widgets/productos-interactivos";
        const widgetBaseURL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? "/widgets/productos-interactivos"
            : widgetProductionBaseURL;

        // Dynamically set logo src to support both local preview and production
        const logo = board ? board.querySelector(".preloader-logo") : null;
        const heroHome = board ? board.querySelector("#gpk-hero-home") : null;
        if (heroHome && heroHome.parentElement !== root) {
            root.appendChild(heroHome);
        }

        if (logo) {
            logo.src = `${widgetBaseURL}/logoGrupak.svg`;
        }
        if (heroHome) {
            const heroImg = heroHome.querySelector(".gpk-hero-home-img");
            const kpiBgs = heroHome.querySelectorAll(".gpk-hero-kpi-bg");

            if (heroImg) heroImg.src = `${widgetBaseURL}/images/hero-home.webp`;
            kpiBgs.forEach(bg => {
                bg.src = `${widgetBaseURL}/images/vector%20hero%20home.svg`;
            });
        }

        const cajasMainImage = board ? board.querySelector(".cajas-main-image") : null;
        if (cajasMainImage) {
            cajasMainImage.src = `${widgetBaseURL}/images/Cajas%20y%20empaques%201.webp`;
        }

        const digitalMainImage = board ? board.querySelector(".digital-main-image") : null;
        if (digitalMainImage) {
            digitalMainImage.src = `${widgetBaseURL}/images/Cajas%20y%20empaques%202-1.webp`;
        }

        // Slide 0 pillar contour/image pairs (Lámina, Papel, Grabados)
        const pillarImageAssets = {
            lamina: "laminas",
            rollo: "papel",
            grabados: "grabado"
        };
        Object.keys(pillarImageAssets).forEach(pillarKey => {
            const assetName = pillarImageAssets[pillarKey];
            const wrapper = board ? board.querySelector(`#p-${pillarKey}`) : null;
            if (!wrapper) return;
            const contourImg = wrapper.querySelector(".pillar-contour-img");
            const fillImg = wrapper.querySelector(".pillar-img");
            if (contourImg) contourImg.src = `${widgetBaseURL}/images/slide%200%20no%20bg/${assetName}%20contorno.png`;
            if (fillImg) fillImg.src = `${widgetBaseURL}/images/slide%200%20no%20bg/${assetName}%20imagen.png`;
        });

        const cajaWrapper = board ? board.querySelector("#p-caja") : null;
        if (cajaWrapper) {
            const contourImg = cajaWrapper.querySelector(".pillar-contour-img");
            const fillImg = cajaWrapper.querySelector(".pillar-img");
            if (contourImg) contourImg.src = `${widgetBaseURL}/images/slide%200%20no%20bg/caja%20Image%201%20caja%20contorno.webp`;
            if (fillImg) fillImg.src = `${widgetBaseURL}/images/slide%200%20no%20bg/caja%20Image%201.webp`;
        }

        function startHeroIntro() {
            if (!heroHome) return;

            heroHome.classList.add("is-running");
            updateHeroIntroOnScroll(0);
        }

        function updateHeroIntroOnScroll(progress) {
            if (!heroHome) return;

            const fadeStart = 0.004;
            const fadeEnd = 0.032;
            const fadeProgress = Math.max(0, Math.min(1, (progress - fadeStart) / (fadeEnd - fadeStart)));
            const opacity = 1 - fadeProgress;

            heroHome.style.opacity = opacity;
            heroHome.classList.toggle("is-scroll-hidden", opacity <= 0.01);
        }

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
                board.style.setProperty('--board-scale', 1);
                board.style.transform = "none";
                return;
            }

            const scaleX = window.innerWidth / 1850;
            const scaleY = window.innerHeight / 1030;
            const scale = Math.min(scaleX, scaleY, 1);
            board.style.setProperty('--board-scale', scale);
            board.style.transform = `scale(${scale})`;
        }

        // --- Slide Controller ---
        function goToSlide(index) {
            if (index < 0 || index >= totalSlides) return;

            // Desktop scroll management
            const rect = tracker.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const trackerTop = rect.top + scrollTop;
            const scrollHeight = rect.height - window.innerHeight;

            const targetProgress = getProgressForSlide(index);
            const targetScrollY = trackerTop + targetProgress * scrollHeight;

            currentSlide = index; // Update immediately for responsive UI
            updateUI();

            window.scrollTo({
                top: targetScrollY,
                behavior: "smooth"
            });
        }

        window.gpkGoToProductsSlide = function(index) {
            goToSlide(index);
        };
        window.dispatchEvent(new CustomEvent("gpkProductsReady"));

        function handleScroll() {
            const rect = tracker.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const trackerTop = rect.top + scrollTop;
            const scrollHeight = rect.height - window.innerHeight;

            const relativeScroll = scrollTop - trackerTop;
            let progress = relativeScroll / scrollHeight;
            progress = Math.max(0, Math.min(1, progress));
            lastScrollProgress = progress;

            // Run preloader scroll animation
            updateHeroIntroOnScroll(progress);
            updatePreloaderOnScroll(progress);

            const targetSlide = getSlideFromProgress(progress);

            if (targetSlide !== currentSlide) {
                currentSlide = targetSlide;
                updateUI();
            }
            
            // Update scroll-driven text blocks on desktop
            updateSlideZeroRevealOnScroll(progress);
            updatePaperTextBlocksOnScroll(progress);
        }

        // Caja, Lámina, Papel and Grabados reveal in two scroll-scrubbed stages within
        // their own slice of the reveal range: first the contour fades in, then (on
        // further scroll) the image fills it in via a clip-path wipe while the contour
        // fades out.
        const pillarFillSegments = [
            { pillar: "caja", start: 0.082, end: 0.0965 },
            { pillar: "lamina", start: 0.0965, end: 0.111 },
            { pillar: "rollo", start: 0.111, end: 0.1255 },
            { pillar: "grabados", start: 0.1255, end: 0.14 }
        ];

        function updateSlideZeroRevealOnScroll(progress) {
            if (!board) return;

            const isSlideZeroActive = currentSlide === 0 && !board.classList.contains("preloading");

            // Caja, Lámina, Papel, Grabados: continuous scroll-driven contour -> fill
            pillarFillSegments.forEach(seg => {
                const wrapper = root.querySelector(`#p-${seg.pillar}`);
                if (!wrapper) return;
                const contourImg = wrapper.querySelector(".pillar-contour-img");
                const fillImg = wrapper.querySelector(".pillar-img");
                if (!contourImg || !fillImg) return;

                if (!isSlideZeroActive) {
                    // Let the stylesheet rules for other modes/slides take back over
                    contourImg.style.opacity = "";
                    fillImg.style.opacity = "";
                    fillImg.style.clipPath = "";
                    return;
                }

                const local = Math.max(0, Math.min(1, (progress - seg.start) / (seg.end - seg.start)));
                const contourPhase = Math.max(0, Math.min(1, local * 2));       // first half: contour fades in
                const fillPhase = Math.max(0, Math.min(1, (local - 0.5) * 2));  // second half: image fills in

                contourImg.style.opacity = contourPhase * (1 - fillPhase);
                fillImg.style.opacity = 1;
                fillImg.style.clipPath = `inset(${(1 - fillPhase) * 100}% 0 0 0)`;
            });
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

            // 4. Clean up papel text blocks when leaving mode 5 (if desktop, handled by scroll; on mobile, kept static)
            if (currentSlide !== 5) {
                const textBlocks = root.querySelectorAll(".papel-text-block");
                textBlocks.forEach(block => {
                    block.classList.remove("revealed");
                    block.classList.remove("active");
                });
            }

            updateSlideZeroRevealOnScroll(lastScrollProgress);
        }

        // --- Scroll-driven Papel text blocks (Mode 5) ---
        function updatePaperTextBlocksOnScroll(progress) {
            if (window.innerWidth <= 1024) return;
            const textBlocks = root.querySelectorAll(".papel-text-block");
            
            if (currentSlide === 5) {
                const r = slideRanges[5];
                const localProgress = (progress - r.start) / (r.end - r.start);
                
                const tlBlock = root.querySelector(".papel-text-block.tl");
                const blBlock = root.querySelector(".papel-text-block.bl");
                const trBlock = root.querySelector(".papel-text-block.tr");
                const brBlock = root.querySelector(".papel-text-block.br");
                
                if (tlBlock) {
                    tlBlock.classList.add("revealed");
                    tlBlock.classList.toggle("active", localProgress < 0.25);
                }
                
                if (blBlock) {
                    const isRevealed = localProgress >= 0.25;
                    blBlock.classList.toggle("revealed", isRevealed);
                    blBlock.classList.toggle("active", isRevealed && localProgress < 0.5);
                }
                
                if (trBlock) {
                    const isRevealed = localProgress >= 0.5;
                    trBlock.classList.toggle("revealed", isRevealed);
                    trBlock.classList.toggle("active", isRevealed && localProgress < 0.75);
                }
                
                if (brBlock) {
                    const isRevealed = localProgress >= 0.75;
                    brBlock.classList.toggle("revealed", isRevealed);
                    brBlock.classList.toggle("active", isRevealed);
                }
            } else {
                textBlocks.forEach(block => {
                    block.classList.remove("revealed");
                    block.classList.remove("active");
                });
            }
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

        // --- Scroll-driven Preloader Updates ---
        function updatePreloaderOnScroll(progress) {
            const preloader = root.querySelector("#gpk-preloader");
            if (!preloader) return;

            // Preloader animation range: 0% to 8% of scroll progress
            const preloaderLimit = 0.08;
            const p = Math.min(progress / preloaderLimit, 1);

            // Select elements
            const whiteBg = preloader.querySelector(".preloader-white-bg");
            const shapeContainer = preloader.querySelector(".preloader-shape-container");
            const fillPath = preloader.querySelector(".shape-fill-path");
            const strokePath = preloader.querySelector(".shape-stroke-path");
            const logo = preloader.querySelector(".preloader-logo");
            const boardOutline = preloader.querySelector(".preloader-board-outline");

            // --- STAGED SCROLL ANIMATION ---
            
            // 1. Stage 1: Logo fades in and scales slightly (p: 0 to 0.15)
            let logoOpacity = 0;
            let logoScale = 0.9;
            if (p <= 0.15) {
                const step = p / 0.15;
                logoOpacity = step;
                logoScale = 0.9 + 0.1 * step;
            } else if (p <= 0.6) {
                logoOpacity = 1;
                logoScale = 1.0;
            } else if (p <= 0.85) {
                const step = (p - 0.6) / 0.25;
                logoOpacity = 1 - step;
                logoScale = 1.0;
            }

            // Logo translateY displacement (Stage 4, p: 0.6 to 0.85)
            let logoTranslateY = 0;
            if (p > 0.6 && p <= 0.85) {
                const step = (p - 0.6) / 0.25;
                logoTranslateY = step * -80; // slides up by 80px
            } else if (p > 0.85) {
                logoTranslateY = -80;
            }

            if (logo) {
                logo.style.opacity = logoOpacity;
                logo.style.transform = `scale(${logoScale}) translateY(${logoTranslateY}px)`;
            }

            // 2. Stage 2: Shape container zooms down and white bg fades in (p: 0.15 to 0.4)
            let shapeScale = 5;
            let whiteBgOpacity = 0;
            if (p > 0.15 && p <= 0.4) {
                const step = (p - 0.15) / 0.25;
                shapeScale = 5 - 4 * step; // goes from 5 to 1
                whiteBgOpacity = step;
            } else if (p > 0.4) {
                shapeScale = 1.0;
                whiteBgOpacity = 1.0;
            }

            // Shape container fades and scales slightly during Stage 4 (p: 0.6 to 0.85)
            let shapeOpacity = 1;
            if (p > 0.6 && p <= 0.85) {
                const step = (p - 0.6) / 0.25;
                shapeOpacity = 1 - step;
                shapeScale = 1.0 + 0.1 * step; // scales up to 1.1
            } else if (p > 0.85) {
                shapeOpacity = 0;
                shapeScale = 1.1;
            }

            if (shapeContainer) {
                shapeContainer.style.opacity = shapeOpacity;
                shapeContainer.style.transform = `translate(-50%, -50%) scale(${shapeScale})`;
            }

            if (whiteBg) {
                // White bg fades out in Stage 4 (p: 0.6 to 0.85)
                let finalWhiteBgOpacity = whiteBgOpacity;
                if (p > 0.6 && p <= 0.85) {
                    const step = (p - 0.6) / 0.25;
                    finalWhiteBgOpacity = 1 - step;
                } else if (p > 0.85) {
                    finalWhiteBgOpacity = 0;
                }
                whiteBg.style.opacity = finalWhiteBgOpacity;
            }

            // 3. Stage 3: Shape fill path fades out and stroke path (dashed border) fades in (p: 0.4 to 0.6)
            let fillOpacity = 1;
            let strokeOpacity = 0;
            if (p > 0.4 && p <= 0.6) {
                const step = (p - 0.4) / 0.2;
                fillOpacity = 1 - step;
                strokeOpacity = step;
            } else if (p > 0.6) {
                fillOpacity = 0;
                strokeOpacity = 1;
            }

            if (fillPath) {
                fillPath.style.opacity = fillOpacity;
            }
            if (strokePath) {
                strokePath.style.opacity = strokeOpacity;
            }

            // 4. Stage 4: Board outline fades in (p: 0.6 to 0.85)
            let outlineOpacity = 0;
            if (p > 0.6 && p <= 0.85) {
                const step = (p - 0.6) / 0.25;
                outlineOpacity = step;
            } else if (p > 0.85) {
                outlineOpacity = 1.0;
            }

            // 5. Stage 5: Preloader itself fades out and pointer events disabled (p: 0.85 to 1.0)
            let preloaderOpacity = 1;
            let finalOutlineOpacity = outlineOpacity;
            if (p >= 0.85) {
                const step = (p - 0.85) / 0.15;
                preloaderOpacity = 1 - step;
                preloader.style.pointerEvents = step >= 0.8 ? "none" : "auto";
                finalOutlineOpacity = 1 - step; // Board outline also fades out
            } else {
                preloader.style.pointerEvents = "auto";
            }

            preloader.style.opacity = preloaderOpacity;

            if (boardOutline) {
                boardOutline.style.opacity = finalOutlineOpacity;
            }

            // --- CROSS-FADE BOARD CONTENT ---
            // Fade in Slide 0 contents (Intro pane, pillars, nav footer) as the preloader fades out.
            // When progress is <= 0.08 (preloader range), we manually interpolate opacity.
            // When progress is > 0.08, we CLEAR the inline style opacity so standard slide transitions work.
            const introPane = board.querySelector(".products-intro-pane");
            const pillarsContainer = board.querySelector(".floating-pillars-container");
            const navFooter = board.querySelector(".products-nav-footer");

            if (progress <= 0.08) {
                // Intro pane and other Slide 0 content fades in between preloader progress 0.6 to 0.85
                let contentOpacity = 0;
                if (p > 0.6) {
                    contentOpacity = Math.min((p - 0.6) / 0.25, 1);
                }
                if (introPane) introPane.style.opacity = contentOpacity;
                if (pillarsContainer) pillarsContainer.style.opacity = contentOpacity;
                if (navFooter) navFooter.style.opacity = contentOpacity;
            } else {
                // Clear inline opacity so the stylesheet classes (.mode-0, etc.) control them!
                if (introPane) introPane.style.opacity = "";
                if (pillarsContainer) pillarsContainer.style.opacity = "";
                if (navFooter) navFooter.style.opacity = "";
            }
        }

        // --- Initialize ---
        function init() {
            buildDots();
            scaleBoard();
            setupEvents();
            updateHeroIntroOnScroll(0);
            updatePreloaderOnScroll(0);
            board.classList.remove("preloading");
            updateUI();
            updateSlideZeroRevealOnScroll(0);
            startHeroIntro();
        }

        init();
    }
})();
