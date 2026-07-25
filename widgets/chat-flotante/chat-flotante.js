(function () {
    "use strict";

    var isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
    var baseURL = isLocalhost ? "widgets/chat-flotante" : "https://grupak-widgets.vercel.app/widgets/chat-flotante";
    var assetVersion = "20260725-task-3";

    ensureStyles();
    mountWidget();

    function ensureStyles() {
        if (document.getElementById("gpk-floating-chat-styles")) return;
        var link = document.createElement("link");
        link.id = "gpk-floating-chat-styles";
        link.rel = "stylesheet";
        link.href = baseURL + "/chat-flotante.css?v=" + assetVersion;
        document.head.appendChild(link);
    }

    function mountWidget() {
        var root = document.getElementById("gpk-floating-chat-root");
        if (!root) return;
        fetch(baseURL + "/chat-flotante.html?v=" + assetVersion)
            .then(function (response) {
                if (!response.ok) throw new Error("Error loading floating chat HTML");
                return response.text();
            })
            .then(function (html) {
                root.innerHTML = html;
                initializeWidget(root);
            })
            .catch(function (error) {
                console.error("[gpk-floating-chat]", error);
            });
    }

    function initializeWidget(root) {
        var widget = root.querySelector("[data-gpk-chat-widget]");
        var panel = root.querySelector("[data-gpk-chat-panel]");
        var launcher = root.querySelector("[data-gpk-chat-launcher]");
        var closeButton = root.querySelector("[data-gpk-chat-close]");
        var views = root.querySelectorAll("[data-view]");
        var states = ["greeting", "main", "contact", "products", "information"];
        var isOpen = false;

        if (!widget || !panel || !launcher || !closeButton || !views.length) return;

        function showView(state) {
            if (states.indexOf(state) === -1) return;
            views.forEach(function (view) {
                view.hidden = view.getAttribute("data-view") !== state;
            });
            widget.setAttribute("data-state", state);
        }

        function openWidget() {
            isOpen = true;
            showView("greeting");
            panel.hidden = false;
            panel.setAttribute("aria-hidden", "false");
            launcher.setAttribute("aria-expanded", "true");
            widget.setAttribute("data-open", "true");
            closeButton.focus();
        }

        function closeWidget() {
            if (!isOpen) return;
            isOpen = false;
            panel.hidden = true;
            panel.setAttribute("aria-hidden", "true");
            launcher.setAttribute("aria-expanded", "false");
            widget.setAttribute("data-open", "false");
            launcher.focus();
        }

        launcher.addEventListener("click", function () {
            if (isOpen) closeWidget();
            else openWidget();
        });
        closeButton.addEventListener("click", closeWidget);
        widget.addEventListener("click", function (event) {
            var action = event.target.closest("[data-action]");
            if (!action || action.hasAttribute("data-final-action")) return;
            showView(action.getAttribute("data-action"));
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && isOpen) closeWidget();
        });

        showView("greeting");
        widget.setAttribute("data-open", "false");
    }
})();
