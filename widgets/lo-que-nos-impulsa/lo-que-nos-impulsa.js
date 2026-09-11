/**
 * Grupak - Lo que nos impulsa (Misión y Visión) Widget Logic
 * Implements Apple Design fluid interactions:
 * - IntersectionObserver staggered reveal with critically damped physics
 * - Subtle direct-manipulation 3D tilt with velocity dampening on pointer move (Desktop only)
 * - Reduced motion accessibility awareness
 */

(function () {
  'use strict';

  function initLoQueNosImpulsa() {
    var root = document.getElementById('gpk-lo-que-nos-impulsa');
    if (!root) return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cards = root.querySelectorAll('.gpk-lqi-card');
    var header = root.querySelector('.gpk-lqi-header');

    if (!prefersReducedMotion) {
      // 1. Entrance Stagger Animation via IntersectionObserver
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
          { threshold: 0.15 }
        );

        observer.observe(root);
      }

      // 2. Apple Subtle Direct Manipulation Tilt (Desktop mouse/pointer only)
      var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (canHover) {
        cards.forEach(function (card) {
          var inner = card.querySelector('.gpk-lqi-card-inner');
          if (!inner) return;

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
            if (root.offsetWidth <= 820) return;
            isHovered = true;
            if (!rafId) rafId = requestAnimationFrame(updateTilt);
          });

          card.addEventListener('pointermove', function (e) {
            if (root.offsetWidth <= 820) return;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoQueNosImpulsa);
  } else {
    initLoQueNosImpulsa();
  }

  window.GrupakLoQueNosImpulsa = {
    init: initLoQueNosImpulsa
  };
})();
