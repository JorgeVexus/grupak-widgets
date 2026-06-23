(function() {
    "use strict";

    const baseURL = "https://grupak-widgets.vercel.app/widgets/mas-alla-del-empaque";

    // 1. Inject CSS stylesheet dynamically if not already present
    if (!document.getElementById("gpk-mas-alla-styles")) {
        const link = document.createElement("link");
        link.id = "gpk-mas-alla-styles";
        link.rel = "stylesheet";
        link.href = `${baseURL}/mas-alla-del-empaque.css`;
        document.head.appendChild(link);
    }

    // 2. Fetch and inject HTML markup if root container exists
    const container = document.getElementById("gpk-mas-alla-widget-root");
    if (container) {
        fetch(`${baseURL}/mas-alla-del-empaque.html`)
            .then(res => {
                if (!res.ok) throw new Error("Error loading Mas Allá widget HTML");
                return res.text();
            })
            .then(html => {
                container.innerHTML = html;
                initWidget();
            })
            .catch(err => console.error("Error loading Mas Allá widget:", err));
    } else if (document.getElementById("gpk-mas-alla-widget")) {
        initWidget();
    }

    function initWidget() {
        const widget = document.getElementById("gpk-mas-alla-widget");
        if (!widget) return;

        const images = widget.querySelectorAll(".mas-alla-slide-img");
        const items = widget.querySelectorAll(".mas-alla-item");
        const spacer = widget.querySelector(".mas-alla-scroll-spacer");
        const wrapper = widget.querySelector(".mas-alla-sticky-wrapper");

        let currentIndex = -1;

        function updateActiveState(index) {
            if (index === currentIndex) return;
            currentIndex = index;

            // Update images
            images.forEach((img, idx) => {
                img.classList.toggle("active", idx === index);
            });

            // Update items
            items.forEach((item, idx) => {
                item.classList.toggle("active", idx === index);
            });
        }

        function handleScroll() {
            const rect = spacer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // We want to trigger the change based on the spacer's position relative to the viewport
            // The spacer is 400vh, meaning 100vh per slide
            const scrollProgress = -rect.top / (rect.height - viewportHeight);
            const progress = Math.max(0, Math.min(1, scrollProgress));
            
            // Map 0-1 to 0-3 (indices for 4 items)
            const index = Math.min(Math.floor(progress * 4), 3);
            
            updateActiveState(index);
        }

        // Use IntersectionObserver to only run scroll logic when widget is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener("scroll", handleScroll, { passive: true });
                    handleScroll(); // Initial check
                } else {
                    window.removeEventListener("scroll", handleScroll);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(widget);
    }
})();
