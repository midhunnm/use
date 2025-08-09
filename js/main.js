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

    // Calender
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
        } else {
            console.warn(`⚠️ Skipping chart ${selector} — element not found.`);
        }
    }

    // Worldwide Sales Chart
    safeChart("#worldwide-sales", {
        type: "bar",
        data: {
            labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
            datasets: [
                { label: "USA", data: [15, 30, 55, 65, 60, 80, 95], backgroundColor: "rgba(0, 156, 255, .7)" },
                { label: "UK", data: [8, 35, 40, 60, 70, 55, 75], backgroundColor: "rgba(0, 156, 255, .5)" },
                { label: "AU", data: [12, 25, 45, 55, 65, 70, 60], backgroundColor: "rgba(0, 156, 255, .3)" }
            ]
        },
        options: { responsive: true }
    });

    // Salse & Revenue Chart
    safeChart("#salse-revenue", {
        type: "line",
        data: {
            labels: ["2016", "2017", "2018", "2019", "2020", "2021", "2022"],
            datasets: [
                { label: "Salse", data: [15, 30, 55, 45, 70, 65, 85], backgroundColor: "rgba(0, 156, 255, .5)", fill: true },
                { label: "Revenue", data: [99, 135, 170, 130, 190, 180, 270], backgroundColor: "rgba(0, 156, 255, .3)", fill: true }
            ]
        },
        options: { responsive: true }
    });

    // Single Line Chart
    safeChart("#line-chart", {
        type: "line",
        data: {
            labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
            datasets: [{ label: "Salse", fill: false, backgroundColor: "rgba(0, 156, 255, .3)", data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15] }]
        },
        options: { responsive: true }
    });

    // Single Bar Chart
    safeChart("#bar-chart", {
        type: "bar",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(0, 156, 255, .7)",
                    "rgba(0, 156, 255, .6)",
                    "rgba(0, 156, 255, .5)",
                    "rgba(0, 156, 255, .4)",
                    "rgba(0, 156, 255, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: { responsive: true }
    });

    // Pie Chart
    safeChart("#pie-chart", {
        type: "pie",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(0, 156, 255, .7)",
                    "rgba(0, 156, 255, .6)",
                    "rgba(0, 156, 255, .5)",
                    "rgba(0, 156, 255, .4)",
                    "rgba(0, 156, 255, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: { responsive: true }
    });

    // Doughnut Chart
    safeChart("#doughnut-chart", {
        type: "doughnut",
        data: {
            labels: ["Italy", "France", "Spain", "USA", "Argentina"],
            datasets: [{
                backgroundColor: [
                    "rgba(0, 156, 255, .7)",
                    "rgba(0, 156, 255, .6)",
                    "rgba(0, 156, 255, .5)",
                    "rgba(0, 156, 255, .4)",
                    "rgba(0, 156, 255, .3)"
                ],
                data: [55, 49, 44, 24, 15]
            }]
        },
        options: { responsive: true }
    });

    /* ========= Physics-Based Device Tilt Clutter ========= */
    let items = [];
    let velocities = [];
    let tiltForce = { x: 0, y: 0 };
    let friction = 0.9;
    let motionActive = false;

    function initClutterElements() {
        items = Array.from(document.querySelectorAll("body *:not(script):not(style):not(link):not(canvas)"));
        velocities = items.map(() => ({ x: 0, y: 0 }));
        items.forEach(el => {
            el.style.position = "relative";
            el.style.transition = "none";
            el.dataset.tx = 0;
            el.dataset.ty = 0;
        });
    }

    function requestMotionPermission() {
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response === "granted") {
                        window.addEventListener("deviceorientation", handleTilt);
                        motionActive = true;
                    }
                })
                .catch(console.error);
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
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        items.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const maxX = screenW - rect.width;
            const maxY = screenH - rect.height;

            // Update velocities with tilt + small random jitter
            velocities[i].x += tiltForce.x + (Math.random() - 0.5) * 0.1; // reduced jitter
            velocities[i].y += tiltForce.y + (Math.random() - 0.5) * 0.1;

            velocities[i].x *= friction;
            velocities[i].y *= friction;

            let tx = parseFloat(el.dataset.tx) + velocities[i].x;
            let ty = parseFloat(el.dataset.ty) + velocities[i].y;

            // Clamp positions so items stay inside the viewport
            tx = Math.max(-rect.left, Math.min(tx, maxX - rect.left));
            ty = Math.max(-rect.top, Math.min(ty, maxY - rect.top));

            el.dataset.tx = tx;
            el.dataset.ty = ty;
            el.style.transform = `translate(${tx}px, ${ty}px)`;
        });
    }
    requestAnimationFrame(updatePhysics);
}


    // Create motion toggle button
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

    // Load saved state from localStorage
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

            // Optional: reset transforms when disabling motion
            items.forEach(el => {
                el.style.transform = '';
                el.dataset.tx = 0;
                el.dataset.ty = 0;
            });
        }
    });

    updatePhysics();
});


})(jQuery);
