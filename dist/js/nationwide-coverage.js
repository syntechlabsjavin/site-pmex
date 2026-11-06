document.addEventListener("DOMContentLoaded", function () {

    const section =
        document.querySelector("#pmex-nationwide");

    if (!section) return;


    const revealItems =
        section.querySelectorAll("[data-nationwide-reveal]");

    const statePills =
        section.querySelectorAll("[data-state-pill]");

    const coverageItems =
        section.querySelectorAll("[data-coverage-item]");

    const counters =
        section.querySelectorAll("[data-counter]");


    let countersStarted = false;


    /* =========================================================
       NUMBER COUNTER
    ========================================================= */

    function animateCounter(element) {

        const target =
            parseInt(element.dataset.value, 10);

        const duration = 1200;

        const start =
            performance.now();


        function update(currentTime) {

            const elapsed =
                currentTime - start;

            const progress =
                Math.min(elapsed / duration, 1);


            /* EASE OUT */
            const eased =
                1 - Math.pow(1 - progress, 3);


            const current =
                Math.round(target * eased);


            element.textContent =
                current.toLocaleString();


            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                element.textContent =
                    target.toLocaleString();

            }

        }


        requestAnimationFrame(update);

    }



    /* =========================================================
       SECTION OBSERVER
    ========================================================= */

    const observer =
        new IntersectionObserver(

            function (entries, observer) {

                entries.forEach(function (entry) {

                    if (!entry.isIntersecting) return;


                    /* -----------------------------------------
                       MAIN CONTENT
                    ----------------------------------------- */

                    revealItems.forEach(
                        function (item, index) {

                            setTimeout(function () {

                                item.classList.remove(
                                    "opacity-0",
                                    "translate-y-5",
                                    "translate-y-6"
                                );

                                item.classList.add(
                                    "opacity-100",
                                    "translate-y-0"
                                );

                            }, index * 130);

                        }
                    );


                    /* -----------------------------------------
                       STATE PILLS
                    ----------------------------------------- */

                    statePills.forEach(
                        function (pill, index) {

                            setTimeout(function () {

                                pill.classList.remove(
                                    "opacity-0",
                                    "translate-y-2"
                                );

                                pill.classList.add(
                                    "opacity-100",
                                    "translate-y-0"
                                );

                            }, 250 + (index * 45));

                        }
                    );


                    /* -----------------------------------------
                       CAPABILITY ITEMS
                    ----------------------------------------- */

                    coverageItems.forEach(
                        function (item, index) {

                            setTimeout(function () {

                                item.classList.remove(
                                    "opacity-0",
                                    "translate-y-2"
                                );

                                item.classList.add(
                                    "opacity-100",
                                    "translate-y-0"
                                );

                            }, 450 + (index * 65));

                        }
                    );


                    /* -----------------------------------------
                       COUNTERS
                    ----------------------------------------- */

                    if (!countersStarted) {

                        countersStarted = true;

                        setTimeout(function () {

                            counters.forEach(
                                function (counter) {

                                    animateCounter(counter);

                                }
                            );

                        }, 300);

                    }


                    observer.disconnect();

                });

            },

            {
                threshold: 0.15
            }

        );


    observer.observe(section);

});