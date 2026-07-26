(function () {
    "use strict";

    var runtimeKey = "gpkFloatingChatRuntime";
    if (window[runtimeKey]) {
        window[runtimeKey].reconcile();
        return;
    }

    var script = document.currentScript ||
        document.querySelector('script[src*="chat-flotante.js"]');
    var isProduction = window.location.protocol !== "file:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1";
    var scriptBaseURL = script && script.src ? new URL(".", script.src) : null;
    var productionWidgetsURL = new URL("https://grupak-widgets.vercel.app/widgets/");
    var widgetsBaseURL = isProduction ? productionWidgetsURL : scriptBaseURL && new URL("../", scriptBaseURL);
    var chatBaseURL = isProduction ? new URL("chat-flotante/", productionWidgetsURL) : scriptBaseURL;
    var assetVersion = "20260725-task-5";
    var controllerKey = "gpkFloatingChatController";
    var mountGeneration = 0;
    var observedRoot = null;
    var scheduled = false;

    var observer = new MutationObserver(scheduleReconcile);
    window[runtimeKey] = { observer: observer, reconcile: reconcile, cleanup: cleanupRuntime };

    ensureStyles();
    observer.observe(document.documentElement, { childList: true, subtree: true });
    reconcile();

    function assetURL(relativePath) {
        return new URL(relativePath, widgetsBaseURL).href + "?v=" + assetVersion;
    }

    function ensureStyles() {
        if (document.getElementById("gpk-floating-chat-styles") || !chatBaseURL) return;
        var link = document.createElement("link");
        link.id = "gpk-floating-chat-styles";
        link.rel = "stylesheet";
        link.href = new URL("chat-flotante.css", chatBaseURL).href + "?v=" + assetVersion;
        document.head.appendChild(link);
    }

    function scheduleReconcile() {
        if (scheduled) return;
        scheduled = true;
        Promise.resolve().then(function () {
            scheduled = false;
            reconcile();
        });
    }

    function reconcile() {
        var root = document.getElementById("gpk-floating-chat-root");
        var controller = window[controllerKey];
        var rootChanged = observedRoot !== root;
        var widgetMissing = root && !root.querySelector("[data-gpk-chat-widget]");

        if (controller && (controller.root !== root || widgetMissing)) {
            controller.cleanup();
            window[controllerKey] = null;
        }
        if (rootChanged) {
            mountGeneration += 1;
            if (observedRoot) {
                observedRoot.removeAttribute("data-gpk-chat-loading");
                observedRoot.removeAttribute("data-gpk-chat-ready");
            }
            observedRoot = root;
        }
        if (!root) return;
        if (root.getAttribute("data-gpk-chat-ready") === "error") return;
        if (root.getAttribute("data-gpk-chat-ready") === "true" && !widgetMissing) return;
        if (root.getAttribute("data-gpk-chat-loading") === "true") return;
        mountWidget(root);
    }

    function mountWidget(root) {
        if (!chatBaseURL || !widgetsBaseURL || window.location.protocol === "file:") {
            root.innerHTML = '<p class="gpk-chat__load-error" role="status">Abre esta vista desde un servidor local para cargar el chat.</p>';
            root.setAttribute("data-gpk-chat-ready", "error");
            return;
        }
        root.removeAttribute("data-gpk-chat-ready");
        root.setAttribute("data-gpk-chat-loading", "true");
        var generation = ++mountGeneration;

        fetch(new URL("chat-flotante.html", chatBaseURL).href + "?v=" + assetVersion)
            .then(function (response) {
                if (!response.ok) throw new Error("Error loading floating chat HTML");
                return response.text();
            })
            .then(function (html) {
                if (!isCurrentMount(root, generation)) return;
                root.innerHTML = html;
                initializeWidget(root, generation);
            })
            .catch(function (error) {
                if (!isCurrentMount(root, generation)) return;
                root.removeAttribute("data-gpk-chat-loading");
                root.innerHTML = '<p class="gpk-chat__load-error" role="status">No fue posible cargar el chat.</p>';
                console.error("[gpk-floating-chat]", error);
            });
    }

    function isCurrentMount(root, generation) {
        return mountGeneration === generation &&
            document.getElementById("gpk-floating-chat-root") === root &&
            root.isConnected;
    }

    function initializeWidget(root, generation) {
        if (!isCurrentMount(root, generation)) return;
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
        if (avatar) avatar.src = assetURL("footer/newsletter-people.png");

        function showView(state) {
            if (states.indexOf(state) === -1) return;
            views.forEach(function (view) {
                view.hidden = view.getAttribute("data-view") !== state;
            });
            widget.setAttribute("data-state", state);
            if (isOpen) {
                var visibleView = root.querySelector('[data-view="' + state + '"]');
                var focusTarget = visibleView.querySelector(".gpk-chat__back") ||
                    visibleView.querySelector("[data-action]") || closeButton;
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

    function cleanupRuntime() {
        observer.disconnect();
        if (window[controllerKey]) window[controllerKey].cleanup();
        window[controllerKey] = null;
        window[runtimeKey] = null;
    }
})();
