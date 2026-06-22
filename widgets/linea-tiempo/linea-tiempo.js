(function() {
    "use strict";

    const baseURL = "https://grupak-widgets.vercel.app/widgets/linea-tiempo";

    // 1. Inject CSS stylesheet dynamically if not already present
    if (!document.getElementById("gpk-timeline-styles")) {
        const link = document.createElement("link");
        link.id = "gpk-timeline-styles";
        link.rel = "stylesheet";
        link.href = `${baseURL}/linea-tiempo.css`;
        document.head.appendChild(link);
    }

    // 2. Fetch and inject HTML markup if root container exists and hasn't been populated
    const container = document.getElementById("gpk-timeline-widget-root");
    if (container) {
        fetch(`${baseURL}/linea-tiempo.html`)
            .then(res => {
                if (!res.ok) throw new Error("Error loading timeline widget HTML");
                return res.text();
            })
            .then(html => {
                container.innerHTML = html;
                initWidget();
            })
            .catch(err => console.error("Error loading timeline widget:", err));
    } else if (document.getElementById("gpk-timeline-widget")) {
        // Fallback for direct integration / static pre-rendered containers
        initWidget();
    }

    // Encapsulated widget controller
    function initWidget() {
        // Milestones Data matching Figma design system coordinates
        const milestones = [
          { year: "1957", label: "Inicio de operaciones", top: 86 },
          { year: "1962", label: "Apertura de planta", top: 154 },
          { year: "1966", label: "Fabricación de papel", top: 215 },
          { year: "1983", label: "Abastecimientos", top: 276 },
          { year: "1985", label: "Corporativos", top: 337 },
          { year: "2003", label: "Planta Toluca", top: 398 },
          { year: "2009", label: "Suministro Toluca", top: 459 },
          { year: "2011", label: "Suministro Cuautitlán", top: 520 },
          { year: "2013", label: "Suministro Puebla", top: 581 },
          { year: "2014", label: "Querétaro", top: 642 },
          { year: "2015", label: "Suministro Hidalgo", top: 703 },
          { year: "2021", label: "Inicio WOWPAK", top: 764 },
          { year: "2023", label: "Adquisición de planta", top: 825 },
          { year: "2024", label: "Corrugado Hidalgo", top: 911 }
        ];

        let currentIndex = 0;
        let isAnimating = false;
        const animationDuration = 600;

        // Scoped DOM elements under the widget root
        const root = document.getElementById("gpk-timeline-widget");
        if (!root) return;

        const board = root.querySelector("#timeline-board");
        const tracker = root.querySelector(".timeline-scroll-tracker");
        const yearsSidebar = root.querySelector("#years-sidebar");
        const slides = root.querySelectorAll(".timeline-slide");
        const activeLine = root.querySelector("#active-line");
        const scrollbarIndicator = root.querySelector("#scrollbar-indicator");
        const prevBtn = root.querySelector("#prev-btn");
        const nextBtn = root.querySelector("#next-btn");
        const currentIndicator = root.querySelector("#current-slide");
        const totalIndicator = root.querySelector("#total-slides");

        // Widescreen Scale Fitting Logic (Figma: 1850x1028 bounds)
        function scaleTimelineBoard() {
          if (window.innerWidth <= 768) {
            board.style.transform = "none";
            return;
          }
          const scaleX = window.innerWidth / 1850;
          const scaleY = window.innerHeight / 1028;
          const scale = Math.min(scaleX, scaleY, 1);
          board.style.transform = `scale(${scale})`;
        }

        // Generate the vertical year nodes matching Figma pixel positions
        function renderSidebarYears() {
          yearsSidebar.innerHTML = "";
          
          milestones.forEach((item, index) => {
            const btn = document.createElement("button");
            btn.className = "year-item";
            btn.setAttribute("data-index", index);
            btn.setAttribute("aria-label", `Hito ${item.year}: ${item.label}`);
            
            // Set vertical coordinates on desktop
            btn.style.top = `${item.top}px`;
            
            // 1. Default green badge
            const badge = document.createElement("div");
            badge.className = "year-badge";
            badge.innerText = item.year;
            btn.appendChild(badge);
            
            // 2. Selected expanded card
            const card = document.createElement("div");
            card.className = "year-item-card";
            
            const cardBorder = document.createElement("div");
            cardBorder.className = "card-border";
            
            const labelBg = document.createElement("div");
            labelBg.className = "card-label-bg";
            const labelText = document.createElement("p");
            labelText.className = "card-label-text";
            labelText.innerText = item.label;
            labelBg.appendChild(labelText);
            
            const cardBadge = document.createElement("div");
            cardBadge.className = "card-badge";
            const cardBadgeText = document.createElement("p");
            cardBadgeText.className = "card-badge-text";
            cardBadgeText.innerText = item.year;
            cardBadge.appendChild(cardBadgeText);
            
            card.appendChild(cardBorder);
            card.appendChild(labelBg);
            card.appendChild(cardBadge);
            
            btn.appendChild(card);
            
            btn.addEventListener("click", () => {
              goToSlide(index);
            });
            
            yearsSidebar.appendChild(btn);
          });
          
          totalIndicator.innerText = milestones.length;
        }

        // Slide index navigator
        function goToSlide(index) {
          if (index < 0 || index >= milestones.length) {
            return;
          }

          if (window.innerWidth <= 768) {
            // Mobile navigation: Update immediately
            currentIndex = index;
            updateTimeline();
            return;
          }

          // Desktop: Scroll to the corresponding position in the scroll tracker
          const rect = tracker.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const trackerTop = rect.top + scrollTop;
          const scrollHeight = rect.height - window.innerHeight;

          const totalSlides = milestones.length;
          const targetProgress = (index + 0.5) / totalSlides;
          const targetScrollY = trackerTop + targetProgress * scrollHeight;

          currentIndex = index;
          updateTimeline();

          window.scrollTo({
            top: targetScrollY,
            behavior: "smooth"
          });
        }

        // Native Scroll handler for Desktop
        function handleScroll() {
          if (window.innerWidth <= 768) return;

          const rect = tracker.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const trackerTop = rect.top + scrollTop;
          const scrollHeight = rect.height - window.innerHeight;

          const relativeScroll = scrollTop - trackerTop;
          let progress = relativeScroll / scrollHeight;
          progress = Math.max(0, Math.min(1, progress));

          const totalSlides = milestones.length;
          const targetSlide = Math.min(Math.floor(progress * totalSlides), totalSlides - 1);

          if (targetSlide !== currentIndex) {
            currentIndex = targetSlide;
            updateTimeline();
          }
        }

        // Apply slide visual updates and state triggers
        function updateTimeline() {
          const yearButtons = root.querySelectorAll(".year-item");
          const progressRatio = currentIndex / (milestones.length - 1);
          const isMobile = window.innerWidth <= 768;
          
          // 1. Update slides active class
          slides.forEach((slide, idx) => {
            if (idx === currentIndex) {
              slide.classList.add("active");
            } else {
              slide.classList.remove("active");
            }
          });
          
          // 2. Select corresponding year item and center scroll on mobile
          yearButtons.forEach((btn, idx) => {
            if (idx === currentIndex) {
              btn.classList.add("selected");
              if (isMobile) {
                btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
              }
            } else {
              btn.classList.remove("selected");
            }
          });
          
          // 3. Scale active vertical green line (1957 starts at 114px, 2024 ends at 939px)
          if (!isMobile) {
            const activeHeight = 114 + progressRatio * (939 - 114);
            activeLine.style.height = `${activeHeight}px`;
          }
          
          // 4. Update scrollbar top offset (Figma bounds: 13px top to 775px top)
          if (!isMobile) {
            const scrollbarTop = 13 + progressRatio * (775 - 13);
            scrollbarIndicator.style.top = `${scrollbarTop}px`;
          }
          
          // 5. Update indicators
          currentIndicator.innerText = currentIndex + 1;
          
          // 6. Navigation button disable state toggle
          prevBtn.disabled = currentIndex === 0;
          nextBtn.disabled = currentIndex === milestones.length - 1;
        }

        // Setup DOM event listeners
        function setupEventListeners() {
          prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
          nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
          
          // Keyboard controls (only fire when widget container is on screen)
          document.addEventListener("keydown", (e) => {
            const rect = root.getBoundingClientRect();
            const isVisible = (rect.top < window.innerHeight && rect.bottom > 0);
            if (!isVisible) return;

            if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
              goToSlide(currentIndex - 1);
            } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
              goToSlide(currentIndex + 1);
            }
          });

          // Bind page scroll listener for desktop
          window.addEventListener("scroll", handleScroll, { passive: true });

          // Mobile Touch Swiping Support
          let touchStartX = 0;
          let touchEndX = 0;
          const slidesContainer = root.querySelector("#slides-container");
          
          if (slidesContainer) {
            slidesContainer.addEventListener("touchstart", (e) => {
              touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            slidesContainer.addEventListener("touchend", (e) => {
              touchEndX = e.changedTouches[0].screenX;
              handleSwipe();
            }, { passive: true });
          }

          function handleSwipe() {
            // Disabled on mobile vertical scroll feed
            return;
          }
          
          window.addEventListener("resize", () => {
            scaleTimelineBoard();
            updateTimeline();
          });
        }

        // Initialize execution flow
        renderSidebarYears();
        scaleTimelineBoard();
        setupEventListeners();
        
        setTimeout(updateTimeline, 100);
    }
})();
