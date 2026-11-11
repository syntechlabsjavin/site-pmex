document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       REVEAL ANIMATION
    ========================================================= */

    const pricingSection = document.querySelector("#pmex-pricing");

    if (!pricingSection) return;


    const revealItems =
        pricingSection.querySelectorAll(".pmex-price-reveal");


    const revealObserver = new IntersectionObserver(
        function (entries, observer) {

            entries.forEach(function (entry) {

                if (!entry.isIntersecting) return;


                revealItems.forEach(function (item, index) {

                    setTimeout(function () {

                        item.classList.remove(
                            "u-opacity-0",
                            "u-translate-y-5",
                            "u-translate-y-6",
                            "u-translate-y-4"
                        );

                        item.classList.add(
                            "u-opacity-100",
                            "u-translate-y-0"
                        );

                    }, index * 100);

                });


                observer.disconnect();

            });

        },
        {
            threshold: 0.15
        }
    );


    revealObserver.observe(pricingSection);



    /* =========================================================
       2.49 NUMBER ANIMATION
    ========================================================= */

    const number =
        pricingSection.querySelector(".pmex-price-number");

    if (!number) return;


    const numberObserver = new IntersectionObserver(
        function (entries, observer) {

            entries.forEach(function (entry) {

                if (!entry.isIntersecting) return;


                const target =
                    parseFloat(number.dataset.value);

                const duration = 1200;

                const startTime =
                    performance.now();


                function animate(currentTime) {

                    const elapsed =
                        currentTime - startTime;

                    const progress =
                        Math.min(elapsed / duration, 1);


                    /* ease out */
                    const eased =
                        1 - Math.pow(1 - progress, 3);


                    const value =
                        target * eased;


                    number.textContent =
                        value.toFixed(2);


                    if (progress < 1) {

                        requestAnimationFrame(animate);

                    } else {

                        number.textContent =
                            target.toFixed(2);

                    }

                }


                requestAnimationFrame(animate);

                observer.disconnect();

            });

        },
        {
            threshold: 0.6
        }
    );


    numberObserver.observe(number);

});