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
                            "opacity-0",
                            "translate-y-5",
                            "translate-y-4"
                        );

                        item.classList.add(
                            "opacity-100",
                            "translate-y-0"
                        );

                    }, index * 120);

                });


                /* DIVIDER ANIMATION */
                if (line) {

                    setTimeout(function () {

                        line.classList.remove("w-0");
                        line.classList.add("w-full");

                    }, 150);

                }


                /* PILLS STAGGER */
                pills.forEach(function (pill, index) {

                    setTimeout(function () {

                        pill.classList.remove(
                            "opacity-0",
                            "translate-y-3"
                        );

                        pill.classList.add(
                            "opacity-100",
                            "translate-y-0"
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