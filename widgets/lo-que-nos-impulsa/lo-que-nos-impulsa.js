/**
 * Grupak - Lo que nos impulsa (Misión y Visión) Widget
 * Self-bootstrapping loader & Apple Design interactions for Webflow / Vercel
 */

(function () {
  'use strict';

  var isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

  var selfProductionBaseURL = 'https://grupak-widgets.vercel.app/widgets/lo-que-nos-impulsa';
  var baseURL = isLocalhost ? '/widgets/lo-que-nos-impulsa' : selfProductionBaseURL;

  // Si estamos en localhost, resolver relativo al script actual
  var currentScript =
    document.currentScript ||
    document.querySelector('script[src*="lo-que-nos-impulsa.js"]');
  if (isLocalhost && currentScript && currentScript.src) {
    try {
      baseURL = new URL('.', currentScript.src).href.replace(/\/$/, '');
    } catch (e) {
      baseURL = 'widgets/lo-que-nos-impulsa';
    }
  }

  var assetVersion = '20260911-equal-height-2';

  // 1. Inyectar estilos CSS si no están presentes
  if (!document.getElementById('gpk-lqi-styles')) {
    var link = document.createElement('link');
    link.id = 'gpk-lqi-styles';
    link.rel = 'stylesheet';
    link.href = isLocalhost
      ? baseURL + '/lo-que-nos-impulsa.css?v=' + assetVersion
      : selfProductionBaseURL + '/lo-que-nos-impulsa.css?v=' + assetVersion;
    document.head.appendChild(link);
  }

  // 2. Contenedor Raíz
  var root =
    document.getElementById('gpk-lqi-widget-root') ||
    document.getElementById('gpk-lo-que-nos-impulsa-root') ||
    document.getElementById('grupak-lo-que-nos-impulsa-root');

  var existingWidget = document.getElementById('gpk-lo-que-nos-impulsa');

  if (existingWidget) {
    resolveImages(existingWidget);
    initWidget(existingWidget);
  } else if (root) {
    fetch(
      isLocalhost
        ? baseURL + '/lo-que-nos-impulsa.html?v=' + assetVersion
        : selfProductionBaseURL + '/lo-que-nos-impulsa.html?v=' + assetVersion
    )
      .then(function (res) {
        if (!res.ok) throw new Error('Error loading Lo Que Nos Impulsa widget HTML');
        return res.text();
      })
      .then(function (html) {
        root.innerHTML = html;
        var widget = root.querySelector('#gpk-lo-que-nos-impulsa');
        resolveImages(root);
        initWidget(widget || root);
      })
      .catch(function (err) {
        console.error('[gpk-lo-que-nos-impulsa]', err);
      });
  }

  // Resolver rutas de imágenes para Vercel CDN y entorno local
  function resolveImages(container) {
    if (!container) return;

    var prefix = isLocalhost ? baseURL + '/' : selfProductionBaseURL + '/';

    container.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src');
      if (!src || src.indexOf('http') === 0 || src.indexOf('data:') === 0) return;
      var cleanSrc = src.replace(/^(\.\/|\/)/, '');
      if (cleanSrc.indexOf('images/') !== 0) cleanSrc = 'images/' + cleanSrc;
      img.src = prefix + cleanSrc;
    });

    container.querySelectorAll('source').forEach(function (source) {
      var srcset = source.getAttribute('srcset');
      if (!srcset || srcset.indexOf('http') === 0 || srcset.indexOf('data:') === 0) return;
      var cleanSrcset = srcset.replace(/^(\.\/|\/)/, '');
      if (cleanSrcset.indexOf('images/') !== 0) cleanSrcset = 'images/' + cleanSrcset;
      source.srcset = prefix + cleanSrcset;
    });
  }

  // 3. Inicialización de interacciones Apple-Design
  function initWidget(widget) {
    if (!widget || widget.dataset.lqiReady === 'true') return;
    widget.dataset.lqiReady = 'true';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cards = widget.querySelectorAll('.gpk-lqi-card');
    var header = widget.querySelector('.gpk-lqi-header');

    if (!prefersReducedMotion) {
      // Entrada con IntersectionObserver
      if ('IntersectionObserver' in window) {
        if (header) {
          header.style.opacity = '0';
          header.style.transform = 'translateY(16px)';
          header.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        }

        cards.forEach(function (card, index) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px)';
          var delay = 0.1 + index * 0.12;
          card.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ' + delay + 's, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ' + delay + 's, filter 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        var observer = new IntersectionObserver(
          function (entries, obs) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                if (header) {
                  header.style.opacity = '1';
                  header.style.transform = 'translateY(0)';
                }
                cards.forEach(function (card) {
                  card.style.opacity = '1';
                  card.style.transform = 'translateY(0)';
                });
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12 }
        );

        observer.observe(widget);
      }

      // Sutil 3D Tilt en Desktop con mouse
      var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (canHover) {
        cards.forEach(function (card) {
          var rafId = null;
          var targetRotateX = 0;
          var targetRotateY = 0;
          var currentRotateX = 0;
          var currentRotateY = 0;
          var isHovered = false;

          function updateTilt() {
            var ease = 0.12;
            currentRotateX += (targetRotateX - currentRotateX) * ease;
            currentRotateY += (targetRotateY - currentRotateY) * ease;

            card.style.transform =
              'perspective(900px) rotateX(' +
              currentRotateX.toFixed(2) +
              'deg) rotateY(' +
              currentRotateY.toFixed(2) +
              'deg) translateY(' +
              (isHovered ? '-4px' : '0') +
              ')';

            if (
              isHovered ||
              Math.abs(targetRotateX - currentRotateX) > 0.05 ||
              Math.abs(targetRotateY - currentRotateY) > 0.05
            ) {
              rafId = requestAnimationFrame(updateTilt);
            } else {
              card.style.transform = '';
              rafId = null;
            }
          }

          card.addEventListener('pointerenter', function () {
            if (widget.offsetWidth <= 820) return;
            isHovered = true;
            if (!rafId) rafId = requestAnimationFrame(updateTilt);
          });

          card.addEventListener('pointermove', function (e) {
            if (widget.offsetWidth <= 820) return;
            var rect = card.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;

            targetRotateX = ((centerY - y) / centerY) * 2.5;
            targetRotateY = ((x - centerX) / centerX) * 2.5;

            if (!rafId) rafId = requestAnimationFrame(updateTilt);
          });

          card.addEventListener('pointerleave', function () {
            isHovered = false;
            targetRotateX = 0;
            targetRotateY = 0;
            if (!rafId) rafId = requestAnimationFrame(updateTilt);
          });
        });
      }
    }
  }

  // Exportar al objeto global
  window.GrupakLoQueNosImpulsa = {
    init: function () {
      var w = document.getElementById('gpk-lo-que-nos-impulsa');
      if (w) initWidget(w);
    }
  };
})();
