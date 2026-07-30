/**
 * Grupak — Estrategia de Sustentabilidad Widget
 * Static layout widget.
 */
(function () {
  "use strict";

  var isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  var baseURL = isLocalhost
    ? "/widgets/sustentabilidad estrategia"
    : "https://grupak-widgets.vercel.app/widgets/sustentabilidad%20estrategia";

  var assetVersion = "20260730-sust-static-1";

  /* Inject CSS */
  if (!document.getElementById("gpk-sust-styles")) {
    var link = document.createElement("link");
    link.id = "gpk-sust-styles";
    link.rel = "stylesheet";
    link.href = isLocalhost
      ? "widgets/sustentabilidad estrategia/sustentabilidad-estrategia.css?v=" + assetVersion
      : baseURL + "/sustentabilidad-estrategia.css?v=" + assetVersion;
    document.head.appendChild(link);
  }

  function start() {
    var root =
      document.getElementById("gpk-sust-widget-root") ||
      document.getElementById("grupak-sust-root");

    if (root) {
      fetch(
        isLocalhost
          ? "widgets/sustentabilidad estrategia/sustentabilidad-estrategia.html?v=" + assetVersion
          : baseURL + "/sustentabilidad-estrategia.html?v=" + assetVersion
      )
        .then(function (res) {
          if (!res.ok) throw new Error("Error loading Sustentabilidad widget HTML");
          return res.text();
        })
        .then(function (html) {
          root.innerHTML = html;
          resolveImages(root);
        })
        .catch(function (err) {
          console.error("[gpk-sust]", err);
        });
    } else if (document.getElementById("gpk-sust-widget")) {
      resolveImages(document.getElementById("gpk-sust-widget"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  function resolveImages(container) {
    if (!container) return;
    container.querySelectorAll("img").forEach(function (img) {
      var src = img.getAttribute("src");
      if (!src || src.indexOf("http") === 0 || src.indexOf("data:") === 0) return;
      var cleanSrc = src.charAt(0) === "/" ? src.slice(1) : src;
      img.src = isLocalhost
        ? "widgets/sustentabilidad estrategia/" + cleanSrc
        : baseURL.replace(/\/$/, "") + "/" + cleanSrc;
    });
  }
})();
