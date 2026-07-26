(function () {
    "use strict";

    var isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
    var widgetsBaseURL = isLocalhost ? "widgets" : "https://grupak-widgets.vercel.app/widgets";
    var baseURL = widgetsBaseURL + "/chat-flotante";
    var assetVersion = "20260725-task-4";
    var controllerKey = "gpkFloatingChatController";
    var mountGenerationKey = "gpkFloatingChatMountGeneration";

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
        if (root.getAttribute("data-gpk-chat-ready") === "true" && root.querySelector("[data-gpk-chat-widget]")) return;
        if (root.getAttribute("data-gpk-chat-loading") === "true") return;

        cleanupPreviousController();
        root.removeAttribute("data-gpk-chat-ready");
        root.setAttribute("data-gpk-chat-loading", "true");
        var mountGeneration = (window[mountGenerationKey] || 0) + 1;
        window[mountGenerationKey] = mountGeneration;

        fetch(baseURL + "/chat-flotante.html?v=" + assetVersion)
            .then(function (response) {
                if (!response.ok) throw new Error("Error loading floating chat HTML");
                return response.text();
            })
            .then(function (html) {
                if (!isCurrentMount(root, mountGeneration)) return;
                root.innerHTML = html;
                initializeWidget(root, mountGeneration);
            })
            .catch(function (error) {
                root.removeAttribute("data-gpk-chat-loading");
                console.error("[gpk-floating-chat]", error);
            });
    }

    function isCurrentMount(root, mountGeneration) {
        return window[mountGenerationKey] === mountGeneration &&
            document.getElementById("gpk-floating-chat-root") === root &&
            root.isConnected;
    }

    function cleanupPreviousController() {
        var previousController = window[controllerKey];
        if (previousController && typeof previousController.cleanup === "function") {
            previousController.cleanup();
        }
    }

    function initializeWidget(root, mountGeneration) {
        if (!isCurrentMount(root, mountGeneration)) return;
        var widget = root.querySelector("[data-gpk-chat-widget]");
        var panel = root.querySelector("[data-gpk-chat-panel]");
        var launcher = root.querySelector("[data-gpk-chat-launcher]");
        var closeButton = root.querySelector("[data-gpk-chat-close]");
        var avatar = root.querySelector("[data-gpk-chat-avatar]");
        var views = root.querySelectorAll("[data-view]");
        var states = ["greeting", "main", "contact", "products", "information"];
        var isOpen = false;

        if (!widget || !panel || !launcher || !closeButton || !views.length) {
            root.removeAttribute("data-gpk-chat-loading");
            return;
        }

        if (avatar) {
            avatar.src = widgetsBaseURL + "/footer/newsletter-people.png?v=" + assetVersion;
        }

        function showView(state) {
            if (states.indexOf(state) === -1) return;
            views.forEach(function (view) {
                view.hidden = view.getAttribute("data-view") !== state;
            });
            widget.setAttribute("data-state", state);

            if (isOpen) {
                var visibleView = root.querySelector('[data-view="' + state + '"]');
                var focusTarget = visibleView.querySelector(".gpk-chat__back") ||
                    visibleView.querySelector("[data-action]") ||
                    closeButton;
                focusTarget.focus();
            }
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

        function handleLauncherClick() {
            if (isOpen) closeWidget();
            else openWidget();
        }

        function handleWidgetClick(event) {
            var action = event.target.closest("[data-action]");
            if (!action || action.hasAttribute("data-final-action")) return;
            showView(action.getAttribute("data-action"));
        }

        function handleDocumentKeydown(event) {
            if (event.key === "Escape" && isOpen) closeWidget();
        }

        function cleanup() {
            launcher.removeEventListener("click", handleLauncherClick);
            closeButton.removeEventListener("click", closeWidget);
            widget.removeEventListener("click", handleWidgetClick);
            document.removeEventListener("keydown", handleDocumentKeydown);
        }

        cleanupPreviousController();
        launcher.addEventListener("click", handleLauncherClick);
        closeButton.addEventListener("click", closeWidget);
        widget.addEventListener("click", handleWidgetClick);
        document.addEventListener("keydown", handleDocumentKeydown);

        showView("greeting");
        widget.setAttribute("data-open", "false");
        root.removeAttribute("data-gpk-chat-loading");
        root.setAttribute("data-gpk-chat-ready", "true");
        window[controllerKey] = { cleanup: cleanup, root: root, showView: showView };
    }
})();
