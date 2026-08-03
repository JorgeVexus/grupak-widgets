(function (window, document) {
  "use strict";

  var currentScript = document.currentScript;

  function resolveBaseURL(protocol, hostname, origin, scriptSource) {
    var widgetPath = "/widgets/slider%20certificaciones%20new";
    if (protocol === "file:" && scriptSource) {
      return new URL(".", scriptSource).href;
    }
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return new URL(widgetPath + "/", origin).href;
    }
    return "https://grupak-widgets.vercel.app" + widgetPath + "/";
  }

  var baseURL = resolveBaseURL(
    location.protocol,
    location.hostname,
    location.origin,
    currentScript && currentScript.src
  );

  function report(message, error) {
    console.error("[Grupack Certifications] " + message, error || "");
  }

  function assetURL(value) {
    return new URL(value, baseURL).href;
  }

  function injectStylesheet() {
    var marker = "gpk-certifications-styles";
    if (document.getElementById(marker)) return;
    var link = document.createElement("link");
    link.id = marker;
    link.rel = "stylesheet";
    link.href = assetURL("slider-certificaciones.css");
    link.addEventListener("error", function () {
      report("Could not load stylesheet.");
    });
    document.head.appendChild(link);
  }

  function resolveImages(widget) {
    widget.querySelectorAll("img[src]").forEach(function (image) {
      var source = image.getAttribute("src");
      if (!source || /^(?:[a-z]+:|\/\/|#|data:|blob:)/i.test(source)) return;
      image.src = assetURL(source);
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
        image.removeAttribute("src");
      }, { once: true });
    });
  }

  function initWidget(widget) {
    if (!widget || widget.dataset.gpkCertInitialized === "true") return;

    var viewport = widget.querySelector(".gpk-cert-viewport");
    var track = widget.querySelector(".gpk-cert-track");
    var slides = Array.prototype.slice.call(track ? track.children : []);
    var cards = Array.prototype.slice.call(track ? track.querySelectorAll(".gpk-cert-card") : []);
    var previous = widget.querySelector(".gpk-cert-prev");
    var next = widget.querySelector(".gpk-cert-next");
    var status = widget.querySelector(".gpk-cert-status");
    var state = { index: 0, visible: 1, step: 0, dragStart: null, pointerId: null };
    if (!viewport || !track || !previous || !next || !slides.length || cards.length !== slides.length) {
      report("Widget markup is incomplete.");
      return;
    }
    widget.dataset.gpkCertInitialized = "true";

    if (status) status.textContent = "";
    resolveImages(widget);

    function lastIndex() {
      return Math.max(0, slides.length - state.visible);
    }

    function render(announce) {
      state.index = Math.min(lastIndex(), Math.max(0, state.index));
      widget.style.setProperty("--gpk-cert-offset", String(-state.index * state.step) + "px");
      previous.disabled = state.index === 0;
      next.disabled = state.index === lastIndex();
      cards.forEach(function (card, cardIndex) {
        var visible = cardIndex >= state.index && cardIndex < state.index + state.visible;
        card.setAttribute("aria-hidden", String(!visible));
      });
      if (announce && status) {
        status.textContent = "Certificaciones " + (state.index + 1) + " a " +
          Math.min(slides.length, state.index + state.visible) + " de " + slides.length;
      }
    }

    function measure() {
      var styles = window.getComputedStyle(widget);
      var trackStyles = window.getComputedStyle(track);
      state.visible = Math.max(1, parseInt(styles.getPropertyValue("--gpk-cert-visible"), 10) || 1);
      state.step = slides[0].getBoundingClientRect().width +
        (parseFloat(trackStyles.columnGap || trackStyles.gap) || 0);
      render(false);
    }

    function move(delta) {
      var nextIndex = Math.min(lastIndex(), Math.max(0, state.index + delta));
      if (nextIndex === state.index) return;
      state.index = nextIndex;
      render(true);
    }

    function onPreviousClick() { move(-1); }
    function onNextClick() { move(1); }
    function onKeydown(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
    function onPointerDown(event) {
      if (event.isPrimary === false || event.button !== 0 || state.pointerId !== null) return;
      state.dragStart = event.clientX;
      state.pointerId = event.pointerId;
      if (typeof viewport.setPointerCapture === "function") {
        viewport.setPointerCapture(event.pointerId);
      }
    }
    function onPointerUp(event) {
      if (state.dragStart === null || event.pointerId !== state.pointerId) return;
      var distance = event.clientX - state.dragStart;
      state.dragStart = null;
      state.pointerId = null;
      if (Math.abs(distance) > 50) move(distance < 0 ? 1 : -1);
    }
    function onPointerCancel(event) {
      if (event.pointerId !== state.pointerId) return;
      state.dragStart = null;
      state.pointerId = null;
    }

    previous.addEventListener("click", onPreviousClick);
    next.addEventListener("click", onNextClick);
    viewport.addEventListener("keydown", onKeydown);
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointerup", onPointerUp);
    viewport.addEventListener("pointercancel", onPointerCancel);

    var resizeObserver = null;
    function cleanup() {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      previous.removeEventListener("click", onPreviousClick);
      next.removeEventListener("click", onNextClick);
      viewport.removeEventListener("keydown", onKeydown);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointerup", onPointerUp);
      viewport.removeEventListener("pointercancel", onPointerCancel);
      removalObserver.disconnect();
      delete widget.dataset.gpkCertInitialized;
    }
    if ("ResizeObserver" in window) {
      resizeObserver = new window.ResizeObserver(measure);
      resizeObserver.observe(viewport);
    } else {
      window.addEventListener("resize", measure);
    }
    var removalObserver = new window.MutationObserver(function () {
      if (!document.documentElement.contains(widget)) cleanup();
    });
    removalObserver.observe(document.documentElement, { childList: true, subtree: true });
    measure();
  }

  function initAll() {
    document.querySelectorAll(".gpk-cert-widget").forEach(initWidget);
  }

  function observeWidgets() {
    var observer = new window.MutationObserver(initAll);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return observer;
  }

  function loadMarkup() {
    var root = document.getElementById("gpk-slider-certificaciones-widget-root");
    if (!root || root.querySelector(".gpk-cert-widget")) {
      initAll();
      return;
    }
    fetch(assetURL("slider-certificaciones.html"))
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (html) {
        root.innerHTML = html;
        initAll();
      })
      .catch(function (error) { report("Could not load widget markup.", error); });
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { initWidget: initWidget, initAll: initAll, observeWidgets: observeWidgets };
    return;
  }

  injectStylesheet();
  observeWidgets();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadMarkup, { once: true });
  } else {
    loadMarkup();
  }
})(window, document);
