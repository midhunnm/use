(function ($) {
    "use strict";

    // Spinner & other existing code...
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

    // Progress Bar, Calendar, Testimonials, Charts - unchanged
    // (Omitted for brevity, just keep your existing code here)

    /* ========= Physics-Based Device Tilt Clutter ========= */
    let handleTiltBound = handleTilt; // store reference for add/remove
    let friction = 0.9;
    let velocities = [];
    let tiltForce = { x: 0, y: 0 };
    let items = [];
    let motionActive = false;

    function initClutterElements() {
        // Query clutter items freshly (in case DOM updated)
        items = document.querySelectorAll(".clutter-item");
        velocities = Array.from(items).map(() => ({ x: 0, y: 0 }));

        items.forEach(el => {
            el.dataset.tx = 0;
            el.dataset.ty = 0;
            el.style.transform = "translate(0px, 0px)";
            el.style.transition = "none"; // reset transition
        });
    }

    function requestMotionPermission() {
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response === "granted") {
                        window.addEventListener("deviceorientation", handleTiltBound);
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener("deviceorientation", handleTiltBound);
        }
    }

    function handleTilt(event) {
        // Debug logs - remove if noisy
        // console.log("handleTilt called:", event.gamma, event.beta);

        tiltForce.x = (event.gamma || 0) / 10;
        tiltForce.y = (event.beta || 0) / 10;
    }

    function updatePhysics() {
        if (motionActive && items.length > 0) {
            let maxX = window.innerWidth / 2;
            let maxY = window.innerHeight / 2;

            items.forEach((el, i) => {
                velocities[i].x += tiltForce.x + (Math.random() - 0.5) * 0.2;
                velocities[i].y += tiltForce.y + (Math.random() - 0.5) * 0.2;

                velocities[i].x *= friction;
                velocities[i].y *= friction;

                let tx = parseFloat(el.dataset.tx) + velocities[i].x;
                let ty = parseFloat(el.dataset.ty) + velocities[i].y;

                // Clamp so items don't drift off screen
                tx = Math.max(-maxX, Math.min(maxX, tx));
                ty = Math.max(-maxY, Math.min(maxY, ty));

                el.dataset.tx = tx;
                el.dataset.ty = ty;

                el.style.transform = `translate(${tx}px, ${ty}px)`;
            });
        }
        requestAnimationFrame(updatePhysics);
    }

    $(document).ready(function () {
        // Auto-create toggle button if missing
        if ($("#toggle-motion").length === 0) {
            $("body").append(`
                <button id="toggle-motion" 
                    style="
                        position: fixed; 
                        bottom: 20px; 
                        right: 20px; 
                        padding: 10px 15px; 
                        font-size: 16px; 
                        background: #333; 
                        color: #fff; 
                        border: none; 
                        border-radius: 6px; 
                        cursor: pointer;
                        z-index: 9999;">
                    Enable Motion
                </button>
            `);
        }

        let btn = $("#toggle-motion");

        btn.on("click", function () {
            if (!motionActive) {
                initClutterElements();
                requestMotionPermission();
                motionActive = true;
                localStorage.setItem("motionActive", "true");
                $(this).text("Disable Motion");
            } else {
                motionActive = false;
                localStorage.setItem("motionActive", "false");
                $(this).text("Enable Motion");

                window.removeEventListener("deviceorientation", handleTiltBound);
                tiltForce.x = 0;
                tiltForce.y = 0;

                document.body.style.transition = "transform 0.4s ease-out";
                document.body.style.transform = "none";
                setTimeout(() => {
                    document.body.style.transition = "none";
                }, 400);

                items.forEach(el => {
                    el.style.transition = "transform 0.5s ease-out";
                    el.style.transform = "translate(0px, 0px)";
                    el.dataset.tx = 0;
                    el.dataset.ty = 0;
                    setTimeout(() => {
                        el.style.transition = "none";
                    }, 500);
                });
            }
        });

        // Start the physics update loop
        updatePhysics();

        // Restore motion setting if stored
        if (localStorage.getItem("motionActive") === "true") {
            btn.trigger("click");
        }
    });

})(jQuery);
