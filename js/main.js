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
        initTestimonialSwiper(); // Initialize testimonial Swiper on initial load
        // If something loads late (fonts/CSS), run once more after full load.
        $(window).on('load', initAnimatedGradients);
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

    // Vision, Mission, Motto, and Core Values Cards animation (initial fade/slide)
    gsap.from(".site-section.bg-light .card", {
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

    // 3D Tilt Hover Effect for Vision, Mission, Motto Cards
    document.querySelectorAll(".site-section.bg-light .card").forEach(card => {
        card.addEventListener("mouseenter", () => {
            gsap.to(card, {
                duration: 0.4,
                rotationX: (Math.random() - 0.5) * 10, // Random small tilt on X
                rotationY: (Math.random() - 0.5) * 10, // Random small tilt on Y
                scale: 1.03, // Slight scale up
                ease: "power2.out",
                overwrite: true // Prevent stacking animations
            });
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(card, {
                duration: 0.4,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                ease: "elastic.out(1, 0.5)", // More bouncy ease on leave
                overwrite: true
            });
        });
    });


    // Facilities Section Sticky Features animation
    const facilitiesContainer = document.querySelector(".ftco-section .col-12.wrap-about");
    const featureItems = gsap.utils.toArray(".ftco-section .services-2");
    
    if (facilitiesContainer && featureItems.length > 0) {
        // Set initial state for all items to be hidden
        gsap.set(featureItems, { opacity: 0, y: 50 });

        // Calculate total number of pairs
        const numPairs = Math.ceil(featureItems.length / 2);
        // Define scroll distance needed for each pair to transition and be visible
        const scrollPerPair = window.innerHeight * 0.7; // 70% of viewport height per pair animation

        // Create a master timeline for the pinned section
        const masterTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: facilitiesContainer,
                pin: true,
                start: "top top", // Start pinning when the top of facilitiesContainer hits the top of the viewport
                end: `+=${numPairs * scrollPerPair}`, // Total scroll length for the animation sequence
                scrub: 1, // Smoothly scrub animations
                // markers: true, // Uncomment for debugging
            }
        });

        // Add animations for each pair
        for (let i = 0; i < featureItems.length; i += 2) {
            const currentPair = [featureItems[i], featureItems[i + 1]].filter(Boolean);
            const prevPair = [featureItems[i - 2], featureItems[i - 1]].filter(Boolean); // Will be empty for first pair

            const label = `pair-${i/2}`; // Unique label for each pair's animation start point

            if (i === 0) {
                // First pair animates in at the very start of the section's scroll
                masterTimeline.fromTo(currentPair, 
                    { opacity: 0, y: 50 }, 
                    { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, label);
            } else {
                // Subsequent pairs: Fade out previous, then fade in current
                masterTimeline
                    .to(prevPair, { opacity: 0, y: -50, duration: 0.7, ease: "power2.in" }, label)
                    .fromTo(currentPair, 
                        { opacity: 0, y: 50 }, 
                        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, label);
            }
            // Add a "hold" duration for the current pair before the next one starts
            masterTimeline.to({}, { duration: 0.8 }, label + "+=0.7"); // Adjust this duration to control how long a pair is fully visible
        }

        // After the loop, ensure the very last pair fades out when the pin ends
        // This is handled by the end condition of the scrub and the final state of the timeline
        // If we want an explicit fade out after the last pair is shown, we can add it here.
        // For scrub:1, the state at the end of the timeline is the final state.
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