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

    // Back to top
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

    // Sidebar toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });

    // Progress bar
    $('.pg-bar').waypoint(function () {
        $('.progress .progress-bar').each(function () {
            $(this).css("width", $(this).attr("aria-valuenow") + '%');
        });
    }, { offset: '80%' });

    // Calendar
    if ($('#calender').length) {
        $('#calender').datetimepicker({ inline: true, format: 'L' });
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

    // Chart helper
    function safeChart(selector, config) {
        let el = $(selector).get(0);
        if (el && typeof Chart !== "undefined") {
            new Chart(el.getContext("2d"), config);
        }
    }

    // Charts
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

    safeChart("#line-chart", {
        type: "line",
        data: {
            labels: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
            datasets: [{ label: "Salse", fill: false, backgroundColor: "rgba(0, 156, 255, .3)", data: [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15] }]
        },
        options: { responsive: true }
    });

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

   /* ===== Device Tilt Physics (Smooth + In-Bounds) ===== */
let items = [], velocities = [], tiltForce = { x: 0, y: 0 }, motionActive = false, startPositions = [];

// Smooth interpolation helper
function lerp(a, b, t) {
    return a + (b - a) * t;
}

function initClutterElements() {
    const exclude = ["script", "style", "link", "canvas", ".sidebar", ".navbar", "header", "footer"];
    items = Array.from(document.querySelectorAll(`body *:not(${exclude.join('):not(')})`))
        .filter(el => el !== document.body && el !== document.documentElement);

    velocities = items.map(() => ({ x: 0, y: 0 }));
    startPositions = items.map(el => {
        const rect = el.getBoundingClientRect();
        return { left: rect.left, top: rect.top };
    });

    items.forEach(el => {
        el.style.position = "relative";
        el.dataset.tx = 0;
        el.dataset.ty = 0;
    });
}

function requestMotionPermission() {
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission().then(res => {
            if (res === "granted") {
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
    // Smooth tilt target instead of instant change
    tiltForce.targetX = (event.gamma || 0) / 30; 
    tiltForce.targetY = (event.beta || 0) / 30;
}

function updatePhysics() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Smoothly interpolate tilt
    tiltForce.x = lerp(tiltForce.x || 0, tiltForce.targetX || 0, 0.1);
    tiltForce.y = lerp(tiltForce.y || 0, tiltForce.targetY || 0, 0.1);

    items.forEach((el, i) => {
        let tx = parseFloat(el.dataset.tx || 0);
        let ty = parseFloat(el.dataset.ty || 0);

        velocities[i].x = lerp(velocities[i].x, tiltForce.x * 5, 0.1);
        velocities[i].y = lerp(velocities[i].y, tiltForce.y * 5, 0.1);

        tx += velocities[i].x;
        ty += velocities[i].y;

        const elWidth = el.offsetWidth;
        const elHeight = el.offsetHeight;

        const maxX = (screenWidth - elWidth) / 2;
        const minX = -maxX;
        const maxY = (screenHeight - elHeight) / 2;
        const minY = -maxY;

        tx = Math.max(minX, Math.min(maxX, tx));
        ty = Math.max(minY, Math.min(maxY, ty));

        el.dataset.tx = tx;
        el.dataset.ty = ty;

        el.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    if (motionActive) requestAnimationFrame(updatePhysics);
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
        updatePhysics();
    }

    btn.on('click', function () {
        if (!motionActive) {
            initClutterElements();
            requestMotionPermission();
            motionActive = true;
            localStorage.setItem('motionActive', 'true');
            $(this).text("Disable Motion");
            updatePhysics();
        } else {
            motionActive = false;
            localStorage.setItem('motionActive', 'false');
            $(this).text("Enable Motion");

            items.forEach(el => {
                el.style.transform = '';
                el.dataset.tx = 0;
                el.dataset.ty = 0;
            });
        }
    });
});

})(jQuery);
