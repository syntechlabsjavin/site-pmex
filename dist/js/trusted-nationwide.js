document.addEventListener("DOMContentLoaded", function () {

    const section =
        document.getElementById("pmex-trusted-metrics");

    if (!section) return;


    /* ========================================================
       REVEAL ANIMATION
    ======================================================== */

    const revealItems =
        section.querySelectorAll(".pmex-metric-reveal");


    const revealObserver =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.remove(
                        "opacity-0",
                        "translate-y-5",
                        "translate-y-6"
                    );

                    entry.target.classList.add(
                        "opacity-100",
                        "translate-y-0"
                    );

                    revealObserver.unobserve(entry.target);

                });

            },
            {
                threshold: 0.15
            }
        );


    revealItems.forEach(function (item) {
        revealObserver.observe(item);
    });


    /* ========================================================
       COUNTER ANIMATION
    ======================================================== */

    const counters =
        section.querySelectorAll(".pmex-count");


    function animateCounter(counter) {

        if (counter.dataset.animated === "true") {
            return;
        }

        counter.dataset.animated = "true";


        const target =
            parseFloat(counter.dataset.target || "0");

        const decimals =
            parseInt(counter.dataset.decimals || "0", 10);

        const prefix =
            counter.dataset.prefix || "";

        const suffix =
            counter.dataset.suffix || "";

        const duration = 1400;

        const startTime =
            performance.now();


        function update(currentTime) {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(elapsed / duration, 1);

            const eased =
                1 - Math.pow(1 - progress, 3);

            const value =
                target * eased;


            counter.textContent =
                prefix +
                value.toFixed(decimals) +
                suffix;


            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                counter.textContent =
                    prefix +
                    target.toFixed(decimals) +
                    suffix;
            }

        }


        requestAnimationFrame(update);
    }


    const counterObserver =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (!entry.isIntersecting) return;

                    animateCounter(entry.target);

                    counterObserver.unobserve(entry.target);

                });

            },
            {
                threshold: 0.45
            }
        );


    counters.forEach(function (counter) {
        counterObserver.observe(counter);
    });

});