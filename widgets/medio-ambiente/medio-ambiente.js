(function () {
  "use strict";

  var isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.protocol === "file:";

  var baseURL = isLocalhost
    ? "/widgets/medio-ambiente"
    : "https://grupak-widgets.vercel.app/widgets/medio-ambiente";

  if (!document.getElementById("gpk-medio-ambiente-styles")) {
    var link = document.createElement("link");
    link.id = "gpk-medio-ambiente-styles";
    link.rel = "stylesheet";
    link.href = isLocalhost
      ? "widgets/medio-ambiente/medio-ambiente.css?v=" + new Date().getTime()
      : baseURL + "/medio-ambiente.css";
    document.head.appendChild(link);
  }

  var root =
    document.getElementById("gpk-medio-ambiente-widget-root") ||
    document.getElementById("grupak-medio-ambiente-root") ||
    document.getElementById("medio-ambiente-widget-root");

  if (root) {
    fetch(
      isLocalhost
        ? "widgets/medio-ambiente/medio-ambiente.html"
        : baseURL + "/medio-ambiente.html"
    )
      .then(function (res) {
        if (!res.ok) throw new Error("Error loading Medio Ambiente widget HTML");
        return res.text();
      })
      .then(function (html) {
        root.innerHTML = html;
        resolveImages(root);
        initWidget(root.querySelector("#gpk-medio-ambiente-widget"));
      })
      .catch(function (err) {
        console.error("[gpk-medio-ambiente]", err);
      });
  } else {
    var directWidget = document.getElementById("gpk-medio-ambiente-widget");
    if (directWidget) {
      resolveImages(directWidget);
      initWidget(directWidget);
    }
  }

  function resolveImages(container) {
    if (!container) return;

    container.querySelectorAll("img").forEach(function (img) {
      var src = img.getAttribute("src");
      if (!src || src.indexOf("http") === 0 || src.indexOf("data:") === 0) return;

      var cleanSrc = src.charAt(0) === "/" ? src.slice(1) : src;
      img.src = isLocalhost
        ? "widgets/medio-ambiente/" + cleanSrc
        : baseURL.replace(/\/$/, "") + "/" + cleanSrc;

      img.addEventListener("error", function () {
        var figure = img.closest(".ma-wheel");
        if (figure) figure.classList.add("is-missing");
        img.style.visibility = "hidden";
      });

      img.addEventListener("load", function () {
        var figure = img.closest(".ma-wheel");
        if (figure) figure.classList.remove("is-missing");
        img.style.visibility = "";
      });
    });
  }

  function initWidget(widget) {
    if (!widget || widget.dataset.maReady === "true") return;
    widget.dataset.maReady = "true";

    var board = widget.querySelector("#ma-board");
    var spacer = widget.querySelector(".ma-scroll-spacer");
    var steps = Array.prototype.slice.call(widget.querySelectorAll(".ma-step"));
    var lines = Array.prototype.slice.call(widget.querySelectorAll(".ma-line"));
    var currentState = -1;
    var stateCount = 14;
    var compactQuery = window.matchMedia("(min-width: 1173px) and (max-width: 1280px)");
    var mobileQuery = window.matchMedia("(max-width: 1172px)");
    var mobileRevealObserver = null;

    if (!board || !spacer) return;

    function getFocusPoint(state) {
      var points = {
        6: { x: 925, y: 165 },
        7: { x: 1800, y: 455 },
        8: { x: 1780, y: 795 },
        9: { x: 944, y: 952 },
        10: { x: 356, y: 789 },
        11: { x: 340, y: 430 },
        12: { x: 925, y: 540 },
        13: { x: 925, y: 432 }
      };

      return points[state] || { x: 925, y: 540 };
    }

    function setLayoutMode() {
      if (mobileQuery.matches) {
        widget.setAttribute("data-ma-layout", "mobile");
      } else if (compactQuery.matches) {
        widget.setAttribute("data-ma-layout", "compact");
      } else {
        widget.setAttribute("data-ma-layout", "full");
      }
    }

    function getMobileRevealItems() {
      return Array.prototype.slice.call(widget.querySelectorAll(
        ".ma-header, .ma-intro-copy, .ma-wheel, .ma-step, .ma-stat"
      ));
    }

    function teardownMobileReveal() {
      if (mobileRevealObserver) {
        mobileRevealObserver.disconnect();
        mobileRevealObserver = null;
      }

      widget.classList.remove("ma-mobile-ready");
      getMobileRevealItems().forEach(function (item) {
        item.classList.remove("ma-mobile-in");
      });
    }

    function setupMobileReveal() {
      if (!mobileQuery.matches) {
        teardownMobileReveal();
        return;
      }

      if (mobileRevealObserver) return;

      var items = getMobileRevealItems();
      widget.classList.add("ma-mobile-ready");

      if (!window.IntersectionObserver) {
        items.forEach(function (item) {
          item.classList.add("ma-mobile-in");
        });
        return;
      }

      mobileRevealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("ma-mobile-in");
            mobileRevealObserver.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      });

      items.forEach(function (item, index) {
        item.style.transitionDelay = Math.min(index * 35, 180) + "ms";
        mobileRevealObserver.observe(item);
      });
    }

    function scaleBoard() {
      setLayoutMode();

      if (mobileQuery.matches) {
        board.style.removeProperty("--ma-scale");
        board.style.removeProperty("--ma-pan-x");
        board.style.removeProperty("--ma-pan-y");
        return;
      }

      var scaleX = window.innerWidth / 1850;
      var scaleY = window.innerHeight / 1080;
      var scale = Math.min(scaleX, scaleY);

      if (compactQuery.matches) {
        scale = Math.max(Math.min(scaleY, 0.82), 0.66);
      } else {
        scale = Math.max(Math.min(scale, 1.12), 0.56);
      }

      var focus = compactQuery.matches ? getFocusPoint(currentState) : { x: 925, y: 540 };
      var panX = compactQuery.matches ? (925 - focus.x) * scale : 0;
      var panY = compactQuery.matches ? (540 - focus.y) * scale : 0;

      board.style.setProperty("--ma-scale", String(Math.max(scale, 0.48).toFixed(4)));
      board.style.setProperty("--ma-pan-x", panX.toFixed(2) + "px");
      board.style.setProperty("--ma-pan-y", panY.toFixed(2) + "px");
    }

    function progressToState(progress) {
      var thresholds = [0.055, 0.125, 0.205, 0.285, 0.365, 0.445, 0.525, 0.605, 0.685, 0.765, 0.845, 0.915, 0.965];

      for (var i = 0; i < thresholds.length; i += 1) {
        if (progress < thresholds[i]) return i;
      }

      return stateCount - 1;
    }

    function applyState(state) {
      if (state === currentState) return;

      currentState = state;
      widget.className = widget.className.replace(/\bma-state-\d+\b/g, "").trim();
      widget.classList.add("ma-state-" + state);
      widget.setAttribute("data-ma-state", String(state));
      scaleBoard();

      var activeStep = state >= 6 && state <= 11 ? state - 5 : 0;
      var revealedSteps = state >= 12 ? 6 : Math.max(0, activeStep);

      steps.forEach(function (step) {
        var stepNumber = Number(step.getAttribute("data-step"));
        step.classList.toggle("is-revealed", stepNumber <= revealedSteps);
        step.classList.toggle("is-active", stepNumber === activeStep);
      });

      lines.forEach(function (line) {
        var lineNumber = Number(line.getAttribute("data-line"));
        line.classList.toggle("is-visible", lineNumber <= revealedSteps);
        line.classList.remove("is-active");

        if (lineNumber === activeStep) {
          void line.offsetWidth;
          line.classList.add("is-active");
        }
      });
    }

    function handleScroll() {
      if (mobileQuery.matches) {
        applyState(13);
        return;
      }

      var rect = spacer.getBoundingClientRect();
      var distance = Math.max(rect.height - window.innerHeight, 1);
      var progress = Math.max(0, Math.min(1, -rect.top / distance));
      applyState(progressToState(progress));
    }

    function onResize() {
      scaleBoard();
      handleScroll();
      setupMobileReveal();
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", handleScroll, { passive: true });
          window.addEventListener("resize", onResize, { passive: true });
          onResize();
        } else {
          window.removeEventListener("scroll", handleScroll);
          window.removeEventListener("resize", onResize);
        }
      });
    }, { threshold: 0.01 });

    observer.observe(widget);
    scaleBoard();
    handleScroll();
    setupMobileReveal();
  }
})();
