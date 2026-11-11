document.addEventListener("DOMContentLoaded", function () {

    const section =
        document.querySelector("#pmex-specialties");

    if (!section) return;


    const revealItems =
        section.querySelectorAll("[data-specialty-reveal]");

    const pills =
        section.querySelectorAll("[data-specialty-pill]");

    const line =
        section.querySelector("[data-specialty-line]");


    const observer = new IntersectionObserver(
        function (entries, observer) {

            entries.forEach(function (entry) {

                if (!entry.isIntersecting) return;


                /* HEADER / BOTTOM REVEAL */
                revealItems.forEach(function (item, index) {

                    setTimeout(function () {

                        item.classList.remove(
                            "u-opacity-0",
                            "u-translate-y-5",
                            "u-translate-y-4"
                        );

                        item.classList.add(
                            "u-opacity-100",
                            "u-translate-y-0"
                        );

                    }, index * 120);

                });


                /* DIVIDER ANIMATION */
                if (line) {

                    setTimeout(function () {

                        line.classList.remove("u-w-0");
                        line.classList.add("u-w-full");

                    }, 150);

                }


                /* PILLS STAGGER */
                pills.forEach(function (pill, index) {

                    setTimeout(function () {

                        pill.classList.remove(
                            "u-opacity-0",
                            "u-translate-y-3"
                        );

                        pill.classList.add(
                            "u-opacity-100",
                            "u-translate-y-0"
                        );

                    }, 220 + (index * 35));

                });


                observer.disconnect();

            });

        },
        {
            threshold: 0.15
        }
    );


    observer.observe(section);

});