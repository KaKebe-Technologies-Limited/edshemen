(function ($) {
    "use strict";
    
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Utility function to split text into words
    function splitTextIntoWords(element) {
        if (!element) return;
        const text = element.innerText;
        const words = text.split(' ');
        element.innerHTML = ''; // Clear original content
        words.forEach(word => {
            const span = document.createElement('span');
            span.classList.add('word');
            span.style.display = 'inline-block'; // Keep words together
            span.innerHTML = word + '&nbsp;'; // Add non-breaking space
            element.appendChild(span);
        });
        return element.querySelectorAll('.word');
    }

    function initAnimatedGradients() {
        if (!window.gsap) return;
        const gradientSections = document.querySelectorAll('.animated-gradient');
        if (!gradientSections.length) return;

        gradientSections.forEach((el) => {
            // Prevent duplicate animations (important with Barba transitions)
            if (el._agTl) el._agTl.kill();
            if (el._agRot) el._agRot.kill();

            // Animate CSS variables used by the gradient + conic overlay (see .animated-gradient in index.html)
            el.classList.add('ag-gsap');
            gsap.set(el, { '--ag-x': '0%', '--ag-y': '50%', '--ag-rot': '0deg' });

            el._agTl = gsap.timeline({ repeat: -1 });
            el._agTl
                .to(el, { '--ag-x': '100%', '--ag-y': '50%', duration: 6, ease: "sine.inOut" })
                .to(el, { '--ag-x': '70%', '--ag-y': '100%', duration: 6, ease: "sine.inOut" })
                .to(el, { '--ag-x': '0%', '--ag-y': '50%', duration: 6, ease: "sine.inOut" });

            el._agRot = gsap.to(el, {
                '--ag-rot': '360deg',
                duration: 18,
                ease: "none",
                repeat: -1,
            });
        });
    }

    function initAboutAnimations() {
        if (!window.gsap) return;

        // Animate "About Es Shemen" heading
        const aboutHeading = document.querySelector("#section-counter h2");
        if (aboutHeading) {
            const words = splitTextIntoWords(aboutHeading);
            gsap.from(words, {
                scrollTrigger: {
                    trigger: aboutHeading,
                    start: "top 80%",
                },
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out"
            });
        }

        // Animate Lead Text
        gsap.from("#section-counter h5", {
            scrollTrigger: {
                trigger: "#section-counter h5",
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 0.3,
            ease: "power3.out"
        });

        // Animate Facilities Cards
        gsap.from(".bg-light .card", {
            scrollTrigger: {
                trigger: ".bg-light .card",
                start: "top 85%",
            },
            y: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });

        // Animate Team Cards - Only if elements exist
        const teamSectionCards = document.querySelectorAll(".ftco-section:not(.img) .card");
        if (teamSectionCards.length > 0) {
            // Ensure cards are visible first
            teamSectionCards.forEach(card => card.style.opacity = "1");
            
            gsap.from(teamSectionCards, {
                scrollTrigger: {
                    trigger: ".ftco-section",
                    start: "top 85%",
                },
                scale: 0.9,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out"
            });
        }
    }

    // Function to initialize testimonial Swiper
    function initTestimonialSwiper() {
        // Destroy existing Swiper instance if it exists to prevent re-initialization issues
        if (window.testimonialSwiperInstance && window.testimonialSwiperInstance.destroy) {
            window.testimonialSwiperInstance.destroy(true, true);
        }

        const testimonialSwiperElement = document.querySelector(".testimonialSwiper");
        if (testimonialSwiperElement) {
            window.testimonialSwiperInstance = new Swiper(testimonialSwiperElement, {
                loop: true,
                centeredSlides: true,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: ".testimonial-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".testimonial-button-next",
                    prevEl: ".testimonial-button-prev",
                },
                lazy: { // Enable lazy loading for testimonials
                    loadPrevNext: true,
                    loadOnTransitionStart: true,
                },
                breakpoints: {
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 10,
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                    },
                    992: {
                        slidesPerView: 3,
                        spaceBetween: 40,
                    },
                },
            });
        }
    }


    // Barba.js Initialization and Page Transitions
    if (window.barba) { // Check if Barba.js is loaded
        barba.init({
            transitions: [{
                name: 'fade-transition',
                leave({ current, next, trigger }) {
                    // animate out the current page
                    return gsap.to(current.container, {
                        opacity: 0,
                        y: -50, // Move up slightly
                        duration: 0.5,
                        ease: "power2.out",
                    });
                },
                enter({ current, next, trigger }) {
                    // animate in the next page
                    return gsap.from(next.container, {
                        opacity: 0,
                        y: 50, // Come from slightly below
                        duration: 0.5,
                        ease: "power2.out",
                        onComplete: () => {
                            // Re-initialize scripts for the new page
                            $(window).trigger('scroll'); // Re-trigger scroll to activate ScrollTriggers
                            initTestimonialSwiper(); // Re-initialize testimonial Swiper
                        }
                    });
                }
            }],
            views: [{
                namespace: 'home', // Corresponds to data-barba-namespace="home"
                afterEnter() {
                    // Re-initialize any Swiper instances or specific homepage scripts
                    // For the main Swiper (mySwiper), it's initialized inline in index.html,
                    // but if it were in main.js, we'd re-initialize it here.
                    // For testimonialSwiper, it's initialized below, so it will re-run.
                    // Re-trigger scroll to activate ScrollTriggers for the new page content
                    $(window).trigger('scroll');
                    initAnimatedGradients();
                    initTestimonialSwiper(); // Re-initialize testimonial Swiper
                }
            }, {
                namespace: 'about',
                afterEnter() {
                    $(window).trigger('scroll');
                    initAboutAnimations();
                }
            }]
        });
    }

    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
        initAnimatedGradients();
        initAboutAnimations();
        initTestimonialSwiper(); // Initialize testimonial Swiper on initial load
        // If something loads late (fonts/CSS), run once more after full load.
        $(window).on('load', function() {
            initAnimatedGradients();
            initAboutAnimations();
        });
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Portfolio isotope and filter
    var portfolioIsotope = $('.portfolio-container').isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
    });

    $('#portfolio-flters li').on('click', function () {
        $("#portfolio-flters li").removeClass('active');
        $(this).addClass('active');

        portfolioIsotope.isotope({filter: $(this).data('filter')});
    });

    // GSAP Animations

    // Navbar Animation on page load (initial animations)
    gsap.from(".navbar-brand", { opacity: 0, y: -50, duration: 1, ease: "power3.out" });
    gsap.from(".navbar-nav .nav-item", { opacity: 0, y: -20, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.2 });
    gsap.from(".navbar .btn-success", { opacity: 0, y: -50, duration: 1, ease: "power3.out", delay: 0.4 });

    // Sticky Header with Shrink/Change
    ScrollTrigger.create({
        start: "top -80", // Adjust this value to when you want the header to start shrinking
        end: 99999,
        toggleClass: {className: "navbar-scrolled", targets: ".navbar"},
        onUpdate: (self) => {
            const navbarBrandImg = document.querySelector('.navbar-brand img');
            const navbarBrandText = document.querySelector('.navbar-brand span');
            const contactBtn = document.querySelector('.navbar .btn-success');
            
            if (self.direction === 1 && self.progress > 0) { // Scrolling down
                gsap.to(navbarBrandImg, { width: 100, height: 'auto', duration: 0.3 }); // Smaller logo
                gsap.to(navbarBrandText, { fontSize: '25px', duration: 0.3 }); // Smaller text
                gsap.to(contactBtn, { padding: '5px 15px', fontSize: '14px', duration: 0.3 }); // Smaller button
            } else if (self.direction === -1 && self.progress === 0) { // Scrolling up and at top
                gsap.to(navbarBrandImg, { width: 150, height: 'auto', duration: 0.3 }); // Original logo size
                gsap.to(navbarBrandText, { fontSize: '35px', duration: 0.3 }); // Original text size
                gsap.to(contactBtn, { padding: '10px 24px', fontSize: '1rem', duration: 0.3 }); // Original button size
            }
        }
    });

    // "Welcome to ESIS" section animation
    const welcomeHeading = document.querySelector(".text.ftco-animate h3");
    if (welcomeHeading) {
        const welcomeWords = splitTextIntoWords(welcomeHeading);
        gsap.from(welcomeWords, {
            scrollTrigger: {
                trigger: welcomeHeading,
                start: "top 80%",
                toggleActions: "play none none none",
            },
            y: 40,
            opacity: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "power3.out",
        });
    }

    gsap.from(".text.ftco-animate p", {
        scrollTrigger: {
            trigger: ".text.ftco-animate p",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
    });

    // Vision, Mission, Motto, and Core Values Cards animation - Only on home page
    const visionCards = document.querySelectorAll(".site-section.bg-light .card");
    if (visionCards.length > 0) {
        // Ensure cards are visible first
        visionCards.forEach(card => card.style.opacity = "1");
        
        gsap.from(visionCards, {
            scrollTrigger: {
                trigger: ".site-section.bg-light",
                start: "top 75%",
                toggleActions: "play none none none",
            },
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
        });
    }

    // 3D Tilt Hover Effect for cards - Only on home page and specific pages
    const tiltCards = document.querySelectorAll(".site-section.bg-light .card, .ftco-section:not(.img) .card");
    if (tiltCards.length > 0) {
        tiltCards.forEach(card => {
            card.style.opacity = "1"; // Ensure cards are visible
            card.addEventListener("mouseenter", () => {
                gsap.to(card, {
                    duration: 0.4,
                    rotationX: (Math.random() - 0.5) * 10,
                    rotationY: (Math.random() - 0.5) * 10,
                    scale: 1.03,
                    ease: "power2.out",
                    overwrite: true
                });
            });

            card.addEventListener("mouseleave", () => {
                gsap.to(card, {
                    duration: 0.4,
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    ease: "elastic.out(1, 0.5)",
                    overwrite: true
                });
            });
        });
    }


    // Facilities Section - Simple fade-in animation (no sticky/absolute positioning)
    const featureItems = document.querySelectorAll(".ftco-section .services-2");
    
    if (featureItems.length > 0) {
        // Set initial state - just opacity, no position changes
        gsap.set(featureItems, { opacity: 0, y: 30 });

        gsap.to(featureItems, {
            scrollTrigger: {
                trigger: ".ftco-section",
                start: "top 75%",
                toggleActions: "play none none none",
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
        });
    }


    // Library Services Section animations (images and text)
    gsap.from(".library-section .row.g-3 img", {
        scrollTrigger: {
            trigger: ".library-section .row.g-3",
            start: "top 75%",
            toggleActions: "play none none none",
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "back.out(1.7)",
    });

    // Library Section: Image Hover Effects
    document.querySelectorAll(".library-section .row.g-3 img").forEach(image => {
        image.addEventListener("mouseenter", () => {
            gsap.to(image, {
                duration: 0.3,
                scale: 1.05, // Slightly zoom in
                filter: "brightness(1.2)", // Make it a bit brighter
                ease: "power2.out",
                overwrite: true
            });
        });

        image.addEventListener("mouseleave", () => {
            gsap.to(image, {
                duration: 0.3,
                scale: 1,
                filter: "brightness(1)", // Reset brightness
                ease: "power2.out",
                overwrite: true
            });
        });
    });

    // Library Section: Animated Feature Circles
    document.querySelectorAll(".library-section .feature-circle").forEach(circle => {
        circle.addEventListener("mouseenter", () => {
            gsap.to(circle, {
                duration: 0.3,
                scale: 1.1, // Slightly zoom in
                boxShadow: "0px 0px 20px rgba(40, 167, 69, 0.6)", // Green glow
                ease: "power2.out",
                overwrite: true
            });
        });

        circle.addEventListener("mouseleave", () => {
            gsap.to(circle, {
                duration: 0.3,
                scale: 1,
                boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)", // Reset shadow
                ease: "power2.out",
                overwrite: true
            });
        });
    });


    gsap.from(".library-section h5.display-6", {
        scrollTrigger: {
            trigger: ".library-section h5.display-6",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
    });

    gsap.from(".library-section p", {
        scrollTrigger: {
            trigger: ".library-section p",
            start: "top 80%",
            toggleActions: "play none none none",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.4,
    });

    // Animate circular feature images in Library Section (initial scroll animation)
    gsap.from(".library-section .feature-circle img", {
        scrollTrigger: {
            trigger: ".library-section .feature-circle",
            start: "top 75%",
            toggleActions: "play none none none",
        },
        scale: 0.8,
        opacity: 0,
        rotation: 45, // Rotate by 45 degrees
        duration: 1.2,
        stagger: 0.15,
        ease: "back.out(1.7)",
    });
    
})(jQuery);
