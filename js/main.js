$(document).ready(function () {

    // --- Sticky Navigation ---
    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('#navbar').addClass('scrolled');
        } else {
            $('#navbar').removeClass('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    $('#mobile-menu').click(function () {
        $('.nav-menu').toggleClass('active');
        $(this).find('.bar').toggleClass('active'); // Optional: Add CSS for hamburger animation if desired
    });

    // Close mobile menu when a link is clicked
    $('.nav-link').click(function () {
        $('.nav-menu').removeClass('active');
    });

    // --- Smooth Scrolling & Active Link Highlighting ---
    $('a[href^="#"]').on('click', function (event) {
        if (this.hash !== "") {
            event.preventDefault();
            var hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top - 70 // Adjust for fixed navbar
            }, 800, function () {
                // window.location.hash = hash; // Optional: Updates URL
            });
        }
    });

    // Highlight active menu item on scroll
    $(window).scroll(function () {
        var scrollDistance = $(window).scrollTop() + 100;

        $('.section, header').each(function (i) {
            if ($(this).position().top <= scrollDistance) {
                $('.nav-menu a.active').removeClass('active');
                $('.nav-menu a').eq(i).addClass('active');
            }
        });
    });

    // --- Dynamic Elements (Hero & About) ---
    function loadDynamicElements() {
        // 1. Hero Background (Slideshow)
        fetch('/api/portfolio?category=hero')
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const $slideshow = $('.hero-slideshow');
                    $slideshow.empty(); // Clear existing

                    data.forEach((img, index) => {
                        const activeClass = index === 0 ? 'active' : '';
                        const slide = `<div class="hero-slide ${activeClass}" style="background-image: url('${img.src}');"></div>`;
                        $slideshow.append(slide);
                    });

                    // Start Slideshow if more than 1 image
                    if (data.length > 1) {
                        let currentSlide = 0;
                        const slides = $('.hero-slide');

                        setInterval(() => {
                            $(slides[currentSlide]).removeClass('active');
                            currentSlide = (currentSlide + 1) % slides.length;
                            $(slides[currentSlide]).addClass('active');
                        }, 5000); // Change every 5 seconds
                    }
                }
            })
            .catch(err => console.error('Error loading hero images:', err));

        // 2. About Profile Pic
        fetch('/api/portfolio?category=about')
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    // Use the most recent image
                    const aboutImage = data[0].src;
                    $('.about-img img').attr('src', aboutImage); // Update existing img
                }
            })
            .catch(err => console.error('Error loading about image:', err));
    }

    loadDynamicElements(); // Call on load

    // --- Dynamic Portfolio Loading & Filtering ---
    function loadPortfolio() {
        fetch('/api/portfolio')
            .then(response => response.json())
            .then(data => {
                const grid = $('.portfolio-grid');
                grid.empty(); // Clear existing content

                if (data.length === 0) {
                    grid.append('<p style="text-align:center; width:100%; color:#fff;">No images uploaded yet. Please use the Admin Dashboard.</p>');
                    return;
                }

                data.forEach(item => {
                    const html = `
                        <div class="portfolio-item ${item.category}">
                            <img src="${item.src}" alt="${item.title}">
                            <div class="portfolio-overlay">
                                <div class="overlay-content">
                                    <h3>${item.title}</h3>
                                    <p>${item.category}</p>
                                    <i class="fas fa-search-plus"></i>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.append(html);
                });

                // Attach Lightbox Event Listeners to NEW elements
                attachLightboxEvents();
            })
            .catch(error => console.error('Error loading portfolio:', error));
    }

    // Initial Load
    loadPortfolio();

    // Filter Click Handler
    $('.filter-btn').click(function () {
        var value = $(this).attr('data-filter');

        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        if (value == 'all') {
            $('.portfolio-item').show('1000');
        } else {
            $('.portfolio-item').not('.' + value).hide('3000');
            $('.portfolio-item').filter('.' + value).show('3000');
        }
    });

    // --- Lightbox ---
    // --- Lightbox ---
    function attachLightboxEvents() {
        $('.portfolio-item').off('click').on('click', function () {
            var imgSrc = $(this).find('img').attr('src');
            // Check if overlay content exists, otherwise use defaults
            var title = $(this).find('.overlay-content h3').text() || 'Photo';
            var category = $(this).find('.overlay-content p').text() || '';
            var captionText = title + (category ? ' - ' + category : '');

            $('#lightbox-img').attr('src', imgSrc);
            $('#lightbox-caption').text(captionText); // Corrected ID from #caption to #lightbox-caption
            $('#lightbox').fadeIn();
            $('body').css('overflow', 'hidden');
        });
    }

    $('.close-lightbox, #lightbox').click(function (e) {
        if (e.target !== $('#lightbox-img')[0]) { // Close if clicked outside image
            $('#lightbox').fadeOut();
            $('body').css('overflow', 'auto');
        }
    });

    // --- Testimonial Slider ---
    // --- Testimonial Slider ---
    var slides = $('.testimonial-slide');
    var dots = $('.dot');
    var totalSlides = slides.length;
    var currentSlideIndex = 0;

    // Ensure first slide is active initially
    if (totalSlides > 0) {
        slides.hide();
        slides.eq(currentSlideIndex).fadeIn();
        dots.removeClass('active');
        dots.eq(currentSlideIndex).addClass('active');
    }

    function showSlide(index) {
        if (index === currentSlideIndex) return;

        slides.eq(currentSlideIndex).fadeOut(400, function () {
            slides.eq(index).fadeIn(400);
        });

        dots.removeClass('active');
        dots.eq(index).addClass('active');

        currentSlideIndex = index;
    }

    // click event for dots
    $('.dot').click(function () {
        var index = $(this).index();
        showSlide(index);

        // Reset timer on manual interaction
        clearInterval(slideInterval);
        slideInterval = setInterval(autoPlay, 5000);
    });

    // Auto-play testimonials
    function autoPlay() {
        var next = (currentSlideIndex + 1) % totalSlides;
        showSlide(next);
    }

    var slideInterval = setInterval(autoPlay, 5000);

    // --- Contact Form Logic (WhatsApp Integration) ---
    $('#contact-form').submit(function (e) {
        e.preventDefault();

        var name = $('#name').val();
        var email = $('#email').val();
        var service = $('#service').val(); // Get selected service
        var message = $('#message').val();

        if (name && email && message && service) { // Ensure all fields including service are filled
            var btn = $(this).find('button');
            var originalText = btn.text();

            btn.text('Opening WhatsApp...');

            // Construct WhatsApp Message
            var whatsappMessage = `*New Inquiry via Website* %0A%0A` +
                `*Name:* ${name} %0A` +
                `*Email:* ${email} %0A` +
                `*Service:* ${service} %0A` +
                `*Message:* ${message}`;

            var whatsappUrl = `https://wa.me/919913132052?text=${whatsappMessage}`;

            // Determine if mobile or desktop to open correctly
            // window.open(whatsappUrl, '_blank'); // Opens in new tab

            setTimeout(function () {
                window.location.href = whatsappUrl; // Redirects current tab or opens app

                // UX Feedback
                $('#form-status').text('Redirecting to WhatsApp...').css('color', 'green').fadeIn();
                btn.text('Sent!');
                $('#contact-form')[0].reset();

                setTimeout(function () {
                    btn.text(originalText);
                    $('#form-status').fadeOut();
                }, 4000);
            }, 1000);

        } else {
            alert('Please fill in all fields including the service type.');
        }
    });

});
