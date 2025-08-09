(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });

    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });

    // Progress Bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, { offset: '80%' });

    // Calendar
    if ($('#calender').length) {
        $('#calender').datetimepicker({
            inline: true,
            format: 'L'
        });
    }

    // Testimonials carousel
    if ($(".testimonial-carousel").length) {
        $(".testimonial-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            items: 1,
            dots: true,
            loop: true,
            nav: false
        });
    }

    // ====== Safe Chart Initialization ======
    function safeChart(selector, config) {
        let el = $(selector).get(0);
        if (el) {
            new Chart(el.getContext("2d"), config);
        }
    }

    // Charts...
    safeChart("#worldwide-sales", { /* chart config */ });
    safeChart("#salse-revenue", { /* chart config */ });
    safeChart("#line-chart", { /* chart config */ });
    safeChart("#bar-chart", { /* chart config */ });
    safeChart("#pie-chart", { /* chart config */ });
    safeChart("#doughnut-chart", { /* chart config */ });

    /* ========= Physics-Based Device Tilt Clutter ========= */
    let items = [];
    let velocities = [];
    let tiltForce = { x: 0, y: 0 };
    let friction = 0.9;
    let motionActive = false;
    let originalStyles = [];

    function initClutterElements() {
        document.body.classList.add('motion-on');
        items = Array.from(document.querySelectorAll("body *:not(script):not(style):not(link):not(canvas)"));
        velocities = items.map(() => ({ x: 0, y: 0 }));
        originalStyles = items.map(el => ({
            transform: el.style.transform || '',
            position: el.style.position || '',
            transition: el.style.transition || ''
        }));
        items.forEach(el => {
            if (!el.style.position) el.style.position = "relative";
            el.style.transition = "none";
            el.dataset.tx = 0;
            el.dataset.ty = 0;
        });
    }

    function restoreOriginalStyles() {
        items.forEach((el, i) => {
            // Double reset to clear GPU state
            el.style.transform = 'none';
            el.offsetHeight;
            el.style.transform = originalStyles[i].transform || '';

            // Restore positions correctly
            if (originalStyles[i].position) {
                el.style.position = originalStyles[i].position;
            } else {
                el.style.removeProperty('position');
            }

            el.style.transition = originalStyles[i].transition || '';
            el.dataset.tx = 0;
            el.dataset.ty = 0;
        });
        document.body.classList.remove('motion-on');
        void document.body.offsetWidth; // Full repaint
    }

    function requestMotionPermission() {
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response === "granted") {
                        window.addEventListener("deviceorientation", handleTilt);
                        motionActive = true;
                    }
                });
        } else {
            window.addEventListener("deviceorientation", handleTilt);
            motionActive = true;
        }
    }

    function handleTilt(event) {
        tiltForce.x = (event.gamma || 0) / 20;
        tiltForce.y = (event.beta || 0) / 20;
    }

    function updatePhysics() {
        if (motionActive) {
            items.forEach((el, i) => {
                velocities[i].x += tiltForce.x + (Math.random() - 0.5) * 0.2;
                velocities[i].y += tiltForce.y + (Math.random() - 0.5) * 0.2;

                velocities[i].x *= friction;
                velocities[i].y *= friction;

                let tx = parseFloat(el.dataset.tx) + velocities[i].x;
                let ty = parseFloat(el.dataset.ty) + velocities[i].y;
                el.dataset.tx = tx;
                el.dataset.ty = ty;

                el.style.transform = `translate(${tx}px, ${ty}px)`;
            });
        }
        requestAnimationFrame(updatePhysics);
    }

    $(document).ready(function () {
        let btn = $('<button id="motionBtn">Enable Motion</button>').css({
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '10px 15px',
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
        });
        $('body').append(btn);

        let savedMotionState = localStorage.getItem('motionActive') === 'true';
        motionActive = savedMotionState;

        if (motionActive) {
            initClutterElements();
            requestMotionPermission();
            btn.text("Disable Motion");
        }

        btn.on('click', function () {
            if (!motionActive) {
                initClutterElements();
                requestMotionPermission();
                motionActive = true;
                localStorage.setItem('motionActive', 'true');
                $(this).text("Disable Motion");
            } else {
                motionActive = false;
                localStorage.setItem('motionActive', 'false');
                $(this).text("Enable Motion");
                restoreOriginalStyles();
            }
        });

        updatePhysics();
    });

})(jQuery);

