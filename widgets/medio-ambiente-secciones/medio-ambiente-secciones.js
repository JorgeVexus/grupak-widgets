(function () {
  "use strict";

  var isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  var selfProductionBaseURL = "https://grupak-widgets.vercel.app/widgets/medio-ambiente-secciones";
  var baseURL = isLocalhost ? "/widgets/medio-ambiente-secciones" : selfProductionBaseURL;

  // Si estamos en localhost, resolver relativo al script actual
  var currentScript = document.currentScript || document.querySelector('script[src*="medio-ambiente-secciones.js"]');
  if (isLocalhost && currentScript && currentScript.src) {
    try {
      baseURL = new URL(".", currentScript.src).href.replace(/\/$/, "");
    } catch (e) {
      baseURL = "widgets/medio-ambiente-secciones";
    }
  }

  var assetVersion = "mas-figma-v3-" + new Date().getTime();

  // 1. Inyectar estilos CSS si no están presentes
  if (!document.getElementById("gpk-mas-styles")) {
    var link = document.createElement("link");
    link.id = "gpk-mas-styles";
    link.rel = "stylesheet";
    link.href = isLocalhost
      ? baseURL + "/medio-ambiente-secciones.css?v=" + assetVersion
      : selfProductionBaseURL + "/medio-ambiente-secciones.css?v=" + assetVersion;
    document.head.appendChild(link);
  }

  // 2. Contenedor Raíz
  var root =
    document.getElementById("gpk-mas-widget-root") ||
    document.getElementById("gpk-medio-ambiente-secciones-root") ||
    document.getElementById("grupak-medio-ambiente-secciones-root") ||
    document.getElementById("medio-ambiente-secciones-widget-root");

  var existingWidget = document.getElementById("gpk-mas-widget");

  if (existingWidget) {
    resolveImages(existingWidget);
    initWidget(existingWidget);
  } else if (root) {
    fetch(
      isLocalhost
        ? baseURL + "/medio-ambiente-secciones.html?v=" + assetVersion
        : selfProductionBaseURL + "/medio-ambiente-secciones.html?v=" + assetVersion
    )
      .then(function (res) {
        if (!res.ok) throw new Error("Error loading Medio Ambiente Secciones widget HTML");
        return res.text();
      })
      .then(function (html) {
        root.innerHTML = html;
        var widget = root.querySelector("#gpk-mas-widget");
        resolveImages(root);
        initWidget(widget);
      })
      .catch(function (err) {
        console.error("[gpk-mas-widget]", err);
      });
  }

  function resolveImages(container) {
    if (!container) return;

    container.querySelectorAll("img").forEach(function (img) {
      var src = img.getAttribute("src");
      if (!src || src.indexOf("http") === 0 || src.indexOf("data:") === 0) return;

      var cleanSrc = src.charAt(0) === "/" ? src.slice(1) : src;
      img.src = isLocalhost
        ? baseURL + "/" + cleanSrc
        : selfProductionBaseURL + "/" + cleanSrc;
    });
  }

  function initWidget(widget) {
    if (!widget || widget.dataset.masReady === "true") return;
    widget.dataset.masReady = "true";

    var diagramWrapper = widget.querySelector(".mas-diagram-wrapper");
    var diagram = widget.querySelector("#mas-diagram");
    var steps = Array.prototype.slice.call(widget.querySelectorAll(".mas-step"));
    var mobileQuery = window.matchMedia("(max-width: 1172px)");

    // Escalado responsivo del diagrama (1736px de Figma)
    function scaleDiagram() {
      if (!diagram || !diagramWrapper || mobileQuery.matches) {
        if (diagram) diagram.style.removeProperty("--mas-scale");
        if (diagramWrapper) diagramWrapper.style.removeProperty("--mas-scale");
        return;
      }

      var availableWidth = diagramWrapper.clientWidth || window.innerWidth;
      var scale = Math.min((availableWidth - 32) / 1736, 1);
      scale = Math.max(scale, 0.45);

      diagram.style.setProperty("--mas-scale", scale.toFixed(4));
      diagramWrapper.style.setProperty("--mas-scale", scale.toFixed(4));
    }

    // Interacciones Hover / Focus para cada paso
    function setupInteractions() {
      steps.forEach(function (step) {
        var stepNum = step.getAttribute("data-step");
        var line = widget.querySelector('.mas-line[data-line="' + stepNum + '"]');

        function activate() {
          step.classList.add("is-active");
          if (line) line.classList.add("is-active");
        }

        function deactivate() {
          step.classList.remove("is-active");
          if (line) line.classList.remove("is-active");
        }

        step.addEventListener("mouseenter", activate);
        step.addEventListener("mouseleave", deactivate);
        step.addEventListener("focus", activate);
        step.addEventListener("blur", deactivate);
      });
    }

    // Observador Scroll-Into-View
    function setupScrollIntoView() {
      if (!window.IntersectionObserver) {
        widget.classList.add("mas-revealed");
        return;
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            widget.classList.add("mas-revealed");
          }
        });
      }, {
        threshold: 0.12
      });

      observer.observe(widget);
    }

    function onResize() {
      scaleDiagram();
    }

    window.addEventListener("resize", onResize, { passive: true });

    scaleDiagram();
    setupInteractions();
    setupScrollIntoView();
  }
})();
