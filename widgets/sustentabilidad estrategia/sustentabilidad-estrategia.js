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

  var selfProductionBaseURL = "https://grupak-widgets.vercel.app/widgets/sustentabilidad%20estrategia";
  var baseURL = isLocalhost
    ? "/widgets/sustentabilidad estrategia"
    : selfProductionBaseURL;

  var currentScript =
    document.currentScript ||
    document.querySelector('script[src*="sustentabilidad-estrategia.js"]');
  if (isLocalhost && currentScript && currentScript.src) {
    try {
      baseURL = new URL(".", currentScript.src).href.replace(/\/$/, "");
    } catch (e) {
      baseURL = "widgets/sustentabilidad estrategia";
    }
  }

  var assetVersion = "20261005-en-diagram-1";

  /* Inject CSS */
  if (!document.getElementById("gpk-sust-styles")) {
    var link = document.createElement("link");
    link.id = "gpk-sust-styles";
    link.rel = "stylesheet";
    link.href = isLocalhost
      ? baseURL + "/sustentabilidad-estrategia.css?v=" + assetVersion
      : selfProductionBaseURL + "/sustentabilidad-estrategia.css?v=" + assetVersion;
    document.head.appendChild(link);
  }

  function start() {
    var root =
      document.getElementById("gpk-sust-widget-root") ||
      document.getElementById("grupak-sust-root") ||
      document.getElementById("gpk-sustentabilidad-estrategia-root") ||
      document.getElementById("sustentabilidad-estrategia-widget-root");

    var existingWidget = document.getElementById("gpk-sust-widget");

    if (root) {
      var isEnglish =
        (root && root.getAttribute("data-lang") === "en") ||
        window.location.pathname.indexOf("/en/") !== -1;
      var templateFile = isEnglish ? "/sustentabilidad-estrategia-en.html" : "/sustentabilidad-estrategia.html";
      fetch(baseURL + templateFile + "?v=" + assetVersion)
        .then(function (res) {
          if (!res.ok) throw new Error("Error loading Sustentabilidad widget HTML");
          return res.text();
        })
        .then(function (html) {
          root.innerHTML = html;
          resolveImages(root, isEnglish);
        })
        .catch(function (err) {
          console.error("[gpk-sust]", err);
        });
    } else if (existingWidget) {
      var isEnglish =
        existingWidget.getAttribute("data-lang") === "en" ||
        (existingWidget.parentElement && existingWidget.parentElement.getAttribute("data-lang") === "en") ||
        window.location.pathname.indexOf("/en/") !== -1;

      if (isEnglish) {
        var diagramImg = existingWidget.querySelector(".sust-diagram-img");
        if (diagramImg && diagramImg.getAttribute("src").indexOf("sustentabilidad frame 3-en") === -1) {
          diagramImg.setAttribute("src", "images/sustentabilidad frame 3-en.webp");
          diagramImg.setAttribute("alt", "Grupak Sustainability Strategy Diagram");
        }
      }
      resolveImages(existingWidget, isEnglish);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  function resolveImages(container, isEnglish) {
    if (!container) return;
    if (isEnglish === undefined) {
      isEnglish =
        container.getAttribute("data-lang") === "en" ||
        (container.parentElement && container.parentElement.getAttribute("data-lang") === "en") ||
        window.location.pathname.indexOf("/en/") !== -1;
    }
    container.querySelectorAll("img").forEach(function (img) {
      var src = img.getAttribute("src");
      if (!src) return;
      if (isEnglish && (src.indexOf("sustentabilidad frame 3.webp") !== -1 || src.indexOf("sustentabilidad frame 3.png") !== -1)) {
        src = src.replace("sustentabilidad frame 3.webp", "sustentabilidad frame 3-en.webp")
                 .replace("sustentabilidad frame 3.png", "sustentabilidad frame 3-en.webp");
      }
      if (src.indexOf("http") === 0 || src.indexOf("data:") === 0) return;
      var cleanSrc = src.charAt(0) === "/" ? src.slice(1) : src;
      img.src = baseURL.replace(/\/$/, "") + "/" + cleanSrc;
    });
  }
})();
