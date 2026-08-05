(function () {
    "use strict";

    // Reuses productos-interactivos.html/css as the single source of truth for content
    // and styling (same panes, same classes, same CSS transitions the original widget
    // already defines per "mode"). This widget only changes the TRIGGER: instead of one
    // sticky 1000vh canvas scrubbed continuously by scroll position, each mode becomes
    // its own section stacked in the document, and reveals by getting its "mode-N" class
    // added when it scrolls into view (IntersectionObserver), removed when it scrolls
    // back out — so the same CSS transition the original already authored for that mode
    // plays over time (not scroll delta) and replays every time you come back.
    //
    // One section system for every screen size. The original 1850x1030 desktop
    // canvas is always scaled down to fit; there is no alternate responsive reflow.
    const sourceProductionBaseURL = "https://grupak-widgets.vercel.app/widgets/productos-interactivos";
    const selfProductionBaseURL = "https://grupak-widgets.vercel.app/widgets/productos-secciones";
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const sourceBaseURL = isLocalHost ? "/widgets/productos-interactivos" : sourceProductionBaseURL;
    const selfBaseURL = isLocalHost ? "/widgets/productos-secciones" : selfProductionBaseURL;

    const assetVersion = "seccion-reveal-29";
    [
        ["gpk-ps-vendor-styles", "productos-secciones-vendor.css"],
        ["gpk-ps-styles", "productos-secciones.css"],
        ["gpk-ps-mobile-intro-styles", "productos-secciones-mobile-intro.css"],
        ["gpk-ps-mobile-overview-styles", "productos-secciones-mobile-overview.css"],
        ["gpk-ps-mobile-paper-styles", "productos-secciones-mobile-paper.css"],
        ["gpk-ps-mobile-laminas-styles", "productos-secciones-mobile-laminas.css"],
        ["gpk-ps-mobile-cajas-styles", "productos-secciones-mobile-cajas.css"],
        ["gpk-ps-mobile-grabados-styles", "productos-secciones-mobile-grabados.css"],
        ["gpk-ps-mobile-energia-styles", "productos-secciones-mobile-energia.css"]
    ].forEach(([id, file]) => {
        if (document.getElementById(id)) return;
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `${selfBaseURL}/${file}?v=${assetVersion}`;
        document.head.appendChild(link);
    });

    const container = document.getElementById("gpk-ps-widget-root");
    if (container) {
        fetch(`${selfBaseURL}/productos-secciones.html`)
            .then(res => {
                if (!res.ok) throw new Error("Error loading productos-secciones HTML");
                return res.text();
            })
            .then(html => {
                container.innerHTML = html;
                initWidget();
            })
            .catch(err => console.error("Error loading productos-secciones widget:", err));
    } else {
        initWidget();
    }

    function initWidget() {
        const root = document.getElementById("gpk-ps-widget");
        if (!root) return;

        fetch(`${sourceBaseURL}/productos-interactivos.html`)
            .then(res => {
                if (!res.ok) throw new Error("Error loading source productos-interactivos.html");
                return res.text();
            })
            .then(html => {
                const source = document.createElement("div");
                source.innerHTML = html;
                build(root, source);
            })
            .catch(err => console.error("Error loading source content for productos-secciones:", err));
    }

    // One section per original "mode" (0-14), same content/classes as the source widget.
    const desktopModes = [
        { mode: 0, label: "Introducción", selectors: ["#intro-pane"], pillars: true },
        { mode: 1, label: "Productos", selectors: ["#overview-pane"], pillars: true },
        { mode: 2, label: "Papel", selectors: ["#pane-papel"], papelBlocks: true },
        { mode: 3, label: "Papel", selectors: ["#pane-papel"] },
        { mode: 4, label: "Lámina", selectors: ["#pane-laminas"] },
        // Modes 5 & 6 were one continuous scroll-scrubbed transition (spec 1 shrinks
        // left, spec 2 slides in). Kept as ONE section that plays 5 -> 6 on a timer.
        { mode: 5, label: "Lámina", selectors: ["#pane-laminas-specs"], laminaSpecsSequence: true },
        // Cajas intro shows the #p-caja pillar as its hero image (vendor CSS makes it
        // big and centered only for mode-7; modes 8/9 use their own dedicated photos).
        { mode: 7, label: "Cajas y empaques", selectors: ["#pane-cajas"], pillars: true },
        { mode: 8, label: "Cajas y empaques", selectors: ["#pane-cajas"] },
        { mode: 9, label: "Cajas y empaques", selectors: ["#pane-cajas"] },
        // Modes 10-13 originally revealed one card each as you scrolled, but each
        // card's CSS rule already stays visible in every later mode (cumulative: by
        // mode-13 all 4 are showing). Kept as ONE section that plays 10 -> 13 on a timer.
        { mode: 10, label: "Grabados", selectors: ["#pane-grabados"], grabadosSequence: true },
        { mode: 14, label: "Energía", selectors: ["#pane-energia"] }
    ];

    // Nav groups shared by the desktop side-nav and the mobile bottom bar/sheet.
    // Multi-item groups (Papel, Lámina, Cajas y empaques) list every sub-section.
    const navGroups = [
        { label: "Introducción", items: [{ label: "Introducción", mode: 0 }] },
        { label: "Productos", items: [{ label: "Productos", mode: 1 }] },
        { label: "Papel", items: [
            { label: "Introducción", mode: 2 },
            { label: "Catálogo", mode: 3 }
        ] },
        { label: "Lámina", items: [
            { label: "Introducción", mode: 4 },
            { label: "Especificaciones", mode: 5 }
        ] },
        { label: "Cajas y empaques", items: [
            { label: "Introducción", mode: 7 },
            { label: "Convencionales", mode: 8 },
            { label: "Impresión digital", mode: 9 }
        ] },
        { label: "Grabados", items: [{ label: "Grabados", mode: 10 }] },
        { label: "Energía", items: [{ label: "Energía", mode: 14 }] }
    ];

    function build(root, source) {
        buildFlow(root, source);

        swapLaminasStackImages(root);
        resolveAssetURLs(root);
        prepareMobileCajasContent(root);
        scaleDesktopBoards(root);
        setupReveal(root);
        setupMobilePaperCatalogReveal(root);
        setupMobileLaminasReveal(root);
        setupMobileCajasReveal(root);
        prepareMobileGrabadosContent(root);
        setupMobileGrabadosReveal(root);
        prepareMobileEnergiaContent(root);
        setupMobileEnergiaReveal(root);
        setupSideNav(root);
        setupSideNavVisibility(root);

        window.addEventListener("resize", () => scaleDesktopBoards(root));

        window.gpkGoToProductsSection = function (labelOrMode) {
            goToMode(root, labelOrMode);
        };
        window.dispatchEvent(new CustomEvent("gpkProductsSeccionesReady"));
    }

    function cloneInto(wrapper, source, selectors) {
        selectors.forEach(selector => {
            const node = source.querySelector(selector);
            if (node) wrapper.appendChild(node.cloneNode(true));
        });
    }

    function buildFlow(root, source) {
        const flow = root.querySelector("#ps-flow-desktop");
        if (!flow) return;

        desktopModes.forEach(entry => {
            const screen = document.createElement("section");
            screen.className = "ps-screen";
            screen.dataset.mode = String(entry.mode);
            screen.dataset.label = entry.label;
            if (entry.mode === 0) screen.classList.add("ps-mobile-intro-v1");
            if (entry.mode === 1) screen.classList.add("ps-mobile-overview-v1");
            if (entry.mode === 2) screen.classList.add("ps-mobile-paper-intro-v1");
            if (entry.mode === 3) screen.classList.add("ps-mobile-paper-catalog-v1");
            if (entry.mode === 4) screen.classList.add("ps-mobile-laminas-intro-v1");
            if (entry.mode === 5) screen.classList.add("ps-mobile-laminas-specs-v1");
            if (entry.mode === 7) screen.classList.add("ps-mobile-cajas-intro-v1");
            if (entry.mode === 8) screen.classList.add("ps-mobile-cajas-conventional-v1");
            if (entry.mode === 9) screen.classList.add("ps-mobile-cajas-digital-v1");
            if (entry.mode === 10) screen.classList.add("ps-mobile-grabados-v1");
            if (entry.mode === 14) screen.classList.add("ps-mobile-energia-v1");
            if (entry.laminaSpecsSequence) screen.dataset.laminaSpecsSequence = "1";
            if (entry.papelBlocks) screen.dataset.papelBlocks = "1";
            if (entry.grabadosSequence) screen.dataset.grabadosSequence = "1";

            const board = document.createElement("div");
            board.className = "products-board ps-board-clone";
            cloneInto(board, source, entry.selectors);

            if (entry.pillars) {
                const pillars = source.querySelector("#pillars-container");
                if (pillars) {
                    const pillarsClone = pillars.cloneNode(true);
                    // Mode 0 only: place the photo group right before the KPI
                    // grid (inside the intro pane) so the mobile reflow shows
                    // title -> description -> photo -> KPIs, matching the
                    // approved reference order.
                    const kpisGrid = entry.mode === 0
                        ? board.querySelector(".products-intro-pane .intro-kpis-grid-new")
                        : null;
                    if (kpisGrid) {
                        kpisGrid.parentElement.insertBefore(pillarsClone, kpisGrid);
                    } else {
                        board.appendChild(pillarsClone);
                    }
                }
            }

            screen.appendChild(board);
            flow.appendChild(screen);
        });
    }

    function resolveAssetURLs(root) {
        const assetPrefix = "widgets/productos-interactivos/";
        root.querySelectorAll("img[src]").forEach(img => {
            const src = img.getAttribute("src");
            if (!src || !src.startsWith(assetPrefix)) return;
            img.src = rebuildAssetURL(src.slice(assetPrefix.length));
        });
        root.querySelectorAll(".grabados-green-card[data-index]").forEach(card => {
            const index = card.getAttribute("data-index");
            card.style.backgroundImage = `url("${sourceBaseURL}/images/slide-grabados/grabados%20${index.padStart(2, "0")}.webp")`;
        });
    }

    function rebuildAssetURL(relativePath) {
        return `${sourceBaseURL}/` + relativePath.split("/").map(encodeURIComponent).join("/");
    }

    // Swap the two Láminas stack images (Kraft / Blanco) whose source PNGs are
    // missing/broken for the updated webp assets shipped in this widget's own
    // images/seccion-laminas folder. Runs before resolveAssetURLs so the
    // swapped src points at selfBaseURL (this widget), not the shared source.
    function swapLaminasStackImages(root) {
        root.querySelectorAll("img[src]").forEach(img => {
            const src = img.getAttribute("src") || "";
            const marker = "images/slide-laminas/Láminas de cartón corrugado";
            if (!src.includes(marker) || !src.endsWith(".png")) return;
            const file = src
                .replace(/^.*?images\/slide-laminas\//, "")
                .replace(/\.png$/, ".webp");
            img.src = `${selfBaseURL}/images/seccion-laminas/` + encodeURIComponent(file);
        });
    }

    function prepareMobileCajasContent(root) {
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const intro = root.querySelector('.ps-screen[data-mode="7"].ps-mobile-cajas-intro-v1');
        const conventional = root.querySelector('.ps-screen[data-mode="8"].ps-mobile-cajas-conventional-v1');
        const digital = root.querySelector('.ps-screen[data-mode="9"].ps-mobile-cajas-digital-v1');
        if (!intro || !conventional || !digital) return;

        const introHeadings = intro.querySelectorAll(".cajas-column h2");
        if (introHeadings[0]) introHeadings[0].textContent = "Soluciones Convencionales";
        if (introHeadings[1]) introHeadings[1].textContent = "Impresión Digital";

        const idealCard = conventional.querySelector(".cajas-paragraph-2");
        if (idealCard && !idealCard.querySelector(".ps-cajas-card-label")) {
            const copy = idealCard.textContent.trim().replace(/^Ideales para\s*/i, "");
            idealCard.innerHTML = `<strong class="ps-cajas-card-label">Ideales para:</strong>${copy}`;
        }

        const technologyCard = digital.querySelector(".digital-paragraph-2");
        if (technologyCard && !technologyCard.querySelector(".ps-cajas-card-label")) {
            const copy = technologyCard.textContent.trim();
            technologyCard.innerHTML = `<strong class="ps-cajas-card-label">Tecnología Single Pass</strong>${copy}`;
        }
    }

    // Fit the fixed 1850x1030 desktop canvas to the available width, capped at 1:1.
    function scaleDesktopBoards(root) {
        const flow = root.querySelector("#ps-flow-desktop");
        if (!flow) return;
        const width = flow.clientWidth || window.innerWidth;
        const desktopGutter = width >= 1025 ? 96 : 0;
        const usableWidth = Math.max(width - desktopGutter, 0);

        const scale = Math.min(usableWidth / 1850, 1);
        const adaptedMobileModes = new Set(["0", "1", "2", "3", "4", "5", "7", "8", "9", "10", "14"]);
        root.querySelectorAll(".ps-screen").forEach(screen => {
            const board = screen.querySelector(".products-board");
            if (!board) return;
            const entryMode = screen.dataset.mode;
            const isAdaptedMobile = adaptedMobileModes.has(entryMode)
                && window.matchMedia("(max-width: 767px)").matches;
            board.style.setProperty("--board-scale", scale);
            screen.style.height = isAdaptedMobile
                ? "auto"
                : `${Math.round(1030 * scale)}px`;
        });
    }

    // --- Reveal: add the exact "mode-N" class while the screen is in view, and
    // remove it when it scrolls out — so the same CSS transition the vendor
    // stylesheet already defines for that mode replays every time you come back. ---
    function setupReveal(root) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const screens = Array.from(root.querySelectorAll(".ps-screen"));
        const timers = new WeakMap();

        function clearTimers(board) {
            (timers.get(board) || []).forEach(id => window.clearTimeout(id));
            timers.set(board, []);
        }
        function addTimer(board, id) {
            (timers.get(board) || timers.set(board, []).get(board)).push(id);
        }

        function resetScreen(screen) {
            const board = screen.querySelector(".products-board");
            if (!board) return;
            clearTimers(board);
            board.className = board.className
                .replace(/\bmode-\d+\b/g, "")
                .replace(/\bps-pillars-play\b/g, "")
                .replace(/\s+/g, " ")
                .trim();
            board.querySelectorAll(".papel-text-block").forEach(el => el.classList.remove("revealed", "active"));
        }

        function playScreen(screen) {
            const board = screen.querySelector(".products-board");
            if (!board) return;
            clearTimers(board);
            // Force a reflow so a re-triggered CSS animation (contour/fill wipe)
            // actually restarts instead of being seen as "already applied".
            void board.offsetWidth;

            if (screen.dataset.laminaSpecsSequence) {
                // Same choreography as the original scroll-scrubbed transition:
                // spec 1 appears full-size first, then (after a beat) shrinks left
                // while spec 2 slides in — just timed instead of scroll-driven.
                board.classList.add("mode-5");
                addTimer(board, window.setTimeout(() => {
                    board.classList.remove("mode-5");
                    board.classList.add("mode-6");
                }, reduceMotion ? 0 : 1100));
                return;
            }

            if (screen.dataset.grabadosSequence) {
                // Each card's CSS rule already stays true across every later mode
                // (mode-11 keeps card 1 visible AND adds card 2, etc.), so simply
                // adding the classes in order makes all 4 end up on screen together.
                ["mode-10", "mode-11", "mode-12", "mode-13"].forEach((cls, i) => {
                    addTimer(board, window.setTimeout(() => board.classList.add(cls), reduceMotion ? 0 : i * 260));
                });
                return;
            }

            board.classList.add(`mode-${screen.dataset.mode}`);

            if (screen.dataset.mode === "0") {
                addTimer(board, window.setTimeout(() => board.classList.add("ps-pillars-play"), reduceMotion ? 0 : 60));
            }
            if (screen.dataset.papelBlocks) {
                playPapelTextBlocks(board, reduceMotion, addTimer);
            }
        }

        // Original quarter-by-quarter reveal (updatePaperTextBlocksOnScroll), timed:
        // each block fades/slides in and turns green while it's "current"; the
        // previous one turns back to grey. The last one (br) stays green.
        function playPapelTextBlocks(board, reduceMotion, addTimer) {
            const order = ["tl", "bl", "tr", "br"];
            const blocks = order
                .map(cls => board.querySelector(`.papel-text-block.${cls}`))
                .filter(Boolean);
            const step = reduceMotion ? 0 : 650;
            blocks.forEach((el, i) => {
                addTimer(board, window.setTimeout(() => {
                    el.classList.add("revealed", "active");
                    const prev = blocks[i - 1];
                    if (prev) prev.classList.remove("active");
                }, i * step));
            });
        }

        if (reduceMotion || typeof IntersectionObserver === "undefined") {
            screens.forEach(playScreen);
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Reset right before playing too (not just on exit) so the
                    // animation is guaranteed to replay even if the exit event
                    // was missed (fast scroll, a direct nav jump, etc.).
                    resetScreen(entry.target);
                    playScreen(entry.target);
                } else {
                    resetScreen(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: "-10% 0px -10% 0px" });

        screens.forEach(s => observer.observe(s));
    }

    function setupMobilePaperCatalogReveal(root) {
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const cards = Array.from(root.querySelectorAll(
            '.ps-screen[data-mode="3"].ps-mobile-paper-catalog-v1 .product-card'
        ));
        if (!cards.length) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion || typeof IntersectionObserver === "undefined") {
            cards.forEach(card => card.classList.add("ps-card-revealed"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const card = entry.target;
                observer.unobserve(card);
                window.setTimeout(() => {
                    card.classList.add("ps-card-revealed");
                }, 150);
            });
        }, { threshold: 0.2 });

        cards.forEach(card => observer.observe(card));
    }

    function setupMobileLaminasReveal(root) {
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const intro = root.querySelector('.ps-screen[data-mode="4"].ps-mobile-laminas-intro-v1');
        const specs = root.querySelector('.ps-screen[data-mode="5"].ps-mobile-laminas-specs-v1');
        if (!intro || !specs) return;

        [
            intro.querySelector(".laminas-main-title"),
            intro.querySelector(".laminas-intro-left"),
            intro.querySelector(".laminas-intro-right"),
            intro.querySelector(".stack-1"),
            intro.querySelector(".stack-2"),
            specs.querySelector(".laminas-main-title"),
            specs.querySelector(".spec-group-1"),
            specs.querySelector(".spec-group-2")
        ].filter(Boolean).forEach(element => element.dataset.psLaminasReveal = "1");

        const firstDescription = specs.querySelector(".spec-group-1 .spec-desc");
        if (firstDescription && !firstDescription.querySelector(".ps-laminas-measure")) {
            const description = firstDescription.textContent.trim().replace(/^283 cm,\s*/i, "");
            firstDescription.innerHTML = `<strong class="ps-laminas-measure">283 cm</strong>${description}`;
        }

        const elements = Array.from(root.querySelectorAll("[data-ps-laminas-reveal]"));
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion || typeof IntersectionObserver === "undefined") {
            elements.forEach(element => element.classList.add("ps-laminas-revealed"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const element = entry.target;
                observer.unobserve(element);
                window.setTimeout(() => {
                    element.classList.add("ps-laminas-revealed");
                }, 150);
            });
        }, { threshold: 0.2 });

        elements.forEach(element => observer.observe(element));
    }

    function setupMobileCajasReveal(root) {
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const intro = root.querySelector('.ps-screen[data-mode="7"].ps-mobile-cajas-intro-v1');
        const conventional = root.querySelector('.ps-screen[data-mode="8"].ps-mobile-cajas-conventional-v1');
        const digital = root.querySelector('.ps-screen[data-mode="9"].ps-mobile-cajas-digital-v1');
        if (!intro || !conventional || !digital) return;

        const conventionalCopy = conventional.querySelector(".cajas-text-container");
        const digitalCopy = digital.querySelector(".digital-text-content");
        [conventionalCopy, digitalCopy]
            .filter(Boolean)
            .forEach(element => element.classList.add("ps-cajas-main-copy"));

        [
            intro.querySelector(".cajas-mobile-hero-container"),
            intro.querySelector(".pane-header-centered"),
            ...intro.querySelectorAll(".cajas-column"),
            conventional.querySelector(".cajas-image-container"),
            conventionalCopy,
            conventional.querySelector(".cajas-paragraph-2"),
            digital.querySelector(".digital-image-container"),
            digitalCopy,
            digital.querySelector(".digital-paragraph-2")
        ].filter(Boolean).forEach(element => element.dataset.psCajasReveal = "1");

        const elements = Array.from(root.querySelectorAll("[data-ps-cajas-reveal]"));
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion || typeof IntersectionObserver === "undefined") {
            elements.forEach(element => element.classList.add("ps-cajas-revealed"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const element = entry.target;
                observer.unobserve(element);
                window.setTimeout(() => {
                    element.classList.add("ps-cajas-revealed");
                }, 150);
            });
        }, { threshold: 0.2 });

        elements.forEach(element => observer.observe(element));
    }

    function setupMobileGrabadosReveal(root) {
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const screen = root.querySelector('.ps-screen[data-mode="10"].ps-mobile-grabados-v1');
        if (!screen) return;

        [
            screen.querySelector(".grabados-main-title"),
            screen.querySelector(".grabados-intro-text"),
            ...screen.querySelectorAll(".grabados-green-card")
        ].filter(Boolean).forEach(element => element.dataset.psGrabadosReveal = "1");

        const elements = Array.from(screen.querySelectorAll("[data-ps-grabados-reveal]"));
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion || typeof IntersectionObserver === "undefined") {
            elements.forEach(element => element.classList.add("ps-grabados-revealed"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const element = entry.target;
                observer.unobserve(element);
                window.setTimeout(() => {
                    element.classList.add("ps-grabados-revealed");
                }, 150);
            });
        }, { threshold: 0.2 });

        elements.forEach(element => observer.observe(element));
    }

    function prepareMobileGrabadosContent(root) {
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const screen = root.querySelector('.ps-screen[data-mode="10"].ps-mobile-grabados-v1');
        if (!screen) return;

        const intro = screen.querySelector(".grabados-intro-text");
        if (intro) {
            intro.textContent = "Servicio integral de grabados y preprensa para la industria del empaque. Desarrollamos y montamos placas asegurando reproducción fiel de arte.";
        }

        const mobileCopy = [
            {
                title: "Preprensa y adaptación",
                description: "Adaptación de arte al empaque para diferentes sustratos (corrugado, flexible, papel, etiquetas)."
            },
            {
                title: "Color Management",
                description: "Gestión de color y simulación de transparencias para mantener consistencia de marca entre líneas de producto."
            },
            {
                title: "Montaje y ajuste de placas",
                description: "Montaje en distintos espesores con corrección de distorsión y registro para altos volúmenes de impresión."
            },
            {
                title: "Retoque y soporte en planta",
                description: "Aplicando mejores prácticas para mejorar la calidad de impresión y eficiencia en arranques de prensa."
            }
        ];

        screen.querySelectorAll(".grabados-green-card").forEach((card, index) => {
            const copy = mobileCopy[index];
            if (!copy) return;
            const title = card.querySelector(".grabados-card-title");
            const description = card.querySelector(".grabados-card-desc");
            if (title) title.textContent = copy.title;
            if (description) description.textContent = copy.description;
        });
    }

    function prepareMobileEnergiaContent(root) {
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const screen = root.querySelector('.ps-screen[data-mode="14"].ps-mobile-energia-v1');
        if (!screen) return;

        const descriptions = [
            "Alcanzamos hasta un 80% de rendimiento energético mediante nuestra tecnología de cogeneración simultánea.",
            "Al aprovechar mejor el combustible, reducimos emisiones y mejoramos nuestra huella de carbono industrial.",
            "Generamos parte importante de la energía que utilizamos, asegurando continuidad operativa total en planta."
        ];
        screen.querySelectorAll(".energia-row").forEach((row, index) => {
            const paragraph = row.querySelector(".energia-row-content p");
            if (paragraph && descriptions[index]) paragraph.textContent = descriptions[index];
        });
    }

    function setupMobileEnergiaReveal(root) {
        if (!window.matchMedia("(max-width: 767px)").matches) return;

        const screen = root.querySelector('.ps-screen[data-mode="14"].ps-mobile-energia-v1');
        if (!screen) return;

        [
            screen.querySelector(".energia-main-title"),
            screen.querySelector(".energia-intro-text"),
            ...screen.querySelectorAll(".energia-row")
        ].filter(Boolean).forEach(element => element.dataset.psEnergiaReveal = "1");

        const elements = Array.from(screen.querySelectorAll("[data-ps-energia-reveal]"));
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion || typeof IntersectionObserver === "undefined") {
            elements.forEach(element => element.classList.add("ps-energia-revealed"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const element = entry.target;
                observer.unobserve(element);
                window.setTimeout(() => {
                    element.classList.add("ps-energia-revealed");
                }, 150);
            });
        }, { threshold: 0.2 });

        elements.forEach(element => observer.observe(element));
    }

    function goToMode(root, labelOrMode) {
        let mode = labelOrMode;
        if (typeof labelOrMode === "string" && isNaN(Number(labelOrMode))) {
            const group = navGroups.find(g => g.label === labelOrMode);
            mode = group ? group.items[0].mode : 0;
        }
        const screen = root.querySelector(`.ps-screen[data-mode="${mode}"]`);
        if (!screen) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        screen.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }

    // --- Desktop: slim dot rail with hover flyout labels ---
    function setupSideNav(root) {
        const list = root.querySelector("#ps-side-nav-list");
        if (!list) return;
        list.innerHTML = "";

        navGroups.forEach(group => {
            const li = document.createElement("li");
            li.className = group.items.length > 1 ? "ps-side-group" : "";

            const btn = document.createElement("button");
            btn.type = "button";
            btn.dataset.psMode = String(group.items[0].mode);
            btn.innerHTML = `<span class="ps-side-dot"></span><span class="ps-side-label">${group.label}</span>`;
            btn.addEventListener("click", () => goToMode(root, group.items[0].mode));
            li.appendChild(btn);

            if (group.items.length > 1) {
                const subList = document.createElement("ul");
                subList.className = "ps-side-sublist";
                group.items.forEach(item => {
                    const subLi = document.createElement("li");
                    const subBtn = document.createElement("button");
                    subBtn.type = "button";
                    subBtn.dataset.psMode = String(item.mode);
                    subBtn.innerHTML = `<span class="ps-side-dot ps-side-dot-sub"></span><span class="ps-side-label">${item.label}</span>`;
                    subBtn.addEventListener("click", () => goToMode(root, item.mode));
                    subLi.appendChild(subBtn);
                    subList.appendChild(subLi);
                });
                li.appendChild(subList);
            }

            list.appendChild(li);
        });

        const screens = Array.from(root.querySelectorAll(".ps-screen"));
        if (typeof IntersectionObserver === "undefined" || !screens.length) return;

        function setActive(mode) {
            let activeMode = 0;
            navGroups.forEach(g => g.items.forEach(item => {
                if (item.mode <= mode) activeMode = item.mode;
            }));
            list.querySelectorAll("button").forEach(btn => {
                btn.classList.toggle("ps-active", Number(btn.dataset.psMode) === activeMode);
            });
        }

        const observer = new IntersectionObserver(entries => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) setActive(Number(visible.target.dataset.mode));
        }, { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.2, 0.5, 0.8] });

        screens.forEach(s => observer.observe(s));
        setActive(0);
    }

    function setupSideNavVisibility(root) {
        if (typeof IntersectionObserver === "undefined") {
            root.classList.add("ps-nav-visible");
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                root.classList.toggle("ps-nav-visible", entry.isIntersecting);
            });
        }, { threshold: 0 });

        observer.observe(root);
    }

})();
