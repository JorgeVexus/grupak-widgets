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
                // If local path, resolve relative to local folder or absolute base URL
                const cleanBase = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
                const cleanSrc = src.startsWith("/") ? src.slice(1) : src;
                
                // For local preview without a server prefix, resolve to widgets/... directly
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

        let currentIndex = -1;

        function updateActiveState(index) {
            if (index === currentIndex) return;
            currentIndex = index;

            // 1. Update active states for the left image slider
            images.forEach((img, idx) => {
                img.classList.toggle("active", idx === index);
            });

            // 2. Update active, inactive, and hidden classes on items for cascading indents
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

            // 3. Update divider vertical placement class
            if (divider) {
                divider.className = "mas-alla-divider";
                divider.classList.add(`state-${index}`);
            }
        }

        function handleScroll() {
            const rect = spacer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Check scroll progress relative to the scroll spacer (400vh tall)
            const scrollProgress = -rect.top / (rect.height - viewportHeight);
            const progress = Math.max(0, Math.min(1, scrollProgress));
            
            // Map progress to item indexes (0 to 3)
            const index = Math.min(Math.floor(progress * 4), 3);
            
            updateActiveState(index);
        }

        // Use IntersectionObserver to listen to scroll only when the widget is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.addEventListener("scroll", handleScroll, { passive: true });
                    handleScroll(); // Run initial synchronization
                } else {
                    window.removeEventListener("scroll", handleScroll);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(widget);
    }
})();
