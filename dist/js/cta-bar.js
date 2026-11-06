document.addEventListener("DOMContentLoaded", function () {

    const section = document.getElementById("pmex-cta-bar");

    if (!section) return;


    // ========================================================
    // REVEAL
    // ========================================================

    const reveal =
        section.querySelector(".pmex-cta-reveal");

    if (reveal) {

        const revealObserver =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(function (entry) {

                        if (!entry.isIntersecting) return;

                        entry.target.classList.remove(
                            "opacity-0",
                            "translate-y-5"
                        );

                        entry.target.classList.add(
                            "opacity-100",
                            "translate-y-0"
                        );

                        revealObserver.unobserve(entry.target);

                    });

                },
                {
                    threshold: 0.2
                }
            );

        revealObserver.observe(reveal);
    }


    // ========================================================
    // COUNTERS
    // ========================================================

    const counters =
        section.querySelectorAll(".pmex-cta-counter");


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

        const duration = 1300;

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


            const formatted =
                decimals > 0
                    ? value.toFixed(decimals)
                    : Math.round(value).toLocaleString();


            counter.textContent =
                prefix + formatted + suffix;


            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                const finalValue =
                    decimals > 0
                        ? target.toFixed(decimals)
                        : Math.round(target).toLocaleString();

                counter.textContent =
                    prefix + finalValue + suffix;
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
                threshold: 0.5
            }
        );


    counters.forEach(function (counter) {
        counterObserver.observe(counter);
    });

});