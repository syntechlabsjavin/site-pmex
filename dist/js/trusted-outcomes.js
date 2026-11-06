
(function () {
    "use strict";

    const section = document.getElementById("pmex-trusted-outcomes");

    if (!section) {
        return;
    }


    /* ==========================================================
       REVEAL
    ========================================================== */

    const revealItems = section.querySelectorAll(
        "[data-outcome-reveal]"
    );

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.remove(
                    "opacity-0",
                    "translate-y-4",
                    "translate-y-5"
                );

                entry.target.classList.add(
                    "opacity-100",
                    "translate-y-0"
                );

                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.08
        }
    );


    revealItems.forEach((item) => {
        revealObserver.observe(item);
    });



    /* ==========================================================
       COUNTERS
    ========================================================== */

    const counters = section.querySelectorAll(
        "[data-outcome-counter]"
    );


    const animateCounter = (element) => {

        if (element.dataset.animated === "true") {
            return;
        }

        element.dataset.animated = "true";

        const target = Number(
            element.getAttribute("data-value")
        );

        const decimals = Number(
            element.getAttribute("data-decimals") || 0
        );

        const duration = 1100;

        let startTime = null;


        const update = (timestamp) => {

            if (!startTime) {
                startTime = timestamp;
            }

            const progress = Math.min(
                (timestamp - startTime) / duration,
                1
            );

            const eased =
                1 - Math.pow(1 - progress, 3);

            const value =
                target * eased;

            element.textContent =
                value.toFixed(decimals);


            if (progress < 1) {
                requestAnimationFrame(update);
            }

        };


        requestAnimationFrame(update);

    };


    const counterObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                animateCounter(entry.target);

                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.35
        }
    );


    counters.forEach((counter) => {
        counterObserver.observe(counter);
    });



    /* ==========================================================
       UPTIME BAR
    ========================================================== */

    const bars = section.querySelectorAll(
        "[data-outcome-bar]"
    );


    const barObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                requestAnimationFrame(() => {
                    entry.target.style.width = "99.9%";
                });

                observer.unobserve(entry.target);

            });

        },
        {
            threshold: 0.35
        }
    );


    bars.forEach((bar) => {
        barObserver.observe(bar);
    });

})();