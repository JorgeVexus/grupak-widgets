(function () {
    "use strict";

    var isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol === "file:";
    var baseURL = isLocalhost
        ? "widgets/chat-flotante"
        : "https://grupak-widgets.vercel.app/widgets/chat-flotante";
    var assetVersion = "20260725-task-1";

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
                if (!response.ok) {
                    throw new Error("Error loading floating chat HTML");
                }
                return response.text();
            })
            .then(function (html) {
                root.innerHTML = html;
            })
            .catch(function (error) {
                console.error("[gpk-floating-chat]", error);
            });
    }
})();
