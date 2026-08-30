/* ============================================================
   Es Shemen — lightweight scroll-reveal
   Replaces the old GSAP/ScrollTrigger animation stack.
   - GPU-friendly (opacity + translateY only)
   - Respects prefers-reduced-motion
   - Content is ALWAYS visible if JS fails or is slow
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Flag that JS ran — CSS only hides reveal targets when this class is present.
  root.classList.add("js-anim");
  if (reduce) { root.classList.remove("js-anim"); return; }

  // Selectors that get a gentle entrance. Kept deliberately small.
  var SELECTORS = [
    ".es-head",
    ".es-section .es-card",
    ".es-card",
    ".services-2",
    ".site-section .card",
    ".ftco-section .card",
    ".library-section img",
    ".library-section .feature-circle",
    ".testimonial-item",
    ".es-stat",
    ".blog-entry",
    ".class .card, .card-items .card",
    "section > .container > .text-center"
  ];

  function collect() {
    var set = new Set();
    SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) { set.add(el); });
    });
    return Array.from(set);
  }

  function run() {
    var items = collect();
    if (!items.length) return;

    // Group siblings so they stagger nicely.
    items.forEach(function (el) {
      el.classList.add("es-reveal");
      var sibs = Array.prototype.filter.call(
        el.parentNode ? el.parentNode.children : [],
        function (c) { return c.classList && c.classList.contains("es-reveal"); }
      );
      var i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i * 70, 350) + "ms";
    });

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) {
        el.classList.add("is-in");           // already on screen — show now
      } else {
        io.observe(el);
      }
    });

    // Failsafe: never leave anything hidden.
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-in"); });
    }, 2200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
