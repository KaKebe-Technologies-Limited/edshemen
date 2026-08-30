/* ============================================================
   Es Shemen — site scripts (lean rewrite)
   Heavy GSAP / ScrollTrigger / Barba stack removed for speed.
   Entrance animations now live in js/es-anim.js (CSS + IO).
   ============================================================ */
(function ($) {
  "use strict";

  /* ---- Testimonial carousel (Swiper) ---- */
  function initTestimonialSwiper() {
    if (typeof Swiper === "undefined") return;
    var el = document.querySelector(".testimonialSwiper");
    if (!el) return;
    if (window.testimonialSwiperInstance && window.testimonialSwiperInstance.destroy) {
      window.testimonialSwiperInstance.destroy(true, true);
    }
    window.testimonialSwiperInstance = new Swiper(el, {
      loop: true,
      centeredSlides: true,
      speed: 600,
      autoplay: { delay: 4500, disableOnInteraction: false },
      pagination: { el: ".testimonial-pagination", clickable: true },
      navigation: {
        nextEl: ".testimonial-button-next",
        prevEl: ".testimonial-button-prev"
      },
      breakpoints: {
        0: { slidesPerView: 1, spaceBetween: 16 },
        768: { slidesPerView: 2, spaceBetween: 28 },
        992: { slidesPerView: 3, spaceBetween: 32 }
      }
    });
  }

  /* ---- Back to top ---- */
  function initBackToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle("is-visible", window.pageYOffset > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Portfolio / gallery filter (Isotope) — only if present ---- */
  function initIsotope() {
    if (typeof $ === "undefined" || !$.fn || !$.fn.isotope) return;
    var $container = $(".portfolio-container");
    if (!$container.length) return;
    var iso = $container.isotope({ itemSelector: ".portfolio-item", layoutMode: "fitRows" });
    $("#portfolio-flters li").on("click", function () {
      $("#portfolio-flters li").removeClass("active");
      $(this).addClass("active");
      iso.isotope({ filter: $(this).data("filter") });
    });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else { fn(); }
  }

  ready(function () {
    initBackToTop();
    initTestimonialSwiper();
    initIsotope();
  });
})(window.jQuery || null);
